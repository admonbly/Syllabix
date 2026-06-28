import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const MIN_PASS_SCORE = 60;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

const MODULE_NAMES = [
  'IT & Ordinateur', 'Internet', 'Email', 'Bureautique',
  'Cybersécurité', 'Intelligence Artificielle', 'Employabilité',
];

export async function POST(request) {
  // 1. Vérification du token Firebase
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let uid;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  // 2. Parsing du corps
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { answers, moduleId, examType } = body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'Réponses manquantes' }, { status: 400 });
  }

  const db = getAdminDb();

  // 3. Vérification du cooldown côté serveur
  const examKey = moduleId !== null && moduleId !== undefined
    ? `certification_module_${moduleId}`
    : 'certification_global';

  const attemptRef = db.doc(`users/${uid}/examAttempts/${examKey}`);
  const attemptSnap = await attemptRef.get();

  if (attemptSnap.exists) {
    const lastAttemptAt = new Date(attemptSnap.data().lastAttemptAt);
    const elapsed = Date.now() - lastAttemptAt.getTime();
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json({ error: 'cooldown', remaining }, { status: 429 });
    }
  }

  // 4. Récupération des questions depuis Firestore côté serveur
  const moduleIds = moduleId !== null && moduleId !== undefined
    ? [String(moduleId)]
    : ['0', '1', '2', '3', '4', '5', '6'];

  const questionMap = new Map();
  await Promise.all(
    moduleIds.map(async (mId) => {
      const snap = await db.collection(`modules/${mId}/questions`).get();
      snap.forEach((doc) => {
        questionMap.set(String(doc.id), { ...doc.data(), id: String(doc.id) });
      });
    })
  );

  // 5. Calcul du score côté serveur (jamais côté client)
  let correct = 0;
  const total = answers.length;

  for (const answer of answers) {
    const question = questionMap.get(String(answer.questionId));
    if (question && question.correct === answer.userAnswerIndex) {
      correct++;
    }
  }

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= MIN_PASS_SCORE;

  // 6. Enregistrement du cooldown
  await attemptRef.set({ lastAttemptAt: new Date().toISOString() });

  // 7. Sauvegarde du certificat si réussi
  let certId = null;
  if (passed) {
    const userSnap = await db.doc(`users/${uid}`).get();
    const userData = userSnap.data() || {};
    const displayName = userData.displayName || userData.email || 'Apprenant';

    const certRef = db.collection(`users/${uid}/certificates`).doc();
    certId = certRef.id;
    const issuedAt = new Date().toISOString();

    const certData = {
      displayName,
      moduleId: moduleId !== null && moduleId !== undefined ? moduleId : null,
      examType: examType || (moduleId !== null && moduleId !== undefined ? 'MODULE' : 'GLOBAL'),
      score: percentage,
      issuedAt,
      userId: uid,
      createdAt: issuedAt,
    };

    await certRef.set(certData);
    // Collection publique pour la vérification /certificate/[id]
    await db.doc(`certificates/${certId}`).set({ ...certData, userId: uid });

    // Progression et badge si certification par module
    if (moduleId !== null && moduleId !== undefined) {
      await db.doc(`users/${uid}/progress/${moduleId}`).set({
        moduleId: String(moduleId),
        score: percentage,
        completedAt: issuedAt,
      });

      await db.doc(`users/${uid}`).update({
        badges: FieldValue.arrayUnion({
          moduleId: Number(moduleId),
          moduleName: MODULE_NAMES[Number(moduleId)] ?? `Module ${moduleId}`,
          score: percentage,
          earnedAt: issuedAt,
        }),
      });
    }
  }

  return NextResponse.json({ percentage, correct, total, passed, certId });
}

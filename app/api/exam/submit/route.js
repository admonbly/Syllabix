import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  EXAM, MODULE_NAMES, loadQuestionBank, isAnswerCorrectServer,
} from '@/lib/examServer';

/**
 * POST /api/exam/submit
 * Note une session d'examen créée par /api/exam/questions.
 * Body : { sessionId, answers: [{ key: 'moduleId:questionId', value }] }
 * - Le total est imposé par la session serveur (pas par le client)
 * - Les réponses sont comparées par VALEUR (insensible au mélange des options)
 * - Anti-rejeu : une session ne peut être soumise qu'une fois (transaction)
 */
export async function POST(request) {
  // 1. Authentification
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let uid;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  // 2. Parsing
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }
  const { sessionId, answers } = body;
  if (!sessionId || typeof sessionId !== 'string' || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'sessionId ou réponses manquants' }, { status: 400 });
  }

  const db = getAdminDb();
  const sessionRef = db.doc(`users/${uid}/examSessions/${sessionId}`);

  // 3. Validation + verrouillage de la session (anti-rejeu, anti-course)
  let session;
  try {
    session = await db.runTransaction(async (tx) => {
      const snap = await tx.get(sessionRef);
      if (!snap.exists) throw new Error('session_not_found');
      const data = snap.data();
      if (data.submitted) throw new Error('already_submitted');
      if (new Date(data.expiresAt).getTime() < Date.now()) throw new Error('session_expired');
      tx.update(sessionRef, { submitted: true, submittedAt: new Date().toISOString() });
      return data;
    });
  } catch (err) {
    const map = {
      session_not_found: ['Session d\'examen introuvable', 404],
      already_submitted: ['Session déjà soumise', 409],
      session_expired:   ['Session expirée', 410],
    };
    const [msg, status] = map[err.message] ?? ['Erreur de session', 500];
    return NextResponse.json({ error: msg }, { status });
  }

  const { moduleId, examType, questionKeys } = session;

  // 4. Rechargement des questions côté serveur
  const moduleIds = [...new Set(questionKeys.map((k) => parseInt(k.split(':')[0], 10)))];
  const bank = await loadQuestionBank(db, moduleIds);

  // 5. Notation — le total est le nombre de questions de la SESSION
  const answerMap = new Map();
  for (const a of answers) {
    if (a && typeof a.key === 'string') answerMap.set(a.key, a.value);
  }

  let correct = 0;
  const total = questionKeys.length;
  for (const key of questionKeys) {
    const question = bank.get(key);
    if (!question) continue;
    const value = answerMap.get(key);
    if (value !== undefined && isAnswerCorrectServer(question, value)) correct++;
  }

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= EXAM.MIN_PASS_SCORE;

  // 6. Cooldown
  const examKey = moduleId !== null ? `certification_module_${moduleId}` : 'certification_global';
  await db.doc(`users/${uid}/examAttempts/${examKey}`).set({
    lastAttemptAt: new Date().toISOString(),
  });

  // 7. Certificat si réussi
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
      moduleId,
      examType: examType || (moduleId !== null ? 'MODULE' : 'GLOBAL'),
      score: percentage,
      issuedAt,
      userId: uid,
      createdAt: issuedAt,
    };

    await certRef.set(certData);
    // Collection publique pour la vérification /certificate/[id]
    await db.doc(`certificates/${certId}`).set(certData);

    if (moduleId !== null) {
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
          level: 'module',
        }),
      });
    } else {
      // Certification GLOBALE réussie → badge de niveau 'global' (cohérence des
      // 3 niveaux). moduleId:null identifie le badge global.
      await db.doc(`users/${uid}`).update({
        badges: FieldValue.arrayUnion({
          moduleId: null,
          moduleName: 'Certification globale',
          score: percentage,
          earnedAt: issuedAt,
          level: 'global',
        }),
      });
    }
  }

  return NextResponse.json({ percentage, correct, total, passed, certId });
}

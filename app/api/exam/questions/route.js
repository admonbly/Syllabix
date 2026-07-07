import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import {
  EXAM, MODULE_IDS, parseModuleId, loadQuestionBank, selectExamQuestions,
} from '@/lib/examServer';

/**
 * POST /api/exam/questions
 * Crée une session d'examen côté serveur et retourne les questions
 * SANS les bonnes réponses. Le client répondra par valeur d'option.
 * Body : { moduleId: 0-6 | null, examType?: string }
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

  // 2. Validation du corps
  let body = {};
  try { body = await request.json(); } catch {}
  const moduleId = parseModuleId(body.moduleId ?? null);
  if (moduleId === undefined) {
    return NextResponse.json({ error: 'moduleId invalide' }, { status: 400 });
  }

  const db = getAdminDb();

  // 3. Cooldown vérifié dès la création de session
  const examKey = moduleId !== null ? `certification_module_${moduleId}` : 'certification_global';
  const attemptSnap = await db.doc(`users/${uid}/examAttempts/${examKey}`).get();
  if (attemptSnap.exists) {
    const elapsed = Date.now() - new Date(attemptSnap.data().lastAttemptAt).getTime();
    if (elapsed < EXAM.COOLDOWN_MS) {
      const remaining = Math.ceil((EXAM.COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json({ error: 'cooldown', remaining }, { status: 429 });
    }
  }

  // 4. Sélection des questions (Firestore avec fallback local)
  const moduleIds = moduleId !== null ? [moduleId] : MODULE_IDS;
  const bank = await loadQuestionBank(db, moduleIds);
  const { selected, sanitized } = selectExamQuestions(bank);

  if (selected.length === 0) {
    return NextResponse.json({ error: 'Aucune question disponible' }, { status: 404 });
  }

  // 5. Durée : mode enfant = 60 min
  let durationS = EXAM.DURATION_S;
  try {
    const profile = await db.doc(`users/${uid}`).get();
    if (profile.exists && profile.data().role === 'CHILD') durationS = EXAM.CHILD_DURATION_S;
  } catch {}

  // 6. Enregistrement de la session d'examen
  const sessionRef = db.collection(`users/${uid}/examSessions`).doc();
  const now = Date.now();
  await sessionRef.set({
    moduleId,
    examType: moduleId !== null ? 'MODULE' : 'GLOBAL',
    questionKeys: selected.map((q) => `${q.moduleId}:${q.id}`),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (durationS + EXAM.SESSION_GRACE_S) * 1000).toISOString(),
    submitted: false,
  });

  return NextResponse.json({
    sessionId: sessionRef.id,
    questions: sanitized,
    duration: durationS,
    total: sanitized.length,
  });
}

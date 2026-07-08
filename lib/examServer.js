// Logique d'examen CÔTÉ SERVEUR uniquement (API routes, Admin SDK).
// Ne jamais importer depuis un composant client.

import { quizData as localQuizData } from '@/lib/quizData';

export const EXAM = {
  QUESTIONS_COUNT: 32,
  DURATION_S: 6300,        // 1h45 — inclut les épreuves pratiques
  CHILD_DURATION_S: 8100,  // 2h15 pour le mode enfant
  SESSION_GRACE_S: 300,    // marge avant expiration de la session
  MIN_PASS_SCORE: 60,
  COOLDOWN_MS: 24 * 60 * 60 * 1000,
};

export const MODULE_IDS = [0, 1, 2, 3, 4, 5, 6];

export const MODULE_NAMES = [
  'IT & Ordinateur', 'Internet', 'Email', 'Bureautique',
  'Cybersécurité', 'Intelligence Artificielle', 'Employabilité',
];

/** moduleId valide : entier 0-6 ou null (examen global). */
export function parseModuleId(raw) {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 0 && n <= 6) return n;
  return undefined; // invalide
}

const isExamQuestion = (q) => !q.pool || q.pool === 'both' || q.pool === 'exam';

// Tous les types auto-notables sont éligibles à la certification,
// y compris les épreuves pratiques (l'UI d'examen les affiche toutes).
const isCertifiable = (q) => {
  if (!isExamQuestion(q)) return false;
  const type = q.type || 'single';
  if (type === 'single')      return Array.isArray(q.options) && typeof q.correct === 'number';
  if (type === 'multi')       return Array.isArray(q.options) && Array.isArray(q.correct);
  if (type === 'input')       return q.correct !== undefined || Array.isArray(q.acceptableAnswers);
  if (type === 'calculation') return q.correct !== undefined && !isNaN(Number(q.correct));
  return false;
};

/**
 * Charge les questions d'un module : Firestore d'abord, fallback local.
 * Retourne une Map id -> question complète (avec `correct`).
 */
export async function loadQuestionBank(db, moduleIds) {
  const bank = new Map();
  await Promise.all(
    moduleIds.map(async (mId) => {
      const local = localQuizData.find((m) => m.id === mId);
      let loaded = false;
      try {
        const snap = await db.collection(`modules/${mId}/questions`).get();
        if (!snap.empty) {
          snap.forEach((doc) => {
            bank.set(`${mId}:${doc.id}`, {
              ...doc.data(),
              id: String(doc.id),
              moduleId: mId,
              module: local?.module ?? `Module ${mId}`,
            });
          });
          loaded = true;
        }
      } catch {
        // Firestore indisponible → fallback local
      }
      if (!loaded && local) {
        local.questions.forEach((q) => {
          bank.set(`${mId}:${q.id}`, { ...q, id: String(q.id), moduleId: mId, module: local.module });
        });
      }
    })
  );
  return bank;
}

/** Fisher-Yates. */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sélectionne les questions d'un examen (uniques, certifiables) et
 * retourne { selected, sanitized } : versions complète et sans réponses.
 * Les options sont mélangées côté serveur — le client répond par VALEUR.
 */
export function selectExamQuestions(bank, count = EXAM.QUESTIONS_COUNT) {
  const pool = [...bank.values()].filter(isCertifiable);
  shuffle(pool);
  const selected = pool.slice(0, Math.min(count, pool.length));

  // On garde tout ce dont l'UI a besoin, mais JAMAIS la réponse
  // (correct, acceptableAnswers, tolerance, explanation restent serveur).
  const sanitized = selected.map((q) => ({
    key: `${q.moduleId}:${q.id}`,
    text: q.text,
    type: q.type || 'single',
    module: q.module,
    moduleId: q.moduleId,
    ...(Array.isArray(q.options) ? { options: shuffle([...q.options]) } : {}),
    ...(q.type === 'multi' ? { expectedCount: (q.correct ?? []).length } : {}),
    ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}),
    ...(q.unit ? { unit: q.unit } : {}),
    ...(q.hint ? { hint: q.hint } : {}),
    ...(q.practical ? {
      practical: true,
      app: q.app,
      instructions: q.instructions ?? [],
      ...(q.fileUrl ? { fileUrl: q.fileUrl } : {}),
      ...(q.competency ? { competency: q.competency } : {}),
    } : {}),
  }));

  return { selected, sanitized };
}

const normalize = (str) =>
  String(str).toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Notation universelle par VALEUR (indépendante de l'ordre des options).
 */
export function isAnswerCorrectServer(question, value) {
  const type = question.type || 'single';
  if (type === 'single') {
    const correctValue = question.options?.[question.correct];
    return correctValue !== undefined && normalize(value) === normalize(correctValue);
  }
  if (type === 'multi') {
    if (!Array.isArray(value) || !Array.isArray(question.correct)) return false;
    const expected = question.correct.map((i) => normalize(question.options?.[i]));
    const got = value.map(normalize);
    return expected.length === got.length && expected.every((v) => got.includes(v));
  }
  if (type === 'input') {
    const acceptable = question.acceptableAnswers ?? [question.correct];
    return acceptable.some((a) => normalize(a) === normalize(value));
  }
  if (type === 'calculation') {
    const tol = question.tolerance ?? 0;
    const val = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    return !isNaN(val) && Math.abs(val - Number(question.correct)) <= tol;
  }
  return false;
}

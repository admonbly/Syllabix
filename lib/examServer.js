// Logique d'examen CÔTÉ SERVEUR uniquement (API routes, Admin SDK).
// Ne jamais importer depuis un composant client.

import { quizData as localQuizData } from '@/lib/quizData';

export const EXAM = {
  QUESTIONS_COUNT: 35,
  DURATION_S: 2100,        // 35 min
  CHILD_DURATION_S: 3600,  // 60 min
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

// Seules les questions notables automatiquement ET affichables par l'UI
// d'examen (choix unique) sont éligibles à la certification.
const isCertifiable = (q) =>
  !q.practical &&
  isExamQuestion(q) &&
  Array.isArray(q.options) &&
  typeof q.correct === 'number' &&
  (!q.type || q.type === 'single');

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

  const sanitized = selected.map((q) => ({
    key: `${q.moduleId}:${q.id}`,
    text: q.text,
    options: shuffle([...q.options]),
    type: 'single',
    module: q.module,
    moduleId: q.moduleId,
    ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}),
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

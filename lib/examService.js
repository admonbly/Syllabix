// Logique métier des examens
// Règles strictes de certification et entraînement

import { getAllQuestions, getModuleById } from './quizService';

// ================================
// CONSTANTES
// ================================

export const EXAM_CONFIG = {
  TRAINING: {
    QUESTIONS_COUNT: 5,  // questions par session d'entraînement
    SESSION_SIZE: 5,
    DURATION: null,
    SHOW_FEEDBACK: true,
    SAVE_RESULTS: false,
    ISSUE_CERTIFICATE: false,
  },
  EVALUATION: {
    QUESTIONS_COUNT: 16,
    DURATION: 2700, // 45 minutes — couvre tout le référentiel, épreuves pratiques incluses
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: false,
    ISSUE_CERTIFICATE: false,
  },
  CERTIFICATION: {
    QUESTIONS_COUNT: 32,
    DURATION: 6300, // 1h45 — épreuves pratiques incluses
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: true,
    ISSUE_CERTIFICATE: true,
    MIN_PASS_SCORE: 60, // pourcentage
  },
  // Mode adapté pour les enfants (rôle CHILD)
  CHILD: {
    QUESTIONS_COUNT: 32,
    DURATION: 8100, // 2h15 — plus de temps pour les enfants
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: true,
    ISSUE_CERTIFICATE: true,
    MIN_PASS_SCORE: 60,
  },
};

// ================================
// RÉCUPÉRATION DES QUESTIONS
// ================================

// Détermine si une question peut apparaître en examen/certification
const isExamQuestion = (q) => !q.pool || q.pool === 'both' || q.pool === 'exam';
// Détermine si une question peut apparaître en entraînement
const isTrainingQuestion = (q) => !q.pool || q.pool === 'both' || q.pool === 'training';

/**
 * Récupère X questions aléatoires d'un module pour l'entraînement (pool complet)
 * @param {number} moduleId - ID du module (0-6)
 * @param {number} count - Nombre de questions à retourner
 * @returns {Promise<Array>}
 */
export const getModuleQuestions = async (moduleId, count = 5) => {
  const module = await getModuleById(parseInt(moduleId));
  if (!module) return [];
  const questions = module.questions.filter(isTrainingQuestion);
  shuffleArray(questions);
  return questions.slice(0, count).map((q) => ({
    ...q,
    module: module.module,
    moduleId: module.id,
  }));
};

/**
 * Récupère X questions aléatoires de TOUS les modules mélangés (pool examen)
 * @param {number} count - Nombre de questions
 * @returns {Promise<Array>}
 */
export const getMixedQuestions = async (count = 35) => {
  const allQuestions = await getAllQuestions();
  const examPool = allQuestions.filter(isExamQuestion);
  shuffleArray(examPool);
  return examPool.slice(0, count);
};

/**
 * Récupère X questions d'un module (pool examen) en répétant si nécessaire
 * @param {number} moduleId - ID du module
 * @param {number} count - Nombre de questions à retourner
 * @returns {Promise<Array>}
 */
export const getModuleQuestionsWithRepeat = async (moduleId, count = 35) => {
  const module = await getModuleById(parseInt(moduleId));
  if (!module) return [];
  const source = module.questions
    .filter(isExamQuestion)
    .map((q) => ({ ...q, module: module.module, moduleId: module.id }));
  if (source.length === 0) return [];
  const questions = [];
  while (questions.length < count) {
    source.forEach((q) => { if (questions.length < count) questions.push({ ...q }); });
  }
  shuffleArray(questions);
  return questions.slice(0, count);
};

// ================================
// LOGIQUE DE SCORING
// ================================

/**
 * Calcule le score d'un examen
 * @param {Array} answers - Réponses utilisateur format [{questionId, userAnswer}]
 * @param {Array} questions - Questions de l'examen avec la bonne réponse
 * @returns {Object} {score: 0-100, correct: number, total: number}
 */
export const calculateScore = (answers, questions) => {
  let correct = 0;

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.correct === answer.userAnswer) {
      correct++;
    }
  });

  const percentage = Math.round((correct / questions.length) * 100);

  return {
    percentage,
    correct,
    total: questions.length,
  };
};

const normalizeStr = (str) =>
  String(str).toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Vérifie une réponse donnée par VALEUR (chaîne, tableau de chaînes ou nombre),
 * quel que soit le type de question. Utilisé par l'évaluation de niveau.
 */
export const isAnswerCorrectByValue = (question, value) => {
  if (value === undefined || value === null || value === '') return false;
  const type = question.type || 'single';
  if (type === 'single') {
    const correctValue = question.options?.[question.correct];
    return correctValue !== undefined && normalizeStr(value) === normalizeStr(correctValue);
  }
  if (type === 'multi') {
    if (!Array.isArray(value) || !Array.isArray(question.correct)) return false;
    const expected = question.correct.map((i) => normalizeStr(question.options?.[i]));
    const got = value.map(normalizeStr);
    return expected.length === got.length && expected.every((v) => got.includes(v));
  }
  if (type === 'input') {
    const acceptable = question.acceptableAnswers ?? [question.correct];
    return acceptable.some((a) => normalizeStr(a) === normalizeStr(value));
  }
  if (type === 'calculation') {
    const tol = question.tolerance ?? 0;
    const val = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    return !isNaN(val) && Math.abs(val - Number(question.correct)) <= tol;
  }
  return false;
};

/**
 * Score d'un examen dont les réponses sont stockées par VALEUR.
 * @param {Object} answersByIndex - { [questionIndex]: value }
 * @param {Array} questions
 */
export const scoreByValue = (answersByIndex, questions) => {
  let correct = 0;
  questions.forEach((q, idx) => {
    if (isAnswerCorrectByValue(q, answersByIndex[idx])) correct++;
  });
  const total = questions.length;
  return { percentage: total > 0 ? Math.round((correct / total) * 100) : 0, correct, total };
};

/**
 * Vérifie si un score est suffisant pour passer
 * @param {number} score - Score en pourcentage
 * @param {number} minPass - Minimum pour passer (défaut 60)
 * @returns {boolean}
 */
export const isPassing = (score, minPass = 60) => {
  return score >= minPass;
};

// ================================
// VALIDATION D'EXAMEN
// ================================

/**
 * Valide qu'un utilisateur peut commencer un examen
 * Vérifie une tentative active existante
 * @param {string} userId
 * @param {string} examType - 'global' ou 'module'
 * @param {number} moduleId - Si type=module
 * @returns {Object} {valid: boolean, message?: string}
 */
export const validateExamStart = async (userId, examType, moduleId = null) => {
  // TODO: Vérifier base de données
  // - Pas de tentative active en cours pour cet examen
  // - Si module-cert, vérifier que c'est un module valide
  
  return { valid: true };
};

/**
 * Vérifie qu'une tentative peut être soumise
 * @param {Object} attempt - La tentative de l'exam
 * @returns {Object} {valid: boolean, message?: string}
 */
export const validateExamSubmit = (attempt) => {
  if (!attempt || !attempt.answers || attempt.answers.length === 0) {
    return { valid: false, message: 'Aucune réponse enregistrée' };
  }

  return { valid: true };
};

// ================================
// QUESTIONS ADAPTATIVES
// ================================

export const ADAPTIVE_CONFIG = {
  STREAK_TO_LEVELUP:   2, // bonnes réponses consécutives pour monter
  STREAK_TO_LEVELDOWN: 2, // mauvaises réponses consécutives pour descendre
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 3,
};

/**
 * Récupère une question adaptée au niveau de difficulté demandé,
 * en excluant les questions déjà posées.
 * Si aucune question n'est disponible au niveau exact, prend la plus proche.
 */
export const getAdaptiveQuestion = async (moduleId, difficulty, usedIds = []) => {
  const module = await getModuleById(parseInt(moduleId));
  if (!module) return null;

  const usedSet = new Set(usedIds);

  // Cherche d'abord au niveau exact
  let candidates = module.questions.filter(
    (q) => (q.difficulty ?? 1) === difficulty && !usedSet.has(q.id)
  );

  // Si vide, élargit aux niveaux adjacents puis à tout le module
  if (candidates.length === 0) {
    candidates = module.questions.filter((q) => !usedSet.has(q.id));
  }

  if (candidates.length === 0) return null;

  shuffleArray(candidates);
  return randomizeAnswerOptions({ ...candidates[0], moduleId: module.id });
};

/**
 * Calcule le nouveau niveau de difficulté après une réponse.
 * Retourne { difficulty, streak, wrongStreak } mis à jour.
 */
export const updateAdaptiveDifficulty = (difficulty, streak, wrongStreak) => {
  if (streak >= ADAPTIVE_CONFIG.STREAK_TO_LEVELUP) {
    return {
      difficulty:  Math.min(difficulty + 1, ADAPTIVE_CONFIG.MAX_DIFFICULTY),
      streak:      0,
      wrongStreak: 0,
    };
  }
  if (wrongStreak >= ADAPTIVE_CONFIG.STREAK_TO_LEVELDOWN) {
    return {
      difficulty:  Math.max(difficulty - 1, ADAPTIVE_CONFIG.MIN_DIFFICULTY),
      streak:      0,
      wrongStreak: 0,
    };
  }
  return { difficulty, streak, wrongStreak };
};

// ================================
// UTILITAIRES
// ================================

/**
 * Mélange un array (algorithme Fisher-Yates)
 * @param {Array} array
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

/**
 * Randomise les réponses d'une question
 * @param {Object} question
 * @returns {Object} Question avec réponses randomisées
 */
export const randomizeAnswerOptions = (question) => {
  // Les types input/calculation n'ont pas d'options à randomiser
  if (!Array.isArray(question.options) || question.type === 'input' || question.type === 'calculation') {
    return question;
  }
  const options = [...question.options];
  shuffleArray(options);

  // Choix multiples : `correct` est un TABLEAU d'index à remapper
  if (question.type === 'multi') {
    const correctValues = (Array.isArray(question.correct) ? question.correct : [])
      .map((i) => question.options[i]);
    return { ...question, options, correct: correctValues.map((v) => options.indexOf(v)) };
  }

  // Choix unique : `correct` est un index simple
  const correctAnswer = question.options[question.correct];
  return { ...question, options, correct: options.indexOf(correctAnswer) };
};

/**
 * Formate les secondes restantes en "MM:SS"
 * @param {number} seconds
 * @returns {string}
 */
export const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Vérifie si le temps est critique
 * @param {number} seconds
 * @returns {boolean}
 */
export const isTimeCritical = (seconds) => {
  return seconds <= 300; // 5 dernières minutes
};

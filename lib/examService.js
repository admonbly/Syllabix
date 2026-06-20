// Logique métier des examens
// Règles strictes de certification et entraînement

import { quizData } from './quizData';

// ================================
// CONSTANTES
// ================================

export const EXAM_CONFIG = {
  TRAINING: {
    QUESTIONS_COUNT: 5,
    DURATION: 600, // 10 minutes en secondes
    SHOW_FEEDBACK: true,
    SAVE_RESULTS: false,
    ISSUE_CERTIFICATE: false,
  },
  CERTIFICATION: {
    QUESTIONS_COUNT: 35,
    DURATION: 2100, // 35 minutes en secondes
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: true,
    ISSUE_CERTIFICATE: true,
    MIN_PASS_SCORE: 60, // pourcentage
  },
  // Mode adapté pour les enfants (rôle CHILD)
  CHILD: {
    QUESTIONS_COUNT: 35,
    DURATION: 3600, // 60 minutes — plus de temps pour les enfants
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: true,
    ISSUE_CERTIFICATE: true,
    MIN_PASS_SCORE: 60,
  },
};

// ================================
// RÉCUPÉRATION DES QUESTIONS
// ================================

/**
 * Récupère X questions aléatoires d'un module
 * @param {number} moduleId - ID du module (0-6)
 * @param {number} count - Nombre de questions à retourner
 * @returns {Array} Questions du module
 */
export const getModuleQuestions = (moduleId, count = 5) => {
  const module = quizData.find((m) => m.id === parseInt(moduleId));
  if (!module) return [];

  // Prendre les questions du module et en mélanger
  const questions = [...module.questions];
  shuffleArray(questions);
  
  // Retourner le nombre demandé
  return questions.slice(0, count).map((q) => ({
    ...q,
    module: module.module,
    moduleId: module.id,
  }));
};

/**
 * Récupère X questions aléatoires de TOUS les modules mélangés
 * @param {number} count - Nombre de questions
 * @returns {Array} Questions mélangées
 */
export const getMixedQuestions = (count = 35) => {
  const allQuestions = [];

  // Récupérer toutes les questions de tous les modules
  quizData.forEach((module) => {
    module.questions.forEach((question) => {
      allQuestions.push({
        ...question,
        module: module.module,
        moduleId: module.id,
      });
    });
  });

  // Mélanger l'array
  shuffleArray(allQuestions);

  // Retourner le nombre demandé
  return allQuestions.slice(0, count);
};

/**
 * Récupère X questions d'un module ET en répète si nécessaire pour atteindre count
 * Utile si un module a moins de 35 questions
 * @param {number} moduleId - ID du module
 * @param {number} count - Nombre de questions à retourner
 * @returns {Array} Questions (potentiellement répétées et mélangées)
 */
export const getModuleQuestionsWithRepeat = (moduleId, count = 35) => {
  const module = quizData.find((m) => m.id === parseInt(moduleId));
  if (!module) return [];

  const questions = [];
  const sourceQuestions = module.questions;

  // Remplir le tableau en répétant si nécessaire
  while (questions.length < count) {
    sourceQuestions.forEach((question) => {
      if (questions.length < count) {
        questions.push({
          ...question,
          module: module.module,
          moduleId: module.id,
        });
      }
    });
  }

  // Mélanger
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
  const options = [...question.options];
  const correctIndex = question.correct;
  const correctAnswer = options[correctIndex];

  shuffleArray(options);

  const newCorrectIndex = options.indexOf(correctAnswer);

  return {
    ...question,
    options,
    correct: newCorrectIndex,
  };
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

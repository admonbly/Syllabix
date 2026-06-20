'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import {
  getModuleQuestions,
  getMixedQuestions,
  calculateScore,
  formatTime,
  isTimeCritical,
  randomizeAnswerOptions,
  EXAM_CONFIG,
} from '@/lib/examService';

/**
 * Composant d'entraînement
 * - 5 questions
 * - 10 minutes
 * - Feedback immédiat
 * - Pas de certificat
 * - Résultats non enregistrés
 */
/** @param {{ mode?: string, moduleId?: string | number | null }} props */
export default function TrainingQuizComponent({ mode = 'module', moduleId = null }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.TRAINING.DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialiser les questions au montage
  useEffect(() => {
    setIsMounted(true);
    loadQuestions();
  }, []);

  // Timer
  useEffect(() => {
    if (!timerStarted || showResults) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowResults(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, showResults]);

  const loadQuestions = () => {
    let quizQuestions = [];

    if (mode === 'module' && moduleId) {
      quizQuestions = getModuleQuestions(moduleId, EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
    } else if (mode === 'mixed') {
      quizQuestions = getMixedQuestions(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
    }

    // Randomiser les réponses
    quizQuestions = quizQuestions.map(randomizeAnswerOptions);

    setQuestions(quizQuestions);
    setLoading(false);

    // Démarrer le timer
    setTimeout(() => setTimerStarted(true), 500);
  };

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600">Chargement des questions...</p>
        </div>
      </section>
    );
  }

  if (!isMounted || questions.length === 0) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-neutral-600">Erreur lors du chargement</p>
      </section>
    );
  }

  const question = questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;
  const isCorrect = answered && answers[currentQuestion] === question.correct;

  // Afficher résultats
  if (showResults) {
    const scoreData = calculateScore(
      Object.entries(answers).map(([qIdx, ans]) => ({
        questionId: questions[qIdx].id,
        userAnswer: ans,
      })),
      questions
    );

    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-heading font-bold text-primary mb-2">
              Entraînement terminé!
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Vous avez complété cet entraînement
            </p>

            <Card className="mb-8">
              <div className="text-center">
                <p className="text-6xl font-bold text-accent mb-4">{scoreData.percentage}%</p>
                <p className="text-neutral-600">
                  Score: {scoreData.correct} sur {scoreData.total} bonnes réponses
                </p>
              </div>
            </Card>

            <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
              <p className="text-neutral-700">
                💡 Cet entraînement n'est pas enregistré. Ses résultats sont à titre informatif uniquement.
              </p>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                  setTimeLeft(EXAM_CONFIG.TRAINING.DURATION);
                  setTimerStarted(false);
                  setTimeout(() => setTimerStarted(true), 500);
                }}
                variant="primary"
                size="lg"
              >
                🔄 Recommencer
              </CTAButton>
              <CTAButton href="/training" variant="outline" size="lg">
                ← Retour aux formations
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Afficher question
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <div>
              <p className="text-sm text-neutral-600">
                Question {currentQuestion + 1} / {questions.length}
              </p>
              <div className="mt-2 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className={`text-lg font-bold ${isTimeCritical(timeLeft) ? 'text-red-600' : 'text-primary'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <p className="text-xl font-semibold text-neutral-800 mb-6">{question.text}</p>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAnswers({ ...answers, [currentQuestion]: index });
                  }}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition-all ${
                    answers[currentQuestion] === index
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-neutral-200 hover:border-accent cursor-pointer'
                  } ${answered ? 'opacity-75' : 'hover:shadow-md'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback immédiat */}
          {answered && (
            <div
              className={`p-4 rounded-lg mb-8 text-center ${
                isCorrect ? 'bg-green-50 border border-green-500' : 'bg-red-50 border border-red-500'
              }`}
            >
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✅ Bonne réponse!' : '❌ Mauvaise réponse'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-neutral-700 mt-2">
                  La bonne réponse est: <strong>{question.options[question.correct]}</strong>
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                ← Précédent
              </button>
            )}
            <div className="flex-1" />
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={!answered}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  answered
                    ? 'bg-accent text-white hover:shadow-lg cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                disabled={!answered}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  answered
                    ? 'bg-green-600 text-white hover:shadow-lg cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                ✓ Terminer
              </button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

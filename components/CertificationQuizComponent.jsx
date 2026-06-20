'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { auth, userDB } from '@/lib/firebase';
import {
  getModuleQuestionsWithRepeat,
  getMixedQuestions,
  calculateScore,
  isPassing,
  formatTime,
  isTimeCritical,
  randomizeAnswerOptions,
  EXAM_CONFIG,
} from '@/lib/examService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/** @param {{ mode?: string, moduleId?: string | number | null, certificateType?: string | null }} props */
export default function CertificationQuizComponent({
  mode = 'global',
  moduleId = null,
  certificateType = null,
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isChildMode, setIsChildMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.CERTIFICATION.DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certId, setCertId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    loadQuestions();

    // Détecter le rôle CHILD pour adapter le timer et l'UI
    const detectChildMode = async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const profile = await userDB.getUserProfile(firebaseUser.uid);
        if (profile?.role === 'CHILD') {
          setIsChildMode(true);
          setTimeLeft(EXAM_CONFIG.CHILD.DURATION);
        }
      }
    };
    detectChildMode();
  }, []);

  // Timer avec soumission auto
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

  // Sauvegarde locale de secours toutes les 10 secondes
  useEffect(() => {
    if (!timerStarted || showResults) return;

    const interval = setInterval(() => {
      localStorage.setItem('exam_backup', JSON.stringify({ questions, answers }));
    }, 10000);

    return () => clearInterval(interval);
  }, [answers, timerStarted, showResults]);

  // Soumission au backend + sauvegarde certificat quand les résultats s'affichent
  useEffect(() => {
    if (!showResults || questions.length === 0) return;

    const computed = calculateScore(
      Object.entries(answers).map(([qIdx, ans]) => ({
        questionId: questions[qIdx].id,
        userAnswer: ans,
      })),
      questions
    );
    setScoreData(computed);

    const passed = isPassing(computed.percentage);
    const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : null;

    const submitAndSaveCert = async () => {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = {
        moduleId: moduleId !== null ? String(moduleId) : null,
        examType: mode === 'module' ? 'CERTIFICATION_MODULE' : 'CERTIFICATION_GLOBAL',
        answers: Object.entries(answers).map(([qIdx, answerIndex]) => ({
          questionId: questions[qIdx].id,
          userAnswerIndex: answerIndex,
          timeSpentSeconds: null,
        })),
        score: computed.percentage,
        durationSeconds,
        submittedAt: new Date().toISOString(),
      };

      try {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          await fetch(`${API_BASE}/api/exams/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        // Soumission API échouée — on continue quand même pour l'UX
        setSubmitError('Résultats non synchronisés avec le serveur. Ils seront sauvegardés localement.');
        console.error('API submission failed:', err);
      }

      // Sauvegarder le certificat dans Firestore si réussi
      if (passed) {
        try {
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const id = await userDB.saveCertificate(firebaseUser.uid, {
              moduleId: moduleId !== null ? moduleId : null,
              examType: certificateType || (mode === 'module' ? 'MODULE' : 'GLOBAL'),
              score: computed.percentage,
              issuedAt: new Date().toISOString(),
            });
            setCertId(id);

            // Sauvegarder aussi la progression du module
            if (moduleId !== null) {
              await userDB.saveUserProgress(firebaseUser.uid, String(moduleId), computed.percentage, []);
            }
          }
        } catch (err) {
          console.error('Certificate save failed:', err);
          setSubmitError('Certificat non sauvegardé. Contactez le support.');
        }
      }

      // Nettoyer la sauvegarde locale
      localStorage.removeItem('exam_backup');
      setIsSubmitting(false);
    };

    submitAndSaveCert();
  }, [showResults]);

  const loadQuestions = () => {
    let quizQuestions = [];

    if (mode === 'module' && moduleId !== null) {
      quizQuestions = getModuleQuestionsWithRepeat(moduleId, EXAM_CONFIG.CERTIFICATION.QUESTIONS_COUNT);
    } else {
      quizQuestions = getMixedQuestions(EXAM_CONFIG.CERTIFICATION.QUESTIONS_COUNT);
    }

    quizQuestions = quizQuestions.map(randomizeAnswerOptions);
    setQuestions(quizQuestions);
    setLoading(false);
  };

  const handleStartExam = () => {
    setShowInstructions(false);
    setTimerStarted(true);
    setStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-neutral-600">Chargement de l'examen...</p>
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

  // AFFICHER INSTRUCTIONS
  if (showInstructions) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <Card className={`p-8 ${isChildMode ? 'text-lg' : ''}`}>
            <h2 className={`font-heading font-bold text-primary mb-6 ${isChildMode ? 'text-4xl' : 'text-3xl'}`}>
              {isChildMode ? '🌟 Instructions de l\'examen' : 'Instructions de l\'examen'}
            </h2>

            {isChildMode && (
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 mb-4">
                <p className="font-semibold text-purple-800">Mode Enfant activé — Tu as plus de temps !</p>
              </div>
            )}

            <div className="space-y-4 mb-8 text-neutral-700">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-semibold mb-2">📋 Nombre de questions:</p>
                <p>35 questions mixtes</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="font-semibold mb-2">⏱ Durée:</p>
                <p>{isChildMode ? '60 minutes' : '35 minutes (1 minute par question)'}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold mb-2">✅ Pour réussir:</p>
                <p>Vous devez obtenir un score d'au moins 60%</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">📜 Certificat:</p>
                <p>Un certificat officiel sera généré si vous réussissez</p>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>⚠️ Règles importantes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Une seule réponse possible par question</li>
                  <li>Vous ne pouvez pas revenir en arrière</li>
                  <li>Le timer démarre immédiatement et ne peut pas être arrêté</li>
                  <li>Soumission automatique à la fin du temps</li>
                  <li>Les réponses sont sauvegardées automatiquement</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <CTAButton variant="primary" size="lg" onClick={handleStartExam} className="w-full md:w-auto">
                Commencer l'examen
              </CTAButton>
              <CTAButton variant="outline" size="lg" href="/certification" className="w-full md:w-auto">
                Annuler
              </CTAButton>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  const question = questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;

  // AFFICHER RÉSULTATS
  if (showResults) {
    const score = scoreData || { percentage: 0, correct: 0, total: questions.length };
    const passed = isPassing(score.percentage);
    const emoji = score.percentage >= 80 ? '🏆' : score.percentage >= 60 ? '✅' : '❌';

    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{isSubmitting ? '⏳' : emoji}</div>
            <h2 className="text-4xl font-heading font-bold text-primary mb-2">
              {isSubmitting ? 'Enregistrement...' : passed ? 'Bravo!' : 'Certificat non obtenu'}
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Vous avez terminé l'examen de certification
            </p>

            <Card className="mb-8">
              <div className="text-center">
                <p className="text-6xl font-bold text-accent mb-4">{score.percentage}%</p>
                <p className="text-neutral-600">
                  Score: {score.correct} sur {score.total} bonnes réponses
                </p>
              </div>
            </Card>

            {submitError && (
              <Card className="mb-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">⚠️ {submitError}</p>
              </Card>
            )}

            {passed && !isSubmitting && (
              <Card variant="accent" className="mb-8 bg-green-50 border-l-4 border-green-500">
                <p className="text-lg text-green-700 mb-4">✅ Vous avez réussi!</p>
                {certId ? (
                  <p className="text-neutral-600">
                    Votre certificat a été généré et est disponible à télécharger.
                  </p>
                ) : (
                  <p className="text-neutral-600">
                    Un certificat officiel sera généré et disponible dans votre tableau de bord.
                  </p>
                )}
              </Card>
            )}

            {!passed && !isSubmitting && (
              <Card className="mb-8 bg-orange-50 border-l-4 border-orange-500">
                <p className="text-lg text-orange-700 mb-4">⚠️ Résultat insuffisant</p>
                <p className="text-neutral-600">
                  Vous avez besoin d'au moins 60% pour obtenir le certificat. Vous pouvez retenter l'examen.
                </p>
              </Card>
            )}

            {!isSubmitting && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {passed && certId && (
                  <CTAButton href={`/certificate/${certId}`} variant="primary" size="lg">
                    📜 Voir le certificat
                  </CTAButton>
                )}
                {passed && !certId && (
                  <CTAButton href="/dashboard" variant="primary" size="lg">
                    📊 Mon tableau de bord
                  </CTAButton>
                )}
                <CTAButton
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResults(false);
                    setShowInstructions(true);
                    setTimeLeft(EXAM_CONFIG.CERTIFICATION.DURATION);
                    setTimerStarted(false);
                    setStartTime(null);
                    setScoreData(null);
                    setCertId(null);
                    setSubmitError(null);
                    window.location.reload();
                  }}
                  variant={passed ? 'outline' : 'primary'}
                  size="lg"
                >
                  {passed ? '← Retour' : '🔄 Retenter'}
                </CTAButton>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // AFFICHER QUESTION
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
            <p className={`font-semibold text-neutral-800 mb-4 ${isChildMode ? 'text-2xl' : 'text-xl'}`}>{question.text}</p>
            {question.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
                <img
                  src={question.imageUrl}
                  alt="Contexte visuel de la question"
                  className="w-full max-h-64 object-contain bg-neutral-50"
                />
              </div>
            )}

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setAnswers({ ...answers, [currentQuestion]: index })}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-accent bg-accent/10'
                      : 'border-neutral-200 hover:border-accent cursor-pointer'
                  } ${answered ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                ← Précédent
              </button>
            )}
            <div className="flex-1" />
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
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
                ✓ Soumettre
              </button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

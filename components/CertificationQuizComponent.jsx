'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { auth, userDB } from '@/lib/firebase';
import { useLanguage } from '@/lib/LanguageContext';
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
  const [cooldownRemaining, setCooldownRemaining] = useState(null);
  const { t } = useLanguage();
  const ct = (k) => t(`quiz.cert.${k}`);
  const qt = (k) => t(`quiz.results.${k}`);

  useEffect(() => {
    setIsMounted(true);
    loadQuestions();

    const init = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      // Détecter le rôle CHILD
      const profile = await userDB.getUserProfile(firebaseUser.uid);
      if (profile?.role === 'CHILD') {
        setIsChildMode(true);
        setTimeLeft(EXAM_CONFIG.CHILD.DURATION);
      }

      // Vérifier le cooldown (24h entre chaque tentative)
      const examKey = mode === 'module' && moduleId !== null
        ? `certification_module_${moduleId}`
        : 'certification_global';
      const lastAttempt = await userDB.getLastCertAttempt(firebaseUser.uid, examKey);
      if (lastAttempt?.lastAttemptAt) {
        const elapsed = Date.now() - new Date(lastAttempt.lastAttemptAt).getTime();
        const cooldownMs = 24 * 60 * 60 * 1000; // 24h
        if (elapsed < cooldownMs) {
          setCooldownRemaining(Math.ceil((cooldownMs - elapsed) / 1000));
        }
      }
    };
    init();
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

      // Sauvegarder cooldown (toujours, même en cas d'échec)
      const firebaseUser2 = auth.currentUser;
      if (firebaseUser2) {
        const examKey = mode === 'module' && moduleId !== null
          ? `certification_module_${moduleId}`
          : 'certification_global';
        await userDB.saveCertAttempt(firebaseUser2.uid, examKey);
      }

      // Sauvegarder le certificat dans Firestore si réussi
      if (passed) {
        try {
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const issuedAt = new Date().toISOString();
            const id = await userDB.saveCertificate(firebaseUser.uid, {
              displayName: firebaseUser.displayName || firebaseUser.email || 'Apprenant',
              moduleId: moduleId !== null ? moduleId : null,
              examType: certificateType || (mode === 'module' ? 'MODULE' : 'GLOBAL'),
              score: computed.percentage,
              issuedAt,
            });
            setCertId(id);

            // Sauvegarder aussi la progression du module
            if (moduleId !== null) {
              await userDB.saveUserProgress(firebaseUser.uid, String(moduleId), computed.percentage, []);
            }

            // Notification email (non bloquant)
            try {
              const token = await firebaseUser.getIdToken();
              await fetch('/api/notify/certificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  certId: id,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || '',
                  score: computed.percentage,
                  examType: certificateType || (mode === 'module' ? 'MODULE' : 'GLOBAL'),
                  moduleId: moduleId !== null ? moduleId : null,
                }),
              });
            } catch (_) { /* email optionnel */ }
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

  // Décompte cooldown en temps réel
  useEffect(() => {
    if (!cooldownRemaining) return;
    const t = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) { clearInterval(t); return null; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownRemaining]);

  const loadQuestions = async () => {
    let quizQuestions = mode === 'module' && moduleId !== null
      ? await getModuleQuestionsWithRepeat(moduleId, EXAM_CONFIG.CERTIFICATION.QUESTIONS_COUNT)
      : await getMixedQuestions(EXAM_CONFIG.CERTIFICATION.QUESTIONS_COUNT);
    setQuestions(quizQuestions.map(randomizeAnswerOptions));
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
        <p className="text-lg text-neutral-600">{t('quiz.loading')}</p>
      </section>
    );
  }

  if (!isMounted || questions.length === 0) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-neutral-600">{t('quiz.noQuestions')}</p>
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
              {isChildMode ? `🌟 ${ct('instructions')}` : ct('instructions')}
            </h2>

            {isChildMode && (
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 mb-4">
                <p className="font-semibold text-purple-800">{ct('childMode')}</p>
              </div>
            )}

            <div className="space-y-4 mb-8 text-neutral-700">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-semibold mb-2">📋 {ct('questions')}</p>
                <p>{ct('questionsVal')}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="font-semibold mb-2">⏱ {ct('duration')}</p>
                <p>{isChildMode ? ct('durationChild') : ct('durationVal')}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold mb-2">✅ {ct('pass')}</p>
                <p>{ct('passVal')}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">📜 {ct('certificate')}</p>
                <p>{ct('certVal')}</p>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>⚠️ {ct('rules')}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{ct('rule1')}</li>
                  <li>{ct('rule2')}</li>
                  <li>{ct('rule3')}</li>
                  <li>{ct('rule4')}</li>
                  <li>{ct('rule5')}</li>
                </ul>
              </div>
            </div>

            {cooldownRemaining ? (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-5 text-center">
                <p className="text-orange-700 font-bold text-lg mb-1">⏳ {ct('cooldownTitle')}</p>
                <p className="text-orange-600 text-sm mb-2">
                  {ct('cooldownDesc')}
                </p>
                <p className="text-3xl font-bold text-orange-700">
                  {Math.floor(cooldownRemaining / 3600)}h {Math.floor((cooldownRemaining % 3600) / 60)}m {cooldownRemaining % 60}s
                </p>
                <p className="text-xs text-orange-500 mt-2">
                  {ct('cooldownNote')}
                </p>
                <CTAButton variant="outline" size="lg" href="/training" className="mt-4 w-full md:w-auto">
                  {ct('cooldownCta')}
                </CTAButton>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <CTAButton variant="primary" size="lg" onClick={handleStartExam} className="w-full md:w-auto">
                  {ct('start')}
                </CTAButton>
                <CTAButton variant="outline" size="lg" href="/certification" className="w-full md:w-auto">
                  {ct('cancel')}
                </CTAButton>
              </div>
            )}
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
              {isSubmitting ? qt('submitting') : passed ? qt('passed') : qt('failed')}
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              {qt('done')}
            </p>

            <Card className="mb-8">
              <div className="text-center">
                <p className="text-6xl font-bold text-accent mb-4">{score.percentage}%</p>
                <p className="text-neutral-600">
                  {score.correct} {qt('score')} {score.total}
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
                <p className="text-lg text-green-700 mb-4">✅ {qt('passedDesc')}</p>
                {certId ? (
                  <p className="text-neutral-600">
                    {qt('certGenerated')}
                  </p>
                ) : (
                  <p className="text-neutral-600">
                    {qt('certPending')}
                  </p>
                )}
              </Card>
            )}

            {!passed && !isSubmitting && (
              <Card className="mb-8 bg-orange-50 border-l-4 border-orange-500">
                <p className="text-lg text-orange-700 mb-4">⚠️ {qt('failed')}</p>
                <p className="text-neutral-600">
                  {qt('failedDesc')}
                </p>
              </Card>
            )}

            {!isSubmitting && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {passed && certId && (
                  <CTAButton href={`/certificate/${certId}`} variant="primary" size="lg">
                    {qt('viewCert')}
                  </CTAButton>
                )}
                {passed && !certId && (
                  <CTAButton href="/dashboard" variant="primary" size="lg">
                    {qt('dashboard')}
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
                  {passed ? qt('train') : qt('restart')}
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
                {t('quiz.question')} {currentQuestion + 1} / {questions.length}
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
                {t('quiz.previous')}
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
                {t('quiz.next')}
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
                {t('quiz.submit')}
              </button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

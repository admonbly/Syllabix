'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { auth } from '@/lib/firebase';
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
  const [flagged,          setFlagged]          = useState(new Set());
  const [showReview,       setShowReview]        = useState(false);
  const [showFinishWarning,setShowFinishWarning] = useState(false);
  const [showFlaggedPanel, setShowFlaggedPanel]  = useState(false);
  const [isChildMode, setIsChildMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.CERTIFICATION.DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  const hasSubmitted = useRef(false);

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
          // Forcer la sortie des écrans intermédiaires avant d'afficher les résultats
          setShowReview(false);
          setShowFinishWarning(false);
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
      localStorage.setItem('exam_backup', JSON.stringify({ answers }));
    }, 10000);

    return () => clearInterval(interval);
  }, [answers, timerStarted, showResults]);

  // Soumission au serveur quand les résultats s'affichent
  useEffect(() => {
    if (!showResults || questions.length === 0 || hasSubmitted.current) return;
    hasSubmitted.current = true;

    const submitToServer = async () => {
      setIsSubmitting(true);
      setSubmitError(null);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setSubmitError('Utilisateur non connecté.');
        setIsSubmitting(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();

        // Envoyer les réponses brutes — le score est calculé côté serveur
        const rawAnswers = Object.entries(answers).map(([qIdx, answerIndex]) => ({
          questionId: questions[parseInt(qIdx)].id,
          userAnswerIndex: answerIndex,
        }));

        const res = await fetch('/api/exam/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: rawAnswers,
            moduleId: moduleId !== null ? moduleId : null,
            examType: certificateType || (mode === 'module' ? 'MODULE' : 'GLOBAL'),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Affichage local en fallback (score non certifié)
          const fallback = calculateScore(
            Object.entries(answers).map(([qIdx, ans]) => ({
              questionId: questions[qIdx].id,
              userAnswer: ans,
            })),
            questions
          );
          setScoreData(fallback);
          setSubmitError(
            res.status === 429
              ? 'Cooldown actif. Vos résultats ne sont pas certifiés.'
              : (data.error || 'Erreur serveur. Résultats non sauvegardés.')
          );
        } else {
          setScoreData({ percentage: data.percentage, correct: data.correct, total: data.total });
          if (data.certId) {
            setCertId(data.certId);
            // Notification email (non bloquant)
            fetch('/api/notify/certificate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                certId: data.certId,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                score: data.percentage,
                examType: certificateType || (mode === 'module' ? 'MODULE' : 'GLOBAL'),
                moduleId: moduleId !== null ? moduleId : null,
              }),
            }).catch(() => {});
          }
          // Transmission à l'API externe si configurée
          const apiBase = process.env.NEXT_PUBLIC_API_URL;
          if (apiBase) {
            fetch(`${apiBase}/api/exams/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                moduleId: moduleId !== null ? String(moduleId) : null,
                examType: mode === 'module' ? 'CERTIFICATION_MODULE' : 'CERTIFICATION_GLOBAL',
                score: data.percentage,
                submittedAt: new Date().toISOString(),
              }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Submission error:', err);
        // Fallback affichage local uniquement
        const fallback = calculateScore(
          Object.entries(answers).map(([qIdx, ans]) => ({
            questionId: questions[qIdx].id,
            userAnswer: ans,
          })),
          questions
        );
        setScoreData(fallback);
        setSubmitError('Erreur réseau. Résultats non certifiés. Contactez le support.');
      }

      localStorage.removeItem('exam_backup');
      setIsSubmitting(false);
    };

    submitToServer();
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
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFlag = (idx) => {
    setFlagged((prev) => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  const handleFinishRequest = () => {
    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      setShowFinishWarning(true);
    } else if (flagged.size > 0) {
      setShowReview(true);
    } else {
      setShowResults(true);
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

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                <p className="font-semibold mb-2">🚩 Signets — marquer pour revenir</p>
                <p className="text-sm">Clique sur le drapeau 🚩 à côté de chaque question pour la marquer. Tu pourras naviguer vers toutes tes questions marquées depuis le badge <strong>🚩 N</strong> en bas, ou les réviser en lot avant de terminer.</p>
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
  const answeredCount = Object.keys(answers).length;

  // ÉCRAN DE RÉVISION DES QUESTIONS MARQUÉES
  if (showReview) {
    const flaggedList = [...flagged].sort((a, b) => a - b);
    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <div className="text-5xl mb-3">🚩</div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">Questions marquées</h2>
              <p className="text-neutral-500">Tu as marqué {flaggedList.length} question{flaggedList.length > 1 ? 's' : ''}. Révise-les avant de terminer.</p>
            </div>
            <div className={`text-lg font-bold px-4 py-2 rounded-xl border ${isTimeCritical(timeLeft) ? 'border-red-300 bg-red-50 text-red-600' : 'border-neutral-200 bg-white text-primary'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="space-y-6 mb-8">
            {flaggedList.map((idx) => {
              const q = questions[idx];
              const userAnswer = answers[idx];
              return (
                <Card key={idx} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-neutral-800 text-base leading-relaxed flex-1 pr-3">
                      <span className="text-neutral-400 text-sm mr-2">Q{idx + 1}</span>{q.text}
                    </p>
                    <button onClick={() => { setCurrentQuestion(idx); setShowReview(false); }} className="text-xs px-3 py-1.5 border border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors whitespace-nowrap">
                      Modifier
                    </button>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((prev) => ({ ...prev, [idx]: oi }))}
                        className={`w-full p-3 text-left rounded-lg border-2 text-sm font-medium transition-all ${
                          answers[idx] === oi
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-neutral-200 hover:border-accent/50 hover:bg-accent/5'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 rounded-full bg-neutral-100 text-center text-xs font-bold mr-2 leading-6">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {userAnswer === undefined && (
                    <p className="mt-2 text-xs text-orange-500 font-medium">⚠️ Non répondu</p>
                  )}
                </Card>
              );
            })}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowReview(false)} className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300 transition-colors">
              Continuer l'examen
            </button>
            <button onClick={() => { setShowReview(false); setShowResults(true); }} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
              Terminer l'examen
            </button>
          </div>
        </div>
      </section>
    );
  }

  // AVERTISSEMENT QUESTIONS NON RÉPONDUES
  if (showFinishWarning) {
    const unanswered = questions.length - answeredCount;
    const flaggedUnanswered = [...flagged].filter((i) => answers[i] === undefined);
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className={`text-center mb-4 text-lg font-bold ${isTimeCritical(timeLeft) ? 'text-red-600' : 'text-primary'}`}>
            ⏱ {formatTime(timeLeft)} restantes
          </div>
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-heading font-bold text-primary mb-3">Questions sans réponse</h2>
            <p className="text-neutral-600 mb-6">
              Il reste <span className="font-bold text-orange-600">{unanswered} question{unanswered > 1 ? 's' : ''}</span> sans réponse.<br />
              Une question sans réponse compte comme fausse.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setShowFinishWarning(false); const first = [...Array(questions.length).keys()].find((i) => answers[i] === undefined); if (first !== undefined) setCurrentQuestion(first); }} className="w-full px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors">
                Répondre aux questions manquantes
              </button>
              {flagged.size > 0 ? (
                <button onClick={() => { setShowFinishWarning(false); setShowReview(true); }} className="w-full px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
                  Voir les questions marquées puis terminer
                </button>
              ) : null}
              <button onClick={() => { setShowFinishWarning(false); setShowResults(true); }} className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors">
                Terminer quand même ({unanswered} non répondue{unanswered > 1 ? 's' : ''})
              </button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

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
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm text-neutral-600">
                  {t('quiz.question')} {currentQuestion + 1} / {questions.length}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${answeredCount === questions.length ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {answeredCount}/{questions.length} répondues
                </span>
              </div>
              <div className="mt-1 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className={`text-lg font-bold ml-4 ${isTimeCritical(timeLeft) ? 'text-red-600' : 'text-primary'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-3 mb-4">
              <p className={`font-semibold text-neutral-800 flex-1 ${isChildMode ? 'text-2xl' : 'text-xl'}`}>{question.text}</p>
              <button
                onClick={() => toggleFlag(currentQuestion)}
                title={flagged.has(currentQuestion) ? 'Retirer le signet' : 'Marquer cette question'}
                className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${flagged.has(currentQuestion) ? 'bg-orange-100 border-orange-400 text-orange-500' : 'border-neutral-200 text-neutral-300 hover:border-orange-300 hover:text-orange-400'}`}
              >
                🚩
              </button>
            </div>
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
                  className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition-all hover:shadow-md ${
                    answers[currentQuestion] === index
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-neutral-200 hover:border-accent cursor-pointer'
                  }`}
                >
                  <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between items-center">
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                {t('quiz.previous')}
              </button>
            )}
            <div className="flex-1" />
            {/* Bouton signet raccourci — ouvre le popup de navigation */}
            {flagged.size > 0 && (
              <button
                onClick={() => setShowFlaggedPanel((v) => !v)}
                className="px-4 py-3 border-2 border-orange-300 text-orange-500 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
              >
                🚩 {flagged.size}
              </button>
            )}
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                {t('quiz.next')}
              </button>
            ) : (
              <button
                onClick={handleFinishRequest}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                {t('quiz.submit')}
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Popup — liste des questions marquées */}
      {showFlaggedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowFlaggedPanel(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-primary text-base">🚩 Questions marquées ({flagged.size})</h3>
              <button onClick={() => setShowFlaggedPanel(false)} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Clique sur une question pour y aller directement.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...flagged].sort((a, b) => a - b).map((idx) => {
                const q = questions[idx];
                if (!q) return null;
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentQuestion(idx); setShowFlaggedPanel(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-neutral-700 flex-1 line-clamp-2">{q.text}</span>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isAnswered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                      {isAnswered ? '✓' : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setShowFlaggedPanel(false); setShowReview(true); }}
              className="mt-4 w-full py-2 text-sm font-semibold text-orange-500 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Réviser toutes les questions marquées →
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import {
  getMixedQuestions,
  scoreByValue,
  isAnswerCorrectByValue,
  randomizeAnswerOptions,
  formatTime,
  isTimeCritical,
  EXAM_CONFIG,
  getAdaptiveQuestion,
  updateAdaptiveDifficulty,
} from '@/lib/examService';
import { useLanguage } from '@/lib/LanguageContext';
import { auth, userDB } from '@/lib/firebase';
import { ExamPracticalBlock, ExamAnswerInput, hasAnswerValue } from '@/components/ExamAnswerInput';

const DIFFICULTY_UI = {
  1: { fr: 'Facile',    en: 'Easy',   cls: 'bg-green-100 text-green-700',   dotCls: 'bg-green-500' },
  2: { fr: 'Moyen',     en: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dotCls: 'bg-yellow-500' },
  3: { fr: 'Difficile', en: 'Hard',   cls: 'bg-red-100 text-red-700',       dotCls: 'bg-red-500' },
};

function CheckIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
}
function XIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
}
function FlagIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
}
function LightbulbIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" /></svg>;
}

/** Libellé de la bonne réponse, pour le feedback. */
function correctAnswerLabel(question) {
  const type = question.type || 'single';
  if (type === 'single') return question.options?.[question.correct] ?? '';
  if (type === 'multi')  return (question.correct ?? []).map((i) => question.options?.[i]).filter(Boolean).join(' + ');
  if (type === 'input')  return (question.acceptableAnswers ?? [question.correct]).join(' / ');
  if (type === 'calculation') return `${question.correct}${question.unit ? ' ' + question.unit : ''}`;
  return '';
}

/** @param {{ mode?: string, moduleId?: string | number | null }} props */
export default function EvaluationQuizComponent({ mode = 'mixed', moduleId = null }) {
  const { locale, t } = useLanguage();
  const ev = (k) => t(`quiz.eval.${k}`);

  const isAdaptive = mode === 'module';
  const total = EXAM_CONFIG.EVALUATION.QUESTIONS_COUNT;

  const [phase,           setPhase]           = useState('intro');
  const [questions,       setQuestions]       = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers,         setAnswers]         = useState({});
  const [timeLeft,        setTimeLeft]        = useState(EXAM_CONFIG.EVALUATION.DURATION);
  const [loading,         setLoading]         = useState(true);
  const [flagged,          setFlagged]          = useState(new Set());
  const [showReview,       setShowReview]       = useState(false);
  const [showWarning,      setShowWarning]      = useState(false);
  const [showFlaggedPanel, setShowFlaggedPanel] = useState(false);

  // Adaptive state
  const [difficulty,  setDifficulty]  = useState(1);
  const [streak,      setStreak]      = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [usedIds,     setUsedIds]     = useState([]);

  const intervalRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (isAdaptive) {
        const first = await getAdaptiveQuestion(moduleId, 1, []);
        if (first) {
          setQuestions([first]);
          setUsedIds([first.id ?? first.text]);
        }
      } else {
        const q = await getMixedQuestions(total);
        setQuestions(q.map(randomizeAnswerOptions));
      }
      setLoading(false);
    };
    load();
  }, []);

  // Timer — démarre quand phase === 'quiz'
  useEffect(() => {
    if (phase !== 'quiz') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Forcer la sortie des écrans intermédiaires
          setShowReview(false);
          setShowWarning(false);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // Passe à la question suivante (avec logique adaptative en mode module).
  // La réponse courante (par VALEUR) doit déjà être dans `answers`.
  const advance = async (valueOverride) => {
    const value = valueOverride !== undefined ? valueOverride : answers[currentQuestion];

    if (!isAdaptive) {
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion((q) => q + 1), 400);
      }
      return;
    }

    const isCorrect = isAnswerCorrectByValue(questions[currentQuestion], value);
    const newStreak      = isCorrect ? streak + 1 : 0;
    const newWrongStreak = isCorrect ? 0 : wrongStreak + 1;
    const updated = updateAdaptiveDifficulty(difficulty, newStreak, newWrongStreak);
    setDifficulty(updated.difficulty);
    setStreak(updated.streak);
    setWrongStreak(updated.wrongStreak);

    const nextIdx = currentQuestion + 1;
    if (nextIdx < total) {
      setTimeout(async () => {
        const next = await getAdaptiveQuestion(moduleId, updated.difficulty, usedIds);
        if (next) {
          setQuestions((prev) => [...prev, next]);
          setUsedIds((prev) => [...prev, next.id ?? next.text]);
        }
        setCurrentQuestion(nextIdx);
      }, 400);
    }
  };

  // Choix unique : un clic répond et affiche le feedback (bonne/mauvaise
  // réponse + explication). Verrouillé ensuite ; l'utilisateur enchaîne avec le
  // bouton « Suivant » après avoir lu le feedback.
  const handleSingleAnswer = (value) => {
    if (hasAnswerValue(answers[currentQuestion])) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const toggleFlag = (idx) => {
    setFlagged((prev) => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });
  };

  const handleSubmitRequest = () => {
    const answeredCount = questions.reduce((n, _, i) => n + (hasAnswerValue(answers[i]) ? 1 : 0), 0);
    const loadedCount = questions.length;
    if (answeredCount < loadedCount) {
      setShowWarning(true);
    } else if (flagged.size > 0) {
      setShowReview(true);
    } else {
      clearInterval(intervalRef.current);
      setPhase('results');
    }
  };

  const handleSubmit = () => {
    clearInterval(intervalRef.current);
    setPhase('results');
  };

  // Sauvegarde session quand résultats affichés
  useEffect(() => {
    if (phase !== 'results' || questions.length === 0) return;
    const user = auth.currentUser;
    if (!user) return;
    const scoreData = scoreByValue(answers, questions);
    userDB.saveSession(user.uid, {
      type: 'evaluation',
      mode,
      moduleId: moduleId !== null ? String(moduleId) : null,
      score: scoreData.percentage,
      correct: scoreData.correct,
      total: scoreData.total,
      questionsCount: questions.length,
    });
  }, [phase]);

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">{ev('start')}</p>
      </section>
    );
  }

  // ——— Intro ———
  if (phase === 'intro') {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-3">{ev('title')}</h1>
            <p className="text-neutral-600 mb-6">{ev('desc')}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-accent/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-accent">{EXAM_CONFIG.EVALUATION.QUESTIONS_COUNT}</p>
                <p className="text-xs text-neutral-500 mt-1">{ev('questions')}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">{Math.round(EXAM_CONFIG.EVALUATION.DURATION / 60)} min</p>
                <p className="text-xs text-neutral-500 mt-1">{ev('duration')}</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">{ev('type')}</p>
                <p className="text-xs text-neutral-500 mt-1">{ev('typeDesc')}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-blue-800 font-semibold mb-2">{ev('how')}</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {ev('how1')}</li>
                <li>• {ev('how2')}</li>
                <li>• {ev('how3')}</li>
                <li>• {ev('how4')}</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-orange-800 font-semibold mb-1 flex items-center gap-2"><FlagIcon className="w-4 h-4 flex-shrink-0" /> Marquer les questions pour y revenir</p>
              <p className="text-sm text-orange-700">Clique sur l'icône drapeau à côté d'une question pour la marquer. Le compteur dans la barre te permet de naviguer directement vers tes questions marquées à tout moment.</p>
            </div>
            <CTAButton onClick={() => setPhase('quiz')} size="lg" className="w-full">
              {ev('start')}
            </CTAButton>
            <p className="mt-4 text-sm text-neutral-400">
              <a href="/training" className="hover:text-accent underline">{ev('back')}</a>
            </p>
          </Card>
        </div>
      </section>
    );
  }

  // ——— Résultats ———
  if (phase === 'results') {
    const scoreData = scoreByValue(answers, questions);

    const pct = scoreData.percentage;
    let niveau, niveauColor, niveauBg, conseil;
    if (pct >= 80) {
      niveau = ev('levels.advanced'); niveauColor = 'text-green-700'; niveauBg = 'bg-green-50 border-green-300';
      conseil = ev('adviceAdv');
    } else if (pct >= 60) {
      niveau = ev('levels.mid'); niveauColor = 'text-blue-700'; niveauBg = 'bg-blue-50 border-blue-300';
      conseil = ev('adviceMid');
    } else if (pct >= 40) {
      niveau = ev('levels.begPlus'); niveauColor = 'text-orange-700'; niveauBg = 'bg-orange-50 border-orange-300';
      conseil = ev('adviceBegP');
    } else {
      niveau = ev('levels.beg'); niveauColor = 'text-red-700'; niveauBg = 'bg-red-50 border-red-300';
      conseil = ev('adviceBeg');
    }

    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{pct >= 60 ? '📈' : '📚'}</div>
            <h2 className="text-3xl font-heading font-bold text-primary">{ev('resultsTitle')}</h2>
          </div>

          <Card className="mb-5 text-center">
            <p className="text-7xl font-bold text-accent mb-2">{pct}%</p>
            <p className="text-neutral-500">{scoreData.correct} {scoreData.correct > 1 ? ev('corrects') : ev('correct')} {scoreData.correct > 1 ? ev('responses') : ev('response')} / {scoreData.total}</p>
            <div className={`inline-block mt-3 px-4 py-1.5 rounded-full border text-sm font-bold ${niveauBg} ${niveauColor}`}>
              {ev('niveau')} {niveau}
            </div>
          </Card>

          <Card className={`mb-5 border ${niveauBg}`}>
            <p className={`font-semibold flex items-start gap-2 ${niveauColor}`}>
              <LightbulbIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {conseil}
            </p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTAButton href="/training" variant="outline" size="lg">{ev('trainCta')}</CTAButton>
            <CTAButton href="/certification" size="lg">{ev('certCta')}</CTAButton>
          </div>
        </div>
      </section>
    );
  }

  // ——— Révision signets ———
  if (showReview) {
    const flaggedList = [...flagged].sort((a, b) => a - b);
    return (
      <section className="py-12 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-3 mx-auto">
                <FlagIcon className="w-7 h-7 text-orange-500" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">Questions marquées</h2>
              <p className="text-neutral-500">{flaggedList.length} question{flaggedList.length > 1 ? 's' : ''} à réviser</p>
            </div>
            <div className={`text-lg font-bold px-4 py-2 rounded-xl border flex-shrink-0 ${isTimeCritical(timeLeft) ? 'border-red-300 bg-red-50 text-red-600' : 'border-neutral-200 bg-white text-primary'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="space-y-4 mb-8">
            {flaggedList.map((idx) => {
              const q = questions[idx];
              if (!q) return null;
              const currentAns = answers[idx];
              return (
                <Card key={idx} className="p-5">
                  <p className="font-semibold text-neutral-800 text-sm mb-3">
                    <span className="text-neutral-400 text-xs mr-2">Q{idx + 1}</span>{q.text}
                  </p>
                  {q.practical && (
                    <ExamPracticalBlock question={q} locale={locale} t={t} />
                  )}
                  <ExamAnswerInput
                    question={q}
                    value={answers[idx]}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [idx]: v }))}
                    locale={locale}
                  />
                  {!hasAnswerValue(currentAns) && (
                    <p className="mt-2 text-xs text-orange-500 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Non répondu
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowReview(false)} className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300">Continuer l'évaluation</button>
            <button onClick={() => { setShowReview(false); handleSubmit(); }} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Terminer</button>
          </div>
        </div>
      </section>
    );
  }

  // ——— Avertissement questions non répondues ———
  if (showWarning) {
    const answeredCount = questions.reduce((n, _, i) => n + (hasAnswerValue(answers[i]) ? 1 : 0), 0);
    const unanswered = questions.length - answeredCount;
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className={`text-center mb-4 text-lg font-bold ${isTimeCritical(timeLeft) ? 'text-red-600' : 'text-primary'}`}>
            ⏱ {formatTime(timeLeft)} restantes
          </div>
          <Card className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-primary mb-3">Questions sans réponse</h2>
            <p className="text-neutral-600 mb-6">Il reste <span className="font-bold text-orange-600">{unanswered} question{unanswered > 1 ? 's' : ''}</span> sans réponse.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowWarning(false)} className="w-full px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90">
                Continuer et répondre
              </button>
              {flagged.size > 0 && (
                <button onClick={() => { setShowWarning(false); setShowReview(true); }} className="w-full px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50">
                  Voir les questions marquées
                </button>
              )}
              <button onClick={() => { setShowWarning(false); handleSubmit(); }} className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50">
                Terminer quand même
              </button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // ——— Quiz ———
  const question  = questions[currentQuestion];
  const qType     = question.type || 'single';
  const answered  = hasAnswerValue(answers[currentQuestion]);
  const progress  = Math.round(((currentQuestion + 1) / total) * 100);
  const answeredCount = questions.reduce((n, _, i) => n + (hasAnswerValue(answers[i]) ? 1 : 0), 0);
  const isLast    = currentQuestion === total - 1;

  return (
    <section className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">

        {/* Timer flottant */}
        <div className={`flex justify-between items-center mb-4 px-5 py-3 rounded-2xl font-bold ${isTimeCritical(timeLeft) ? 'bg-red-50 border-2 border-red-300 text-red-600' : 'bg-white border border-neutral-200 text-primary'}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('quiz.question')} {currentQuestion + 1}/{total}</span>
            {isAdaptive && (
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[difficulty].cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_UI[difficulty].dotCls}`} />
                {locale === 'fr' ? DIFFICULTY_UI[difficulty].fr : DIFFICULTY_UI[difficulty].en}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2">
            {flagged.size > 0 && (
              <button onClick={() => setShowFlaggedPanel((v) => !v)} className="text-xs px-2 py-1.5 border border-orange-300 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 flex items-center gap-1">
                <FlagIcon className="w-3 h-3" /> {flagged.size}
              </button>
            )}
            <span className="text-sm text-neutral-400">{answeredCount}/{total}</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-6 overflow-hidden">
          <div className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <Card className="p-7">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="text-xl font-semibold text-neutral-800 leading-relaxed flex-1">{question.text}</p>
            <button
              onClick={() => toggleFlag(currentQuestion)}
              title={flagged.has(currentQuestion) ? 'Retirer le signet' : 'Marquer cette question'}
              aria-label={flagged.has(currentQuestion) ? 'Retirer le signet' : 'Marquer cette question'}
              className={`flex-shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${flagged.has(currentQuestion) ? 'bg-orange-100 border-orange-400 text-orange-500' : 'border-neutral-200 text-neutral-400 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50'}`}
            >
              <FlagIcon className="w-4 h-4" />
            </button>
          </div>
          {question.practical && (
            <ExamPracticalBlock question={question} locale={locale} t={t} />
          )}

          {question.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
              <img
                src={question.imageUrl}
                alt="Contexte visuel de la question"
                className="w-full max-h-64 object-contain bg-neutral-50"
              />
            </div>
          )}

          {qType === 'single' ? (
            <div className="space-y-3">
              {(question.options ?? []).map((option, index) => {
                const isSel = answers[currentQuestion] === option;
                const isCorrectOpt = isAnswerCorrectByValue(question, option);
                let style = 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
                if (answered) {
                  if (isCorrectOpt)      style = 'border-green-500 bg-green-50 text-green-800';
                  else if (isSel)        style = 'border-red-400 bg-red-50 text-red-800';
                  else                   style = 'border-neutral-200 opacity-50';
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleSingleAnswer(option)}
                    disabled={answered}
                    className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all ${style}`}
                  >
                    <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {answered && isCorrectOpt && <CheckIcon className="float-right w-5 h-5 text-green-600 mt-0.5" />}
                    {answered && isSel && !isCorrectOpt && <XIcon className="float-right w-5 h-5 text-red-500 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <ExamAnswerInput
              question={question}
              value={answers[currentQuestion]}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [currentQuestion]: v }))}
              locale={locale}
            />
          )}

          {/* Feedback immédiat après réponse (bonne/mauvaise + explication) */}
          {answered && (() => {
            const correct = isAnswerCorrectByValue(question, answers[currentQuestion]);
            return (
              <div className={`mt-6 p-4 rounded-xl border ${correct ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`font-bold flex items-center gap-2 ${correct ? 'text-green-700' : 'text-orange-700'}`}>
                  {correct
                    ? <><CheckIcon className="w-5 h-5 flex-shrink-0" />{t('quiz.correct')} !</>
                    : <><XIcon className="w-5 h-5 flex-shrink-0" />{t('quiz.incorrect')} — {t('quiz.correct')} : <span className="font-semibold">{correctAnswerLabel(question)}</span></>}
                </p>
                {question.explanation && (
                  <p className="text-sm text-neutral-700 leading-relaxed mt-2 flex items-start gap-2">
                    <LightbulbIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-500" />
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Navigation — bouton explicite après avoir lu le feedback */}
          {answered && !isLast && (
            <div className="mt-6 text-right">
              <button
                onClick={() => advance()}
                className="px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                {t('quiz.next')}
              </button>
            </div>
          )}

          {answered && isLast && (
            <div className="mt-6 text-center">
              <CTAButton
                onClick={handleSubmitRequest}
                size="lg"
                className="w-full"
              >
                {t('quiz.submit')}
              </CTAButton>
            </div>
          )}
        </Card>
      </div>

      {/* Popup — liste des questions marquées */}
      {showFlaggedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowFlaggedPanel(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                <FlagIcon className="w-4 h-4 text-orange-500" />
                Questions marquées ({flagged.size})
              </h3>
              <button onClick={() => setShowFlaggedPanel(false)} aria-label="Fermer" className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Clique sur une question pour y aller directement.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...flagged].sort((a, b) => a - b).map((idx) => {
                const q = questions[idx];
                if (!q) return null;
                const isAnswered = hasAnswerValue(answers[idx]);
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
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isAnswered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                      {isAnswered ? <CheckIcon className="w-3 h-3" /> : <span className="text-xs font-bold">–</span>}
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

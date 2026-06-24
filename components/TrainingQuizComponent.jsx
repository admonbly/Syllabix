'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import {
  getModuleQuestions, getMixedQuestions, calculateScore,
  randomizeAnswerOptions, EXAM_CONFIG,
  getAdaptiveQuestion, updateAdaptiveDifficulty,
} from '@/lib/examService';
import { getModuleById } from '@/lib/quizService';
import { useLanguage } from '@/lib/LanguageContext';

const DIFFICULTY_UI = {
  1: { fr: 'Facile',    en: 'Easy',   cls: 'bg-green-100 text-green-700',   dot: '🟢' },
  2: { fr: 'Moyen',     en: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dot: '🟡' },
  3: { fr: 'Difficile', en: 'Hard',   cls: 'bg-red-100 text-red-700',       dot: '🔴' },
};

/** @param {{ mode?: string, moduleId?: string | number | null }} props */
export default function TrainingQuizComponent({ mode = 'module', moduleId = null }) {
  const { locale, t } = useLanguage();
  const q = (k) => t(`quiz.${k}`);

  const isAdaptive = mode === 'module';

  const [total,        setTotal]        = useState(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
  const [questions,    setQuestions]    = useState([]);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [showResults,  setShowResults]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [loadingNext,  setLoadingNext]  = useState(false);

  // Adaptive state
  const [difficulty,   setDifficulty]   = useState(1);
  const [streak,       setStreak]       = useState(0);
  const [wrongStreak,  setWrongStreak]  = useState(0);
  const [usedIds,      setUsedIds]      = useState([]);

  useEffect(() => {
    const load = async () => {
      if (isAdaptive) {
        // Charger le vrai stock Firestore pour ce module
        const [first, mod] = await Promise.all([
          getAdaptiveQuestion(moduleId, 1, []),
          getModuleById(parseInt(moduleId)),
        ]);
        if (mod?.questions?.length) {
          setTotal(mod.questions.length);
        }
        if (first) {
          setQuestions([first]);
          setUsedIds([first.id ?? first.text]);
        }
      } else {
        const qs = await getMixedQuestions(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
        setQuestions(qs.map(randomizeAnswerOptions));
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleAnswer = (index) => {
    if (answers[currentIdx] !== undefined) return;

    const isCorrect = index === questions[currentIdx].correct;
    setAnswers((prev) => ({ ...prev, [currentIdx]: index }));

    if (!isAdaptive) return;

    const newStreak      = isCorrect ? streak + 1 : 0;
    const newWrongStreak = isCorrect ? 0 : wrongStreak + 1;
    const updated = updateAdaptiveDifficulty(difficulty, newStreak, newWrongStreak);
    setDifficulty(updated.difficulty);
    setStreak(updated.streak);
    setWrongStreak(updated.wrongStreak);
  };

  const goNext = async () => {
    if (!isAdaptive) {
      setCurrentIdx((i) => i + 1);
      return;
    }
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      return;
    }
    setLoadingNext(true);
    const next = await getAdaptiveQuestion(moduleId, difficulty, usedIds);
    if (next) {
      setQuestions((prev) => [...prev, next]);
      setUsedIds((prev) => [...prev, next.id ?? next.text]);
      setCurrentIdx((i) => i + 1);
    }
    setLoadingNext(false);
  };

  const restart = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
    setShowResults(false);
    setDifficulty(1);
    setStreak(0);
    setWrongStreak(0);
    setUsedIds([]);

    if (isAdaptive) {
      const [first, mod] = await Promise.all([
        getAdaptiveQuestion(moduleId, 1, []),
        getModuleById(parseInt(moduleId)),
      ]);
      if (mod?.questions?.length) setTotal(mod.questions.length);
      if (first) {
        setQuestions([first]);
        setUsedIds([first.id ?? first.text]);
      }
    } else {
      const qs = await getMixedQuestions(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
      setQuestions(qs.map(randomizeAnswerOptions));
    }
    setLoading(false);
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">{q('loading')}</p>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">{q('noQuestions')}</p>
      </section>
    );
  }

  // ─── Résultats ──────────────────────────────────────────
  if (showResults) {
    const scoreData = calculateScore(
      Object.entries(answers).map(([idx, ans]) => ({
        questionId: questions[idx].id,
        userAnswer: ans,
      })),
      questions
    );

    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{scoreData.percentage >= 60 ? '🎉' : '💪'}</div>
            <h2 className="text-4xl font-heading font-bold text-primary mb-2">{q('results.title')}</h2>
            <p className="text-neutral-500">{q('results.train')}</p>
          </div>

          <Card className="mb-6 text-center">
            <p className="text-6xl font-bold text-accent mb-2">{scoreData.percentage}%</p>
            <p className="text-neutral-600">{scoreData.correct} {q('results.score')} {scoreData.total}</p>
            {isAdaptive && (
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${DIFFICULTY_UI[difficulty].cls}`}>
                  {DIFFICULTY_UI[difficulty].dot}{' '}
                  {locale === 'fr'
                    ? `Niveau atteint : ${DIFFICULTY_UI[difficulty].fr}`
                    : `Level reached: ${DIFFICULTY_UI[difficulty].en}`}
                </span>
              </div>
            )}
          </Card>

          <Card className="mb-6">
            <h3 className="font-heading font-bold text-primary mb-4">{q('results.title')}</h3>
            <div className="space-y-4">
              {questions.map((ques, idx) => {
                const userAns = answers[idx];
                const correct = userAns === ques.correct;
                return (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${correct ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-neutral-800">
                        {correct ? '✅' : '❌'} Q{idx + 1} — {ques.text}
                      </p>
                      {isAdaptive && ques.difficulty && (
                        <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[ques.difficulty ?? 1].cls}`}>
                          {DIFFICULTY_UI[ques.difficulty ?? 1].dot}
                        </span>
                      )}
                    </div>
                    {!correct && (
                      <p className="text-sm text-neutral-600">
                        {t('quiz.incorrect')} : <span className="text-red-600 font-medium">{userAns !== undefined ? ques.options[userAns] : '-'}</span><br />
                        {t('quiz.correct')} : <span className="text-green-700 font-medium">{ques.options[ques.correct]}</span>
                      </p>
                    )}
                    {ques.explanation && (
                      <p className="text-xs text-neutral-500 mt-2 italic">💡 {ques.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton onClick={restart} variant="primary" size="lg">{q('results.restart')}</CTAButton>
            <CTAButton href="/training" variant="outline" size="lg">{q('previous')}</CTAButton>
          </div>
        </div>
      </section>
    );
  }

  // ─── Question ───────────────────────────────────────────
  const question  = questions[currentIdx];
  const answered  = answers[currentIdx] !== undefined;
  const isCorrect = answered && answers[currentIdx] === question.correct;
  const progress  = Math.round(((currentIdx + 1) / total) * 100);
  const isLast    = currentIdx === total - 1;
  const allDone   = Object.keys(answers).length === questions.length && questions.length === total;

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">

          {/* En-tête progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-neutral-500">
                {q('question')} {currentIdx + 1} / {total}
              </p>
              <div className="flex items-center gap-2">
                {isAdaptive && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[difficulty].cls}`}>
                    {DIFFICULTY_UI[difficulty].dot} {locale === 'fr' ? DIFFICULTY_UI[difficulty].fr : DIFFICULTY_UI[difficulty].en}
                  </span>
                )}
                <p className="text-sm text-secondary font-semibold">
                  {Object.keys(answers).length} {q('of')} {total}
                </p>
              </div>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question */}
          <p className="text-xl font-semibold text-neutral-800 mb-4 leading-relaxed">{question.text}</p>

          {question.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
              <img src={question.imageUrl} alt="Contexte visuel de la question" className="w-full max-h-64 object-contain bg-neutral-50" />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              let style = 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
              if (answered) {
                if (index === question.correct) style = 'border-green-500 bg-green-50 text-green-800';
                else if (index === answers[currentIdx] && !isCorrect) style = 'border-red-400 bg-red-50 text-red-800';
                else style = 'border-neutral-200 opacity-50';
              }
              return (
                <button
                  key={index}
                  onClick={() => !answered && handleAnswer(index)}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all ${style}`}
                >
                  <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {answered && index === question.correct && <span className="float-right">✅</span>}
                  {answered && index === answers[currentIdx] && !isCorrect && index !== question.correct && <span className="float-right">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect
                  ? `✅ ${q('correct')} !`
                  : `❌ ${q('incorrect')} — ${q('correct')} : ${question.options[question.correct]}`}
              </p>
              {question.explanation && (
                <p className="text-sm text-neutral-700 leading-relaxed">💡 {question.explanation}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between items-center">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-30"
            >
              {q('previous')}
            </button>

            {!isAdaptive && (
              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      idx === currentIdx
                        ? 'bg-accent text-white scale-110'
                        : answers[idx] !== undefined
                          ? answers[idx] === questions[idx].correct
                            ? 'bg-green-500 text-white'
                            : 'bg-red-400 text-white'
                          : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {isLast || (isAdaptive && currentIdx === questions.length - 1 && questions.length === total) ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={!allDone}
                className={`px-5 py-3 rounded-xl font-semibold transition-colors ${allDone ? 'bg-secondary text-white hover:bg-green-700' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
              >
                {q('submit')}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!answered || loadingNext}
                className="px-5 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                {loadingNext ? '...' : q('next')}
              </button>
            )}
          </div>

        </Card>
      </div>
    </section>
  );
}

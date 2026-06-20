'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { getModuleQuestions, getMixedQuestions, calculateScore, randomizeAnswerOptions, EXAM_CONFIG } from '@/lib/examService';
import { useLanguage } from '@/lib/LanguageContext';

/** @param {{ mode?: string, moduleId?: string | number | null }} props */
export default function TrainingQuizComponent({ mode = 'module', moduleId = null }) {
  const { t } = useLanguage();
  const q = (k) => t(`quiz.${k}`);
  const [questions,       setQuestions]       = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers,         setAnswers]         = useState({});
  const [showResults,     setShowResults]     = useState(false);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = mode === 'mixed'
        ? await getMixedQuestions(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT)
        : await getModuleQuestions(moduleId, EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
      setQuestions(q.map(randomizeAnswerOptions));
      setLoading(false);
    };
    load();
  }, []);

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

  // ——— Page résultats ———
  if (showResults) {
    const scoreData = calculateScore(
      Object.entries(answers).map(([qIdx, ans]) => ({
        questionId: questions[qIdx].id,
        userAnswer: ans,
      })),
      questions
    );

    const restart = async () => {
      const q = mode === 'mixed'
        ? await getMixedQuestions(EXAM_CONFIG.TRAINING.QUESTIONS_COUNT)
        : await getModuleQuestions(moduleId, EXAM_CONFIG.TRAINING.QUESTIONS_COUNT);
      setQuestions(q.map(randomizeAnswerOptions));
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    };

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
          </Card>

          {/* Récap détaillé par question */}
          <Card className="mb-6">
            <h3 className="font-heading font-bold text-primary mb-4">{q('results.title')}</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const correct = userAns === q.correct;
                return (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${correct ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                    <p className="font-semibold text-sm text-neutral-800 mb-1">
                      {correct ? '✅' : '❌'} Q{idx + 1} — {q.text}
                    </p>
                    {!correct && (
                      <p className="text-sm text-neutral-600">
                        {t('quiz.incorrect')} : <span className="text-red-600 font-medium">{userAns !== undefined ? q.options[userAns] : '-'}</span><br />
                        {t('quiz.correct')} : <span className="text-green-700 font-medium">{q.options[q.correct]}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-neutral-500 mt-2 italic">💡 {q.explanation}</p>
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

  // ——— Page question ———
  const question  = questions[currentQuestion];
  const answered  = answers[currentQuestion] !== undefined;
  const isCorrect = answered && answers[currentQuestion] === question.correct;
  const progress  = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const allDone   = Object.keys(answers).length === questions.length;

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">

          {/* En-tête progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-neutral-500">
                {q('question')} {currentQuestion + 1} / {questions.length}
              </p>
              <p className="text-sm text-secondary font-semibold">
                {Object.keys(answers).length} {q('of')} {questions.length}
              </p>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <p className="text-xl font-semibold text-neutral-800 mb-4 leading-relaxed">{question.text}</p>

          {/* Image contextuelle (si disponible) */}
          {question.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
              <img
                src={question.imageUrl}
                alt="Contexte visuel de la question"
                className="w-full max-h-64 object-contain bg-neutral-50"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              let style = 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
              if (answered) {
                if (index === question.correct) {
                  style = 'border-green-500 bg-green-50 text-green-800';
                } else if (index === answers[currentQuestion] && !isCorrect) {
                  style = 'border-red-400 bg-red-50 text-red-800';
                } else {
                  style = 'border-neutral-200 opacity-50';
                }
              }
              return (
                <button
                  key={index}
                  onClick={() => !answered && setAnswers({ ...answers, [currentQuestion]: index })}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all ${style}`}
                >
                  <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {answered && index === question.correct && <span className="float-right">✅</span>}
                  {answered && index === answers[currentQuestion] && !isCorrect && index !== question.correct && <span className="float-right">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Explication après réponse */}
          {answered && (
            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect ? `✅ ${q('correct')} !` : `❌ ${q('incorrect')} — ${q('correct')} : ${question.options[question.correct]}`}
              </p>
              {question.explanation && (
                <p className="text-sm text-neutral-700 leading-relaxed">
                  💡 {question.explanation}
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-5 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-30"
            >
              {q('previous')}
            </button>

            <div className="flex gap-2">
              {/* Pastilles de navigation rapide */}
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    idx === currentQuestion
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

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-5 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors"
              >
                {q('next')}
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                disabled={!allDone}
                className={`px-5 py-3 rounded-xl font-semibold transition-colors ${allDone ? 'bg-secondary text-white hover:bg-green-700' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
              >
                {q('submit')}
              </button>
            )}
          </div>

          {!allDone && (
            <p className="text-center text-xs text-neutral-400 mt-4">
              {q('noQuestions')}
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}

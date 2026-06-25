'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { shuffleArray, randomizeAnswerOptions } from '@/lib/examService';
import { getModuleById, getAllQuestions } from '@/lib/quizService';
import { useLanguage } from '@/lib/LanguageContext';

const DIFFICULTY_UI = {
  1: { fr: 'Facile',    en: 'Easy',   cls: 'bg-green-100 text-green-700',   dot: '🟢' },
  2: { fr: 'Moyen',     en: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dot: '🟡' },
  3: { fr: 'Difficile', en: 'Hard',   cls: 'bg-red-100 text-red-700',       dot: '🔴' },
};

// ─── Helpers types de questions ───────────────────────────────────────────────

function normalize(str) {
  return String(str).toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function isAnswerCorrect(question, userAnswer) {
  const type = question.type || 'single';
  if (type === 'single') return userAnswer === question.correct;
  if (type === 'multi') {
    if (!Array.isArray(userAnswer) || !Array.isArray(question.correct)) return false;
    const ua = [...userAnswer].sort((a, b) => a - b);
    const ca = [...question.correct].sort((a, b) => a - b);
    return ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  }
  if (type === 'input') {
    const acceptable = question.acceptableAnswers ?? [question.correct];
    return acceptable.some((a) => normalize(a) === normalize(userAnswer));
  }
  if (type === 'calculation') {
    const tol = question.tolerance ?? 0;
    const val = parseFloat(String(userAnswer).replace(/\s/g, '').replace(',', '.'));
    return !isNaN(val) && Math.abs(val - Number(question.correct)) <= tol;
  }
  return false;
}

function scoreFromAnswers(answers, questions) {
  let correct = 0;
  questions.forEach((q, idx) => {
    const ua = answers[idx];
    if (ua !== undefined && isAnswerCorrect(q, ua)) correct++;
  });
  return { percentage: Math.round((correct / questions.length) * 100), correct, total: questions.length };
}

function correctAnswerLabel(question) {
  const type = question.type || 'single';
  if (type === 'single') return question.options?.[question.correct] ?? '';
  if (type === 'multi')  return (question.correct ?? []).map((i) => question.options?.[i]).filter(Boolean).join(' + ');
  if (type === 'input')  return (question.acceptableAnswers ?? [question.correct]).join(' / ');
  if (type === 'calculation') return `${question.correct}${question.unit ? ' ' + question.unit : ''}`;
  return '';
}

// ─── Badge type ───────────────────────────────────────────────────────────────
function TypeBadge({ type, locale }) {
  const labels = {
    single:      { fr: 'Choix unique',      en: 'Single choice' },
    multi:       { fr: 'Plusieurs réponses', en: 'Multiple answers' },
    input:       { fr: 'Réponse à saisir',  en: 'Type your answer' },
    calculation: { fr: 'Calcul',            en: 'Calculation' },
  };
  const colors = {
    single:      'bg-blue-100 text-blue-700',
    multi:       'bg-purple-100 text-purple-700',
    input:       'bg-amber-100 text-amber-700',
    calculation: 'bg-teal-100 text-teal-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors[type] ?? colors.single}`}>
      {labels[type]?.[locale] ?? labels.single[locale]}
    </span>
  );
}

// ─── Single choice ────────────────────────────────────────────────────────────
function SingleChoiceInput({ question, answered, userAnswer, onAnswer }) {
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        let style = 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
        if (answered) {
          if (index === question.correct) style = 'border-green-500 bg-green-50 text-green-800';
          else if (index === userAnswer && !isAnswerCorrect(question, userAnswer)) style = 'border-red-400 bg-red-50 text-red-800';
          else style = 'border-neutral-200 opacity-50';
        }
        return (
          <button
            key={index}
            onClick={() => !answered && onAnswer(index)}
            disabled={answered}
            className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all ${style}`}
          >
            <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
            {answered && index === question.correct && <span className="float-right">✅</span>}
            {answered && index === userAnswer && index !== question.correct && <span className="float-right">❌</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Multi choice ─────────────────────────────────────────────────────────────
function MultiChoiceInput({ question, answered, selected, onToggle, onSubmit, locale }) {
  const correct = question.correct ?? [];
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-3 italic">
        {locale === 'fr'
          ? `Sélectionnez toutes les réponses correctes (${correct.length} attendue${correct.length > 1 ? 's' : ''})`
          : `Select all correct answers (${correct.length} expected)`}
      </p>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected    = selected.has(index);
          const isCorrectOpt  = correct.includes(index);
          let style = 'border-2 rounded-xl p-4 text-left font-medium transition-all w-full flex items-center gap-3 ';
          if (!answered) {
            style += isSelected ? 'border-accent bg-accent/10 text-accent cursor-pointer' : 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
          } else {
            if (isCorrectOpt)           style += 'border-green-500 bg-green-50 text-green-800';
            else if (isSelected)        style += 'border-red-400 bg-red-50 text-red-800';
            else                        style += 'border-neutral-200 opacity-50';
          }
          return (
            <button key={index} onClick={() => !answered && onToggle(index)} disabled={answered} className={style}>
              <span className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center text-xs font-bold ${
                answered
                  ? isCorrectOpt ? 'border-green-500 bg-green-500 text-white' : isSelected ? 'border-red-400 bg-red-400 text-white' : 'border-neutral-300'
                  : isSelected ? 'border-accent bg-accent text-white' : 'border-neutral-300'
              }`}>
                {answered ? (isCorrectOpt ? '✓' : isSelected ? '✗' : '') : isSelected ? '✓' : ''}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>
      {!answered && (
        <button
          onClick={onSubmit}
          disabled={selected.size === 0}
          className="mt-4 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {locale === 'fr' ? 'Valider ma réponse' : 'Submit answer'}
        </button>
      )}
    </div>
  );
}

// ─── Input texte / calcul ─────────────────────────────────────────────────────
function TextInput({ question, answered, userAnswer, inputVal, onChange, onSubmit, locale }) {
  const isCalc  = question.type === 'calculation';
  const correct = isAnswerCorrect(question, answered ? userAnswer : inputVal);
  return (
    <div>
      {isCalc && question.hint && <p className="text-xs text-neutral-400 mb-3 italic">💡 {question.hint}</p>}
      <div className="flex gap-3 items-stretch">
        <input
          type="text"
          inputMode={isCalc ? 'decimal' : 'text'}
          value={answered ? (userAnswer ?? '') : inputVal}
          onChange={(e) => !answered && onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !answered && inputVal.trim() && onSubmit()}
          disabled={answered}
          placeholder={isCalc
            ? (locale === 'fr' ? 'Entrez le résultat...' : 'Enter result...')
            : (locale === 'fr' ? 'Votre réponse...' : 'Your answer...')}
          className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium text-base transition-all outline-none
            ${answered
              ? correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800'
              : 'border-neutral-300 focus:border-accent bg-white'}`}
        />
        {question.unit && (
          <span className="px-3 py-3 bg-neutral-100 rounded-xl text-sm font-semibold text-neutral-600 flex items-center">
            {question.unit}
          </span>
        )}
        {!answered && (
          <button
            onClick={onSubmit}
            disabled={!inputVal.trim()}
            className="px-5 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {locale === 'fr' ? 'Valider' : 'Submit'}
          </button>
        )}
      </div>
      {answered && (
        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-600">
          <span>{correct ? '✅' : '❌'}</span>
          {correct
            ? <span>{locale === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span>
            : <span>{locale === 'fr' ? 'Réponse attendue : ' : 'Expected: '}<strong className="text-green-700">{correctAnswerLabel(question)}</strong></span>}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const ADAPTIVE_STREAK_UP   = 2;
const ADAPTIVE_STREAK_DOWN = 2;
const SESSION_SIZE         = 5; // questions par session d'entraînement

export default function TrainingQuizComponent({ mode = 'module', moduleId = null }) {
  const { locale, t } = useLanguage();
  const q = (k) => t(`quiz.${k}`);

  // Pool complet de questions chargé une seule fois
  const [pool,        setPool]        = useState([]);
  // Questions présentées jusqu'ici (sous-ensemble ordonné du pool)
  const [questions,   setQuestions]   = useState([]);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading,     setLoading]     = useState(true);

  // Adaptatif
  const [difficulty,  setDifficulty]  = useState(1);
  const [streak,      setStreak]      = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  // Saisie par question
  const [selectedMulti, setSelectedMulti] = useState(new Set());
  const [inputVal,      setInputVal]      = useState('');

  useEffect(() => { setSelectedMulti(new Set()); setInputVal(''); }, [currentIdx]);

  // ── Chargement initial : tout le pool en un seul appel Firestore ───────────
  useEffect(() => {
    const load = async () => {
      let raw = [];
      if (mode === 'module' && moduleId != null) {
        const mod = await getModuleById(parseInt(moduleId));
        raw = (mod?.questions ?? []).map((q, i) => ({ ...q, _uid: q.id ?? `${moduleId}-${i}` }));
      } else {
        const all = await getAllQuestions();
        raw = all.map((q, i) => ({ ...q, _uid: q.id ?? `mixed-${i}` }));
      }
      shuffleArray(raw);
      setPool(raw);

      // Première question : difficulté 1
      const first = pickFromPool(raw, 1, new Set());
      if (first) setQuestions([randomizeAnswerOptions(first)]);
      setLoading(false);
    };
    load();
  }, []);

  // ── Sélection adaptive depuis le pool local ────────────────────────────────
  function pickFromPool(poolArr, diff, usedSet) {
    let candidates = poolArr.filter((q) => !usedSet.has(q._uid) && (q.difficulty ?? 1) === diff);
    if (candidates.length === 0) candidates = poolArr.filter((q) => !usedSet.has(q._uid));
    if (candidates.length === 0) return null;
    shuffleArray(candidates);
    return candidates[0];
  }

  // ── Répondre ───────────────────────────────────────────────────────────────
  const commitAnswer = (answer) => {
    if (answers[currentIdx] !== undefined) return;
    const correct = isAnswerCorrect(questions[currentIdx], answer);
    setAnswers((prev) => ({ ...prev, [currentIdx]: answer }));

    if (mode !== 'module') return;
    const ns = correct ? streak + 1 : 0;
    const nw = correct ? 0 : wrongStreak + 1;
    let newDiff = difficulty;
    if (ns >= ADAPTIVE_STREAK_UP)   { newDiff = Math.min(difficulty + 1, 3); setStreak(0); setWrongStreak(0); }
    else if (nw >= ADAPTIVE_STREAK_DOWN) { newDiff = Math.max(difficulty - 1, 1); setStreak(0); setWrongStreak(0); }
    else { setStreak(ns); setWrongStreak(nw); }
    setDifficulty(newDiff);
  };

  const toggleMulti = (i) => setSelectedMulti((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentIdx >= total - 1) return; // session terminée
    if (currentIdx < questions.length - 1) { setCurrentIdx((i) => i + 1); return; }

    const usedSet = new Set(questions.map((q) => q._uid));
    const next    = pickFromPool(pool, difficulty, usedSet);
    if (!next) return;
    setQuestions((prev) => [...prev, randomizeAnswerOptions(next)]);
    setCurrentIdx((i) => i + 1);
  };

  const restart = () => {
    setAnswers({}); setCurrentIdx(0); setShowResults(false);
    setDifficulty(1); setStreak(0); setWrongStreak(0);
    setSelectedMulti(new Set()); setInputVal('');
    // Mélange le pool pour avoir 5 questions différentes à chaque relance
    const shuffled = [...pool];
    shuffleArray(shuffled);
    setPool(shuffled);
    const first = pickFromPool(shuffled, 1, new Set());
    setQuestions(first ? [randomizeAnswerOptions(first)] : []);
  };

  // ── États de chargement ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">{q('loading')}</p>
        </div>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="py-20 flex items-center justify-center">
        <p className="text-neutral-500">{q('noQuestions')}</p>
      </div>
    );
  }

  const total    = Math.min(SESSION_SIZE, pool.length);
  const answered = answers[currentIdx] !== undefined;

  // ── Résultats ──────────────────────────────────────────────────────────────
  if (showResults) {
    const scoreData = scoreFromAnswers(answers, questions);
    return (
      <section className="py-10 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{scoreData.percentage >= 60 ? '🎉' : '💪'}</div>
            <h2 className="text-4xl font-heading font-bold text-primary mb-2">{q('results.title')}</h2>
            <p className="text-neutral-500">{q('results.train')}</p>
          </div>

          <Card className="mb-6 text-center">
            <p className="text-6xl font-bold text-accent mb-2">{scoreData.percentage}%</p>
            <p className="text-neutral-600">{scoreData.correct} {q('results.score')} {scoreData.total}</p>
            {mode === 'module' && (
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${DIFFICULTY_UI[difficulty].cls}`}>
                  {DIFFICULTY_UI[difficulty].dot} {locale === 'fr' ? `Niveau atteint : ${DIFFICULTY_UI[difficulty].fr}` : `Level reached: ${DIFFICULTY_UI[difficulty].en}`}
                </span>
              </div>
            )}
          </Card>

          <Card className="mb-6">
            <h3 className="font-heading font-bold text-primary mb-4">{q('results.title')}</h3>
            <div className="space-y-4">
              {questions.map((ques, idx) => {
                const ua      = answers[idx];
                const correct = ua !== undefined && isAnswerCorrect(ques, ua);
                const qType   = ques.type || 'single';
                let userLabel = '';
                if (qType === 'single') userLabel = ua !== undefined ? ques.options?.[ua] : '-';
                else if (qType === 'multi') userLabel = Array.isArray(ua) ? ua.map((i) => ques.options?.[i]).join(' + ') : '-';
                else userLabel = String(ua ?? '-');

                return (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${correct ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-neutral-800">
                        {correct ? '✅' : '❌'} Q{idx + 1} — {ques.text}
                      </p>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <TypeBadge type={qType} locale={locale} />
                        {ques.difficulty && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[ques.difficulty ?? 1].cls}`}>
                            {DIFFICULTY_UI[ques.difficulty ?? 1].dot}
                          </span>
                        )}
                      </div>
                    </div>
                    {!correct && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {t('quiz.incorrect')} : <span className="text-red-600 font-medium">{userLabel}</span><br />
                        {t('quiz.correct')} : <span className="text-green-700 font-medium">{correctAnswerLabel(ques)}</span>
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

  // ── Question active ────────────────────────────────────────────────────────
  const question  = questions[currentIdx];
  const qType     = question.type || 'single';
  const isCorrect = answered && isAnswerCorrect(question, answers[currentIdx]);
  const answered_count = Object.keys(answers).length;
  const progress  = Math.round(((currentIdx + 1) / total) * 100);
  const isLast    = currentIdx === total - 1;
  const allDone   = answered_count >= questions.length && answered;

  return (
    <section className="py-10 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">

          {/* Progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-neutral-500">
                {q('question')} {currentIdx + 1} / {total}
              </p>
              <div className="flex items-center gap-2">
                {mode === 'module' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[difficulty].cls}`}>
                    {DIFFICULTY_UI[difficulty].dot} {locale === 'fr' ? DIFFICULTY_UI[difficulty].fr : DIFFICULTY_UI[difficulty].en}
                  </span>
                )}
                <p className="text-sm text-secondary font-semibold">
                  {answered_count} {q('of')} {total}
                </p>
              </div>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Type + question */}
          <div className="flex items-center gap-2 mb-3">
            <TypeBadge type={qType} locale={locale} />
          </div>
          <p className="text-xl font-semibold text-neutral-800 mb-4 leading-relaxed">{question.text}</p>

          {question.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
              <img src={question.imageUrl} alt="Contexte visuel" className="w-full max-h-64 object-contain bg-neutral-50" />
            </div>
          )}

          {/* Zone de réponse */}
          <div className="mb-6">
            {qType === 'single' && (
              <SingleChoiceInput
                question={question}
                answered={answered}
                userAnswer={answers[currentIdx]}
                onAnswer={(i) => commitAnswer(i)}
              />
            )}
            {qType === 'multi' && (
              <MultiChoiceInput
                question={question}
                answered={answered}
                selected={selectedMulti}
                onToggle={toggleMulti}
                onSubmit={() => commitAnswer([...selectedMulti])}
                locale={locale}
              />
            )}
            {(qType === 'input' || qType === 'calculation') && (
              <TextInput
                question={question}
                answered={answered}
                userAnswer={answers[currentIdx]}
                inputVal={inputVal}
                onChange={setInputVal}
                onSubmit={() => commitAnswer(inputVal.trim())}
                locale={locale}
              />
            )}
          </div>

          {/* Feedback + explication après réponse */}
          {answered && (
            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect
                  ? `✅ ${q('correct')} !`
                  : `❌ ${q('incorrect')} — ${q('correct')} : ${correctAnswerLabel(question)}`}
              </p>
              {question.explanation && (
                <p className="text-sm text-neutral-700 leading-relaxed mt-1">💡 {question.explanation}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between items-center">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-30"
            >
              {q('previous')}
            </button>

            {isLast ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={!answered}
                className={`px-5 py-3 rounded-xl font-semibold transition-colors ${answered ? 'bg-secondary text-white hover:bg-green-700' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
              >
                {q('submit')}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!answered}
                className="px-5 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                {q('next')}
              </button>
            )}
          </div>

        </Card>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { shuffleArray, randomizeAnswerOptions, EXAM_CONFIG } from '@/lib/examService';
import { getModuleById, getAllQuestions } from '@/lib/quizService';
import { useLanguage } from '@/lib/LanguageContext';
import { auth, userDB } from '@/lib/firebase';

const DIFFICULTY_UI = {
  1: { fr: 'Facile',    en: 'Easy',   cls: 'bg-green-100 text-green-700',   dotCls: 'bg-green-500' },
  2: { fr: 'Moyen',     en: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dotCls: 'bg-yellow-500' },
  3: { fr: 'Difficile', en: 'Hard',   cls: 'bg-red-100 text-red-700',       dotCls: 'bg-red-500' },
};

// ─── Icônes SVG légères ───────────────────────────────────────────────────────
function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function XIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
function FlagIcon({ className = 'w-4 h-4', filled = false }) {
  return filled
    ? <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v10H4z" /><path d="M4 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
    : <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
}
function LightbulbIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  );
}

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

// ─── Épreuve pratique ─────────────────────────────────────────────────────────
const PRACTICAL_APPS = {
  excel:      { icon: '📊', color: 'border-green-300 bg-green-50',   chip: 'bg-green-600' },
  word:       { icon: '📝', color: 'border-blue-300 bg-blue-50',     chip: 'bg-blue-600' },
  powerpoint: { icon: '📽️', color: 'border-orange-300 bg-orange-50', chip: 'bg-orange-500' },
  cmd:        { icon: '⬛', color: 'border-neutral-400 bg-neutral-100', chip: 'bg-neutral-700' },
  explorer:   { icon: '📁', color: 'border-amber-300 bg-amber-50',   chip: 'bg-amber-600' },
  email:      { icon: '📧', color: 'border-teal-300 bg-teal-50',     chip: 'bg-teal-600' },
};

function PracticalBlock({ question, locale, t }) {
  const app  = PRACTICAL_APPS[question.app] ?? PRACTICAL_APPS.explorer;
  const p    = (k) => t(`quiz.practical.${k}`);
  const comp = question.competency?.[locale] ?? question.competency?.fr;

  return (
    <div className={`mb-6 rounded-2xl border-2 ${app.color} overflow-hidden`}>
      {/* En-tête */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-black/5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold ${app.chip}`}>
          🧪 {p('title')}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-neutral-700 text-xs font-semibold border border-black/5">
          {app.icon} {p(`apps.${question.app}`) }
        </span>
        {comp && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold ml-auto">
            🎯 {p('competency')} : {comp}
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="px-5 py-4">
        <p className="text-sm font-bold text-neutral-700 mb-3">{p('steps')}</p>
        <ol className="space-y-2 mb-4">
          {(question.instructions ?? []).map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-black/10 text-xs font-bold flex items-center justify-center text-neutral-600">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {question.fileUrl ? (
          <div>
            <a
              href={question.fileUrl}
              download
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity ${app.chip}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {p('download')}
            </a>
            <p className="text-xs text-neutral-500 mt-2">{p('downloadHint')}</p>
          </div>
        ) : (
          <p className="text-xs text-neutral-500">{p('noFileHint')}</p>
        )}
      </div>
    </div>
  );
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
            {answered && index === question.correct && <CheckIcon className="float-right w-5 h-5 text-green-600 mt-0.5" />}
            {answered && index === userAnswer && index !== question.correct && <XIcon className="float-right w-5 h-5 text-red-500 mt-0.5" />}
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
                {answered
                  ? (isCorrectOpt ? <CheckIcon className="w-3 h-3" /> : isSelected ? <XIcon className="w-3 h-3" /> : null)
                  : isSelected ? <CheckIcon className="w-3 h-3" /> : null}
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
          {correct
            ? <><CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" /><span className="text-green-700">{locale === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>
            : <><XIcon className="w-4 h-4 text-red-500 flex-shrink-0" /><span>{locale === 'fr' ? 'Réponse attendue : ' : 'Expected: '}<strong className="text-green-700">{correctAnswerLabel(question)}</strong></span></>}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const ADAPTIVE_STREAK_UP   = 2;
const ADAPTIVE_STREAK_DOWN = 2;
const SESSION_SIZE         = EXAM_CONFIG.TRAINING.SESSION_SIZE;

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
  const [badgeEarned, setBadgeEarned] = useState(false); // badge d'apprentissage décroché

  // Adaptatif
  const [difficulty,  setDifficulty]  = useState(1);
  const [streak,      setStreak]      = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  // Saisie par question
  const [selectedMulti, setSelectedMulti] = useState(new Set());
  const [inputVal,      setInputVal]      = useState('');

  // Signets
  const [flagged,          setFlagged]          = useState(new Set());
  const [showReview,       setShowReview]        = useState(false);
  const [showFlaggedPanel, setShowFlaggedPanel]  = useState(false);
  const [showIntro,        setShowIntro]         = useState(true);

  useEffect(() => { setSelectedMulti(new Set()); setInputVal(''); }, [currentIdx]);

  // Sauvegarde session quand résultats affichés
  useEffect(() => {
    if (!showResults || questions.length === 0) return;
    const scoreData = scoreFromAnswers(answers, questions);
    saveSessionToFirestore(scoreData);
  }, [showResults]);

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

  const toggleFlag = (idx) => {
    setFlagged((prev) => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });
  };

  const saveSessionToFirestore = async (scoreData) => {
    const user = auth.currentUser;
    if (!user) return;
    await userDB.saveSession(user.uid, {
      type: 'training',
      mode,
      moduleId: moduleId !== null ? String(moduleId) : null,
      score: scoreData.percentage,
      correct: scoreData.correct,
      total: scoreData.total,
      questionsCount: questions.length,
    });

    // Badge d'apprentissage : uniquement pour un entraînement de module réussi.
    // Le serveur re-vérifie le seuil et gère l'anti-doublon (meilleur score).
    if (mode === 'module' && moduleId !== null) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/training/badge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ moduleId: Number(moduleId), score: scoreData.percentage }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.awarded) setBadgeEarned(true);
        }
      } catch { /* le badge est un bonus — un échec réseau ne casse pas le résultat */ }
    }
  };

  const restart = () => {
    setAnswers({}); setCurrentIdx(0); setShowResults(false); setShowReview(false);
    setBadgeEarned(false);
    setDifficulty(1); setStreak(0); setWrongStreak(0);
    setSelectedMulti(new Set()); setInputVal('');
    setFlagged(new Set()); setShowIntro(true);
    // Mélange le pool pour avoir 5 questions différentes à chaque relance
    const shuffled = [...pool];
    shuffleArray(shuffled);
    setPool(shuffled);
    const first = pickFromPool(shuffled, 1, new Set());
    setQuestions(first ? [randomizeAnswerOptions(first)] : []);
  };

  // ── Écran d'intro ──────────────────────────────────────────────────────────
  if (showIntro && !loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-3">{q('training')}</h1>
            <p className="text-neutral-600 mb-6">{q('trainingDesc')}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-accent/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-accent">{SESSION_SIZE}</p>
                <p className="text-xs text-neutral-500 mt-1">Questions</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">~15</p>
                <p className="text-xs text-neutral-500 mt-1">Minutes</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">✅</p>
                <p className="text-xs text-neutral-500 mt-1">Feedback</p>
              </div>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 font-semibold mb-2 flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 flex-shrink-0" />
                  Comment ça marche
                </p>
                <ul className="text-sm text-blue-700 space-y-1.5">
                  <li className="flex items-start gap-2"><CheckIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />Réponds à chaque question avant de passer à la suivante</li>
                  <li className="flex items-start gap-2"><CheckIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />Le feedback s'affiche immédiatement après ta réponse</li>
                  {mode === 'module' && <li className="flex items-start gap-2"><CheckIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />La difficulté s'adapte automatiquement à ton niveau</li>}
                  <li className="flex items-start gap-2"><CheckIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />Tu peux revenir en arrière pour revoir tes réponses</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800 font-semibold mb-1 flex items-center gap-2">
                  <FlagIcon className="w-4 h-4 flex-shrink-0" />
                  Marquer les questions
                </p>
                <p className="text-sm text-orange-700">
                  Clique sur l'icône de drapeau à côté d'une question pour la marquer et y revenir plus tard.
                  Le compteur dans la barre de navigation te permet de naviguer vers tes questions marquées.
                  Une question marquée sans réponse peut être passée — tu la retrouveras en révision avant les résultats.
                </p>
              </div>
            </div>

            <CTAButton onClick={() => setShowIntro(false)} size="lg" className="w-full">
              Commencer l'entraînement
            </CTAButton>
            <p className="mt-4 text-sm">
              <a href="/training" className="text-neutral-400 hover:text-accent underline">Retour</a>
            </p>
          </Card>
        </div>
      </section>
    );
  }

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

  const handleFinishTraining = () => {
    const unansweredFlagged = [...flagged].some((idx) => answers[idx] === undefined);
    if (unansweredFlagged) {
      // Des questions marquées n'ont pas encore de réponse — afficher la révision
      setShowReview(true);
    } else {
      setShowResults(true);
    }
  };

  // ── Écran de révision des questions marquées ───────────────────────────────
  if (showReview) {
    const flaggedList = [...flagged].sort((a, b) => a - b);
    return (
      <section className="py-10 bg-neutral-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🚩</div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Questions marquées</h2>
            <p className="text-neutral-500">Tu as marqué {flaggedList.length} question{flaggedList.length > 1 ? 's' : ''}. Tu peux les revoir avant de voir les résultats.</p>
          </div>
          <div className="space-y-4 mb-8">
            {flaggedList.map((idx) => {
              const q = questions[idx];
              const ua = answers[idx];
              const correct = ua !== undefined && isAnswerCorrect(q, ua);
              return (
                <Card key={idx} className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-neutral-800 text-sm flex-1 pr-3">
                      <span className="text-neutral-400 text-xs mr-2">Q{idx + 1}</span>{q.text}
                    </p>
                    <button onClick={() => { setCurrentIdx(idx); setShowReview(false); }} className="text-xs px-3 py-1.5 border border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors whitespace-nowrap">
                      Revoir
                    </button>
                  </div>
                  {ua !== undefined && (
                    <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 ${correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {correct
                        ? <><CheckIcon className="w-3 h-3 flex-shrink-0" /> Bonne réponse</>
                        : <><XIcon className="w-3 h-3 flex-shrink-0" /> Réponse : {q.options?.[ua] ?? ua} — Correct : {correctAnswerLabel(q)}</>}
                    </div>
                  )}
                  {ua === undefined && (
                    <p className="text-xs text-orange-500 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Non répondu
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowReview(false)} className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300">
              Retour au quiz
            </button>
            <button onClick={() => { setShowResults(true); setShowReview(false); }} className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-green-700">
              Voir les résultats
            </button>
          </div>
        </div>
      </section>
    );
  }

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

          {badgeEarned && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl border-2 border-amber-300/60 bg-amber-50">
              <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center text-xl flex-shrink-0">🏅</div>
              <div>
                <p className="font-heading font-bold text-amber-800 text-sm leading-tight">
                  {locale === 'fr' ? "Badge d'apprentissage obtenu !" : 'Learning badge earned!'}
                </p>
                <p className="text-xs text-amber-700">
                  {locale === 'fr' ? 'Retrouve-le sur ton profil.' : 'Find it on your profile.'}
                </p>
              </div>
            </div>
          )}

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
                      <p className="font-semibold text-sm text-neutral-800 flex items-start gap-1.5">
                        {correct
                          ? <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          : <XIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                        Q{idx + 1} — {ques.text}
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
                      <p className="text-xs text-neutral-500 mt-2 italic flex items-start gap-1.5">
                        <LightbulbIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {ques.explanation}
                      </p>
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
              {mode === 'module' && (
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold ${DIFFICULTY_UI[difficulty].cls}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_UI[difficulty].dotCls}`} />
                  {locale === 'fr' ? DIFFICULTY_UI[difficulty].fr : DIFFICULTY_UI[difficulty].en}
                </span>
              )}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Type + question */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <TypeBadge type={qType} locale={locale} />
            <button
              onClick={() => toggleFlag(currentIdx)}
              title={flagged.has(currentIdx) ? 'Retirer le signet' : 'Marquer cette question'}
              aria-label={flagged.has(currentIdx) ? 'Retirer le signet' : 'Marquer cette question'}
              className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${flagged.has(currentIdx) ? 'bg-orange-100 border-orange-400 text-orange-500' : 'border-neutral-200 text-neutral-400 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50'}`}
            >
              <FlagIcon className="w-4 h-4" filled={flagged.has(currentIdx)} />
            </button>
          </div>
          {question.practical && (
            <PracticalBlock question={question} locale={locale} t={t} />
          )}

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
            <div className={`p-4 rounded-xl mb-6 quiz-feedback-enter ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`font-bold mb-1 flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect
                  ? <><CheckIcon className="w-5 h-5 flex-shrink-0" />{q('correct')} !</>
                  : <><XIcon className="w-5 h-5 flex-shrink-0" />{q('incorrect')} — {q('correct')} : {correctAnswerLabel(question)}</>}
              </p>
              {question.explanation && (
                <p className="text-sm text-neutral-700 leading-relaxed mt-2 flex items-start gap-2">
                  <LightbulbIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-500" />
                  {question.explanation}
                </p>
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

            <div className="flex items-center gap-2">
              {flagged.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowFlaggedPanel((v) => !v)}
                    className="px-3 py-2 border-2 border-orange-300 text-orange-500 rounded-xl text-xs font-semibold hover:bg-orange-50 transition-colors flex items-center gap-1.5"
                  >
                    <FlagIcon className="w-3.5 h-3.5" /> {flagged.size}
                  </button>
                </div>
              )}
              {isLast ? (
                <button
                  onClick={handleFinishTraining}
                  disabled={!answered && !flagged.has(currentIdx)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-colors ${(answered || flagged.has(currentIdx)) ? 'bg-secondary text-white hover:bg-green-700' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
                >
                  {q('submit')}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!answered && !flagged.has(currentIdx)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-colors ${(answered || flagged.has(currentIdx)) ? 'bg-accent text-white hover:bg-accent/90' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
                >
                  {q('next')}
                </button>
              )}
            </div>
          </div>

        </Card>
      </div>

      {/* Popup panel — liste des questions marquées */}
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
                const q_ = questions[idx];
                if (!q_) return null;
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIdx(idx); setShowFlaggedPanel(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-neutral-700 flex-1 line-clamp-2">{q_.text}</span>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isAnswered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                      {isAnswered ? '✓' : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setShowFlaggedPanel(false); setShowReview(true); }} className="mt-4 w-full py-2 text-sm font-semibold text-orange-500 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">
              Voir le récap complet →
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

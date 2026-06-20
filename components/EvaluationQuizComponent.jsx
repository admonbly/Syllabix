'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import {
  getModuleQuestions,
  getMixedQuestions,
  calculateScore,
  randomizeAnswerOptions,
  formatTime,
  isTimeCritical,
  EXAM_CONFIG,
} from '@/lib/examService';

/** @param {{ mode?: string, moduleId?: string | number | null }} props */
export default function EvaluationQuizComponent({ mode = 'mixed', moduleId = null }) {
  const [phase,           setPhase]           = useState('intro');   // intro | quiz | results
  const [questions,       setQuestions]       = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers,         setAnswers]         = useState({});
  const [timeLeft,        setTimeLeft]        = useState(EXAM_CONFIG.EVALUATION.DURATION);
  const [loading,         setLoading]         = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const q = mode === 'module'
        ? await getModuleQuestions(moduleId, EXAM_CONFIG.EVALUATION.QUESTIONS_COUNT)
        : await getMixedQuestions(EXAM_CONFIG.EVALUATION.QUESTIONS_COUNT);
      setQuestions(q.map(randomizeAnswerOptions));
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
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const handleAnswer = (index) => {
    if (answers[currentQuestion] !== undefined) return;
    const newAnswers = { ...answers, [currentQuestion]: index };
    setAnswers(newAnswers);
    // Avancer automatiquement après 600ms
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((q) => q + 1), 600);
    }
  };

  const handleSubmit = () => {
    clearInterval(intervalRef.current);
    setPhase('results');
  };

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Préparation de l'évaluation...</p>
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
            <h1 className="text-3xl font-heading font-bold text-primary mb-3">Évaluation de niveau</h1>
            <p className="text-neutral-600 mb-6">
              Ce test rapide mesure votre niveau actuel. Les résultats vous aident à cibler vos efforts avant la certification.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-accent/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-accent">{EXAM_CONFIG.EVALUATION.QUESTIONS_COUNT}</p>
                <p className="text-xs text-neutral-500 mt-1">Questions</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">10 min</p>
                <p className="text-xs text-neutral-500 mt-1">Durée</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">Indicatif</p>
                <p className="text-xs text-neutral-500 mt-1">Pas de certificat</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-semibold mb-2">Comment ça marche :</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Le timer démarre dès que vous commencez</li>
                <li>• Passez automatiquement à la question suivante après chaque réponse</li>
                <li>• L'évaluation se soumet automatiquement à 0 seconde</li>
                <li>• Aucun résultat n'est enregistré dans votre profil</li>
              </ul>
            </div>
            <CTAButton onClick={() => setPhase('quiz')} size="lg" className="w-full">
              🚀 Commencer l'évaluation
            </CTAButton>
            <p className="mt-4 text-sm text-neutral-400">
              <a href="/training" className="hover:text-accent underline">← Revenir à l'entraînement</a>
            </p>
          </Card>
        </div>
      </section>
    );
  }

  // ——— Résultats ———
  if (phase === 'results') {
    const scoreData = calculateScore(
      Object.entries(answers).map(([qIdx, ans]) => ({
        questionId: questions[qIdx]?.id,
        userAnswer: ans,
      })),
      questions
    );

    const pct = scoreData.percentage;
    let niveau, niveauColor, niveauBg, conseil;
    if (pct >= 80) {
      niveau = 'Avancé'; niveauColor = 'text-green-700'; niveauBg = 'bg-green-50 border-green-300';
      conseil = 'Excellent niveau ! Vous êtes prêt pour passer la certification officielle.';
    } else if (pct >= 60) {
      niveau = 'Intermédiaire'; niveauColor = 'text-blue-700'; niveauBg = 'bg-blue-50 border-blue-300';
      conseil = 'Bon niveau. Quelques révisions ciblées et vous serez prêt pour la certification.';
    } else if (pct >= 40) {
      niveau = 'Débutant avancé'; niveauColor = 'text-orange-700'; niveauBg = 'bg-orange-50 border-orange-300';
      conseil = 'Des bases solides mais il faut renforcer vos connaissances. Continuez l\'entraînement !';
    } else {
      niveau = 'Débutant'; niveauColor = 'text-red-700'; niveauBg = 'bg-red-50 border-red-300';
      conseil = 'Commencez par les modules d\'entraînement pour renforcer vos bases avant la certification.';
    }

    return (
      <section className="py-20 bg-neutral-50 min-h-screen">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{pct >= 60 ? '📈' : '📚'}</div>
            <h2 className="text-3xl font-heading font-bold text-primary">Résultat de votre évaluation</h2>
          </div>

          <Card className="mb-5 text-center">
            <p className="text-7xl font-bold text-accent mb-2">{pct}%</p>
            <p className="text-neutral-500">{scoreData.correct} bonne{scoreData.correct > 1 ? 's' : ''} réponse{scoreData.correct > 1 ? 's' : ''} sur {scoreData.total}</p>
            <div className={`inline-block mt-3 px-4 py-1.5 rounded-full border text-sm font-bold ${niveauBg} ${niveauColor}`}>
              Niveau : {niveau}
            </div>
          </Card>

          <Card className={`mb-5 border ${niveauBg}`}>
            <p className={`font-semibold ${niveauColor}`}>💡 {conseil}</p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTAButton href="/training" variant="outline" size="lg">📚 S'entraîner</CTAButton>
            <CTAButton href="/certification" size="lg">🏆 Passer la certification</CTAButton>
          </div>
        </div>
      </section>
    );
  }

  // ——— Quiz ———
  const question  = questions[currentQuestion];
  const answered  = answers[currentQuestion] !== undefined;
  const progress  = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const isLast    = currentQuestion === questions.length - 1;

  return (
    <section className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">

        {/* Timer flottant */}
        <div className={`flex justify-between items-center mb-4 px-5 py-3 rounded-2xl font-bold ${isTimeCritical(timeLeft) ? 'bg-red-50 border-2 border-red-300 text-red-600' : 'bg-white border border-neutral-200 text-primary'}`}>
          <span className="text-sm">Question {currentQuestion + 1}/{questions.length}</span>
          <span className="text-xl">⏱ {formatTime(timeLeft)}</span>
          <span className="text-sm text-neutral-400">{answeredCount}/{questions.length} répondus</span>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
          <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <Card className="p-7">
          <p className="text-xl font-semibold text-neutral-800 mb-4 leading-relaxed">{question.text}</p>
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
            {question.options.map((option, index) => {
              let style = 'border-neutral-200 hover:border-accent hover:bg-accent/5 cursor-pointer';
              if (answered) {
                if (index === answers[currentQuestion]) {
                  style = 'border-accent bg-accent/10';
                } else {
                  style = 'border-neutral-100 opacity-40';
                }
              }
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all ${style}`}
                >
                  <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* En mode évaluation : pas d'explication immédiate */}
          {answered && !isLast && (
            <p className="text-center text-xs text-neutral-400 mt-4">Passage automatique à la question suivante...</p>
          )}

          {answered && isLast && (
            <div className="mt-6 text-center">
              <CTAButton
                onClick={handleSubmit}
                size="lg"
                className="w-full"
              >
                ✅ Voir mon résultat
              </CTAButton>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

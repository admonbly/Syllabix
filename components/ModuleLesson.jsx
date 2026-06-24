'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Leçon structurée avant quiz :
 * concept → analogie → exemple africain → points clés → erreurs classiques
 */
export default function ModuleLesson({ lesson, onStartQuiz }) {
  const { locale } = useLanguage();
  const fr = locale === 'fr';
  const [step, setStep] = useState(0); // 0=concept 1=exemple 2=clés 3=erreurs

  if (!lesson) return null;

  const steps = [
    { id: 0, label: fr ? 'Concept' : 'Concept',       emoji: '💡' },
    { id: 1, label: fr ? 'Exemple' : 'Example',        emoji: '🌍' },
    { id: 2, label: fr ? 'Points clés' : 'Key points', emoji: '🎯' },
    { id: 3, label: fr ? 'Pièges' : 'Mistakes',        emoji: '⚠️' },
  ];

  return (
    <div className="mb-10">

      {/* En-tête leçon */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-2">
            📖 {fr ? `Leçon rapide · ${lesson.duration}` : `Quick lesson · ${lesson.duration}`}
          </span>
          <p className="text-sm text-neutral-600 max-w-xl">
            {fr ? lesson.intro.fr : lesson.intro.en}
          </p>
        </div>
        <button
          onClick={onStartQuiz}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors flex-shrink-0 ml-4"
        >
          {fr ? 'Passer au quiz →' : 'Skip to quiz →'}
        </button>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              step === s.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary'
            }`}
          >
            <span>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">

        {/* ÉTAPE 0 — Concept + analogie */}
        {step === 0 && (
          <div className="p-7">
            <h3 className="text-xl font-heading font-bold text-primary mb-4">
              {fr ? lesson.concept.title.fr : lesson.concept.title.en}
            </h3>
            <p className="text-neutral-700 leading-relaxed mb-6">
              {fr ? lesson.concept.body.fr : lesson.concept.body.en}
            </p>
            <div className="flex gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-3xl flex-shrink-0">{lesson.concept.analogy.emoji}</span>
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                  {fr ? 'Analogie pour comprendre' : 'Analogy to understand'}
                </p>
                <p className="text-sm text-amber-900 leading-relaxed italic">
                  {fr ? lesson.concept.analogy.fr : lesson.concept.analogy.en}
                </p>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              {fr ? 'Voir l\'exemple →' : 'See example →'}
            </button>
          </div>
        )}

        {/* ÉTAPE 1 — Exemple africain */}
        {step === 1 && (
          <div className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{lesson.example.emoji}</span>
              <h3 className="text-xl font-heading font-bold text-primary">
                {fr ? lesson.example.title.fr : lesson.example.title.en}
              </h3>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <pre className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">
                {fr ? lesson.example.body.fr : lesson.example.body.en}
              </pre>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="px-5 py-2.5 border border-neutral-200 text-neutral-500 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                ← {fr ? 'Retour' : 'Back'}
              </button>
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                {fr ? 'Points clés →' : 'Key points →'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Points clés */}
        {step === 2 && (
          <div className="p-7">
            <h3 className="text-xl font-heading font-bold text-primary mb-5">
              🎯 {fr ? 'Points clés à retenir' : 'Key points to remember'}
            </h3>
            <div className="space-y-3">
              {lesson.keyPoints.map((kp, i) => (
                <div key={i} className="flex gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <span className="text-xl flex-shrink-0">{kp.emoji}</span>
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {fr ? kp.fr : kp.en}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-neutral-200 text-neutral-500 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                ← {fr ? 'Retour' : 'Back'}
              </button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                {fr ? 'Erreurs classiques →' : 'Common mistakes →'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Erreurs classiques + CTA quiz */}
        {step === 3 && (
          <div className="p-7">
            <h3 className="text-xl font-heading font-bold text-primary mb-5">
              ⚠️ {fr ? 'Erreurs classiques à éviter' : 'Common mistakes to avoid'}
            </h3>
            <div className="space-y-3 mb-8">
              {lesson.mistakes.map((m, i) => (
                <div key={i} className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-red-400 flex-shrink-0 font-bold text-sm mt-0.5">✗</span>
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {fr ? m.fr : m.en}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA final vers le quiz */}
            <div className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 text-white text-center">
              <p className="text-lg font-heading font-bold mb-1">
                {fr ? '✅ Leçon terminée — tu es prêt !' : '✅ Lesson done — you\'re ready!'}
              </p>
              <p className="text-sm text-white/80 mb-4">
                {fr ? '5 questions adaptées à ton niveau t\'attendent.' : '5 questions adapted to your level are waiting.'}
              </p>
              <button
                onClick={onStartQuiz}
                className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-neutral-100 transition-colors text-sm"
              >
                {fr ? '🚀 Commencer le quiz' : '🚀 Start the quiz'}
              </button>
            </div>

            <button onClick={() => setStep(2)} className="mt-4 px-5 py-2.5 border border-neutral-200 text-neutral-500 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
              ← {fr ? 'Retour' : 'Back'}
            </button>
          </div>
        )}
      </div>

      {/* Bouton skip mobile */}
      <button
        onClick={onStartQuiz}
        className="sm:hidden mt-4 w-full py-3 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
      >
        {fr ? 'Passer directement au quiz →' : 'Skip directly to quiz →'}
      </button>
    </div>
  );
}

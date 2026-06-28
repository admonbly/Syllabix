'use client';

import { Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import TrainingQuizComponent from '@/components/TrainingQuizComponent';
import ModuleLesson from '@/components/ModuleLesson';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { quizData } from '@/lib/quizData';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';
import { MODULE_LESSONS } from '@/lib/moduleLessons';
import { EXAM_CONFIG } from '@/lib/examService';

function TrainingModuleContent() {
  const params = useParams();
  const moduleId = params.id;

  const module = quizData.find((m) => m.id === parseInt(moduleId));
  const compData = MODULE_COMPETENCIES.find((m) => m.moduleId === parseInt(moduleId));
  const lesson = MODULE_LESSONS.find((m) => m.moduleId === parseInt(moduleId));
  const [showQuiz, setShowQuiz] = useState(false);

  if (!module) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-neutral-600 mb-8">Module non trouvé</p>
          <CTAButton href="/training" variant="primary" size="lg">
            ← Retour aux formations
          </CTAButton>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <CTAButton href="/training" variant="outline" className="mb-4">
            ← Retour aux formations
          </CTAButton>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">
            📚 Entraînement: {module.module}
          </h1>
          <p className="text-lg text-neutral-600">
            Pratiquez avec {EXAM_CONFIG.TRAINING.SESSION_SIZE} questions aléatoires de ce module
          </p>

          {/* Compétences développées */}
          {compData && (
            <div className={`mt-5 p-5 rounded-2xl border-2 ${compData.color.bg} ${compData.color.border}`}>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">
                Compétences que tu vas développer
              </p>
              <div className="flex flex-wrap gap-3">
                {compData.competences.map((comp, i) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${compData.color.badge}`}>
                    <span className="text-base">{comp.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{comp.fr}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{comp.desc_fr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leçon ou Quiz selon l'état */}
        {!showQuiz ? (
          <>
            <ModuleLesson lesson={lesson} onStartQuiz={() => setShowQuiz(true)} />

            {/* Info quiz */}
            <div className="mb-8 flex flex-wrap gap-6 px-1">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="font-bold text-primary text-base">{EXAM_CONFIG.TRAINING.SESSION_SIZE}</span>
                questions / session
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="font-bold text-primary text-base">~{Math.ceil(EXAM_CONFIG.TRAINING.SESSION_SIZE * 1.5)} min</span>
                durée estimée
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="font-bold text-primary text-base">Adaptatif</span>
                difficulté
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowQuiz(false)}
                className="text-sm text-primary font-semibold hover:underline"
              >
                ← Revoir la leçon
              </button>
            </div>
            <TrainingQuizComponent mode="module" moduleId={moduleId} />
          </>
        )}
      </div>
    </section>
  );
}

export default function TrainingModulePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <TrainingModuleContent />
    </Suspense>
  );
}

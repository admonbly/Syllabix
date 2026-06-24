'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import TrainingQuizComponent from '@/components/TrainingQuizComponent';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { quizData } from '@/lib/quizData';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';

function TrainingModuleContent() {
  const params = useParams();
  const moduleId = params.id;

  const module = quizData.find((m) => m.id === parseInt(moduleId));
  const compData = MODULE_COMPETENCIES.find((m) => m.moduleId === parseInt(moduleId));

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
            Pratiquez avec 5 questions aléatoires de ce module
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

        {/* Info box */}
        <Card className="mb-12 bg-blue-50 border-l-4 border-blue-500 p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-sm text-neutral-600">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">10 min</p>
              <p className="text-sm text-neutral-600">Durée</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Gratuit</p>
              <p className="text-sm text-neutral-600">Sans compte</p>
            </div>
          </div>
        </Card>

        {/* Quiz */}
        <TrainingQuizComponent mode="module" moduleId={moduleId} />
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

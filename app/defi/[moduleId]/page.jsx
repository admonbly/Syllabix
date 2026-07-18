'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TrainingQuizComponent from '@/components/TrainingQuizComponent';
import CTAButton from '@/components/CTAButton';
import { quizData } from '@/lib/quizData';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Défi public — variante SANS compte de l'entraînement d'un module.
 * Ouvre une session anonyme (via TrainingQuizComponent challenge) ; le badge et
 * l'historique sont conservés à la création de compte (linking).
 */
function DefiContent() {
  const params = useParams();
  const moduleId = params.moduleId;
  const { locale } = useLanguage();

  const module = quizData.find((m) => m.id === parseInt(moduleId));
  const compData = MODULE_COMPETENCIES.find((m) => m.moduleId === parseInt(moduleId));

  if (!module) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-neutral-600 mb-8">
            {locale === 'fr' ? 'Ce défi est introuvable.' : 'This challenge was not found.'}
          </p>
          <CTAButton href="/defi" variant="primary" size="lg">
            {locale === 'fr' ? 'Voir tous les défis' : 'See all challenges'}
          </CTAButton>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link href="/defi" className="text-sm text-primary font-semibold hover:underline">
          ← {locale === 'fr' ? 'Tous les défis' : 'All challenges'}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl">{compData?.icon ?? '🎯'}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary leading-tight">
              {locale === 'fr' ? compData?.nameFr : compData?.nameEn} — {locale === 'fr' ? 'Défi' : 'Challenge'}
            </h1>
            <p className="text-sm text-neutral-500">
              {locale === 'fr'
                ? '10 questions · ~15 min · sans inscription'
                : '10 questions · ~15 min · no sign-up'}
            </p>
          </div>
        </div>
      </div>

      <TrainingQuizComponent mode="module" moduleId={moduleId} challenge />
    </div>
  );
}

export default function DefiModulePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-neutral-500">…</div>}>
      <DefiContent />
    </Suspense>
  );
}

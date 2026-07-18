'use client';

import TrainingQuizComponent from '@/components/TrainingQuizComponent';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { EXAM_CONFIG } from '@/lib/examService';

/**
 * Page d'entraînement mixte
 * Questions mélangées de tous les modules (voir EXAM_CONFIG.TRAINING)
 */
export default function TrainingMixedPage() {
  const count = EXAM_CONFIG.TRAINING.SESSION_SIZE;
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <CTAButton href="/training" variant="outline" className="mb-4">
            ← Retour aux formations
          </CTAButton>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">
            🎯 Test Rapide Global
          </h1>
          <p className="text-lg text-neutral-600">
            {count} questions aléatoires de tous les modules mélangés
          </p>
        </div>

        {/* Info box */}
        <Card className="mb-12 bg-green-50 border-l-4 border-green-500 p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{count}</p>
              <p className="text-sm text-neutral-600">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">~15 min</p>
              <p className="text-sm text-neutral-600">Durée</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Mélangé</p>
              <p className="text-sm text-neutral-600">Tous les modules</p>
            </div>
          </div>
        </Card>

        {/* Quiz */}
        <TrainingQuizComponent mode="mixed" />
      </div>
    </section>
  );
}

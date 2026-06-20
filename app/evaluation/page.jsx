'use client';

import { Suspense } from 'react';
import EvaluationQuizComponent from '@/components/EvaluationQuizComponent';

function EvaluationContent() {
  return <EvaluationQuizComponent mode="mixed" />;
}

export default function EvaluationPage() {
  return (
    <Suspense fallback={
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </section>
    }>
      <EvaluationContent />
    </Suspense>
  );
}

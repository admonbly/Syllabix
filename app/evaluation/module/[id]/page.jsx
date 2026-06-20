'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import EvaluationQuizComponent from '@/components/EvaluationQuizComponent';

function EvaluationModuleContent() {
  const params = useParams();
  const moduleId = params?.id ? parseInt(params.id, 10) : 0;
  return <EvaluationQuizComponent mode="module" moduleId={moduleId} />;
}

export default function EvaluationModulePage() {
  return (
    <Suspense fallback={
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </section>
    }>
      <EvaluationModuleContent />
    </Suspense>
  );
}

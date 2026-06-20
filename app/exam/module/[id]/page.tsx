'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import CertificationQuizComponent from '@/components/CertificationQuizComponent';
import CTAButton from '@/components/CTAButton';
import { quizData } from '@/lib/quizData';

function ExamModuleContent() {
  const params = useParams();
  const moduleId = params?.id as string;

  const module = quizData.find((m) => m.id === parseInt(moduleId));

  if (!module) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-neutral-600 mb-8">Module non trouvé</p>
          <CTAButton href="/certification" variant="primary" size="lg">
            ← Retour à la certification
          </CTAButton>
        </div>
      </section>
    );
  }

  return <CertificationQuizComponent mode="module" moduleId={moduleId} />;
}

export default function ExamModulePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ExamModuleContent />
    </Suspense>
  );
}

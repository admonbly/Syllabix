'use client';

import CertificationQuizComponent from '@/components/CertificationQuizComponent';

/**
 * Page examen global
 * 35 questions mélangées
 * 35 minutes
 * Certificat si >= 60%
 */
export default function ExamGlobalPage() {
  return <CertificationQuizComponent mode="global" />;
}

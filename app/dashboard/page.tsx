'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/Loading';
import { useAuth } from '@/hooks';
import { useExamStats } from '@/hooks';
import { useExamHistory } from '@/hooks';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, firebaseUser } = useAuth();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useExamStats();
  const { history, isLoading: historyLoading, refetch: refetchHistory } = useExamHistory();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const isLoading = authLoading || statsLoading || historyLoading;

  if (isLoading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  if (!user || !isAuthenticated) {
    return null; // Will redirect
  }

  // Calculate statistics from exam history
  const totalExams = history?.length || 0;
  const passedExams = history?.filter((exam) => exam.passed).length || 0;
  const averageScore =
    totalExams > 0 ? Math.round(history!.reduce((sum, exam) => sum + exam.score, 0) / totalExams) : 0;
  const completionPercentage = stats ? Math.round((stats.passedExams / 6) * 100) : 0;

  // Group history by module for progress display
  const progressByModule = [
    { module: 'IT (Ordinateur)', moduleId: 'it-basics' },
    { module: 'Internet & Google', moduleId: 'internet' },
    { module: 'Email', moduleId: 'email' },
    { module: 'Bureautique', moduleId: 'office' },
    { module: 'Cybersécurité', moduleId: 'cybersecurity' },
    { module: 'Intelligence Artificielle', moduleId: 'ai' },
  ].map((mod) => {
    const moduleExams = history?.filter((exam) => exam.moduleId === mod.moduleId) || [];
    return {
      module: mod.module,
      attempts: moduleExams.length,
      bestScore: moduleExams.length > 0 ? Math.max(...moduleExams.map((e) => e.score)) : 0,
      status: moduleExams.length > 0 && moduleExams.some((e) => e.passed) ? '✅ Certifié' : '🔒 Non tenté',
    };
  });

  // Get certificates (exams with passed=true)
  const certificates = history
    ?.filter((exam) => exam.passed)
    .slice(0, 3)
    .map((exam, index) => ({
      module: exam.moduleId,
      level: exam.score >= 80 ? 'AVANCÉ' : 'INTERMÉDIAIRE',
      date: new Date(exam.submittedAt).toLocaleDateString('fr-FR'),
      id: exam.examId,
      score: exam.score,
    })) || [];

  const handleLogout = () => {
    if (firebaseUser) {
      // Firebase sign out would be called here
      router.push('/auth/login');
    }
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Mon Tableau de Bord</h1>

        {/* User Info */}
        <Card className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-neutral-600">Bienvenue</p>
            <p className="text-2xl font-heading font-bold text-primary">
              {user?.displayName || user?.email}
            </p>
            <p className="text-sm text-neutral-500">
              Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            Déconnexion
          </button>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="accent">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-neutral-600 text-sm">Modules certifiés</p>
            <p className="text-3xl font-bold text-accent">{stats?.passedExams || 0}/6</p>
          </Card>
          <Card variant="secondary">
            <div className="text-4xl mb-2">📜</div>
            <p className="text-neutral-600 text-sm">Certificats</p>
            <p className="text-3xl font-bold text-secondary">{certificates.length}</p>
          </Card>
          <Card>
            <div className="text-4xl mb-2">📊</div>
            <p className="text-neutral-600 text-sm">Score moyen</p>
            <p className="text-3xl font-bold text-primary">{averageScore}%</p>
          </Card>
          <Card>
            <div className="text-4xl mb-2">⏱️</div>
            <p className="text-neutral-600 text-sm">Exams passés</p>
            <p className="text-3xl font-bold">{totalExams}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">Progression générale</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent to-orange-500 h-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <p className="font-bold text-accent text-lg">{completionPercentage}%</p>
          </div>
        </Card>

        {/* Progress by Module */}
        <Card className="mb-8">
          <h3 className="text-xl font-heading font-bold text-primary mb-6">Progression par module</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 font-heading font-bold text-primary">Module</th>
                  <th className="text-center py-3 font-heading font-bold text-primary">Tentatives</th>
                  <th className="text-center py-3 font-heading font-bold text-primary">Meilleur score</th>
                  <th className="text-right py-3 font-heading font-bold text-primary">Statut</th>
                </tr>
              </thead>
              <tbody>
                {progressByModule.map((item, index) => (
                  <tr key={index} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="py-4 font-medium text-neutral-700">{item.module}</td>
                    <td className="text-center py-4 text-neutral-600">{item.attempts}</td>
                    <td className="text-center py-4 font-bold text-primary">
                      {item.bestScore > 0 ? `${item.bestScore}%` : '-'}
                    </td>
                    <td className="text-right py-4 font-semibold text-accent">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Certificates */}
        {certificates.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-xl font-heading font-bold text-primary mb-6">📜 Mes certificats</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certificates.map((cert, index) => (
                <Card key={index} variant="accent" className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-heading font-bold text-primary">{cert.module}</p>
                      <p className="text-sm text-neutral-600">{cert.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-bold">
                      {cert.level}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">Score: {cert.score}%</p>
                  <p className="text-xs text-neutral-500 mb-4">ID: {cert.id}</p>
                  <button className="w-full px-4 py-2 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors text-sm">
                    📥 Télécharger
                  </button>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="text-center p-8 bg-gradient-to-r from-accent to-orange-500 text-white">
          <h3 className="text-2xl font-heading font-bold mb-4">Continuer votre apprentissage</h3>
          <p className="mb-6">Explorez nos modules de certification et augmentez vos compétences</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <CTAButton href="/certification" variant="primary">
              🎯 Certification
            </CTAButton>
            <CTAButton href="/training" variant="outline">
              📚 Formation
            </CTAButton>
          </div>
        </Card>
      </div>
    </section>
  );
}

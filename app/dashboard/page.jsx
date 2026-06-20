'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MODULES = [
  { id: 0, name: 'IT (Ordinateur)' },
  { id: 1, name: 'Internet & Google' },
  { id: 2, name: 'Email' },
  { id: 3, name: 'Bureautique' },
  { id: 4, name: 'Cybersécurité' },
  { id: 5, name: 'Intelligence Artificielle' },
  { id: 6, name: 'Employabilité' },
];

const MIN_PASS_SCORE = 60;

function formatCertDate(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      setUser(firebaseUser);

      try {
        const [prog, certs] = await Promise.all([
          userDB.getUserProgress(firebaseUser.uid),
          userDB.getUserCertificates(firebaseUser.uid),
        ]);
        setProgress(prog || []);
        setCertificates(certs || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-neutral-600">Chargement du tableau de bord...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Vous devez être connecté pour accéder au tableau de bord.</p>
          <Link href="/auth/login" className="text-accent font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  // Merge module list with actual progress
  const progressByModule = {};
  progress.forEach((p) => {
    const key = String(p.moduleId);
    if (!progressByModule[key] || p.score > progressByModule[key].score) {
      progressByModule[key] = p;
    }
  });

  const moduleProgress = MODULES.map((mod) => {
    const p = progressByModule[String(mod.id)];
    return {
      module: mod.name,
      bestScore: p ? p.score : 0,
      passed: p ? p.score >= MIN_PASS_SCORE : false,
      attempted: !!p,
    };
  });

  const completedCount = moduleProgress.filter((m) => m.passed).length;
  const attemptedCount = moduleProgress.filter((m) => m.attempted).length;
  const passRate = attemptedCount > 0
    ? Math.round((completedCount / attemptedCount) * 100)
    : 0;
  const completionPercentage = Math.round((completedCount / MODULES.length) * 100);

  const displayName = user.displayName || user.email;
  const joinYear = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Mon Tableau de Bord</h1>

        {/* User Info */}
        <Card className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-neutral-600">Bienvenue</p>
            <p className="text-2xl font-heading font-bold text-primary">{displayName}</p>
            {joinYear && (
              <p className="text-sm text-neutral-500">Membre depuis {joinYear}</p>
            )}
          </div>
          <button
            onClick={async () => {
              const { authFunctions } = await import('@/lib/firebase');
              await authFunctions.signOut();
              window.location.href = '/auth/login';
            }}
            className="px-6 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            Déconnexion
          </button>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="accent">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-neutral-600 text-sm">Modules complétés</p>
            <p className="text-3xl font-bold text-accent">{completedCount}/{MODULES.length}</p>
          </Card>
          <Card variant="secondary">
            <div className="text-4xl mb-2">📜</div>
            <p className="text-neutral-600 text-sm">Certificats obtenus</p>
            <p className="text-3xl font-bold text-secondary">{certificates.length}</p>
          </Card>
          <Card>
            <div className="text-4xl mb-2">📊</div>
            <p className="text-neutral-600 text-sm">Taux de réussite</p>
            <p className="text-3xl font-bold text-primary">{passRate > 0 ? `${passRate}%` : '-'}</p>
          </Card>
          <Card>
            <div className="text-4xl mb-2">📝</div>
            <p className="text-neutral-600 text-sm">Modules tentés</p>
            <p className="text-3xl font-bold">{attemptedCount}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">
            Progression générale
          </h3>
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
          <h3 className="text-xl font-heading font-bold text-primary mb-6">
            Progression par module
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 font-heading font-bold text-primary">Module</th>
                  <th className="text-center py-3 font-heading font-bold text-primary">Meilleur score</th>
                  <th className="text-right py-3 font-heading font-bold text-primary">Statut</th>
                </tr>
              </thead>
              <tbody>
                {moduleProgress.map((item, index) => (
                  <tr key={index} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="py-4 font-medium text-neutral-700">{item.module}</td>
                    <td className="text-center py-4 font-bold text-primary">
                      {item.bestScore > 0 ? `${item.bestScore}%` : '-'}
                    </td>
                    <td className="text-right py-4 font-semibold text-accent">
                      {item.passed ? '✅ Certifié' : item.attempted ? '⚠️ Non réussi' : '🔒 Non tenté'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Certificates */}
        {certificates.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-xl font-heading font-bold text-primary mb-6">
              📜 Mes certificats
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} variant="accent" className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-heading font-bold text-primary">
                        {cert.moduleId !== null && cert.moduleId !== undefined
                          ? MODULES[cert.moduleId]?.name || `Module ${cert.moduleId}`
                          : 'Certification Globale'}
                      </p>
                      <p className="text-sm text-neutral-600">{formatCertDate(cert.issuedAt || cert.createdAt)}</p>
                    </div>
                    <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-bold">
                      {cert.score >= 80 ? 'AVANCÉ' : cert.score >= 60 ? 'INTERMÉDIAIRE' : 'VALIDÉ'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">ID: {cert.id}</p>
                  <Link
                    href={`/certificate/${cert.id}`}
                    className="block w-full px-4 py-2 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors text-sm text-center"
                  >
                    📥 Voir le certificat
                  </Link>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {certificates.length === 0 && completedCount === 0 && (
          <Card className="mb-8 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-blue-800 font-semibold mb-2">Vous n'avez pas encore de certificat.</p>
            <p className="text-blue-700 text-sm">
              Passez un examen de certification pour obtenir votre premier certificat.
            </p>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center">
          <CTAButton href="/training/mixed" size="lg">
            🏋️ Continuer l'entraînement
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

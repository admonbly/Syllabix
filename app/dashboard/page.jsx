'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import BadgeGrid from '@/components/BadgeGrid';
import OrgPanel from '@/components/OrgPanel';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import { SkeletonStat, SkeletonCard } from '@/components/SkeletonCard';
import Link from 'next/link';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';

const SESSION_TYPE_LABEL = {
  training:   { label: 'Entraînement', color: 'bg-blue-100 text-blue-700' },
  evaluation: { label: 'Évaluation',   color: 'bg-purple-100 text-purple-700' },
};

const MODULE_NAMES_SHORT = ['IT', 'Internet', 'Email', 'Bureautique', 'Cybersec', 'IA', 'Emploi'];

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'À l\'instant';
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

const MODULES = [
  { id: 0, name: 'IT (Ordinateur)' },
  { id: 1, name: 'Internet' },
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
  const { t } = useLanguage();
  const d = (k) => t(`dashboard.${k}`);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProgress, unsubCerts, unsubBadges, unsubSessions;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      setUser(firebaseUser);

      // Listeners temps réel — se déclenchent dès qu'une donnée change dans Firestore
      unsubProgress  = userDB.subscribeToProgress(firebaseUser.uid, (data) => setProgress(data));
      unsubCerts     = userDB.subscribeToCertificates(firebaseUser.uid, (data) => setCertificates(data));
      unsubBadges    = userDB.subscribeToBadges(firebaseUser.uid, (data) => setBadges(data));
      unsubSessions  = userDB.subscribeToSessions(firebaseUser.uid, (data) => setSessions(data));

      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubProgress?.();
      unsubCerts?.();
      unsubBadges?.();
      unsubSessions?.();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-40 bg-gradient-to-br from-primary to-[#283593] animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
          </div>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageHeader title="Tableau de bord" subtitle="Connectez-vous pour accéder à votre espace personnel." icon="📊" />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-neutral-600 mb-6 text-lg">{d('notLoggedIn')}</p>
          <CTAButton href="/auth/login" variant="primary" size="lg">{d('signIn')}</CTAButton>
        </div>
      </div>
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
    <div className="min-h-screen bg-neutral-50">

      {/* Header premium */}
      <PageHeader
        title={d('title')}
        icon="📊"
        badge="Espace personnel"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm">{d('welcome')}</p>
            <p className="text-xl font-heading font-bold text-white">{displayName}</p>
            {joinYear && <p className="text-white/40 text-xs mt-0.5">{d('member')} {joinYear}</p>}
          </div>
          <Link
            href="/profile"
            className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            {d('myProfile')} →
          </Link>
        </div>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: d('stats.completed'),    value: `${completedCount}/${MODULES.length}`, color: 'text-accent',     border: 'border-accent/20',     bg: 'bg-orange-50',  icon: '🎯' },
            { label: d('stats.certificates'), value: certificates.length,                   color: 'text-secondary',  border: 'border-secondary/20',  bg: 'bg-green-50',   icon: '🏆' },
            { label: d('stats.rate'),         value: passRate > 0 ? `${passRate}%` : '—',  color: 'text-primary',    border: 'border-primary/20',    bg: 'bg-blue-50',    icon: '📈' },
            { label: d('stats.attempted'),    value: attemptedCount,                        color: 'text-neutral-700',border: 'border-neutral-200',   bg: 'bg-white',      icon: '📝' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className={`lift rounded-2xl border-2 ${s.border} ${s.bg} p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
                <span className="text-lg opacity-70" aria-hidden>{s.icon}</span>
              </div>
              <p className={`text-3xl font-heading font-extrabold ${s.color}`}>{s.value}</p>
            </Reveal>
          ))}
        </div>

        {/* Mon établissement (école / entreprise) */}
        <div className="mb-8">
          <OrgPanel />
        </div>

        {/* Recommandations personnalisées */}
        {(() => {
          const recommendations = moduleProgress
            .map((m, i) => ({ ...m, moduleId: i }))
            .filter((m) => m.bestScore < 80)
            .sort((a, b) => {
              // Priorité : non tenté d'abord, puis score le plus bas
              if (!a.attempted && b.attempted) return -1;
              if (a.attempted && !b.attempted) return 1;
              return a.bestScore - b.bestScore;
            })
            .slice(0, 3);

          if (recommendations.length === 0) return (
            <Card className="mb-8 bg-green-50 border-l-4 border-green-400">
              <p className="text-green-800 font-semibold text-lg mb-1">🎉 Bravo, tu maîtrises tout !</p>
              <p className="text-green-700 text-sm">Tous tes modules sont au-dessus de 80%. Passe la certification globale pour couronner le tout.</p>
            </Card>
          );

          const TAG = {
            notTried:  { label: 'À commencer',   cls: 'bg-neutral-100 text-neutral-500' },
            improve:   { label: 'À renforcer',    cls: 'bg-red-100 text-red-600' },
            progress:  { label: 'Peut progresser', cls: 'bg-amber-100 text-amber-700' },
          };

          return (
            <Card className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-xl font-heading font-bold text-primary">Ton parcours recommandé</h3>
                  <p className="text-sm text-neutral-500">Basé sur tes résultats — modules à travailler en priorité</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, idx) => {
                  const tag = !rec.attempted ? TAG.notTried : rec.bestScore < 60 ? TAG.improve : TAG.progress;
                  const icons = ['💻','🌐','📧','📊','🔒','🤖','💼'];
                  return (
                    <div key={rec.moduleId} className="relative flex flex-col p-5 rounded-2xl border-2 border-neutral-100 hover:border-accent/30 hover:shadow-accent transition-all bg-white">
                      {/* Numéro priorité */}
                      <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {idx + 1}
                      </span>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{icons[rec.moduleId]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-primary text-sm leading-tight truncate">{rec.module}</p>
                          <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${tag.cls}`}>
                            {tag.label}
                          </span>
                        </div>
                      </div>

                      {rec.attempted ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                            <span>Meilleur score</span>
                            <span className={rec.bestScore < 60 ? 'text-red-500 font-bold' : 'text-amber-600 font-bold'}>
                              {rec.bestScore}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${rec.bestScore < 60 ? 'bg-red-400' : 'bg-amber-400'}`}
                              style={{ width: `${rec.bestScore}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 mb-4 flex-1">Pas encore tenté — commence l'entraînement !</p>
                      )}

                      <div className="flex gap-2 mt-auto">
                        <a
                          href={`/training/module/${rec.moduleId}`}
                          className="flex-1 text-center px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          📚 S'entraîner
                        </a>
                        {rec.attempted && (
                          <a
                            href={`/exam/module/${rec.moduleId}`}
                            className="px-3 py-2 border-2 border-accent text-accent rounded-xl text-xs font-semibold hover:bg-accent hover:text-white transition-colors"
                          >
                            🎓
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })()}

        {/* Activité récente */}
        {sessions.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-xl font-heading font-bold text-primary mb-5">📋 Activité récente</h3>
            <div className="space-y-3">
              {sessions.slice(0, 8).map((s) => {
                const typeInfo = SESSION_TYPE_LABEL[s.type] ?? { label: s.type, color: 'bg-neutral-100 text-neutral-600' };
                const modLabel = s.moduleId !== null && s.moduleId !== undefined
                  ? MODULE_NAMES_SHORT[parseInt(s.moduleId)] ?? `Module ${s.moduleId}`
                  : 'Mixte';
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-sm text-neutral-600 flex-1">{modLabel}</span>
                    <span className={`text-sm font-bold ${s.score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                      {s.score}%
                    </span>
                    <span className="text-xs text-neutral-400 whitespace-nowrap">{timeAgo(s.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Badges */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-primary">
              🏅 {d('badges.title') || 'Mes badges'}
            </h3>
            <span className="text-sm text-neutral-500">
              {badges.length}/{7} {d('badges.earned') || 'obtenus'}
            </span>
          </div>
          <BadgeGrid badges={badges} shareable />
        </Card>

        <Card className="mb-8">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">
            {d('progress.title')}
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
            {d('byModule.title')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 font-heading font-bold text-primary">{d('byModule.module')}</th>
                  <th className="text-center py-3 font-heading font-bold text-primary">{d('byModule.bestScore')}</th>
                  <th className="text-right py-3 font-heading font-bold text-primary">{d('byModule.status')}</th>
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
                      {item.passed ? d('byModule.certified') : item.attempted ? d('byModule.failed') : d('byModule.notTried')}
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
              {d('certificates.title')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} variant="accent" className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-heading font-bold text-primary">
                        {cert.moduleId !== null && cert.moduleId !== undefined
                          ? MODULES[cert.moduleId]?.name || `Module ${cert.moduleId}`
                          : d('certificates.globalCert')}
                      </p>
                      <p className="text-sm text-neutral-600">{formatCertDate(cert.issuedAt || cert.createdAt)}</p>
                    </div>
                    <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-bold">
                      {cert.score >= 80 ? d('certificates.levels.advanced') : cert.score >= 60 ? d('certificates.levels.mid') : d('certificates.levels.basic')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">ID: {cert.id}</p>
                  <Link
                    href={`/certificate/${cert.id}`}
                    className="block w-full px-4 py-2 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors text-sm text-center"
                  >
                    {d('certificates.view')}
                  </Link>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {certificates.length === 0 && completedCount === 0 && (
          <Card className="mb-8 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-blue-800 font-semibold mb-2">{d('certificates.noCert')}</p>
            <p className="text-blue-700 text-sm">{d('certificates.noCertDesc')}</p>
          </Card>
        )}

        <div className="text-center">
          <CTAButton href="/training/mixed" size="lg">{d('cta')}</CTAButton>
        </div>
      </div>
    </div>
  );
}

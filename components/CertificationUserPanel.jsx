'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import BadgeGrid from '@/components/BadgeGrid';
import CTAButton from '@/components/CTAButton';

const MIN_PASS = 60;

const MODULES = [
  { id: 0, name: 'IT & Ordinateur',          color: '#1A237E' },
  { id: 1, name: 'Internet',                  color: '#0277BD' },
  { id: 2, name: 'Email',                     color: '#00695C' },
  { id: 3, name: 'Bureautique',               color: '#E65100' },
  { id: 4, name: 'Cybersécurité',             color: '#B71C1C' },
  { id: 5, name: 'Intelligence Artificielle', color: '#4A148C' },
  { id: 6, name: 'Employabilité',             color: '#1B5E20' },
];

export default function CertificationUserPanel() {
  const [user, setUser]               = useState(null);
  const [progress, setProgress]       = useState({});
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges]           = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setLoading(false); return; }
      setUser(u);
      try {
        const [prog, certs, bdgs] = await Promise.all([
          userDB.getUserProgress(u.uid),
          userDB.getUserCertificates(u.uid),
          userDB.getUserBadges(u.uid),
        ]);
        setBadges(bdgs || []);
        const byModule = {};
        (prog || []).forEach((p) => {
          const k = String(p.moduleId);
          if (!byModule[k] || p.score > byModule[k].score) byModule[k] = p;
        });
        setProgress(byModule);
        setCertificates(certs || []);
      } catch (_) {}
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || !user) return null;

  const getModuleStatus = (moduleId) => {
    const p = progress[String(moduleId)];
    const cert = certificates.find((c) => c.moduleId === moduleId && c.examType === 'MODULE');
    if (cert) return { type: 'certified', score: cert.score, certId: cert.id };
    if (p && p.score >= MIN_PASS) return { type: 'certified', score: p.score };
    if (p) return { type: 'attempted', score: p.score };
    return { type: 'pending' };
  };

  const globalCert = certificates.find((c) => c.examType === 'GLOBAL');
  const certifiedCount = MODULES.filter((m) => getModuleStatus(m.id).type === 'certified').length;

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-10 pb-4">
      {/* Barre progression */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Votre progression</p>
            <p className="text-2xl font-bold text-primary">
              {certifiedCount} / {MODULES.length} modules certifiés
              {globalCert && (
                <span className="ml-3 text-base font-medium text-green-600">+ Certification globale ✓</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {MODULES.map((m) => {
                const s = getModuleStatus(m.id);
                return (
                  <div
                    key={m.id}
                    title={m.name}
                    className="w-3 h-8 rounded-full"
                    style={{
                      background: s.type === 'certified' ? '#27AE60'
                        : s.type === 'attempted' ? '#E67E22'
                        : '#e5e7eb',
                    }}
                  />
                );
              })}
            </div>
            <Link href="/dashboard" className="text-sm text-primary font-medium hover:underline">
              Tableau de bord →
            </Link>
          </div>
        </div>
      </div>

      {/* Badges */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm">🏅</span>
          <h2 className="text-2xl font-heading font-bold text-primary">Mes badges</h2>
          <span className="text-sm text-neutral-500">{badges.length}/{MODULES.length} obtenus</span>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <BadgeGrid badges={badges} />
        </div>
      </section>

      {/* Statuts sur certification globale */}
      {globalCert && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
            ✅ Déjà certifié — Score : {globalCert.score}%
          </div>
          {globalCert.id && (
            <CTAButton href={`/certificate/${globalCert.id}`} variant="outline" size="sm">
              Voir le certificat
            </CTAButton>
          )}
        </div>
      )}

      {/* Overlay statuts par module — injecté via data-module-id */}
      <div id="module-status-overlay" data-statuses={JSON.stringify(
        MODULES.map((m) => ({ id: m.id, ...getModuleStatus(m.id) }))
      )} />
    </div>
  );
}

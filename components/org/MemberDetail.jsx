'use client';

import { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Circle } from 'lucide-react';
import { auth } from '@/lib/firebase';

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
}

/** Fiche détaillée d'un membre, chargée à la demande (jamais pour toute la liste). */
export default function MemberDetail({ uid, onClose }) {
  const [member, setMember] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`/api/org/member/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
        setMember(data.member);
      } catch {
        if (!cancelled) setError('Erreur de chargement');
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Fermeture au clavier
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog" aria-modal="true" aria-labelledby="member-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 id="member-title" className="text-lg font-display font-bold text-primary truncate">
              {member?.displayName ?? 'Chargement…'}
            </h3>
            {member && <p className="text-xs text-neutral-500 truncate">{member.email}</p>}
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          {!member && !error && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />)}
            </div>
          )}

          {member && (
            <>
              {/* Chiffres clés */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'Modules validés', value: `${member.modulesValidated}/${member.totalModules}` },
                  { label: 'Score moyen',     value: member.avgScore !== null ? `${member.avgScore}%` : '—' },
                  { label: 'Certificats',     value: member.certificateCount },
                ].map((s) => (
                  <div key={s.label} className="bg-neutral-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-display font-extrabold text-primary tabular-nums">{s.value}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Modules */}
              <h4 className="text-xs font-display font-bold text-neutral-400 uppercase tracking-widest mb-3">
                Progression par module
              </h4>
              <div className="space-y-2 mb-8">
                {member.modules.map((m) => (
                  <div key={m.moduleId} className="flex items-center gap-3">
                    {m.validated
                      ? <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" aria-hidden="true" />
                      : <Circle className="w-4 h-4 text-neutral-200 flex-shrink-0" aria-hidden="true" />}
                    <span className={`text-sm flex-1 ${m.validated ? 'text-primary' : 'text-neutral-400'}`}>
                      {m.name}
                    </span>
                    {m.validated ? (
                      <>
                        <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${m.score}%` }} />
                        </div>
                        <span className="text-sm font-display font-bold text-secondary tabular-nums w-10 text-right">
                          {m.score}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-300">Pas encore validé</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Certificats */}
              <h4 className="text-xs font-display font-bold text-neutral-400 uppercase tracking-widest mb-3">
                Certificats obtenus
              </h4>
              {member.certificates.length === 0 ? (
                <p className="text-sm text-neutral-400">Aucun certificat pour l&apos;instant.</p>
              ) : (
                <div className="space-y-2">
                  {member.certificates.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 bg-neutral-50 rounded-lg px-4 py-3">
                      <Award className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-semibold text-primary">
                          {c.examType === 'GLOBAL' ? 'Certification globale' : c.moduleName}
                        </p>
                        <p className="text-xs text-neutral-400">{fmt(c.issuedAt)}</p>
                      </div>
                      <span className="text-sm font-display font-bold text-primary tabular-nums">{c.score}%</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-neutral-400 mt-8 pt-4 border-t border-neutral-100">
                Rattaché depuis le {fmt(member.joinedOrgAt)} · Dernière activité : {fmt(member.lastActivity)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Couleur d'un score : rouge < 60, orange < 75, vert au-delà. */
function scoreTone(score) {
  if (score === null || score === undefined) return { bar: 'bg-neutral-200', text: 'text-neutral-400' };
  if (score < 60) return { bar: 'bg-red-500',   text: 'text-red-600' };
  if (score < 75) return { bar: 'bg-accent',    text: 'text-accent-dark' };
  return { bar: 'bg-secondary', text: 'text-secondary-dark' };
}

function Bar({ value, tone }) {
  return (
    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden" role="presentation">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${tone.bar}`}
        style={{ width: `${value ?? 0}%` }}
      />
    </div>
  );
}

/**
 * Couverture par MODULE — le reporting réel de la plateforme.
 *
 * `avgScore` et `coverage` sont des chiffres effectivement mesurés (via les
 * badges). Les 3 compétences par module sont descriptives (mêmes libellés que
 * sur /training) — elles ne sont pas notées séparément, seul le module l'est.
 */
export default function ModuleCoverage({ modules, memberWord, locale = 'fr' }) {
  const [open, setOpen] = useState(null);
  const isFr = locale === 'fr';

  return (
    <div className="space-y-3">
      {modules.map((m) => {
        const tone = scoreTone(m.avgScore);
        const isOpen = open === m.moduleId;
        return (
          <div key={m.moduleId} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : m.moduleId)}
              aria-expanded={isOpen}
              className="w-full text-left p-5 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex items-center gap-2.5">
                  {m.icon && <span className="text-lg flex-shrink-0" aria-hidden="true">{m.icon}</span>}
                  <p className="font-display font-bold text-primary">{m.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-2xl font-display font-extrabold leading-none tabular-nums ${tone.text}`}>
                      {m.avgScore ?? '—'}
                    </p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                      {isFr ? 'score moyen' : 'avg score'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <Bar value={m.avgScore} tone={tone} />
              <p className="text-xs text-neutral-400 mt-2">
                {isFr
                  ? `${m.coverage}% des ${memberWord} ont validé ce module`
                  : `${m.coverage}% of ${memberWord} validated this module`}
              </p>
            </button>

            {isOpen && (m.competencies?.length ?? 0) > 0 && (
              <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-4">
                <p className="text-[10px] font-display font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  {isFr ? 'Compétences développées' : 'Competencies developed'}
                </p>
                <ul className="space-y-2.5">
                  {m.competencies.map((c, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="flex-shrink-0" aria-hidden="true">{c.emoji}</span>
                      <div>
                        <p className="text-primary leading-snug">{isFr ? c.fr : c.en}</p>
                        <p className="text-xs text-neutral-400 leading-snug">{isFr ? c.desc_fr : c.desc_en}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

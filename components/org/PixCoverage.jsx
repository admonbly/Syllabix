'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Couleur d'un score : rouge < 60, orange < 75, vert au-delà. */
function scoreTone(score) {
  if (score === null || score === undefined) return { bar: 'bg-neutral-200', text: 'text-neutral-400' };
  if (score < 60) return { bar: 'bg-red-500',       text: 'text-red-600' };
  if (score < 75) return { bar: 'bg-accent',        text: 'text-accent-dark' };
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
 * Couverture par domaine / compétence du référentiel Pix.
 * `avgScore` = niveau moyen des membres ayant validé ; `coverage` = part des
 * membres l'ayant validée. Un score élevé mais une couverture faible signale
 * « peu de gens l'ont fait, mais ils sont bons ».
 */
export default function PixCoverage({ domains, memberWord }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3">
      {domains.map((d) => {
        const tone = scoreTone(d.avgScore);
        const isOpen = open === d.id;
        return (
          <div key={d.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : d.id)}
              aria-expanded={isOpen}
              className="w-full text-left p-5 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-primary">{d.nameFr}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{d.descFr}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-2xl font-display font-extrabold leading-none tabular-nums ${tone.text}`}>
                      {d.avgScore ?? '—'}
                    </p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                      score moyen
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <Bar value={d.avgScore} tone={tone} />
              <p className="text-xs text-neutral-400 mt-2">
                {d.coverage}% des {memberWord} ont validé au moins une compétence de ce domaine
              </p>
            </button>

            {isOpen && (
              <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 space-y-4">
                {d.competencies.map((c) => {
                  const ct = scoreTone(c.avgScore);
                  return (
                    <div key={c.code}>
                      <div className="flex items-baseline justify-between gap-3 mb-1.5">
                        <p className="text-sm text-primary">
                          <span className="font-mono text-xs text-neutral-400 mr-2">{c.code}</span>
                          {c.nameFr}
                        </p>
                        <p className={`text-sm font-display font-bold tabular-nums flex-shrink-0 ${ct.text}`}>
                          {c.avgScore ?? '—'}
                        </p>
                      </div>
                      <Bar value={c.avgScore} tone={ct} />
                      <p className="text-xs text-neutral-400 mt-1.5">
                        {c.validatedCount} {memberWord} · via {c.moduleNames.join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { orgUnitLabels } from '@/lib/orgs';

function scoreClass(score) {
  if (score === null) return 'text-neutral-300';
  if (score < 60) return 'text-red-600';
  if (score < 75) return 'text-accent-dark';
  return 'text-secondary';
}

/**
 * Comparaison des classes/filières (ou directions) entre elles.
 * C'est la lecture qui déclenche une décision : « la Terminale D décroche »,
 * « la direction commerciale a besoin de bureautique ».
 *
 * Les membres sans unité apparaissent toujours en dernier — jamais masqués,
 * sinon les chiffres ne réconcilieraient pas avec le total.
 */
export default function UnitBreakdown({ orgType, breakdown, memberWord, onSelect }) {
  const labels = orgUnitLabels(orgType);
  const rows = [
    ...(breakdown?.units ?? []),
    ...(breakdown?.withoutUnit ? [breakdown.withoutUnit] : []),
  ];
  if (rows.length === 0) return null;

  const maxScore = Math.max(...rows.map((r) => r.avgScore ?? 0), 1);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" className="text-left px-5 py-3 font-display font-semibold text-neutral-500 text-xs uppercase tracking-widest">
                {labels.short}
              </th>
              {[`${memberWord}`, 'Score moyen', 'Certifiés', 'Modules validés'].map((h) => (
                <th key={h} scope="col" className="text-right px-5 py-3 font-display font-semibold text-neutral-500 text-xs uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.name ?? '__none__'}
                onClick={() => onSelect?.(r.name)}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3">
                  {r.name
                    ? <span className="font-display font-semibold text-primary">{r.name}</span>
                    : <span className="text-neutral-400 italic">Sans {labels.short.toLowerCase()}</span>}
                </td>
                <td className="px-5 py-3 text-right text-primary tabular-nums">{r.memberCount}</td>
                <td className="px-5 py-3 text-right">
                  {r.avgScore !== null ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${r.avgScore < 60 ? 'bg-red-500' : r.avgScore < 75 ? 'bg-accent' : 'bg-secondary'}`}
                          style={{ width: `${(r.avgScore / maxScore) * 100}%` }}
                        />
                      </div>
                      <span className={`font-display font-bold tabular-nums ${scoreClass(r.avgScore)}`}>
                        {r.avgScore}%
                      </span>
                    </div>
                  ) : <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-5 py-3 text-right text-neutral-600 tabular-nums whitespace-nowrap">
                  {r.certifiedCount} <span className="text-neutral-300">({r.certificationRate}%)</span>
                </td>
                <td className="px-5 py-3 text-right text-neutral-600 tabular-nums">{r.avgModulesValidated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

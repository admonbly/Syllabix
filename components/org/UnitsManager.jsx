'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { orgUnitLabels } from '@/lib/orgs';

/**
 * Gestion de la liste des classes/filières (école) ou directions (entreprise).
 *
 * C'est la seule écriture permise à un ORG_ADMIN : elle porte sur la
 * configuration de son organisation, jamais sur les membres eux-mêmes.
 * Tant que la liste est vide, le champ n'est pas demandé aux membres.
 */
export default function UnitsManager({ orgType, units, breakdown, onChanged }) {
  const labels = orgUnitLabels(orgType);
  const [open, setOpen]   = useState(false);
  const [name, setName]   = useState('');
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const call = async (method, body) => {
    const token = await auth.currentUser.getIdToken();
    return fetch('/api/org/units', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  };

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true); setError('');
    try {
      const res = await call('POST', { name });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setName('');
      await onChanged();
    } catch { setError('Erreur'); }
    finally { setBusy(false); }
  };

  const remove = async (unitName, memberCount) => {
    const warning = memberCount > 0
      ? `Supprimer « ${unitName} » ? ${memberCount} membre${memberCount > 1 ? 's' : ''} y ${memberCount > 1 ? 'sont' : 'est'} rattaché${memberCount > 1 ? 's' : ''} : ils resteront dans votre organisation mais sans ${labels.short.toLowerCase()}.`
      : `Supprimer « ${unitName} » ?`;
    if (!window.confirm(warning)) return;
    setBusy(true); setError('');
    try {
      const res = await call('DELETE', { name: unitName });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      await onChanged();
    } catch { setError('Erreur'); }
    finally { setBusy(false); }
  };

  const countOf = (unitName) =>
    breakdown?.units?.find((u) => u.name === unitName)?.memberCount ?? 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-primary">{labels.plural}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {units.length === 0
              ? `Déclarez vos ${labels.plural.toLowerCase()} : vos membres pourront alors indiquer la leur.`
              : `${units.length} déclarée${units.length > 1 ? 's' : ''} · proposées à vos membres au moment de rejoindre.`}
          </p>
        </div>
        <button
          onClick={() => { setOpen(!open); setError(''); }}
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-neutral-200 text-sm font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
        >
          {open ? <><X className="w-4 h-4" aria-hidden="true" /> Fermer</>
                : <><Plus className="w-4 h-4" aria-hidden="true" /> Gérer</>}
        </button>
      </div>

      {open && (
        <div className="mt-5 pt-5 border-t border-neutral-100">
          {error && (
            <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <form onSubmit={add} className="flex gap-2 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Ex. ${labels.placeholder}`}
              aria-label={`Ajouter une ${labels.short.toLowerCase()}`}
              className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="px-5 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Ajouter
            </button>
          </form>

          {units.length === 0 ? (
            <p className="text-sm text-neutral-400">Aucune entrée pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {units.map((u) => {
                const n = countOf(u);
                return (
                  <li key={u}
                    className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-sm text-primary">{u}</span>
                    <span className="text-xs text-neutral-400 tabular-nums">{n}</span>
                    <button
                      onClick={() => remove(u, n)}
                      disabled={busy}
                      aria-label={`Supprimer ${u}`}
                      className="p-1 rounded text-neutral-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket, Download, Plus } from 'lucide-react';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';

const SOURCE_LABELS = {
  partner_free: 'Dotation partenaire (gratuit)',
  promo:        'Promo / jeu-concours',
  admin:        'Admin (divers)',
};

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const fmt = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

function downloadCsv(filename, rows) {
  const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminVouchersPage() {
  const [orgs, setOrgs]       = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Formulaire de création
  const [source, setSource]   = useState('partner_free');
  const [orgId, setOrgId]     = useState('');
  const [count, setCount]     = useState(10);
  const [label, setLabel]     = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null); // { batchId, codes }

  const load = useCallback(async () => {
    try {
      const [oRes, bRes] = await Promise.all([
        adminFetch('/api/admin/org/list'),
        adminFetch('/api/admin/voucher/list'),
      ]);
      const oData = await oRes.json();
      const bData = await bRes.json();
      if (oRes.ok) setOrgs(oData.orgs ?? []);
      if (bRes.ok) setBatches(bData.batches ?? []);
      else setError(bData.error || 'Erreur de chargement');
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setJustCreated(null);
    if (source === 'partner_free' && !orgId) {
      setError('Choisissez une organisation pour une dotation partenaire.');
      return;
    }
    setCreating(true);
    try {
      const res = await adminFetch('/api/admin/voucher/batch', {
        method: 'POST',
        body: JSON.stringify({
          source, count: Number(count),
          orgId: orgId || null,
          label: label || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Échec de création'); return; }
      setJustCreated({ batchId: data.batchId, codes: data.codes });
      setLabel('');
      await load();
    } catch {
      setError('Échec de création');
    } finally {
      setCreating(false);
    }
  };

  const exportBatch = async (batch) => {
    try {
      const res = await adminFetch(`/api/admin/voucher/list?batchId=${batch.id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Export impossible'); return; }
      const rows = [
        ['Code', 'Statut', 'Utilisé le'],
        ...data.codes.map((c) => [c.code, c.status, fmt(c.redeemedAt)]),
      ];
      downloadCsv(`syllabix-vouchers-${(batch.label || batch.id).replace(/[^a-z0-9]+/gi, '-')}.csv`, rows);
    } catch {
      setError('Export impossible');
    }
  };

  return (
    <AdminShell title="Vouchers de certification">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-800 text-sm">{error}</div>
      )}

      {/* Création de lot */}
      <form onSubmit={create} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <h2 className="font-display font-bold text-primary">Créer un lot de codes</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Type</span>
            <select value={source} onChange={(e) => setSource(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white text-sm">
              {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Organisation {source === 'partner_free' ? '(requise)' : '(optionnelle)'}
            </span>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white text-sm">
              <option value="">— Aucune —</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Nombre de codes</span>
            <input type="number" min={1} max={400} value={count}
              onChange={(e) => setCount(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none text-sm" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Libellé (optionnel)</span>
            <input type="text" value={label} maxLength={120} placeholder="ex. Lycée X — promo 2026"
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none text-sm" />
          </label>
        </div>

        <button type="submit" disabled={creating}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-display font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-60">
          {creating ? 'Création…' : 'Générer le lot'}
        </button>
      </form>

      {/* Codes fraîchement créés */}
      {justCreated && (
        <div className="mb-8 bg-secondary/5 border border-secondary/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-primary">
              {justCreated.codes.length} codes générés ✅
            </p>
            <button onClick={() => downloadCsv(`syllabix-vouchers-${justCreated.batchId}.csv`,
              [['Code'], ...justCreated.codes.map((c) => [c])])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent">
              <Download className="w-4 h-4" /> Exporter en CSV
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {justCreated.codes.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 font-mono text-xs">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Liste des lots */}
      <h2 className="font-display font-bold text-primary mb-3 flex items-center gap-2">
        <Ticket className="w-4 h-4 text-accent" /> Lots créés
      </h2>
      {loading ? (
        <div className="h-40 bg-neutral-100 rounded-2xl animate-pulse" />
      ) : batches.length === 0 ? (
        <p className="text-sm text-neutral-400">Aucun lot pour l'instant.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3 text-right">Utilisés</th>
                <th className="px-4 py-3 text-right">Restants</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-700">{b.label || b.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-neutral-500">{SOURCE_LABELS[b.source] ?? b.source}</td>
                  <td className="px-4 py-3 text-neutral-500">{b.orgName ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.redeemedCount ?? 0} / {b.count}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary">{b.remaining}</td>
                  <td className="px-4 py-3 text-neutral-400">{fmt(b.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => exportBatch(b)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent">
                      <Download className="w-3.5 h-3.5" /> Codes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

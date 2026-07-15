'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Mail } from 'lucide-react';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';

/** Échappe une valeur pour le format CSV (RFC 4180). */
function csvCell(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdminNewsletterPage() {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/newsletter/list');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
      setSubs(data.subscribers);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const rows = [
      ['Email', 'Date d\'inscription'],
      ...subs.map((s) => [
        s.email,
        s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('fr-FR') : '',
      ]),
    ];
    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-syllabix-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Newsletter">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-display font-extrabold text-primary leading-none">
              {loading ? '—' : subs.length}
            </p>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Abonné{subs.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={exportCsv}
          disabled={loading || subs.length === 0}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-display font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Exporter en CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />)}
        </div>
      ) : subs.length === 0 ? (
        <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-6">
          Aucun abonné pour l&apos;instant.
        </p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th scope="col" className="text-left px-5 py-3 font-display font-semibold text-neutral-500 text-xs uppercase tracking-widest">
                    Email
                  </th>
                  <th scope="col" className="text-left px-5 py-3 font-display font-semibold text-neutral-500 text-xs uppercase tracking-widest">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 text-primary">{s.email}</td>
                    <td className="px-5 py-3 text-neutral-500 tabular-nums">
                      {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

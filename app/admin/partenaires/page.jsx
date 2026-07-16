'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Handshake, Mail, Phone } from 'lucide-react';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';
import { orgRequestTypeLabel } from '@/lib/partnership';

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export default function AdminPartenairesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [openId, setOpenId]     = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/partnership/list');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
      setRequests(data.requests);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const rows = [
      ['Organisation', 'Type', 'Contact', 'Email', 'Téléphone', 'Besoin', 'Reçue le'],
      ...requests.map((r) => [
        r.orgName, orgRequestTypeLabel(r.type), r.contactName, r.email,
        r.phone ?? '', r.message ?? '', fmt(r.createdAt),
      ]),
    ];
    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `syllabix-demandes-partenariat-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Demandes de partenariat">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-display font-extrabold text-primary leading-none tabular-nums">
              {loading ? '—' : requests.length}
            </p>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Demande{requests.length > 1 ? 's' : ''} reçue{requests.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={exportCsv}
          disabled={loading || requests.length === 0}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-display font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Exporter en CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
          <Handshake className="w-8 h-8 text-neutral-200 mx-auto mb-3" aria-hidden="true" />
          <p className="font-display font-bold text-primary mb-1">Aucune demande pour l&apos;instant</p>
          <p className="text-sm text-neutral-500">
            Les demandes déposées depuis la page « Devenir partenaire » apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const open = openId === r.id;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  aria-expanded={open}
                  className="w-full text-left p-5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-bold text-primary">{r.orgName}</p>
                        <span className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-display font-semibold">
                          {orgRequestTypeLabel(r.type)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {r.contactName} · {r.email}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums whitespace-nowrap">
                      {fmt(r.createdAt)}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <a href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-accent hover:text-accent transition-colors min-h-[44px]">
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        {r.email}
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-accent hover:text-accent transition-colors min-h-[44px]">
                          <Phone className="w-4 h-4" aria-hidden="true" />
                          {r.phone}
                        </a>
                      )}
                    </div>
                    {r.message && (
                      <div>
                        <p className="text-xs font-display font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                          Besoin exprimé
                        </p>
                        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

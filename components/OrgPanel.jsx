'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, GraduationCap, LogOut, Plus, X } from 'lucide-react';
import Card from '@/components/Card';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Encart « Mon établissement » du tableau de bord.
 *
 * Le rattachement et le détachement passent exclusivement par les API routes
 * (/api/org/join, /api/org/leave) — le client n'écrit jamais son orgId lui-même.
 */
export default function OrgPanel() {
  const { t } = useLanguage();
  const o = (k) => t(`org.${k}`);

  const [org, setOrg]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [code, setCode]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const [notice, setNotice]   = useState('');

  const authedFetch = useCallback(async (url, options = {}) => {
    const user = auth.currentUser;
    if (!user) throw new Error('not-authenticated');
    const token = await user.getIdToken();
    return fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
  }, []);

  const loadOrg = useCallback(async () => {
    try {
      const res = await authedFetch('/api/org/me');
      if (!res.ok) { setOrg(null); return; }
      const data = await res.json();
      setOrg(data.org);
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) loadOrg();
      else setLoading(false);
    });
    return unsub;
  }, [loadOrg]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) { setError(o('errors.empty')); return; }
    setBusy(true);
    try {
      const res = await authedFetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || o('errors.generic')); return; }
      setNotice(`${o('joined')} ${data.orgName}.`);
      setModal(false);
      setCode('');
      await loadOrg();
    } catch {
      setError(o('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(o('leaveConfirm'))) return;
    setBusy(true);
    setError('');
    try {
      const res = await authedFetch('/api/org/leave', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || o('errors.generic'));
        return;
      }
      setNotice(o('left'));
      await loadOrg();
    } catch {
      setError(o('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse mb-3" />
        <div className="h-4 w-64 bg-neutral-100 rounded animate-pulse" />
      </Card>
    );
  }

  const Icon = org?.type === 'COMPANY' ? Building2 : GraduationCap;

  return (
    <>
      <Card className="p-6">
        <h3 className="text-sm font-display font-bold text-neutral-400 uppercase tracking-widest mb-4">
          {o('title')}
        </h3>

        {notice && (
          <p className="mb-4 text-sm text-secondary bg-secondary-pale border border-secondary/20 rounded-lg px-3 py-2">
            {notice}
          </p>
        )}
        {error && !modalOpen && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {org ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-primary truncate">{org.name}</p>
              <p className="text-xs text-neutral-500">
                {o(`types.${org.type}`)}
                {org.joinedAt && ` · ${o('joinedOn')} ${new Date(org.joinedAt).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={handleLeave}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm font-semibold text-neutral-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              {busy ? o('leaving') : o('leave')}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-600 mb-1">{o('none')}</p>
            <p className="text-xs text-neutral-400 mb-4">{o('noneHint')}</p>
            <button
              onClick={() => { setModal(true); setError(''); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-display font-semibold hover:bg-primary-light transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {o('join')}
            </button>
          </div>
        )}
      </Card>

      {/* Modale de saisie du code */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="org-join-title"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-start justify-between mb-1">
              <h4 id="org-join-title" className="text-lg font-display font-bold text-primary">
                {o('joinTitle')}
              </h4>
              <button
                onClick={() => setModal(false)}
                aria-label={o('cancel')}
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-5">{o('joinHint')}</p>

            <form onSubmit={handleJoin}>
              <label htmlFor="org-code" className="block text-sm font-semibold text-primary mb-2">
                {o('codeLabel')}
              </label>
              <input
                id="org-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={o('codePlaceholder')}
                autoFocus
                autoCapitalize="characters"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors uppercase"
              />
              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors min-h-[44px]"
                >
                  {o('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-4 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  {busy ? o('joining') : o('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

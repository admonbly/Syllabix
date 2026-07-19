'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Carte « code de certification offert » (200 premiers comptes).
 * Réclame le code au serveur (idempotent) et l'affiche, ou indique l'état
 * (email à vérifier / offre épuisée). Silencieuse si non éligible autrement.
 */
export default function SignupCodeCard() {
  const { locale } = useLanguage();
  const [state, setState] = useState(null); // { status, code, foundingNumber }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/voucher/signup-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (data?.status) setState(data);
      } catch { /* silencieux */ }
    });
    return () => unsub();
  }, []);

  if (!state) return null;

  const fr = locale === 'fr';

  if (state.status === 'needs_verification') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
        <span className="text-2xl">✉️</span>
        <div>
          <p className="font-display font-bold text-amber-800">
            {fr ? 'Vérifie ton adresse email' : 'Verify your email'}
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            {fr
              ? 'Confirme ton email pour débloquer ton code de certification offert.'
              : 'Confirm your email to unlock your free certification code.'}
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'sold_out') {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 flex items-start gap-3">
        <span className="text-2xl">🎟️</span>
        <div>
          <p className="font-display font-bold text-neutral-700">
            {fr ? "L'offre des 200 premiers est épuisée" : 'The first-200 offer is over'}
          </p>
          <p className="text-sm text-neutral-500 mt-0.5">
            {fr
              ? 'Guette nos campagnes et jeux-concours pour obtenir un code, ou passe par ton établissement / entreprise.'
              : 'Watch our campaigns and contests for a code, or get one via your school / company.'}
          </p>
        </div>
      </div>
    );
  }

  if (state.status !== 'issued' || !state.code) return null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(state.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  };

  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-orange-50 p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🎁</span>
        <p className="font-display font-bold text-primary">
          {fr ? 'Ton code de certification offert' : 'Your free certification code'}
        </p>
        {state.foundingNumber && (
          <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
            {fr ? `Membre fondateur n°${state.foundingNumber}` : `Founding member #${state.foundingNumber}`}
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-600 mb-4">
        {fr
          ? 'Utilise ce code pour débloquer une certification (valable 2 ans).'
          : 'Use this code to unlock a certification (valid 2 years).'}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <code className="px-4 py-2.5 rounded-xl bg-white border-2 border-dashed border-accent/40 font-mono text-lg tracking-wider text-primary">
          {state.code}
        </code>
        <button onClick={copy}
          className="px-4 py-2.5 rounded-xl bg-neutral-700 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors">
          {copied ? (fr ? '✓ Copié' : '✓ Copied') : (fr ? '🔗 Copier' : '🔗 Copy')}
        </button>
        <Link href="/certification"
          className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent-dark transition-colors">
          {fr ? 'Passer la certification →' : 'Take the certification →'}
        </Link>
      </div>
    </div>
  );
}

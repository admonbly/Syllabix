'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

const STORAGE_KEY = 'syllabix_cookie_consent';

/** Lit le consentement enregistré (null si pas encore choisi). */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Vérifie si une catégorie est consentie (ex : hasConsent('analytics')). */
export function hasConsent(category) {
  const consent = getCookieConsent();
  if (!consent) return false;
  if (category === 'essential') return true;
  return consent[category] === true;
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const ck = (k) => t(`cookies.${k}`);

  const [visible, setVisible]     = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  const save = (analyticsAccepted) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      essential: true,
      analytics: analyticsAccepted,
      date: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={ck('title')}
      className="fixed bottom-0 inset-x-0 z-[90] p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        <div className="p-5 sm:p-6">

          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">🍪</span>
            <div>
              <p className="font-heading font-bold text-primary text-base">{ck('title')}</p>
              <p className="text-sm text-neutral-600 leading-relaxed mt-1">
                {ck('desc')}{' '}
                <Link href="/privacy" className="text-primary underline hover:text-accent">
                  {ck('learnMore')}
                </Link>
              </p>
            </div>
          </div>

          {/* Panneau de personnalisation */}
          {customize && (
            <div className="mb-4 space-y-2 border border-neutral-100 rounded-xl p-4 bg-neutral-50">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold text-neutral-800">{ck('essential')}</span>
                  <span className="block text-xs text-neutral-500">{ck('essentialDesc')}</span>
                </span>
                <input type="checkbox" checked disabled className="w-5 h-5 accent-primary opacity-60 cursor-not-allowed" />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                <span>
                  <span className="font-semibold text-neutral-800">{ck('analytics')}</span>
                  <span className="block text-xs text-neutral-500">{ck('analyticsDesc')}</span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            {!customize && (
              <button
                onClick={() => setCustomize(true)}
                className="px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:text-primary rounded-xl transition-colors"
              >
                {ck('customize')}
              </button>
            )}
            <button
              onClick={() => save(false)}
              className="px-4 py-2.5 text-sm font-semibold text-neutral-700 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors"
            >
              {ck('essentialOnly')}
            </button>
            {customize ? (
              <button
                onClick={() => save(analytics)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
              >
                {ck('saveChoices')}
              </button>
            ) : (
              <button
                onClick={() => save(true)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
              >
                {ck('acceptAll')}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

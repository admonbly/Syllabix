'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Newspaper, Mail, Quote, ShieldCheck, Handshake } from 'lucide-react';
import { auth } from '@/lib/firebase';

const TABS = [
  { href: '/admin/organizations', label: 'Organisations', icon: Building2 },
  { href: '/admin/partenaires',   label: 'Demandes',      icon: Handshake },
  { href: '/admin/blog',          label: 'Blog',          icon: Newspaper },
  { href: '/admin/newsletter',    label: 'Newsletter',    icon: Mail },
  { href: '/admin/temoignages',   label: 'Témoignages',   icon: Quote },
];

/** Appel authentifié réutilisable par toutes les pages admin. */
export async function adminFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');
  const token = await user.getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Coquille des pages d'administration : vérifie côté serveur (via /api/admin/me)
 * que l'utilisateur est admin plateforme, sinon redirige.
 * La vraie sécurité est dans les API routes — cette garde n'est qu'ergonomique.
 */
export default function AdminShell({ title, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState('loading');

  const checkAdmin = useCallback(async (user) => {
    if (!user) { router.replace('/auth/login?redirect=/admin/organizations'); return; }
    try {
      const res = await adminFetch('/api/admin/me');
      const data = await res.json();
      if (!res.ok || !data.isPlatformAdmin) { setStatus('denied'); return; }
      setStatus('ok');
    } catch {
      setStatus('denied');
    }
  }, [router]);

  useEffect(() => auth.onAuthStateChanged(checkAdmin), [checkAdmin]);

  if (status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-8 w-52 bg-neutral-100 rounded animate-pulse mb-6" />
        <div className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShieldCheck className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-display font-bold text-primary mb-2">Accès réservé</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Cette zone est réservée à l&apos;administration de la plateforme.
        </p>
        <Link href="/dashboard" className="text-accent font-semibold hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Bandeau admin */}
      <div className="bg-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-display font-semibold uppercase tracking-widest text-accent">
              Administration
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold">{title}</h1>
        </div>

        {/* Onglets */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Sections d'administration">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-display font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? 'border-accent text-white'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

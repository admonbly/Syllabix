'use client';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/LanguageContext';

function FooterLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="group text-sm text-white/55 hover:text-accent flex items-center gap-1.5 transition-colors"
      >
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const ft = (k) => t(`footer.${k}`);
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const year = new Date().getFullYear();

  const produits = [
    { href: '/training',               label: ft('links.train') },
    { href: '/certification',          label: ft('links.cert') },
    { href: '/certification/presentation', label: ft('links.ref') },
    { href: '/dashboard',              label: ft('links.dashboard') },
  ];
  const ressources = [
    { href: '/about',        label: ft('links.about') },
    { href: '/blog',         label: ft('links.blog') },
    { href: '/partenariats', label: ft('links.partners') },
    { href: '/contact',      label: ft('links.contact') },
  ];
  const legal = [
    { href: '/privacy', label: ft('links.privacy') },
    { href: '/cgu',     label: ft('links.cgu') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: email.trim().toLowerCase(),
        subscribedAt: serverTimestamp(),
      });
      setSent(true);
      setEmail('');
    } catch (err) {
      setError(ft('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand — logo cliquable vers accueil */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <img
                src="/syllabix-logo-sansfond.png"
                alt="Syllabix — Accueil"
                width={2816}
                height={1536}
                className="h-14 w-auto max-w-[170px] object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              {ft('brand')}
            </p>
            <div className="flex items-center gap-1.5 text-white/35 text-xs mb-4">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{ft('location')}</span>
            </div>
            <a
              href="https://www.linkedin.com/company/syllabix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>

          {/* Produits */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              {ft('products')}
            </h4>
            <ul className="space-y-3">
              {produits.map(({ href, label }) => <FooterLink key={href} href={href} label={label} />)}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              {ft('resources')}
            </h4>
            <ul className="space-y-3">
              {ressources.map(({ href, label }) => <FooterLink key={href} href={href} label={label} />)}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              {ft('newsletter')}
            </h4>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              {ft('newsletterDesc')}
            </p>

            {sent ? (
              <div className="flex items-center gap-2 text-secondary text-sm font-display font-semibold">
                <span className="text-base">✅</span>
                {ft('subscribed')}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ft('emailPlaceholder')}
                  aria-label={ft('emailAriaLabel')}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 rounded-xl focus:outline-none focus:border-accent focus:bg-white/15 transition-all"
                  style={{ caretColor: 'white' }}
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-display font-semibold text-sm rounded-xl transition-colors active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? ft('subscribing') : <><span>{ft('subscribe')}</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>&copy; {year} Syllabix. {ft('copyright')}</p>
          <div className="flex items-center gap-5">
            {legal.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white/60 transition-colors">
                {label}
              </Link>
            ))}
            <Link href="/mentions-legales" className="hover:text-white/60 transition-colors">{ft('links.legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

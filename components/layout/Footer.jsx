'use client';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { useState } from 'react';

const produits = [
  { href: '/training/mixed',             label: "S'entraîner" },
  { href: '/exam/global',                label: 'Passer la certification' },
  { href: '/certification/presentation', label: 'Référentiel compétences' },
  { href: '/dashboard',                  label: 'Tableau de bord' },
];

const ressources = [
  { href: '/about',        label: 'À propos' },
  { href: '/blog',         label: 'Blog & Actualités' },
  { href: '/partenariats', label: 'Partenariats' },
  { href: '/contact',      label: 'Contact' },
];

const legal = [
  { href: '/privacy', label: 'Confidentialité' },
  { href: '/cgu',     label: 'CGU' },
];

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
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);
  const year = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) { setSent(true); setEmail(''); }
  };

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div>
            <img
              src="/syllabix-logo-sans%20fond.png"
              alt="Syllabix"
              className="h-10 w-auto mb-5 brightness-0 invert opacity-85"
            />
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              La plateforme de référence pour évaluer et certifier les compétences numériques à travers l&apos;Afrique.
            </p>
            <div className="flex items-center gap-1.5 text-white/35 text-xs">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Afrique — Certifications reconnues</span>
            </div>
          </div>

          {/* Produits */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              Produits
            </h4>
            <ul className="space-y-3">
              {produits.map(({ href, label }) => <FooterLink key={href} href={href} label={label} />)}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              Ressources
            </h4>
            <ul className="space-y-3">
              {ressources.map(({ href, label }) => <FooterLink key={href} href={href} label={label} />)}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-display font-bold text-white/35 uppercase tracking-widest mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Actualités numériques et nouvelles ressources, directement dans votre boîte mail.
            </p>

            {sent ? (
              <div className="flex items-center gap-2 text-secondary text-sm font-display font-semibold">
                <span className="text-base">✅</span>
                Inscription confirmée !
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  aria-label="Adresse email newsletter"
                  className="w-full px-4 py-2.5 bg-white/8 border border-white/14 text-white text-sm placeholder-white/28 rounded-xl focus:outline-none focus:border-accent focus:bg-white/12 transition-all"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-display font-semibold text-sm rounded-xl transition-colors active:scale-[0.98]"
                >
                  S&apos;abonner <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>&copy; {year} Syllabix. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            {legal.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white/60 transition-colors">
                {label}
              </Link>
            ))}
            <span>Mentions légales</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

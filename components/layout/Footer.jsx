'use client';

import Link from 'next/link';
import { Mail, Share2, ExternalLink } from 'lucide-react';

const produits = [
  { href: '/training/mixed',              label: "S'entraîner" },
  { href: '/exam/global',                 label: 'Passer la certification' },
  { href: '/certification/presentation',  label: 'Référentiel' },
  { href: '/dashboard',                   label: 'Mon tableau de bord' },
];

const ressources = [
  { href: '/about',         label: 'À propos' },
  { href: '/blog',          label: 'Blog' },
  { href: '/actualites',    label: 'Actualités' },
  { href: '/partenariats',  label: 'Partenariats' },
  { href: '/contact',       label: 'Contact' },
];

const legal = [
  { href: '/privacy', label: 'Confidentialité' },
  { href: '/cgu',     label: "Conditions d'utilisation" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/syllabix-logo-with-name.png"
              alt="Syllabix"
              className="h-10 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              La plateforme de référence pour évaluer et certifier les compétences numériques en Afrique.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2,       href: '#', label: 'Twitter / X' },
                { icon: ExternalLink, href: '#', label: 'LinkedIn' },
                { icon: Mail,         href: 'mailto:contact@syllabix.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Produits */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wide mb-4">
              Produits
            </h4>
            <ul className="space-y-3">
              {produits.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wide mb-4">
              Ressources
            </h4>
            <ul className="space-y-3">
              {ressources.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wide mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-white/60 mb-4">
              Recevez nos actualités et ressources numériques.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                required
                aria-label="Adresse email"
                className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {year} Syllabix. Tous droits réservés.</p>
          <div className="flex gap-6">
            {legal.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white/70 transition-colors">
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

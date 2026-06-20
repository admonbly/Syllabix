'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/certification', label: 'Certification' },
  { href: '/#actualites',   label: 'Actualités' },
  { href: '/partenariats',  label: 'Partenariats' },
  { href: '/contact',       label: 'Contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-100'
          : 'bg-white border-b border-neutral-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
          <img
            src="/syllabix-logo-with-name.png"
            alt="Syllabix"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-accent hover:bg-accent/5 transition-all duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + Burger */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex items-center px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-dark hover:shadow-accent transition-all duration-200 active:scale-[0.98]"
          >
            Connexion
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-accent hover:bg-accent/5 transition-all duration-150"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="block px-5 py-3 bg-accent text-white text-sm font-semibold rounded-xl text-center hover:bg-accent-dark transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

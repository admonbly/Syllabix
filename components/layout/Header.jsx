'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

const navLinks = [
  { href: '/certification', label: 'Certification' },
  { href: '/#actualites',   label: 'Actualités' },
  { href: '/partenariats',  label: 'Partenariats' },
  { href: '/contact',       label: 'Contact' },
];

export default function Header() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-soft border-b border-neutral-100/80'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/syllabix-logo-with-name.png"
            alt="Syllabix"
            className={`h-10 w-auto transition-all duration-300 ${!scrolled ? 'brightness-0 invert' : ''}`}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                scrolled
                  ? 'text-neutral-600 hover:text-accent hover:bg-accent/5'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + burger */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white text-sm font-display font-semibold rounded-xl hover:bg-accent-dark hover:shadow-accent transition-all duration-200 active:scale-[0.97] btn-shine"
          >
            Connexion
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              scrolled
                ? 'text-neutral-700 hover:bg-neutral-100'
                : 'text-white hover:bg-white/12'
            }`}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            {open
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-3 shadow-card-hover space-y-0.5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors"
            >
              {label}
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </Link>
          ))}
          <div className="pt-2 pb-1">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-display font-semibold rounded-xl text-sm hover:bg-accent-dark transition-colors active:scale-[0.97]"
            >
              Connexion <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

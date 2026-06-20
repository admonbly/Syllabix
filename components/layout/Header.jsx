'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import { auth, authFunctions } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const navLinks = [
  { href: '/certification', label: 'Certification' },
  { href: '/#actualites',   label: 'Actualités' },
  { href: '/partenariats',  label: 'Partenariats' },
  { href: '/contact',       label: 'Contact' },
];

export default function Header() {
  const [open,        setOpen]        = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [user,        setUser]        = useState(null);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Écoute l'état d'authentification Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await authFunctions.signOut();
    setDropOpen(false);
    window.location.href = '/';
  };

  // Initiales de l'utilisateur pour l'avatar
  const initials = user
    ? (user.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0]?.toUpperCase() ?? 'U')
    : '';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-soft border-b border-neutral-100/80'
          : 'bg-[#1A237E]'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 flex items-center justify-between">

        {/* Logo — transparent PNG, invert to white on dark header */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/syllabix-logo-sans%20fond.png"
            alt="Syllabix"
            className={`h-28 w-auto transition-all duration-300 ${!scrolled ? 'brightness-0 invert' : ''}`}
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
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + burger */}
        <div className="flex items-center gap-3">

          {user ? (
            /* Utilisateur connecté — avatar + dropdown */
            <div className="relative hidden sm:block" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                {/* Avatar initiales */}
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <span className={`text-sm font-semibold max-w-[120px] truncate ${scrolled ? 'text-primary' : 'text-white'}`}>
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${dropOpen ? 'rotate-90' : ''} ${scrolled ? 'text-neutral-400' : 'text-white/70'}`} />
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-neutral-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-xs text-neutral-400 mb-0.5">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-primary truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mon tableau de bord
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon profil
                  </Link>
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Non connecté — bouton Connexion */
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white text-sm font-display font-semibold rounded-xl hover:bg-accent-dark hover:shadow-accent transition-all duration-200 active:scale-[0.97] btn-shine"
            >
              Connexion
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              scrolled
                ? 'text-neutral-700 hover:bg-neutral-100'
                : 'text-white hover:bg-white/15'
            }`}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
          <div className="pt-2 pb-1 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-display font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-display font-semibold rounded-xl text-sm hover:bg-accent-dark transition-colors active:scale-[0.97]"
              >
                Connexion <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

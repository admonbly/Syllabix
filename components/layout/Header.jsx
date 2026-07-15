'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, LogOut, User, Globe, Accessibility, Building2, GraduationCap } from 'lucide-react';
import { auth, authFunctions } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';
import { useA11y } from '@/lib/AccessibilityContext';
import { useOrgRole } from '@/lib/useOrgRole';

export default function Header() {
  const { isOrgAdmin, orgType } = useOrgRole();
  const [open,        setOpen]        = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [user,        setUser]        = useState(null);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [a11yOpen,    setA11yOpen]    = useState(false);
  const dropRef  = useRef(null);
  const a11yRef  = useRef(null);

  const { locale, setLocale, t } = useLanguage();
  const { prefs, set, reset }    = useA11y();

  const navLinks = [
    { href: '/training',      label: t('nav.training') },
    { href: '/certification', label: t('nav.certification') },
    { href: '/blog',           label: t('nav.news') },
    { href: '/about',         label: t('nav.about') },
    { href: '/contact',       label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Ferme les dropdowns si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (a11yRef.current  && !a11yRef.current.contains(e.target))  setA11yOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await authFunctions.signOut();
    setDropOpen(false);
    window.location.href = '/';
  };

  const initials = user
    ? (user.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0]?.toUpperCase() ?? 'U')
    : '';

  const isScrolled = scrolled;
  const textBase   = isScrolled ? 'text-neutral-600' : 'text-white/85';
  const textHover  = isScrolled ? 'hover:text-accent hover:bg-accent/5' : 'hover:text-white hover:bg-white/10';
  const iconColor  = isScrolled ? 'text-neutral-500' : 'text-white/70';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/96 backdrop-blur-md shadow-soft border-b border-neutral-100/80'
          : 'bg-[#1A237E]'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/syllabix-logo-sansfond.png"
            alt="Syllabix"
            width={2816}
            height={1536}
            className={`h-14 sm:h-16 w-auto max-w-[210px] object-contain transition-all duration-300 ${!isScrolled ? 'brightness-0 invert' : ''}`}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${textBase} ${textHover}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side: a11y + lang + auth */}
        <div className="flex items-center gap-2">

          {/* ── Bouton langue FR/EN ── */}
          <button
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isScrolled
                ? 'border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
                : 'border-white/30 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>

          {/* ── Widget accessibilité ── */}
          <div className="relative hidden sm:block" ref={a11yRef}>
            <button
              onClick={() => setA11yOpen(!a11yOpen)}
              aria-label={t('a11y.label')}
              aria-expanded={a11yOpen}
              className={`p-2 rounded-lg border transition-all ${
                isScrolled
                  ? 'border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary'
                  : 'border-white/30 text-white/70 hover:bg-white/10 hover:text-white'
              } ${(prefs.highContrast || prefs.dyslexiaFont || prefs.textSize > 0) ? '!border-accent !text-accent' : ''}`}
            >
              <Accessibility className="w-4 h-4" />
            </button>

            {a11yOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 z-50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-primary">{t('a11y.label')}</p>
                  <button
                    onClick={reset}
                    className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    {t('a11y.reset')}
                  </button>
                </div>

                {/* Taille du texte */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
                    {t('a11y.textSize')}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { val: 0, label: 'A', size: 'text-sm' },
                      { val: 1, label: 'A', size: 'text-base' },
                      { val: 2, label: 'A', size: 'text-lg' },
                    ].map(({ val, label, size }) => (
                      <button
                        key={val}
                        onClick={() => set('textSize', val)}
                        aria-pressed={prefs.textSize === val}
                        className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${size} ${
                          prefs.textSize === val
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-200 text-neutral-600 hover:border-primary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contraste élevé */}
                <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">◐</span>
                    <span className="text-sm font-medium text-neutral-700">{t('a11y.contrast')}</span>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.highContrast}
                    onClick={() => set('highContrast', !prefs.highContrast)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      prefs.highContrast ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        prefs.highContrast ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Police dyslexie */}
                <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">Aa</span>
                    <span className="text-sm font-medium text-neutral-700">{t('a11y.dyslexia')}</span>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.dyslexiaFont}
                    onClick={() => set('dyslexiaFont', !prefs.dyslexiaFont)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      prefs.dyslexiaFont ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        prefs.dyslexiaFont ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  {locale === 'fr'
                    ? 'Les préférences sont sauvegardées automatiquement.'
                    : 'Preferences are saved automatically.'}
                </p>
              </div>
            )}
          </div>

          {/* ── Avatar / Connexion ── */}
          {user ? (
            <div className="relative hidden sm:block" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                )}
                <span className={`text-sm font-semibold max-w-[120px] truncate ${isScrolled ? 'text-primary' : 'text-white'}`}>
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${dropOpen ? 'rotate-90' : ''} ${iconColor}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-neutral-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-xs text-neutral-400 mb-0.5">{t('nav.loggedAs')}</p>
                    <p className="text-sm font-semibold text-primary truncate">{user.email}</p>
                  </div>
                  {/* Un ORG_ADMIN est aussi un apprenant : il accède aux deux espaces */}
                  {isOrgAdmin && (
                    <Link href="/org" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary hover:text-accent hover:bg-accent/5 transition-colors">
                      {orgType === 'COMPANY'
                        ? <Building2 className="w-4 h-4" />
                        : <GraduationCap className="w-4 h-4" />}
                      {orgType === 'COMPANY' ? 'Espace entreprise' : 'Espace établissement'}
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                  </Link>
                  <Link href="/profile" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors">
                    <User className="w-4 h-4" /> {t('nav.profile')}
                  </Link>
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white text-sm font-display font-semibold rounded-xl hover:bg-accent-dark hover:shadow-accent transition-all duration-200 active:scale-[0.97] btn-shine"
            >
              {t('nav.login')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Burger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isScrolled ? 'text-neutral-700 hover:bg-neutral-100' : 'text-white hover:bg-white/15'
            }`}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
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
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-accent hover:bg-accent/5 transition-colors">
              {label}
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </Link>
          ))}

          {/* Langue + accessibilité mobile */}
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-primary hover:text-primary transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={() => { set('textSize', (prefs.textSize + 1) % 3); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-primary hover:text-primary transition-all"
              title={t('a11y.textSize')}
            >
              <Accessibility className="w-3.5 h-3.5" />
              Aa
            </button>
          </div>

          <div className="pt-2 pb-1 space-y-2">
            {user ? (
              <>
                {isOrgAdmin && (
                  <Link href="/org" onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-display font-semibold rounded-xl text-sm hover:bg-accent-dark transition-colors">
                    {orgType === 'COMPANY'
                      ? <Building2 className="w-4 h-4" />
                      : <GraduationCap className="w-4 h-4" />}
                    {orgType === 'COMPANY' ? 'Espace entreprise' : 'Espace établissement'}
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-display font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-display font-semibold rounded-xl text-sm hover:bg-accent-dark transition-colors active:scale-[0.97]">
                {t('nav.login')} <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

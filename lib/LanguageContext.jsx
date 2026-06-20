'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getT } from '@/lib/i18n';

const LanguageContext = createContext({ locale: 'fr', setLocale: () => {}, t: getT('fr') });

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem('syllabix_lang');
    if (saved === 'en' || saved === 'fr') setLocaleState(saved);
  }, []);

  const setLocale = (l) => {
    setLocaleState(l);
    localStorage.setItem('syllabix_lang', l);
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: getT(locale) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

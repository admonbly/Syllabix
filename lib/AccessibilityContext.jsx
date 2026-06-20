'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const defaultPrefs = { textSize: 0, highContrast: false, dyslexiaFont: false };
const A11yContext = createContext({ prefs: defaultPrefs, set: () => {}, reset: () => {} });

const TEXT_SIZES = ['', 'text-size-md', 'text-size-lg'];

export function A11yProvider({ children }) {
  const [prefs, setPrefs] = useState(defaultPrefs);

  // Applique les classes sur <html> à chaque changement
  useEffect(() => {
    const html = document.documentElement;
    // Taille de texte
    html.classList.remove('text-size-md', 'text-size-lg');
    if (prefs.textSize === 1) html.classList.add('text-size-md');
    if (prefs.textSize === 2) html.classList.add('text-size-lg');
    // Contraste élevé
    html.classList.toggle('high-contrast', prefs.highContrast);
    // Police dyslexie
    html.classList.toggle('dyslexia-font', prefs.dyslexiaFont);
  }, [prefs]);

  // Charger les préférences sauvegardées
  useEffect(() => {
    try {
      const saved = localStorage.getItem('syllabix_a11y');
      if (saved) setPrefs(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const set = (key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('syllabix_a11y', JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setPrefs(defaultPrefs);
    localStorage.removeItem('syllabix_a11y');
  };

  return (
    <A11yContext.Provider value={{ prefs, set, reset }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  return useContext(A11yContext);
}

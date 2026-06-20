export const translations = {
  fr: {
    // Navigation
    nav: {
      training:       'Apprentissage',
      certification:  'Certification',
      news:           'Actualités',
      partners:       'Partenariats',
      contact:        'Contact',
      login:          'Connexion',
      dashboard:      'Mon tableau de bord',
      profile:        'Mon profil',
      logout:         'Se déconnecter',
      loggedAs:       'Connecté en tant que',
      openMenu:       'Ouvrir le menu',
      closeMenu:      'Fermer le menu',
    },

    // Accessibilité
    a11y: {
      label:          'Options d\'accessibilité',
      textSize:       'Taille du texte',
      contrast:       'Contraste élevé',
      dyslexia:       'Police dyslexie',
      reset:          'Réinitialiser',
      skipToContent:  'Aller au contenu principal',
    },

    // Langue
    lang: {
      switch: 'EN',
      current: 'FR',
    },
  },

  en: {
    nav: {
      training:       'Learning',
      certification:  'Certification',
      news:           'News',
      partners:       'Partners',
      contact:        'Contact',
      login:          'Sign in',
      dashboard:      'My dashboard',
      profile:        'My profile',
      logout:         'Sign out',
      loggedAs:       'Signed in as',
      openMenu:       'Open menu',
      closeMenu:      'Close menu',
    },

    a11y: {
      label:          'Accessibility options',
      textSize:       'Text size',
      contrast:       'High contrast',
      dyslexia:       'Dyslexia font',
      reset:          'Reset',
      skipToContent:  'Skip to main content',
    },

    lang: {
      switch: 'FR',
      current: 'EN',
    },
  },
};

/**
 * Returns a translation function for the given locale.
 * Usage: const t = useT(); t('nav.login')
 */
export function getT(locale = 'fr') {
  const dict = translations[locale] ?? translations.fr;
  return (path) => {
    const keys = path.split('.');
    let val = dict;
    for (const k of keys) { val = val?.[k]; }
    return val ?? path;
  };
}

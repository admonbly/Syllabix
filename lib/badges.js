/**
 * Système de badges à 3 niveaux — source de vérité unique.
 *
 * Un badge représente une réussite. Trois niveaux, distingués par la couleur :
 *  - learning : entraînement / défi réussi (badge seul, carburant viral)
 *  - module   : certification d'un module réussie (badge + certificat)
 *  - global   : certification globale (7 modules) réussie (badge + certificat)
 *
 * Rétro-compatibilité : les badges déjà en base n'ont pas de champ `level`.
 * Ils correspondent tous à d'anciennes certifications de module, donc
 * `badgeLevelOf()` retombe sur 'module' par défaut. NE JAMAIS supposer que
 * `badge.level` existe — toujours passer par ce helper.
 */

export const BADGE_LEVELS = {
  LEARNING: 'learning',
  MODULE: 'module',
  GLOBAL: 'global',
};

/**
 * Style visuel par niveau. Les classes Tailwind restent alignées sur la palette
 * du projet (accent = orange, primary = bleu). Le niveau apprentissage est
 * volontairement « plus léger » (neutre/bronze) pour préserver la valeur des
 * badges de certification.
 */
export const BADGE_LEVEL_STYLE = {
  [BADGE_LEVELS.LEARNING]: {
    labelFr: 'Apprentissage',
    labelEn: 'Learning',
    ring: 'border-amber-300/60',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
    chipText: 'text-amber-700',
    chipBg: 'bg-amber-100',
  },
  [BADGE_LEVELS.MODULE]: {
    labelFr: 'Certification module',
    labelEn: 'Module certification',
    ring: 'border-accent/40',
    bg: 'bg-accent/5',
    dot: 'bg-accent',
    chipText: 'text-accent',
    chipBg: 'bg-accent/10',
  },
  [BADGE_LEVELS.GLOBAL]: {
    labelFr: 'Certification globale',
    labelEn: 'Global certification',
    ring: 'border-primary/40',
    bg: 'bg-primary/5',
    dot: 'bg-primary',
    chipText: 'text-primary',
    chipBg: 'bg-primary/10',
  },
};

/** Niveau d'un badge, avec repli sûr sur 'module' (badges historiques). */
export function badgeLevelOf(badge) {
  const lvl = badge?.level;
  if (lvl === BADGE_LEVELS.LEARNING || lvl === BADGE_LEVELS.GLOBAL) return lvl;
  return BADGE_LEVELS.MODULE;
}

/** Style visuel d'un badge selon son niveau. */
export function badgeStyleOf(badge) {
  return BADGE_LEVEL_STYLE[badgeLevelOf(badge)];
}

/** Libellé du niveau, localisé. */
export function badgeLevelLabel(badge, locale = 'fr') {
  const s = badgeStyleOf(badge);
  return locale === 'fr' ? s.labelFr : s.labelEn;
}

/** Un badge est-il un badge d'apprentissage (vs certification) ? */
export function isLearningBadge(badge) {
  return badgeLevelOf(badge) === BADGE_LEVELS.LEARNING;
}

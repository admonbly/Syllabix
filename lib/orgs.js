/**
 * Utilitaires partagés « organisations » (écoles & entreprises).
 * Pas de dépendance serveur ici — utilisable côté client et côté API.
 */

export const ORG_TYPES = ['SCHOOL', 'COMPANY'];

export const ORG_TYPE_LABELS = {
  SCHOOL:  { fr: 'École',      en: 'School' },
  COMPANY: { fr: 'Entreprise', en: 'Company' },
};

/**
 * Libellé de l'unité de rattachement selon le type d'organisation :
 * une école a des classes/filières, une entreprise a des directions.
 */
export const ORG_UNIT_LABELS = {
  SCHOOL:  { singular: 'Classe / filière', plural: 'Classes et filières', short: 'Classe',    placeholder: 'Terminale D' },
  COMPANY: { singular: 'Direction',        plural: 'Directions',          short: 'Direction', placeholder: 'Direction commerciale' },
};

export function orgUnitLabels(type) {
  return ORG_UNIT_LABELS[type] ?? ORG_UNIT_LABELS.SCHOOL;
}

/** Nombre maximum d'unités par organisation (garde-fou d'affichage). */
export const MAX_ORG_UNITS = 60;

/**
 * Normalise un nom d'unité : espaces compactés, bornes nettoyées.
 * On conserve la casse saisie par l'organisation (c'est elle qui fait foi),
 * la comparaison d'unicité se fait via unitKey().
 */
export function normalizeUnitName(name) {
  return String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** Clé de comparaison : « Terminale D », « terminale d » et « Terminale  D » sont la même unité. */
export function unitKey(name) {
  return normalizeUnitName(name)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Une unité proposée est-elle dans la liste déclarée par l'organisation ? */
export function findUnitInList(units, candidate) {
  const key = unitKey(candidate);
  if (!key) return null;
  return (units ?? []).find((u) => unitKey(u) === key) ?? null;
}

export function isValidOrgType(t) {
  return ORG_TYPES.includes(t);
}

/** Normalise un code saisi par l'utilisateur (casse/espaces). */
export function normalizeAccessCode(code) {
  return String(code || '').trim().toUpperCase();
}

/**
 * Génère un code d'accès lisible et partageable à partir du nom de l'orga.
 * Ex. "Lycée Moderne de Cocody" → "LYCEE-MODERNE-COCODY-2026-4F7A"
 */
export function generateAccessCode(name) {
  const slug = String(name || 'ORG')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // enlève les accents
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-').slice(0, 3).join('-'); // 3 premiers mots max
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug || 'ORG'}-${year}-${rand}`;
}

/**
 * Utilitaires partagés « organisations » (écoles & entreprises).
 * Pas de dépendance serveur ici — utilisable côté client et côté API.
 */

export const ORG_TYPES = ['SCHOOL', 'COMPANY'];

export const ORG_TYPE_LABELS = {
  SCHOOL:  { fr: 'École',      en: 'School' },
  COMPANY: { fr: 'Entreprise', en: 'Company' },
};

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

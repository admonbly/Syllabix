/**
 * Témoignages de repli (fallback) affichés sur l'accueil.
 *
 * ⚠️ LISTE VOLONTAIREMENT VIDE (2026-07-15).
 *
 * Elle contenait trois témoignages attribués à des personnes nommées
 * (Amara Traoré, Samuel Adeyemi, Zainab Mohamed) — des individus INVENTÉS.
 * De la preuve sociale fabriquée n'a pas sa place sur le site, a fortiori
 * devant des partenaires susceptibles de demander à les contacter.
 *
 * La source de vérité est la collection Firestore `testimonials`, éditable
 * depuis /admin/temoignages. Dès qu'un témoignage RÉEL y sera ajouté, la
 * section réapparaîtra automatiquement sur l'accueil.
 *
 * Format d'une entrée :
 *   { id, name, role, location, initials, color, quoteFr, quoteEn, order, published }
 */

export const TESTIMONIALS_SEED = [];

/** Palette autorisée pour la pastille d'initiales (cohérence de charte). */
export const TESTIMONIAL_COLORS = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-primary-light', 'bg-accent-dark'];

/** Initiales calculées depuis le nom, si l'admin ne les renseigne pas. */
export function initialsFromName(name) {
  return String(name || '')
    .trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

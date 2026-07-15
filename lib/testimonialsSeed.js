/**
 * Témoignages de repli (fallback) affichés sur l'accueil.
 *
 * La source de vérité est désormais la collection Firestore `testimonials`,
 * éditable depuis /admin/temoignages. Cette liste sert uniquement de secours
 * si la collection est vide ou injoignable — l'accueil ne doit jamais afficher
 * une section de témoignages vide.
 *
 * Migration vers Firestore : node scripts/seed-testimonials.mjs
 */

export const TESTIMONIALS_SEED = [
  {
    id: 'amara-traore',
    name: 'Amara Traoré',
    role: 'Assistant administratif',
    location: 'Dakar, Sénégal',
    initials: 'AT',
    color: 'bg-primary',
    quoteFr: "Syllabix m'a permis de certifier mes compétences numériques. Le certificat a vraiment fait la différence dans ma recherche d'emploi.",
    quoteEn: 'Syllabix helped me certify my digital skills. The certificate really made a difference in my job search.',
    order: 1,
    published: true,
  },
  {
    id: 'samuel-adeyemi',
    name: 'Samuel Adeyemi',
    role: 'Manager RH',
    location: 'Lagos, Nigeria',
    initials: 'SA',
    color: 'bg-accent',
    quoteFr: "Interface simple et modules très bien structurés. J'ai pu former toute mon équipe en quelques semaines. Vraiment recommandé !",
    quoteEn: 'Simple interface and well-structured modules. I trained my whole team in a few weeks. Highly recommended!',
    order: 2,
    published: true,
  },
  {
    id: 'zainab-mohamed',
    name: 'Zainab Mohamed',
    role: 'Chargée de communication',
    location: 'Kigali, Rwanda',
    initials: 'ZM',
    color: 'bg-secondary',
    quoteFr: "En tant que jeune diplômée, ce certificat m'a aidée à montrer concrètement mes compétences aux recruteurs. Merci Syllabix !",
    quoteEn: 'As a recent graduate, this certificate helped me concretely showcase my skills to recruiters. Thank you Syllabix!',
    order: 3,
    published: true,
  },
];

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

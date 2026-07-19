/**
 * URL publique du site, source unique.
 *
 * Définie par la variable d'environnement NEXT_PUBLIC_SITE_URL (à renseigner
 * dans Vercel une fois le domaine propre en place, ex. https://syllabix.com).
 * À défaut, on retombe sur le sous-domaine Vercel actuel.
 *
 * NEXT_PUBLIC_* est disponible côté serveur ET client (build-time), y compris
 * dans les routes edge (images OpenGraph). Changer de domaine = changer cette
 * seule variable dans Vercel, puis redéployer.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://syllabix-eight.vercel.app')
  .replace(/\/+$/, '');

/** Hôte seul (sans protocole), pour l'affichage. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

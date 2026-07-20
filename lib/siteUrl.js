/**
 * URL publique du site, source unique.
 *
 * Définie par la variable d'environnement NEXT_PUBLIC_SITE_URL (posée dans
 * Vercel : https://syllabix.net). À défaut, on retombe sur le domaine canonique
 * syllabix.net.
 *
 * NEXT_PUBLIC_* est disponible côté serveur ET client (build-time), y compris
 * dans les routes edge (images OpenGraph). Changer de domaine = changer cette
 * seule variable dans Vercel, puis redéployer.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://syllabix.net')
  .replace(/\/+$/, '');

/** Hôte seul (sans protocole), pour l'affichage. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

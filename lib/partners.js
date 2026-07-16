/**
 * Partenaires institutionnels Syllabix.
 *
 * ⚠️ LISTE VOLONTAIREMENT VIDE (2026-07-15).
 *
 * Cette liste contenait le MENA, le MESRS, le Ministère de la Transition
 * Numérique et l'Agence Emploi Jeunes, présentés comme « Partenaires
 * institutionnels » — alors qu'AUCUN accord n'existe avec ces organismes.
 * Afficher des emblèmes d'État sans autorisation et affirmer une reconnaissance
 * officielle inexistante n'est pas acceptable, a fortiori sur les certificats
 * délivrés aux utilisateurs.
 *
 * Les fichiers logos restent dans /public : il suffira de réintroduire une
 * entrée ici le jour où un partenariat sera RÉELLEMENT signé.
 *
 * Format d'une entrée :
 *   {
 *     id, name, shortName, description, logo, type, country,
 *     showOnCertificate: boolean  // tous sur le site, seuls les marqués sur le certificat
 *   }
 */

export const PARTNERS = [];

/** Partenaires rendus sur le certificat (sous-ensemble de PARTNERS). */
export const PARTNERS_ON_CERTIFICATE = PARTNERS.filter((p) => p.showOnCertificate);

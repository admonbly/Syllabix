/**
 * Configuration des partenaires institutionnels Syllabix.
 * Ajouter ici les futurs partenaires — ils apparaissent automatiquement
 * sur la page /partenariats et sur l'accueil.
 *
 * `showOnCertificate` : seuls les partenaires marqués `true` sont rendus sur
 * le certificat. Tous les autres restent visibles sur le site mais n'y figurent
 * pas — le certificat n'affiche que les cautions institutionnelles.
 * Utiliser PARTNERS_ON_CERTIFICATE côté certificat.
 */

export const PARTNERS = [
  {
    id: 'mena',
    name: 'Ministère de l\'Éducation Nationale et de l\'Alphabétisation',
    shortName: 'MENA',
    description: 'Partenaire institutionnel pour la validation des compétences numériques dans le système éducatif ivoirien.',
    logo: '/logo_MENA.png',
    type: 'Ministère',
    country: 'Côte d\'Ivoire',
    showOnCertificate: true,
  },
  {
    id: 'mesrs',
    name: 'Ministère de l\'Enseignement Supérieur et de la Recherche Scientifique',
    shortName: 'MESRS',
    description: 'Partenaire pour la reconnaissance des certifications numériques dans l\'enseignement supérieur.',
    logo: '/Logo_MESRS.png',
    type: 'Ministère',
    country: 'Côte d\'Ivoire',
    showOnCertificate: true,
  },
  {
    id: 'ministere-numerique',
    name: 'Ministère de la Transition Numérique et de la Digitalisation',
    shortName: 'Min. Numérique',
    description: 'Partenaire pour la promotion des compétences numériques et la transformation digitale en Côte d\'Ivoire.',
    logo: '/logo_ministere_numerique.jpg',
    type: 'Ministère',
    country: 'Côte d\'Ivoire',
    showOnCertificate: true,
  },
  {
    id: 'agence-emploi-jeunes',
    name: 'Agence Emploi Jeunes',
    shortName: 'Agence Emploi Jeunes',
    description: 'Partenaire pour l\'insertion professionnelle et le développement des compétences des jeunes.',
    logo: '/logo_agence_emploi_jeune.png',
    type: 'Agence gouvernementale',
    country: 'Côte d\'Ivoire',
    showOnCertificate: true,
  },
];

/** Partenaires rendus sur le certificat (sous-ensemble de PARTNERS). */
export const PARTNERS_ON_CERTIFICATE = PARTNERS.filter((p) => p.showOnCertificate);

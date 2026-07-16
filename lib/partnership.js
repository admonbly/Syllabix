/**
 * Demandes de partenariat (écoles, universités, grandes écoles, entreprises).
 *
 * Ces organisations ne sont pas la cible de l'accueil — elles sont un canal de
 * croissance de la communauté de certifiés. La page /partenariats explique ce
 * qu'elles gagnent à rejoindre et recueille leur demande.
 */

export const ORG_REQUEST_TYPES = [
  { value: 'SCHOOL',      fr: 'École (primaire, collège, lycée)', en: 'School' },
  { value: 'UNIVERSITY',  fr: 'Université',                       en: 'University' },
  { value: 'GRANDE_ECOLE',fr: 'Grande école / école supérieure',  en: 'Higher education institution' },
  { value: 'COMPANY',     fr: 'Entreprise',                       en: 'Company' },
  { value: 'OTHER',       fr: 'Autre organisation',               en: 'Other organisation' },
];

export function isValidOrgRequestType(type) {
  return ORG_REQUEST_TYPES.some((t) => t.value === type);
}

export function orgRequestTypeLabel(type, locale = 'fr') {
  const found = ORG_REQUEST_TYPES.find((t) => t.value === type);
  if (!found) return type;
  return locale === 'fr' ? found.fr : found.en;
}

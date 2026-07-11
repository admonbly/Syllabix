/**
 * Source unique de vérité pour les noms des 7 modules.
 * Importable côté client ET serveur (données pures, aucune dépendance).
 * Pour renommer un module : le changer ICI uniquement.
 */
export const MODULE_NAMES = [
  'IT & Ordinateur',
  'Internet',
  'Email',
  'Bureautique',
  'Cybersécurité',
  'Intelligence Artificielle',
  'Employabilité',
];

/** Nom d'un module par son id (0-6), avec repli sûr. */
export function getModuleName(id) {
  const n = Number(id);
  return MODULE_NAMES[n] ?? `Module ${id}`;
}

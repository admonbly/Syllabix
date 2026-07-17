/**
 * Politique de mot de passe (côté client).
 *
 * Exigences : au moins 12 caractères, une majuscule, une minuscule, un chiffre
 * et un caractère spécial. Alignée sur les pratiques des sites grand public.
 *
 * Note : c'est une validation d'expérience utilisateur. La sécurité réelle du
 * compte repose sur Firebase Auth (hachage, protection anti-bruteforce) ; cette
 * politique guide l'utilisateur vers un mot de passe fort.
 */

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_RULES = [
  { id: 'length', test: (p) => p.length >= PASSWORD_MIN_LENGTH, fr: 'Au moins 12 caractères',        en: 'At least 12 characters' },
  { id: 'upper',  test: (p) => /[A-Z]/.test(p),                  fr: 'Une majuscule',                 en: 'One uppercase letter' },
  { id: 'lower',  test: (p) => /[a-z]/.test(p),                  fr: 'Une minuscule',                 en: 'One lowercase letter' },
  { id: 'digit',  test: (p) => /[0-9]/.test(p),                  fr: 'Un chiffre',                    en: 'One digit' },
  { id: 'symbol', test: (p) => /[^A-Za-z0-9]/.test(p),           fr: 'Un caractère spécial (@, !, …)', en: 'One special character (@, !, …)' },
];

/** Résultat par règle : [{ id, ok, fr, en }]. */
export function checkPassword(password = '') {
  return PASSWORD_RULES.map((r) => ({ id: r.id, ok: r.test(password), fr: r.fr, en: r.en }));
}

/** Le mot de passe respecte-t-il toutes les règles ? */
export function isPasswordStrong(password = '') {
  return PASSWORD_RULES.every((r) => r.test(password));
}

/** Nombre de règles satisfaites (0..5), pour la jauge de force. */
export function passwordScore(password = '') {
  return PASSWORD_RULES.reduce((n, r) => n + (r.test(password) ? 1 : 0), 0);
}

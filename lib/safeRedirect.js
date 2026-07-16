/**
 * N'autorise qu'un chemin INTERNE comme cible de redirection après connexion.
 *
 * Sans ce filtre, `/auth/login?redirect=https://site-malveillant.com` renvoie
 * l'utilisateur vers un site externe après une connexion réussie (open redirect
 * -> phishing). On n'accepte donc qu'un chemin qui :
 *   - commence par "/"
 *   - n'est PAS "//" ni "/\" (URL protocole-relative, ex. //evil.com)
 *   - ne contient aucun caractère de contrôle (dont saut de ligne)
 *
 * @param {string|null|undefined} target valeur brute (souvent un query param)
 * @param {string} fallback destination si `target` n'est pas un chemin interne sûr
 * @returns {string} un chemin interne sûr
 */
export function safeInternalPath(target, fallback = '/dashboard') {
  if (typeof target !== 'string') return fallback;
  // Doit commencer par "/" suivi d'autre chose qu'un "/" ou "\"
  if (!/^\/(?![/\\])/.test(target)) return fallback;
  // Rejette tout caractère de contrôle (code < 32) qui pourrait tromper le parsing d'URL
  for (let i = 0; i < target.length; i++) {
    if (target.charCodeAt(i) < 32) return fallback;
  }
  return target;
}

/**
 * Blocklist (non exhaustive) de domaines d'email jetables / temporaires.
 * Sert de première barrière anti-farming pour le code offert aux 200 premiers
 * comptes. Ce n'est pas parfait (de nouveaux domaines apparaissent) : c'est une
 * couche parmi d'autres (1 code/compte, email vérifié, rate-limit IP).
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'yopmail.com', 'yopmail.fr', 'guerrillamail.com',
  'guerrillamail.info', 'sharklasers.com', '10minutemail.com', '10minutemail.net',
  'temp-mail.org', 'tempmail.com', 'trashmail.com', 'getnada.com', 'nada.email',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'throwawaymail.com',
  'mohmal.com', 'moakt.com', 'tempmailo.com', 'mintemail.com', 'mailnesia.com',
  'spam4.me', 'grr.la', 'emailondeck.com', 'tmpmail.org', 'tmpmail.net',
  'burnermail.io', 'mailtemp.net', 'inboxbear.com', 'jetable.org',
  'discard.email', 'wegwerfmail.de', 'einrot.com', 'tempinbox.com',
]);

/** Le domaine de cet email est-il un domaine jetable connu ? */
export function isDisposableEmail(email) {
  const domain = String(email || '').toLowerCase().split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

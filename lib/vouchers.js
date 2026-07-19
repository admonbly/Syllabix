/**
 * Vouchers / codes de certification — source de vérité.
 *
 * Un code débloque UNE tentative de certification. Il peut être gratuit
 * (offert à l'inscription, dotation partenaire, promo) ou payant (Phase 1).
 * Voir docs/superpowers/specs/2026-07-19-volet-economique-vouchers-design.md.
 *
 * Ce module est ISOMORPHE (utilisable serveur ET client) :
 *  - le serveur génère les codes (`generateCode`) ;
 *  - le client valide la forme saisie (`normalizeCode`, `isValidCodeFormat`).
 * On utilise Web Crypto (`crypto.getRandomValues`), disponible en Node 18+,
 * edge et navigateur — donc pas d'import de `node:crypto` (compatibilité).
 */

export const VOUCHER_PREFIX = 'SYX';

// Alphabet sans caractères ambigus (pas de 0/O, 1/I/L) — lisible à la main.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const GROUP_LEN = 4; // SYX-XXXX-XXXX

/** Sources possibles d'un voucher. */
export const VOUCHER_SOURCES = ['signup_free', 'partner_free', 'promo', 'partner_paid', 'admin'];
export function isValidVoucherSource(s) {
  return VOUCHER_SOURCES.includes(s);
}

function randomGroup() {
  const bytes = new Uint32Array(GROUP_LEN);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < GROUP_LEN; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Génère un code au format `SYX-XXXX-XXXX` (haute entropie). */
export function generateCode() {
  return `${VOUCHER_PREFIX}-${randomGroup()}-${randomGroup()}`;
}

/**
 * Normalise une saisie utilisateur vers la forme canonique `SYX-XXXX-XXXX`.
 * Tolère minuscules, espaces, tirets manquants/en trop. Renvoie '' si la
 * saisie ne peut pas donner un code de la bonne longueur/alphabet.
 */
export function normalizeCode(input) {
  const raw = String(input ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ''); // enlève espaces, tirets, etc.

  // Doit commencer par le préfixe puis 2 groupes de GROUP_LEN.
  const body = raw.startsWith(VOUCHER_PREFIX) ? raw.slice(VOUCHER_PREFIX.length) : raw;
  if (body.length !== GROUP_LEN * 2) return '';
  if (![...body].every((c) => ALPHABET.includes(c))) return '';

  return `${VOUCHER_PREFIX}-${body.slice(0, GROUP_LEN)}-${body.slice(GROUP_LEN)}`;
}

/** La saisie correspond-elle à un code valide en forme (indépendamment de son existence) ? */
export function isValidCodeFormat(input) {
  return normalizeCode(input) !== '';
}

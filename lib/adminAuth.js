import { getAdminAuth } from '@/lib/firebaseAdmin';

/**
 * Sécurité de l'administration plateforme.
 *
 * Le rôle « admin plateforme » n'est PAS stocké dans Firestore et n'est donc
 * pas auto-attribuable : il est défini par la variable d'environnement
 * PLATFORM_ADMIN_UIDS (liste d'UID Firebase séparés par des virgules).
 * La vérification se fait toujours côté serveur, dans les API routes /admin.
 */

/** Liste des UID admin plateforme, lue à chaud depuis l'env. */
export function getPlatformAdminUids() {
  return (process.env.PLATFORM_ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isPlatformAdminUid(uid) {
  return !!uid && getPlatformAdminUids().includes(uid);
}

/** Extrait et vérifie l'idToken Firebase d'une requête. Renvoie l'uid ou null. */
export async function getUidFromRequest(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Garde à appeler en tête de chaque API route /api/admin/*.
 * Renvoie { ok: true, uid } si l'appelant est admin plateforme,
 * sinon { ok: false, status, error } prêt à renvoyer en réponse.
 */
export async function requirePlatformAdmin(request) {
  const uid = await getUidFromRequest(request);
  if (!uid) return { ok: false, status: 401, error: 'Non autorisé' };
  if (!isPlatformAdminUid(uid)) return { ok: false, status: 403, error: 'Accès réservé à l\'administration' };
  return { ok: true, uid };
}

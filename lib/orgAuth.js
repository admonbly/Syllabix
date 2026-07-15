import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';

/**
 * Sécurité des routes de tableau de bord organisation.
 *
 * Règle centrale : l'orgId n'est JAMAIS lu depuis la requête. Il est toujours
 * résolu depuis le profil serveur de l'appelant. Un ORG_ADMIN ne peut donc pas
 * consulter les données d'une autre organisation, même en forgeant sa requête.
 */

/**
 * Vérifie que l'appelant est ORG_ADMIN d'une organisation et renvoie son contexte.
 * → { ok: true, uid, orgId, org } ou { ok: false, status, error }
 */
export async function requireOrgAdmin(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return { ok: false, status: 401, error: 'Non autorisé' };

  let uid;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return { ok: false, status: 401, error: 'Token invalide ou expiré' };
  }

  const db = getAdminDb();
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) return { ok: false, status: 403, error: 'Profil introuvable' };

  const user = userSnap.data();
  if (user.role !== 'ORG_ADMIN') {
    return { ok: false, status: 403, error: 'Accès réservé aux administrateurs d\'organisation' };
  }

  const orgId = user.orgId;
  if (!orgId) return { ok: false, status: 403, error: 'Aucune organisation rattachée' };

  const orgSnap = await db.doc(`organizations/${orgId}`).get();
  if (!orgSnap.exists) return { ok: false, status: 404, error: 'Organisation introuvable' };

  const org = orgSnap.data();
  // Le rôle seul ne suffit pas : l'uid doit être déclaré admin DE CETTE orga.
  if (!(org.adminUids ?? []).includes(uid)) {
    return { ok: false, status: 403, error: 'Vous n\'administrez pas cette organisation' };
  }

  return { ok: true, uid, orgId, org };
}

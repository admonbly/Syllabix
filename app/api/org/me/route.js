import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';

/**
 * GET /api/org/me
 * Renvoie l'organisation de rattachement de l'utilisateur courant,
 * pour l'affichage de l'encart « Mon établissement ».
 * → { org: null } si l'utilisateur n'est rattaché à aucune organisation.
 */
export async function GET(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let uid;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  const db = getAdminDb();
  const userSnap = await db.doc(`users/${uid}`).get();
  const userData = userSnap.exists ? userSnap.data() : {};
  const role = userData.role ?? 'LEARNER';
  const orgId = userData.orgId ?? null;

  if (!orgId) return NextResponse.json({ org: null, role, isOrgAdmin: false });

  const orgSnap = await db.doc(`organizations/${orgId}`).get();
  if (!orgSnap.exists) return NextResponse.json({ org: null, role, isOrgAdmin: false });

  const org = orgSnap.data();
  // ORG_ADMIN de CETTE orga uniquement (le rôle seul ne suffit pas).
  const isOrgAdmin = role === 'ORG_ADMIN' && (org.adminUids ?? []).includes(uid);

  return NextResponse.json({
    role,
    isOrgAdmin,
    org: {
      id: orgId,
      name: org.name,
      type: org.type,
      memberCount: org.memberCount ?? 0,
      joinedAt: userData.orgJoinedAt ?? null,
      // Classe/filière ou direction du membre + choix possibles
      unit: userData.orgUnit ?? null,
      units: org.units ?? [],
    },
  });
}

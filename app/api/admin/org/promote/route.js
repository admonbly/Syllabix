import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * POST /api/admin/org/promote
 * Body : { email, orgId }
 * Promeut l'utilisateur en ORG_ADMIN de l'organisation et l'y rattache.
 * Si l'utilisateur appartenait à une autre orga, le rattachement est remplacé
 * (et le compteur de l'ancienne orga décrémenté).
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const orgId = String(body?.orgId || '').trim();
  if (!email) return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
  if (!orgId) return NextResponse.json({ error: 'orgId manquant' }, { status: 400 });

  // Résolution de l'utilisateur
  let uid;
  try {
    uid = (await getAdminAuth().getUserByEmail(email)).uid;
  } catch {
    return NextResponse.json({ error: 'Aucun utilisateur avec cet email' }, { status: 404 });
  }

  const db = getAdminDb();
  const orgRef = db.doc(`organizations/${orgId}`);
  const userRef = db.doc(`users/${uid}`);

  try {
    await db.runTransaction(async (tx) => {
      // --- Lectures d'abord ---
      const orgSnap = await tx.get(orgRef);
      if (!orgSnap.exists) throw new Error('org_not_found');
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('profile_not_found');

      const previousOrgId = userSnap.data().orgId ?? null;
      let previousOrgSnap = null;
      if (previousOrgId && previousOrgId !== orgId) {
        previousOrgSnap = await tx.get(db.doc(`organizations/${previousOrgId}`));
      }

      // --- Écritures ensuite ---
      tx.set(userRef, {
        role: 'ORG_ADMIN',
        orgId,
        orgType: orgSnap.data().type,
        orgJoinedAt: new Date().toISOString(),
      }, { merge: true });

      tx.update(orgRef, { adminUids: FieldValue.arrayUnion(uid) });

      if (previousOrgId !== orgId) {
        tx.update(orgRef, { memberCount: FieldValue.increment(1) });
        if (previousOrgSnap?.exists && (previousOrgSnap.data().memberCount || 0) > 0) {
          tx.update(previousOrgSnap.ref, { memberCount: FieldValue.increment(-1) });
        }
      }
    });
  } catch (err) {
    const map = {
      org_not_found:     ['Organisation introuvable', 404],
      profile_not_found: ['Cet utilisateur n\'a pas encore de profil sur la plateforme', 404],
    };
    const [msg, status] = map[err.message] ?? ['Erreur lors de la promotion', 500];
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ ok: true, uid, email });
}

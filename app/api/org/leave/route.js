import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/org/leave
 * Détache l'utilisateur courant de son organisation (libre-service, coupure nette).
 * Écriture EXCLUSIVEMENT serveur.
 */
export async function POST(request) {
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
  const userRef = db.doc(`users/${uid}`);

  try {
    await db.runTransaction(async (tx) => {
      // --- Lectures d'abord (contrainte Firestore) ---
      const userSnap = await tx.get(userRef);
      const orgId = userSnap.exists ? userSnap.data().orgId : null;
      if (!orgId) throw new Error('not_member');

      const orgRef = db.doc(`organizations/${orgId}`);
      const orgSnap = await tx.get(orgRef);

      // --- Écritures ensuite ---
      tx.set(userRef, {
        orgId: null,
        orgType: null,
        orgJoinedAt: null,
      }, { merge: true });

      if (orgSnap.exists && (orgSnap.data().memberCount || 0) > 0) {
        tx.update(orgRef, { memberCount: FieldValue.increment(-1) });
      }
    });
  } catch (err) {
    if (err.message === 'not_member') {
      return NextResponse.json({ error: 'Vous n\'appartenez à aucune organisation' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur lors du détachement' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

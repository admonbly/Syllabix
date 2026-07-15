import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { normalizeAccessCode } from '@/lib/orgs';

/**
 * POST /api/org/join
 * Body : { code }
 * Rattache l'utilisateur courant à une organisation via son code d'accès.
 * - Écriture EXCLUSIVEMENT serveur (le client ne peut pas forger son orgId).
 * - Refus si l'utilisateur appartient déjà à une organisation (mono-rattachement).
 */
export async function POST(request) {
  // 1. Auth
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let uid;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  // 2. Parsing
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }
  const code = normalizeAccessCode(body?.code);
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 });

  const db = getAdminDb();

  // 3. Recherche de l'organisation par code actif
  const snap = await db.collection('organizations')
    .where('accessCode', '==', code)
    .where('accessCodeActive', '==', true)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 });
  }
  const orgDoc = snap.docs[0];
  const org = orgDoc.data();

  // 4. Rattachement en transaction (+ incrément du compteur)
  const userRef = db.doc(`users/${uid}`);
  const orgRef = orgDoc.ref;
  try {
    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const existingOrgId = userSnap.exists ? userSnap.data().orgId : null;
      if (existingOrgId) throw new Error('already_member');

      tx.set(userRef, {
        orgId: orgRef.id,
        orgType: org.type,
        orgJoinedAt: new Date().toISOString(),
      }, { merge: true });
      tx.update(orgRef, { memberCount: FieldValue.increment(1) });
    });
  } catch (err) {
    if (err.message === 'already_member') {
      return NextResponse.json(
        { error: 'Vous appartenez déjà à une organisation. Quittez-la d\'abord.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Erreur lors du rattachement' }, { status: 500 });
  }

  return NextResponse.json({ orgName: org.name, orgType: org.type });
}

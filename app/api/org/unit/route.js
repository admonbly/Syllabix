import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { findUnitInList } from '@/lib/orgs';

/**
 * POST /api/org/unit
 * Body : { unit }  — `null` ou '' pour se retirer de son unité.
 *
 * Permet à un membre de choisir ou changer sa classe / direction sans quitter
 * son organisation (changement de classe à la rentrée, réaffectation…).
 * La valeur est validée contre la liste déclarée par l'organisation : le client
 * ne peut jamais écrire une unité arbitraire.
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

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const db = getAdminDb();
  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const orgId = userSnap.exists ? userSnap.data().orgId : null;
  if (!orgId) {
    return NextResponse.json({ error: 'Vous n\'appartenez à aucune organisation' }, { status: 400 });
  }

  const orgSnap = await db.doc(`organizations/${orgId}`).get();
  if (!orgSnap.exists) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  const units = orgSnap.data().units ?? [];
  const requested = body?.unit;

  // Retrait explicite
  if (!requested) {
    await userRef.set({ orgUnit: null }, { merge: true });
    return NextResponse.json({ ok: true, orgUnit: null });
  }

  if (units.length === 0) {
    return NextResponse.json(
      { error: 'Votre organisation n\'a pas encore défini de liste' },
      { status: 400 },
    );
  }

  const orgUnit = findUnitInList(units, requested);
  if (!orgUnit) {
    return NextResponse.json(
      { error: 'Cette valeur ne fait pas partie de la liste de l\'organisation' },
      { status: 400 },
    );
  }

  await userRef.set({ orgUnit }, { merge: true });
  return NextResponse.json({ ok: true, orgUnit });
}

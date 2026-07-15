import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireOrgAdmin } from '@/lib/orgAuth';
import { normalizeUnitName, unitKey, MAX_ORG_UNITS } from '@/lib/orgs';

/**
 * Gestion de la liste des unités (classes/filières ou directions) d'une
 * organisation. Réservé à l'ORG_ADMIN de CETTE organisation.
 *
 * C'est la seule écriture autorisée à un ORG_ADMIN : elle porte sur la
 * configuration de sa propre organisation, jamais sur les membres (le
 * rattachement reste à la main de l'apprenant).
 */

/** GET — liste actuelle + nombre de membres par unité. */
export async function GET(request) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const members = await db.collection('users').where('orgId', '==', guard.orgId).get();

  const counts = new Map();
  let withoutUnit = 0;
  members.forEach((d) => {
    const u = d.data().orgUnit;
    if (!u) { withoutUnit++; return; }
    counts.set(u, (counts.get(u) ?? 0) + 1);
  });

  const units = (guard.org.units ?? []).map((name) => ({ name, memberCount: counts.get(name) ?? 0 }));
  return NextResponse.json({ units, withoutUnit, orgType: guard.org.type });
}

/**
 * POST — ajoute une unité.
 * Body : { name }
 */
export async function POST(request) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const name = normalizeUnitName(body?.name);
  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

  const units = guard.org.units ?? [];
  if (units.length >= MAX_ORG_UNITS) {
    return NextResponse.json({ error: `Maximum ${MAX_ORG_UNITS} entrées` }, { status: 400 });
  }
  if (units.some((u) => unitKey(u) === unitKey(name))) {
    return NextResponse.json({ error: 'Cette entrée existe déjà' }, { status: 409 });
  }

  const next = [...units, name].sort((a, b) => a.localeCompare(b, 'fr'));
  await getAdminDb().doc(`organizations/${guard.orgId}`).update({ units: next });
  return NextResponse.json({ ok: true, units: next });
}

/**
 * DELETE — retire une unité de la liste.
 * Body : { name }
 * Les membres qui y étaient rattachés repassent « sans unité » : on ne les
 * détache PAS de l'organisation et on ne perd aucune donnée de progression.
 */
export async function DELETE(request) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const name = normalizeUnitName(body?.name);
  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

  const db = getAdminDb();
  const units = guard.org.units ?? [];
  const next = units.filter((u) => unitKey(u) !== unitKey(name));
  if (next.length === units.length) {
    return NextResponse.json({ error: 'Entrée introuvable' }, { status: 404 });
  }

  await db.doc(`organizations/${guard.orgId}`).update({ units: next });

  // Les membres concernés repassent « sans unité » (par lots : limite Firestore de 500)
  const affected = await db.collection('users')
    .where('orgId', '==', guard.orgId)
    .where('orgUnit', '==', name)
    .get();

  const docs = affected.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    docs.slice(i, i + 400).forEach((d) => batch.set(d.ref, { orgUnit: null }, { merge: true }));
    await batch.commit();
  }

  return NextResponse.json({ ok: true, units: next, membersReset: docs.length });
}

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';
import { generateCode } from '@/lib/vouchers';

/**
 * POST /api/admin/voucher/batch
 * Crée un lot de N vouchers gratuits/promo, éventuellement rattaché à une org.
 * Réservé à l'admin plateforme.
 *
 * Body : { count, source: 'partner_free'|'promo'|'admin', orgId?, label?, expiresAt? }
 *
 * Les vouchers payants (Phase 1) NE passent PAS par ici (générés après paiement).
 */

const MAX_BATCH = 400;             // limite d'écritures par lot (marge sous 500)
const ALLOWED_SOURCES = ['partner_free', 'promo', 'admin'];

export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const count = Number(body?.count);
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH) {
    return NextResponse.json({ error: `Nombre invalide (1 à ${MAX_BATCH}).` }, { status: 400 });
  }

  const source = String(body?.source ?? '');
  if (!ALLOWED_SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Source invalide.' }, { status: 400 });
  }

  const orgId = body?.orgId ? String(body.orgId) : null;
  const label = String(body?.label ?? '').trim().slice(0, 120) || null;
  const expiresAt = body?.expiresAt ? String(body.expiresAt) : null;

  const db = getAdminDb();

  // Si une org est visée, on vérifie son existence (évite les lots orphelins).
  if (orgId) {
    const orgSnap = await db.doc(`organizations/${orgId}`).get();
    if (!orgSnap.exists) {
      return NextResponse.json({ error: 'Organisation introuvable.' }, { status: 404 });
    }
  }

  const now = new Date().toISOString();
  const batchRef = db.collection('voucherBatches').doc();
  const batchId = batchRef.id;

  // Codes uniques au sein du lot (l'espace de codes rend les collisions
  // externes négligeables ; batch.create échoue si un code existait déjà).
  const codes = new Set();
  while (codes.size < count) codes.add(generateCode());
  const codeList = [...codes];

  const writer = db.batch();
  writer.set(batchRef, {
    orgId, source, label, count,
    redeemedCount: 0,
    createdAt: now,
    createdBy: guard.uid,
  });
  for (const code of codeList) {
    writer.create(db.doc(`vouchers/${code}`), {
      code, status: 'active', source, orgId, batchId,
      createdAt: now, createdBy: guard.uid,
      redeemedBy: null, redeemedAt: null,
      expiresAt,
    });
  }

  try {
    await writer.commit();
  } catch (err) {
    console.error('voucher batch commit:', err);
    return NextResponse.json({ error: 'Échec de création du lot.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, batchId, count, codes: codeList });
}

export const dynamic = 'force-dynamic';

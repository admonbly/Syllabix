import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/voucher/list
 *   → { batches: [...] } : tous les lots avec consommation et nom d'org.
 * GET /api/admin/voucher/list?batchId=XYZ
 *   → { codes: [{ code, status, redeemedBy, redeemedAt }] } : codes d'un lot
 *     (pour export / distribution). Réservé à l'admin plateforme.
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get('batchId');

  // Détail d'un lot : ses codes.
  if (batchId) {
    const snap = await db.collection('vouchers').where('batchId', '==', batchId).get();
    const codes = snap.docs
      .map((d) => {
        const v = d.data();
        return { code: v.code, status: v.status, redeemedBy: v.redeemedBy ?? null, redeemedAt: v.redeemedAt ?? null };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
    return NextResponse.json({ codes });
  }

  // Liste des lots.
  const snap = await db.collection('voucherBatches').orderBy('createdAt', 'desc').get();
  const batches = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Enrichit avec le nom de l'org (un seul getAll pour les orgs référencées).
  const orgIds = [...new Set(batches.map((b) => b.orgId).filter(Boolean))];
  const orgNames = {};
  if (orgIds.length > 0) {
    const refs = orgIds.map((id) => db.doc(`organizations/${id}`));
    const orgSnaps = await db.getAll(...refs);
    orgSnaps.forEach((s) => { if (s.exists) orgNames[s.id] = s.data().name; });
  }

  const enriched = batches.map((b) => ({
    ...b,
    orgName: b.orgId ? (orgNames[b.orgId] ?? '(org supprimée)') : null,
    remaining: Math.max(0, (b.count ?? 0) - (b.redeemedCount ?? 0)),
  }));

  return NextResponse.json({ batches: enriched });
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireOrgAdmin } from '@/lib/orgAuth';

/**
 * GET /api/org/vouchers
 * Suivi des vouchers de l'organisation de l'appelant (ORG_ADMIN) :
 * total alloué, utilisés, restants, et le détail par lot.
 * L'orgId est résolu côté serveur (jamais depuis la requête).
 */
export async function GET(request) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('voucherBatches').where('orgId', '==', guard.orgId).get();

  let allocated = 0;
  let used = 0;
  const batches = snap.docs.map((d) => {
    const b = d.data();
    const count = b.count ?? 0;
    const redeemed = b.redeemedCount ?? 0;
    allocated += count;
    used += redeemed;
    return {
      id: d.id,
      label: b.label ?? null,
      source: b.source ?? null,
      count,
      redeemedCount: redeemed,
      remaining: Math.max(0, count - redeemed),
      createdAt: b.createdAt ?? null,
    };
  });

  batches.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  return NextResponse.json({
    allocated,
    used,
    remaining: Math.max(0, allocated - used),
    batches,
  });
}

export const dynamic = 'force-dynamic';

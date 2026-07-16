import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/partnership/list
 * Liste les demandes de partenariat (lecture seule), plus récentes d'abord.
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('partnershipRequests').get();

  const requests = snap.docs.map((d) => {
    const r = d.data();
    return {
      id: d.id,
      type: r.type ?? 'OTHER',
      orgName: r.orgName ?? '',
      contactName: r.contactName ?? '',
      email: r.email ?? '',
      phone: r.phone ?? null,
      message: r.message ?? null,
      status: r.status ?? 'NEW',
      createdAt: r.createdAt ?? null,
    };
  }).sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));

  return NextResponse.json({ requests, total: requests.length });
}

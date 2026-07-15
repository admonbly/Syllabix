import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/org/list
 * Liste les organisations avec leur code, statut et nombre de membres.
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('organizations').orderBy('createdAt', 'desc').get();

  const orgs = snap.docs.map((d) => {
    const o = d.data();
    return {
      id: d.id,
      name: o.name,
      type: o.type,
      city: o.city ?? null,
      accessCode: o.accessCode,
      accessCodeActive: o.accessCodeActive !== false,
      memberCount: o.memberCount ?? 0,
      adminCount: (o.adminUids ?? []).length,
      createdAt: o.createdAt ?? null,
    };
  });

  return NextResponse.json({ orgs });
}

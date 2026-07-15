import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/testimonials/list
 * Liste TOUS les témoignages (publiés et masqués), triés par `order`.
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('testimonials').get();

  const testimonials = snap.docs
    .map((d) => {
      const t = d.data();
      return {
        id: d.id,
        name: t.name ?? '',
        role: t.role ?? '',
        location: t.location ?? '',
        initials: t.initials ?? '',
        color: t.color ?? 'bg-primary',
        quoteFr: t.quoteFr ?? '',
        quoteEn: t.quoteEn ?? '',
        order: t.order ?? 0,
        published: t.published !== false,
      };
    })
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({ testimonials });
}

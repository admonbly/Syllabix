import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/newsletter/list
 * Liste les abonnés à la newsletter (lecture seule).
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('newsletter').get();

  const subscribers = snap.docs.map((d) => {
    const s = d.data();
    // subscribedAt est un Timestamp Firestore (serverTimestamp côté client)
    const at = s.subscribedAt?.toDate?.() ?? null;
    return {
      id: d.id,
      email: s.email ?? '',
      subscribedAt: at ? at.toISOString() : null,
    };
  });

  // Plus récents d'abord ; les dates manquantes en fin de liste
  subscribers.sort((a, b) => {
    if (!a.subscribedAt) return 1;
    if (!b.subscribedAt) return -1;
    return new Date(b.subscribedAt) - new Date(a.subscribedAt);
  });

  return NextResponse.json({ subscribers, total: subscribers.length });
}

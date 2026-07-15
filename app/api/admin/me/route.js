import { NextResponse } from 'next/server';
import { getUidFromRequest, isPlatformAdminUid } from '@/lib/adminAuth';

/**
 * GET /api/admin/me
 * Renvoie { isPlatformAdmin } pour que l'UI /admin décide d'afficher ou rediriger.
 * Ne divulgue jamais la liste des admins.
 */
export async function GET(request) {
  const uid = await getUidFromRequest(request);
  if (!uid) return NextResponse.json({ isPlatformAdmin: false }, { status: 401 });
  return NextResponse.json({ isPlatformAdmin: isPlatformAdminUid(uid) });
}

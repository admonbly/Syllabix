import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * POST /api/admin/testimonials/toggle-publish
 * Body : { id, published }
 * Affiche ou masque un témoignage sur l'accueil (jamais de suppression).
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const id = String(body?.id || '').trim();
  const published = Boolean(body?.published);
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const db = getAdminDb();
  const ref = db.doc(`testimonials/${id}`);
  if (!(await ref.get()).exists) {
    return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 });
  }

  await ref.update({ published, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, published });
}

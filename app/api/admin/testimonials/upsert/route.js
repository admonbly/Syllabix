import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';
import { TESTIMONIAL_COLORS, initialsFromName } from '@/lib/testimonialsSeed';

function slugify(str) {
  return String(str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * POST /api/admin/testimonials/upsert
 * Body : { id?, name, role, location, quoteFr, quoteEn, color, initials?, order, published }
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

  const quoteFr = String(body?.quoteFr || '').trim();
  if (!quoteFr) return NextResponse.json({ error: 'La citation française est requise' }, { status: 400 });

  const color = TESTIMONIAL_COLORS.includes(body?.color) ? body.color : 'bg-primary';
  const db = getAdminDb();

  const existingId = body?.id ? String(body.id).trim() : null;
  const docId = existingId || slugify(name);
  if (!docId) return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });

  const ref = db.doc(`testimonials/${docId}`);
  const snap = await ref.get();
  if (!existingId && snap.exists) {
    return NextResponse.json({ error: 'Un témoignage existe déjà pour ce nom' }, { status: 409 });
  }

  const data = {
    id: docId,
    name,
    role: String(body?.role || '').trim(),
    location: String(body?.location || '').trim(),
    initials: String(body?.initials || '').trim() || initialsFromName(name),
    color,
    quoteFr,
    // La citation anglaise retombe sur la française si non fournie
    quoteEn: String(body?.quoteEn || '').trim() || quoteFr,
    order: Number.isFinite(Number(body?.order)) ? Number(body.order) : 99,
    published: body?.published !== false,
    updatedAt: new Date().toISOString(),
  };

  await ref.set(data, { merge: true });
  return NextResponse.json({ ok: true, id: docId, created: !snap.exists });
}

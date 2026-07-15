import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * POST /api/admin/org/toggle-code
 * Body : { orgId, active }
 * Active ou désactive le code d'accès (sans casser les rattachements existants).
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const orgId = String(body?.orgId || '').trim();
  const active = Boolean(body?.active);
  if (!orgId) return NextResponse.json({ error: 'orgId manquant' }, { status: 400 });

  const db = getAdminDb();
  const ref = db.doc(`organizations/${orgId}`);
  if (!(await ref.get()).exists) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  await ref.update({ accessCodeActive: active });
  return NextResponse.json({ ok: true, accessCodeActive: active });
}

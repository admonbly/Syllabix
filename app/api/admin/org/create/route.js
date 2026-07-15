import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';
import { isValidOrgType, generateAccessCode } from '@/lib/orgs';

/**
 * POST /api/admin/org/create
 * Body : { name, type, city? }
 * Crée une organisation avec un code d'accès unique.
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  const type = String(body?.type || '').trim();
  const city = body?.city ? String(body.city).trim() : null;

  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
  if (!isValidOrgType(type)) return NextResponse.json({ error: 'Type invalide (SCHOOL ou COMPANY)' }, { status: 400 });

  const db = getAdminDb();

  // Refus des doublons nom + type
  const dup = await db.collection('organizations')
    .where('name', '==', name).where('type', '==', type).limit(1).get();
  if (!dup.empty) {
    return NextResponse.json({ error: 'Une organisation de ce nom et ce type existe déjà' }, { status: 409 });
  }

  // Code unique (retente en cas de collision)
  let accessCode = null;
  for (let i = 0; i < 10; i++) {
    const candidate = generateAccessCode(name);
    const clash = await db.collection('organizations').where('accessCode', '==', candidate).limit(1).get();
    if (clash.empty) { accessCode = candidate; break; }
  }
  if (!accessCode) return NextResponse.json({ error: 'Impossible de générer un code unique' }, { status: 500 });

  const ref = db.collection('organizations').doc();
  await ref.set({
    type,
    name,
    country: 'CI',
    city,
    accessCode,
    accessCodeActive: true,
    adminUids: [],
    memberCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: guard.uid,
  });

  return NextResponse.json({ id: ref.id, name, type, accessCode });
}

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { ORG_REQUEST_TYPES, isValidOrgRequestType } from '@/lib/partnership';

/**
 * POST /api/partnership/request
 * Demande de partenariat déposée depuis /partenariats.
 *
 * Route PUBLIQUE : une école ou une entreprise qui découvre Syllabix n'a pas
 * de compte. L'écriture passe malgré tout par l'Admin SDK — la collection
 * `partnershipRequests` est fermée au client par les règles Firestore, ce qui
 * évite qu'on puisse y écrire n'importe quoi directement.
 *
 * Validation stricte des champs + bornes de taille : c'est le seul rempart,
 * il n'y a pas de captcha à ce stade (hors périmètre assumé).
 */

const LIMITS = { orgName: 120, contactName: 80, email: 120, phone: 30, message: 2000 };

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const type        = String(body?.type ?? '').trim();
  const orgName     = clean(body?.orgName, LIMITS.orgName);
  const contactName = clean(body?.contactName, LIMITS.contactName);
  const email       = clean(body?.email, LIMITS.email).toLowerCase();
  const phone       = clean(body?.phone, LIMITS.phone);
  const message     = clean(body?.message, LIMITS.message);

  if (!isValidOrgRequestType(type)) {
    return NextResponse.json({ error: 'Type d\'organisation invalide' }, { status: 400 });
  }
  if (!orgName)     return NextResponse.json({ error: 'Le nom de l\'organisation est requis' }, { status: 400 });
  if (!contactName) return NextResponse.json({ error: 'Votre nom est requis' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse e-mail invalide' }, { status: 400 });
  }

  const db = getAdminDb();

  // Anti-doublon simple : une même organisation + e-mail ne peut pas déposer
  // deux demandes en attente. Évite les envois multiples par impatience.
  const existing = await db.collection('partnershipRequests')
    .where('email', '==', email)
    .where('orgName', '==', orgName)
    .where('status', '==', 'NEW')
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json(
      { ok: true, duplicate: true },
      { status: 200 },
    );
  }

  await db.collection('partnershipRequests').add({
    type, orgName, contactName, email, phone: phone || null, message: message || null,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';

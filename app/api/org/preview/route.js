import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { normalizeAccessCode } from '@/lib/orgs';

/**
 * POST /api/org/preview
 * Body : { code }
 * Renvoie le nom de l'organisation et ses unités (classes / directions) SANS
 * rattacher l'utilisateur — pour lui présenter la liste avant qu'il confirme.
 *
 * Authentifié : seul un utilisateur connecté peut sonder un code (le code
 * reste le secret partagé, mais on évite qu'un anonyme énumère les codes).
 */
export async function POST(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const code = normalizeAccessCode(body?.code);
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 });

  const snap = await getAdminDb().collection('organizations')
    .where('accessCode', '==', code)
    .where('accessCodeActive', '==', true)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 });
  }

  const org = snap.docs[0].data();
  return NextResponse.json({
    orgName: org.name,
    orgType: org.type,
    units: org.units ?? [],
  });
}

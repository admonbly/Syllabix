import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/auth/init-profile
 *
 * Initialise le profil Firestore d'un compte fraîchement créé PAR LIAISON d'une
 * session anonyme (défi public → création de compte). Écrit via l'Admin SDK :
 *  - permet de poser email/role/createdAt (interdits au client par les règles
 *    sur un UPDATE) ;
 *  - fait un MERGE, donc préserve le champ `badges` déjà décroché pendant le défi.
 *
 * Idempotent : si le profil a déjà un email (déjà initialisé), ne réécrit pas les
 * champs immuables (createdAt, role) ; met seulement à jour nom/téléphone si fournis.
 *
 * Body : { firstName?, lastName?, phoneNumber?, dateOfBirth?, parentalConsentGiven? }
 */
export async function POST(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  // Un compte anonyme n'a pas d'email : refuser tant que la liaison n'a pas eu lieu.
  const uid = decoded.uid;
  const email = decoded.email || '';
  if (!email) {
    return NextResponse.json({ error: 'Compte non lié (email manquant)' }, { status: 400 });
  }

  let body = {};
  try { body = (await request.json()) || {}; } catch { /* body optionnel */ }

  const firstName = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 80) : '';
  const lastName  = typeof body.lastName === 'string'  ? body.lastName.trim().slice(0, 80)  : '';
  const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim().slice(0, 30) : '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ');

  const db = getAdminDb();
  const ref = db.doc(`users/${uid}`);
  const snap = await ref.get();
  const existing = snap.exists ? snap.data() : {};

  // Champs de base — createdAt/role posés une seule fois.
  const profile = {
    email,
    firstName,
    lastName,
    displayName,
    phoneNumber,
    emailVerified: !!decoded.email_verified,
    role: existing.role || 'LEARNER',
    authProvider: existing.authProvider || (decoded.firebase?.sign_in_provider ?? 'password'),
    createdAt: existing.createdAt || new Date().toISOString(),
  };

  if (body.dateOfBirth) {
    profile.dateOfBirth = String(body.dateOfBirth);
    profile.parentalConsentGiven = !!body.parentalConsentGiven;
    profile.parentalConsentAt = body.parentalConsentGiven ? new Date().toISOString() : null;
  }

  // merge:true → NE TOUCHE PAS `badges` (décrochés pendant le défi anonyme).
  await ref.set(profile, { merge: true });

  return NextResponse.json({ ok: true, uid });
}

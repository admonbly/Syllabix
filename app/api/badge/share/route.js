import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { badgeLevelOf } from '@/lib/badges';

/**
 * POST /api/badge/share
 * Publie un badge de l'utilisateur dans la collection publique `publicBadges`
 * pour le rendre partageable (WhatsApp / LinkedIn / Facebook), avec une page
 * publique /b/[id] et une image d'aperçu.
 *
 * Body : { moduleId, level }  (identifie le badge dans le profil)
 *
 * Id déterministe (uid_level_module) → un même badge n'est publié qu'une fois ;
 * republier met simplement à jour le nom / score courant.
 *
 * Requiert un compte NON anonyme (il faut un nom à afficher).
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
  const uid = decoded.uid;
  if (decoded.firebase?.sign_in_provider === 'anonymous') {
    return NextResponse.json({ error: 'Créez un compte pour partager votre badge.' }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const level = body?.level;
  const moduleId = body?.moduleId === null ? null : Number(body?.moduleId);

  const db = getAdminDb();
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  const userData = userSnap.data();

  const badges = Array.isArray(userData.badges) ? userData.badges : [];
  const badge = badges.find((b) => {
    const sameLevel = badgeLevelOf(b) === level;
    const sameModule = (b.moduleId ?? null) === (Number.isNaN(moduleId) ? null : moduleId);
    return sameLevel && sameModule;
  });

  if (!badge) {
    return NextResponse.json({ error: 'Badge introuvable dans votre profil' }, { status: 404 });
  }

  const displayName = userData.displayName || userData.firstName || 'Apprenant Syllabix';
  const modKey = badge.moduleId ?? 'global';
  const badgeId = `${uid}_${badgeLevelOf(badge)}_${modKey}`;

  const publicDoc = {
    userId: uid,
    displayName,
    moduleId: badge.moduleId ?? null,
    moduleName: badge.moduleName ?? 'Syllabix',
    score: badge.score ?? 0,
    level: badgeLevelOf(badge),
    earnedAt: badge.earnedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.doc(`publicBadges/${badgeId}`).set(publicDoc, { merge: true });

  return NextResponse.json({ ok: true, id: badgeId });
}

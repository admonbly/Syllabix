import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { MODULE_NAMES, parseModuleId } from '@/lib/examServer';
import { EXAM_CONFIG } from '@/lib/examService';
import { BADGE_LEVELS } from '@/lib/badges';

/**
 * POST /api/training/badge
 * Décerne un badge d'APPRENTISSAGE (niveau 'learning') après un entraînement /
 * défi réussi. Distinct de /api/exam/submit qui gère la CERTIFICATION.
 *
 * Body : { moduleId, score }  (score = pourcentage 0-100 côté client)
 *
 * Note d'intégrité : l'entraînement ne passe pas par une session serveur, donc le
 * score est celui remonté par le client. C'est acceptable — un badge
 * d'apprentissage est à faible enjeu (viral, pas certifiant) ; la vraie garantie
 * reste la certification. On borne malgré tout le score et on exige le seuil.
 *
 * Fonctionne aussi pour un utilisateur ANONYME (Lot B) : verifyIdToken accepte les
 * jetons anonymes, et le badge est écrit sous son uid — préservé au linking.
 */
export async function POST(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let uid;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const moduleId = parseModuleId(body?.moduleId);
  if (moduleId === undefined || moduleId === null) {
    return NextResponse.json({ error: 'moduleId invalide' }, { status: 400 });
  }

  const rawScore = Number(body?.score);
  if (!Number.isFinite(rawScore)) {
    return NextResponse.json({ error: 'score invalide' }, { status: 400 });
  }
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const minScore = EXAM_CONFIG.TRAINING.BADGE_MIN_SCORE ?? 60;
  if (score < minScore) {
    // Pas d'erreur : simplement pas de badge décerné à ce score.
    return NextResponse.json({ awarded: false, reason: 'below_threshold', minScore });
  }

  const db = getAdminDb();
  const userRef = db.doc(`users/${uid}`);
  const now = new Date().toISOString();
  const moduleName = MODULE_NAMES[moduleId] ?? `Module ${moduleId}`;

  // Anti-doublon : au plus UN badge d'apprentissage par module, on garde le
  // meilleur score. Transaction pour éviter les écritures concurrentes.
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.exists ? snap.data() : {};
    const badges = Array.isArray(data.badges) ? [...data.badges] : [];

    const idx = badges.findIndex(
      (b) => b && b.level === BADGE_LEVELS.LEARNING && Number(b.moduleId) === moduleId,
    );

    if (idx >= 0) {
      if ((badges[idx].score ?? 0) >= score) {
        return { awarded: true, improved: false };
      }
      badges[idx] = { ...badges[idx], score, earnedAt: now };
    } else {
      badges.push({
        moduleId,
        moduleName,
        score,
        earnedAt: now,
        level: BADGE_LEVELS.LEARNING,
      });
    }

    // set (merge) plutôt qu'update : couvre le cas d'un profil anonyme sans doc.
    tx.set(userRef, { badges }, { merge: true });
    return { awarded: true, improved: true };
  });

  return NextResponse.json({ ...result, moduleId, score, level: BADGE_LEVELS.LEARNING });
}

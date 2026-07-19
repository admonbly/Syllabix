import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { normalizeCode } from '@/lib/vouchers';

/**
 * POST /api/voucher/redeem
 * Valide et consomme un code de certification pour l'utilisateur connecté.
 * Après succès, l'utilisateur est autorisé à démarrer UNE certification
 * (le lien code → session d'examen est vérifié au Lot 2).
 *
 * Body : { code }
 *
 * Sécurité :
 *  - transaction (anti double-usage, anti-course) ;
 *  - rate-limit IP (anti brute-force de codes) ;
 *  - messages NEUTRES (ne révèle pas si un code existe).
 */

const RATE_MAX = 10;               // tentatives de saisie
const RATE_WINDOW_MS = 60 * 60 * 1000; // par heure et par IP

function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || 'unknown';
}

const NEUTRAL = 'Code invalide ou déjà utilisé.';

export async function POST(request) {
  // 1. Auth
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let uid;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Session expirée, reconnectez-vous.' }, { status: 401 });
  }

  // 2. Corps + normalisation
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  const code = normalizeCode(body?.code);
  if (!code) return NextResponse.json({ error: NEUTRAL }, { status: 400 });

  const db = getAdminDb();

  // 3. Rate-limit IP (fenêtre glissante, transaction)
  const ip = clientIp(request);
  if (ip !== 'unknown') {
    const rateRef = db.doc(`rateLimits/voucher_${encodeURIComponent(ip)}`);
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(rateRef);
        const now = Date.now();
        const hits = (snap.exists ? snap.data().hits : []).filter((t) => now - t < RATE_WINDOW_MS);
        if (hits.length >= RATE_MAX) throw new Error('rate_limited');
        tx.set(rateRef, { hits: [...hits, now], updatedAt: new Date().toISOString() });
      });
    } catch (err) {
      if (err.message === 'rate_limited') {
        return NextResponse.json(
          { error: 'Trop de tentatives. Réessayez plus tard.' },
          { status: 429 },
        );
      }
      console.error('voucher rate-limit:', err);
    }
  }

  // 4. Validation + consommation du code (transaction)
  const voucherRef = db.doc(`vouchers/${code}`);
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(voucherRef);
      if (!snap.exists) throw new Error('invalid');
      const v = snap.data();
      if (v.status !== 'active') throw new Error('invalid');
      if (v.expiresAt && new Date(v.expiresAt).getTime() < Date.now()) throw new Error('invalid');

      tx.update(voucherRef, {
        status: 'redeemed',
        redeemedBy: uid,
        redeemedAt: new Date().toISOString(),
      });
      // Compteur de consommation du lot maintenu à jour (admin + dashboard org).
      if (v.batchId) {
        tx.update(db.doc(`voucherBatches/${v.batchId}`), {
          redeemedCount: FieldValue.increment(1),
        });
      }
    });
  } catch (err) {
    if (err.message === 'invalid') {
      return NextResponse.json({ error: NEUTRAL }, { status: 400 });
    }
    console.error('voucher redeem:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code });
}

export const dynamic = 'force-dynamic';

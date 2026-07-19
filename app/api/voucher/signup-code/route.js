import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { generateCode, FOUNDING_LIMIT } from '@/lib/vouchers';
import { isDisposableEmail } from '@/lib/disposableEmails';

/**
 * POST /api/voucher/signup-code
 * Attribue (ou renvoie) le code de certification OFFERT aux 200 premiers comptes.
 * 1 code par compte, réservé aux comptes vérifiés (email ou téléphone), hors
 * domaines d'email jetables. Idempotent : renvoie le code déjà attribué.
 *
 * Réponses : { status: 'issued', code, foundingNumber }
 *          | { status: 'needs_verification' }
 *          | { status: 'sold_out' }
 *          | { status: 'blocked' }
 */

const RATE_MAX = 12;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || 'unknown';
}

export async function POST(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
  }
  const uid = decoded.uid;
  const email = decoded.email || '';

  const db = getAdminDb();

  // Rate-limit IP (anti-farming de comptes).
  const ip = clientIp(request);
  if (ip !== 'unknown') {
    const rateRef = db.doc(`rateLimits/signupcode_${encodeURIComponent(ip)}`);
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
        return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
      }
      console.error('signup-code rate-limit:', err);
    }
  }

  // Email jetable → refus (sauf comptes sans email, ex. téléphone).
  if (email && isDisposableEmail(email)) {
    return NextResponse.json({ status: 'blocked' });
  }

  // Éligibilité : email vérifié OU téléphone vérifié.
  const userSnap = await db.doc(`users/${uid}`).get();
  const profile = userSnap.exists ? userSnap.data() : {};
  const verified = decoded.email_verified === true || profile.phoneVerified === true;
  if (!verified) {
    return NextResponse.json({ status: 'needs_verification' });
  }

  // Attribution en transaction (compteur global + 1 code/compte).
  const userRef = db.doc(`users/${uid}`);
  const counterRef = db.doc('counters/foundingCodes');

  try {
    const result = await db.runTransaction(async (tx) => {
      const uSnap = await tx.get(userRef);
      const u = uSnap.exists ? uSnap.data() : {};
      if (u.signupCodeIssued && u.signupCode) {
        return { status: 'issued', code: u.signupCode, foundingNumber: u.foundingNumber ?? null };
      }

      const cSnap = await tx.get(counterRef);
      const issued = cSnap.exists ? (cSnap.data().issued ?? 0) : 0;
      if (issued >= FOUNDING_LIMIT) {
        return { status: 'sold_out' };
      }

      const code = generateCode();
      const now = new Date().toISOString();
      const foundingNumber = issued + 1;

      tx.set(db.doc(`vouchers/${code}`), {
        code, status: 'active', source: 'signup_free',
        orgId: null, batchId: null,
        createdAt: now, createdBy: uid,
        redeemedBy: null, redeemedAt: null, expiresAt: null,
      });
      tx.set(counterRef, { issued: foundingNumber, updatedAt: now }, { merge: true });
      tx.set(userRef, { signupCodeIssued: true, signupCode: code, foundingNumber }, { merge: true });

      return { status: 'issued', code, foundingNumber };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('signup-code:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

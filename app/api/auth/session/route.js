import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getAdminAuth } from '@/lib/firebaseAdmin';

const SESSION_TIMEOUT_S = 6 * 60 * 60; // 6h en secondes

const COOKIE_BASE = {
  path: '/',
  sameSite: 'strict',
  secure: true,
  httpOnly: true,
  maxAge: SESSION_TIMEOUT_S,
};

/**
 * Valeur de cookie signée : "<expirationMs>.<hmacSha256>".
 * Sans SESSION_SECRET configuré, retombe sur l'ancienne valeur "1"
 * (à éviter — définir SESSION_SECRET dans les variables d'environnement).
 */
function buildSessionValue() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return '1';
  const exp = String(Date.now() + SESSION_TIMEOUT_S * 1000);
  const sig = createHmac('sha256', secret).update(exp).digest('hex');
  return `${exp}.${sig}`;
}

export async function POST(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  try {
    await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('syllabix_session', buildSessionValue(), COOKIE_BASE);
  response.cookies.set('syllabix_last_activity', String(Date.now()), COOKIE_BASE);
  return response;
}

// Déconnexion : efface les cookies HttpOnly côté serveur
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('syllabix_session', '', { path: '/', maxAge: 0 });
  response.cookies.set('syllabix_last_activity', '', { path: '/', maxAge: 0 });
  return response;
}

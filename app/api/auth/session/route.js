import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

const SESSION_TIMEOUT_S = 6 * 60 * 60; // 6h en secondes

const COOKIE_BASE = {
  path: '/',
  sameSite: 'strict',
  secure: true,
  httpOnly: true,
  maxAge: SESSION_TIMEOUT_S,
};

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
  response.cookies.set('syllabix_session', '1', COOKIE_BASE);
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

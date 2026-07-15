import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/training',
  '/exam',
  '/certification',
  '/evaluation',
  '/profile',
  '/org',
  '/admin',
];

const PUBLIC_EXCEPTIONS = [
  '/certification/presentation',
];

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 heures d'inactivité

/**
 * Vérifie le cookie de session signé "<expirationMs>.<hmacSha256>".
 * Sans SESSION_SECRET configuré, accepte l'ancienne valeur "1" (mode legacy).
 */
async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return value === '1'; // legacy — définir SESSION_SECRET en prod

  const dot = value.lastIndexOf('.');
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(exp));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  // Comparaison à temps constant
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isException = PUBLIC_EXCEPTIONS.some((p) => pathname === p);
  if (isException) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get('syllabix_session')?.value;
  const lastActivity = request.cookies.get('syllabix_last_activity')?.value;

  // Pas de session valide → login
  if (!(await isValidSession(session))) {
    return redirectToLogin(request, pathname);
  }

  // Vérification de l'inactivité
  if (lastActivity) {
    const elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      // Session expirée par inactivité — on efface et on redirige
      return expireSession(request, pathname);
    }
  }

  // Session valide — on rafraîchit le timestamp d'activité
  const response = NextResponse.next();
  response.cookies.set('syllabix_last_activity', String(Date.now()), {
    path: '/',
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
    maxAge: SESSION_TIMEOUT_MS / 1000,
  });
  return response;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

function expireSession(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  loginUrl.searchParams.set('reason', 'session_expired');
  const response = NextResponse.redirect(loginUrl);
  // Effacer les deux cookies
  response.cookies.set('syllabix_session', '', { path: '/', maxAge: 0 });
  response.cookies.set('syllabix_last_activity', '', { path: '/', maxAge: 0 });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)'],
};

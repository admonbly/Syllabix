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

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000;        // 3 heures d'inactivité
const COOKIE_MAX_AGE_S   = 30 * 24 * 60 * 60;          // rétention navigateur : 30 jours

/**
 * Vérifie le cookie de session signé "<expirationMs>.<hmacSha256>".
 * Sans SESSION_SECRET configuré, accepte l'ancienne valeur "1" (mode legacy).
 */
async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Reconstruit une valeur de session signée "<exp>.<hmac>" glissante (3h). */
async function buildSessionValue(): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return '1'; // legacy
  const exp = String(Date.now() + SESSION_TIMEOUT_MS);
  return `${exp}.${await hmacHex(secret, exp)}`;
}

async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return value === '1'; // legacy — définir SESSION_SECRET en prod

  const dot = value.lastIndexOf('.');
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;

  const expected = await hmacHex(secret, exp);

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

  // Pas de session valide.
  if (!(await isValidSession(session))) {
    // Un marqueur d'activité subsiste → l'utilisateur ÉTAIT connecté et sa
    // session a expiré (valeur signée périmée). On force une vraie déconnexion
    // (reason=session_expired → signOut Firebase côté login), sinon Firebase
    // recréerait la session sans redemander le mot de passe.
    if (lastActivity) return expireSession(request, pathname);
    // Aucun contexte de session → simple visiteur non connecté.
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

  // Session valide et active — on fait GLISSER la fenêtre : on réémet le cookie
  // signé avec une nouvelle expiration (+3h) et on rafraîchit le marqueur
  // d'activité. Un utilisateur actif n'est donc jamais déconnecté à 3h pile ;
  // seule une inactivité réelle de 3h fait expirer la session.
  const response = NextResponse.next();
  const cookieOpts = {
    path: '/',
    sameSite: 'strict' as const,
    secure: true,
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_S,
  };
  response.cookies.set('syllabix_session', await buildSessionValue(), cookieOpts);
  response.cookies.set('syllabix_last_activity', String(Date.now()), cookieOpts);
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

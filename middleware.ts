import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/training',
  '/exam',
  '/certification',
  '/evaluation',
  '/profile',
];

const PUBLIC_EXCEPTIONS = [
  '/certification/presentation',
];

const SESSION_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 heures d'inactivité

const COOKIE_OPTIONS = 'path=/; SameSite=Strict; Secure; HttpOnly';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isException = PUBLIC_EXCEPTIONS.some((p) => pathname === p);
  if (isException) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get('syllabix_session')?.value;
  const lastActivity = request.cookies.get('syllabix_last_activity')?.value;

  // Pas de session → login
  if (!session || session !== '1') {
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

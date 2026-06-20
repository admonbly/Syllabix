import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/training',
  '/exam',
  '/certification',
  '/profile',
];

// Pages publiques même si elles commencent par un chemin protégé
const PUBLIC_EXCEPTIONS = [
  '/certification/presentation',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isException = PUBLIC_EXCEPTIONS.some((p) => pathname === p);
  if (isException) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get('syllabix_session')?.value;

  if (!session || session !== '1') {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)'],
};

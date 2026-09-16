import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'pb_auth';

function decodeJwtExp(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function hasValidAdminCookie(req: NextRequest): boolean {
  const raw = req.cookies.get(COOKIE)?.value;
  if (!raw) return false;
  try {
    const { token, model } = JSON.parse(raw);
    if (!token || !model?.id || model.role !== 'admin') return false;
    const exp = decodeJwtExp(token);
    if (exp !== null && exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    if (hasValidAdminCookie(req)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  if (!hasValidAdminCookie(req)) {
    const login = new URL('/admin/login', req.url);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

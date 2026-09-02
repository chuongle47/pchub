import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/tai-khoan', '/thanh-toan', '/dat-hang-thanh-cong'];
const authRoutes = ['/login', '/register', '/dang-nhap', '/dang-ky'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nksToken = request.cookies.get('nks_token')?.value;
  const pchubToken = request.cookies.get('pchub-token')?.value;
  const isAuthenticated = Boolean(nksToken || pchubToken);

  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/tai-khoan', request.url));
  }

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tai-khoan/:path*', '/thanh-toan', '/dat-hang-thanh-cong', '/login', '/register', '/dang-nhap', '/dang-ky'],
};

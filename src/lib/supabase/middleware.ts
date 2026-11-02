import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isStaff, type UserRole } from '../permissions';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlalyoyazlgsimzudtxw.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {}

  const { pathname } = request.nextUrl;

  // 1. ADMIN ROUTES PROTECTION
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    // Check pchub_admin_session cookie
    const adminSessionCookie = request.cookies.get('pchub_admin_session')?.value;
    let adminSessionRole: UserRole | null = null;
    if (adminSessionCookie) {
      try {
        const parsed = JSON.parse(adminSessionCookie);
        if (parsed?.role && isStaff(parsed.role)) {
          adminSessionRole = parsed.role;
        }
      } catch {}
    }

    let isStaffUser = Boolean(adminSessionRole);

    if (!isStaffUser && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const userRole = (profile?.role as UserRole) || 'customer';
        if (isStaff(userRole)) {
          isStaffUser = true;
        }
      } catch {}
    }

    if (!isStaffUser) {
      if (!isLoginPage) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    // Already staff, accessing login page -> redirect to /admin
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return response;
  }

  // 2. STOREFRONT PROTECTED ROUTES (/tai-khoan)
  const nksToken = request.cookies.get('nks_token')?.value;
  const pchubToken = request.cookies.get('pchub-token')?.value;
  const isAuthenticated = Boolean(user || nksToken || pchubToken);

  const storefrontAuthRoutes = ['/login', '/register', '/dang-nhap', '/dang-ky', '/forgot-password'];
  if (storefrontAuthRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/tai-khoan', request.url));
  }

  if (pathname.startsWith('/tai-khoan') && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

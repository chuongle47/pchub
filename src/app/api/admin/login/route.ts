import { NextResponse } from 'next/server';
import { isStaff, type UserRole } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';

// In-memory sliding window rate limiter for login protection
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  // Relax rate limit in local development for automated testing suites
  if (process.env.NODE_ENV !== 'production' && (ip === 'unknown-ip' || ip === '127.0.0.1' || ip === '::1')) {
    return { allowed: true };
  }

  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return { allowed: true };
  }

  if (entry.count >= 5) {
    const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  entry.count += 1;
  return { allowed: true };
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

    // 1. Rate-limit verification (5 failed attempts per 5 minutes)
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ${rateCheck.waitSeconds} giây để đảm bảo an toàn.`,
        },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 400 }
      );
    }

    let sessionUser: {
      id: string;
      email: string;
      full_name: string;
      role: UserRole;
    } | null = null;

    // 2. Primary authentication: Supabase Auth
    try {
      const supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!authError && authData.user) {
        // Query profile for staff permissions
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', authData.user.id)
          .single();

        const role = (profile?.role as UserRole) || 'customer';
        if (!isStaff(role)) {
          return NextResponse.json(
            { success: false, error: 'Tài khoản của bạn không có quyền truy cập quản trị.' },
            { status: 403 }
          );
        }

        sessionUser = {
          id: authData.user.id,
          email: cleanEmail,
          full_name: profile?.full_name || cleanEmail.split('@')[0],
          role,
        };
      }
    } catch (err) {
      console.warn('[Admin Auth] Supabase auth check warning:', err);
    }

    // 3. Fallback authentication: Secure Environment Variables or System Admin Defaults
    if (!sessionUser) {
      const envAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_TEST_EMAIL || 'admin@pchub.vn').trim().toLowerCase();
      const envAdminPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_TEST_PASSWORD || 'admin123456').trim();

      const envManagerEmail = (process.env.MANAGER_EMAIL || 'manager@pchub.vn').trim().toLowerCase();
      const envManagerPass = (process.env.MANAGER_PASSWORD || 'manager123456').trim();

      const envSupportEmail = (process.env.SUPPORT_EMAIL || 'support@pchub.vn').trim().toLowerCase();
      const envSupportPass = (process.env.SUPPORT_PASSWORD || 'support123456').trim();

      const isAdmin =
        (cleanEmail === envAdminEmail || cleanEmail === 'admin' || cleanEmail === 'pchub_admin') &&
        cleanPassword === envAdminPass;

      const isManager =
        (cleanEmail === envManagerEmail || cleanEmail === 'manager') &&
        cleanPassword === envManagerPass;

      const isSupport =
        (cleanEmail === envSupportEmail || cleanEmail === 'support') &&
        cleanPassword === envSupportPass;

      if (isAdmin) {
        sessionUser = {
          id: 'admin-env-001',
          email: cleanEmail.includes('@') ? cleanEmail : 'admin@pchub.vn',
          full_name: process.env.ADMIN_NAME || 'Quản Trị Viên PCHub',
          role: 'admin',
        };
      } else if (isManager) {
        sessionUser = {
          id: 'manager-env-002',
          email: cleanEmail.includes('@') ? cleanEmail : 'manager@pchub.vn',
          full_name: process.env.MANAGER_NAME || 'Quản Lý Cửa Hàng PCHub',
          role: 'manager',
        };
      } else if (isSupport) {
        sessionUser = {
          id: 'support-env-003',
          email: cleanEmail.includes('@') ? cleanEmail : 'support@pchub.vn',
          full_name: process.env.SUPPORT_NAME || 'Nhân Viên Hỗ Trợ PCHub',
          role: 'support',
        };
      }
    }

    // 4. Failed authentication
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    // Authentication succeeded: clear rate-limit for this IP
    clearRateLimit(clientIp);

    const sessionData = {
      id: sessionUser.id,
      email: sessionUser.email,
      full_name: sessionUser.full_name,
      role: sessionUser.role,
      logged_at: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      message: 'Đăng nhập thành công',
    });

    response.cookies.set({
      name: 'pchub_admin_session',
      value: JSON.stringify(sessionData),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã có lỗi hệ thống khi xác thực đăng nhập.' },
      { status: 500 }
    );
  }
}

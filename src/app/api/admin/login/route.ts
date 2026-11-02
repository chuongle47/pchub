import { NextResponse } from 'next/server';
import { isStaff, type UserRole } from '@/lib/permissions';

const STAFF_ACCOUNTS: Record<string, { pass: string; role: UserRole; name: string; id: string }> = {
  'admin@pchub.vn': {
    pass: 'admin123456',
    role: 'admin',
    name: 'Quản Trị Viên PCHub',
    id: 'admin-pchub-001',
  },
  'manager@pchub.vn': {
    pass: 'manager123456',
    role: 'manager',
    name: 'Quản Lý Cửa Hàng PCHub',
    id: 'manager-pchub-002',
  },
  'support@pchub.vn': {
    pass: 'support123456',
    role: 'support',
    name: 'Nhân Viên Hỗ Trợ PCHub',
    id: 'support-pchub-003',
  },
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    const account = STAFF_ACCOUNTS[cleanEmail];
    if (!account || account.pass !== cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    if (!isStaff(account.role)) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không có quyền truy cập quản trị.' },
        { status: 403 }
      );
    }

    const sessionData = {
      id: account.id,
      email: cleanEmail,
      full_name: account.name,
      role: account.role,
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xác thực đăng nhập.' },
      { status: 500 }
    );
  }
}

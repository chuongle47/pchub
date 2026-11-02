import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất thành công' });
  response.cookies.delete('pchub_admin_session');
  return response;
}

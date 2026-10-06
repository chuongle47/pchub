import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '@/lib/wallet-service';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('nks_token')?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
    request.nextUrl.searchParams.get('token') || '';

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Chưa đăng nhập hoặc token không hợp lệ' },
      { status: 401 }
    );
  }

  const result = await WalletService.getWallet(token);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const token = body.access_token ||
    request.cookies.get('nks_token')?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Chưa đăng nhập hoặc token không hợp lệ' },
      { status: 401 }
    );
  }

  const result = await WalletService.getWallet(token, body.currency || 'VND');
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '@/lib/wallet-service';

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

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json(
      { success: false, message: 'Số tiền nạp vào ví không hợp lệ' },
      { status: 400 }
    );
  }

  const result = await WalletService.deposit(token, amount, body.currency || 'VND');
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

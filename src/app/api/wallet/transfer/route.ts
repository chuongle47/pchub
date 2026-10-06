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

  const ruser_id = body.ruser_id || body.receiver_id || body.receiver_wallet_code;
  if (!ruser_id) {
    return NextResponse.json(
      { success: false, message: 'Vui lòng nhập ID hoặc mã ví tài khoản người nhận' },
      { status: 400 }
    );
  }

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json(
      { success: false, message: 'Số tiền chuyển không hợp lệ' },
      { status: 400 }
    );
  }

  const result = await WalletService.transfer(token, {
    ruser_id,
    amount,
    fee: Number(body.fee) || 0,
    currency: body.currency || 'VNĐ',
    description: body.description || 'Chuyển tiền qua ví điện tử PCHub',
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

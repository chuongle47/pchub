import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export interface OrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note?: string;
    method: string;
    fee: number;
  };
  payment: {
    method: string;
    status: 'pending' | 'paid';
  };
  voucher?: string;
  discount: number;
  total: number;
}

export interface OrderResponse {
  orderId: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export async function POST(req: NextRequest): Promise<NextResponse<OrderResponse>> {
  try {
    // ✅ Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { orderId: '', status: 'error', message: 'Vui lòng đăng nhập để tiếp tục thanh toán' },
        { status: 401 }
      );
    }

    const body: OrderRequest = await req.json();

    // ✅ Validate order data
    if (!body.items?.length) {
      return NextResponse.json(
        { orderId: '', status: 'error', message: 'Giỏ hàng trống' },
        { status: 400 }
      );
    }

    if (!body.shipping?.name || !body.shipping?.phone || !body.shipping?.address) {
      return NextResponse.json(
        { orderId: '', status: 'error', message: 'Thông tin giao hàng không đầy đủ' },
        { status: 400 }
      );
    }

    if (!body.payment?.method) {
      return NextResponse.json(
        { orderId: '', status: 'error', message: 'Vui lòng chọn phương thức thanh toán' },
        { status: 400 }
      );
    }

    // ✅ Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ✅ TODO: Save order to database
    // const order = await saveOrderToDatabase({
    //   orderId,
    //   userId: user.id,
    //   ...body
    // });

    // ✅ TODO: Process payment based on method
    // if (body.payment.method === 'vnpay') {
    //   const paymentUrl = await initiateVNPayment(orderId, body.total);
    //   return NextResponse.json({
    //     orderId,
    //     status: 'success',
    //     message: 'Đơn hàng tạo thành công',
    //     data: { paymentUrl }
    //   });
    // }

    // ✅ Return success
    return NextResponse.json({
      orderId,
      status: 'success',
      message: 'Đơn hàng của bạn đã được tiếp nhận',
      data: { orderId, userId: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { orderId: '', status: 'error', message: 'Lỗi xử lý đơn hàng. Vui lòng thử lại' },
      { status: 500 }
    );
  }
}

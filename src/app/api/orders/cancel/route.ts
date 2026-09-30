import { NextRequest, NextResponse } from 'next/server';
import { cancelSbuyWooCommerceOrder } from '@/lib/sbuy';

export async function POST(req: NextRequest) {
  try {
    const { orderId, wooOrderId, reason } = await req.json();

    if (!orderId && !wooOrderId) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin đơn hàng cần hủy' }, { status: 400 });
    }

    let targetWooId = wooOrderId;
    if (!targetWooId && orderId) {
      const numericMatch = String(orderId).match(/^ORD-(\d+)$/);
      if (numericMatch) {
        targetWooId = parseInt(numericMatch[1], 10);
      }
    }

    if (targetWooId) {
      const result = await cancelSbuyWooCommerceOrder(targetWooId, reason);
      if (!result.success) {
        console.warn('WooCommerce cancel note:', result.error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      orderId,
      status: 'cancelled',
      statusLabel: 'Đã hủy'
    });
  } catch (err: any) {
    console.error('Order cancellation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const {
      customer_name,
      phone,
      email,
      shipping_address,
      subtotal,
      shipping_fee = 0,
      discount = 0,
      tax = 0,
      total,
      payment_method = 'cod',
      note = '',
      items = [],
      user_id = null,
    } = body;

    if (!customer_name || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin người nhận hoặc giỏ hàng trống' },
        { status: 400 }
      );
    }

    // 1. Prepare Order and Items Payload for Atomic RPC
    const p_order = {
      user_id: user_id || null,
      customer_name,
      phone,
      email: email || null,
      shipping_address,
      subtotal: Number(subtotal || 0),
      shipping_fee: Number(shipping_fee || 0),
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      total: Number(total || 0),
      payment_method,
      payment_status: 'pending',
      note,
    };

    const p_items = items.map((i: any) => ({
      product_id: i.product_id || i.id,
      name_snapshot: i.name,
      sku_snapshot: i.sku || null,
      price_snapshot: Number(i.price || 0),
      quantity: Number(i.quantity || 1),
    }));

    // 2. Call Atomic RPC Function in Supabase
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_order_atomic',
      {
        p_order,
        p_items,
      }
    );

    if (rpcError) {
      console.error('[Supabase Order Creation Error]:', rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 400 }
      );
    }

    // 3. Send email confirmation if email provided
    if (email) {
      sendOrderConfirmationEmail({
        orderCode: rpcResult.order_code,
        customerName: customer_name,
        customerEmail: email,
        total: Number(total),
        items,
        shippingAddress: shipping_address,
      }).catch((err) => console.error('Send email error:', err));
    }

    return NextResponse.json({
      success: true,
      order_id: rpcResult.order_id,
      order_code: rpcResult.order_code,
      message: 'Đặt hàng thành công!',
    });
  } catch (err: any) {
    console.error('[Order Creation Exception]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
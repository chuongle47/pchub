import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const customer_name = body.customer_name || body.customer?.name || body.buyer?.name || '';
    const phone = body.phone || body.customer?.phone || body.buyer?.phone || '';
    const email = body.email || body.customer?.email || body.buyer?.email || null;
    
    let shipping_address = body.shipping_address;
    if (!shipping_address && body.customer) {
      const parts = [body.customer.address, body.customer.ward, body.customer.district, body.customer.province].filter(Boolean);
      shipping_address = parts.join(', ');
    }
    if (!shipping_address) {
      shipping_address = 'Địa chỉ giao hàng';
    }

    const subtotal = Number(body.subtotal || body.totalPrice || 0);
    const shipping_fee = Number(body.shipping_fee ?? body.shippingFee ?? 0);
    const discount = Number(body.discount ?? body.voucherDiscount ?? 0);
    const tax = Number(body.tax ?? 0);
    const total = Number(body.total || (subtotal + shipping_fee - discount));
    const payment_method = body.payment_method || body.paymentMethod || 'cod';
    const note = body.note || body.customer?.note || '';
    const items = body.items || [];
    const user_id = body.user_id || null;

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
      shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
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
      name_snapshot: i.name || i.product?.name || 'Sản phẩm',
      sku_snapshot: i.sku || i.product?.sku || null,
      price_snapshot: Number(i.price || i.product?.price || 0),
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
      console.warn('RPC create_order_atomic error, falling back to direct table insert:', rpcError.message);
      
      // Fallback: Direct table insert
      const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const { data: directOrder, error: directError } = await supabase
        .from('orders')
        .insert({
          code: orderCode,
          order_number: orderCode,
          user_id: user_id || null,
          customer_name,
          phone,
          email,
          customer_email: email,
          shipping_address,
          subtotal,
          shipping_fee,
          discount,
          tax,
          total,
          total_amount: total,
          payment_method,
          payment_status: 'pending',
          status: 'pending',
          note,
        })
        .select('id, code')
        .single();

      if (directError) {
        console.error('Direct order insert error:', directError);
        return NextResponse.json({ success: false, error: directError.message }, { status: 500 });
      }

      // Insert order items
      if (directOrder && p_items.length > 0) {
        const orderItemsToInsert = p_items.map((it: any) => ({
          order_id: directOrder.id,
          product_id: it.product_id && it.product_id.length === 36 ? it.product_id : null,
          name_snapshot: it.name_snapshot,
          sku_snapshot: it.sku_snapshot,
          price_snapshot: it.price_snapshot,
          quantity: it.quantity,
          subtotal: it.price_snapshot * it.quantity,
        }));
        await supabase.from('order_items').insert(orderItemsToInsert);
      }

      return NextResponse.json({
        success: true,
        orderId: directOrder.code,
        order: directOrder,
      });
    }

    // 3. Gửi email xác nhận bất đồng bộ (nếu có email)
    if (email && rpcResult) {
      try {
        await sendOrderConfirmationEmail({
          customerName: customer_name,
          customerEmail: email,
          orderCode: rpcResult.code || String(rpcResult.id),
          total: total,
          paymentMethod: payment_method,
          shippingAddress: shipping_address,
          items: p_items.map((i: any) => ({
            name: i.name_snapshot,
            quantity: i.quantity,
            price: i.price_snapshot,
          })),
        });
      } catch (emailErr) {
        console.error('Send confirmation email warning:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: rpcResult?.code || rpcResult?.id,
      order: rpcResult,
    });
  } catch (err: any) {
    console.error('Order creation exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

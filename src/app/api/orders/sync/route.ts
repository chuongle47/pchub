import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/orders/sync?email=user@email.com&phone=0123456789
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get('email') || '').toLowerCase().trim();
    const phone = (searchParams.get('phone') || '').replace(/\D/g, '');

    const supabase = await createClient();

    // 1. Kiểm tra session hiện tại
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        code,
        customer_name,
        email,
        customer_email,
        phone,
        shipping_address,
        subtotal,
        shipping_fee,
        discount,
        total,
        total_amount,
        payment_method,
        payment_status,
        status,
        note,
        created_at,
        items:order_items(
          id,
          product_id,
          name_snapshot,
          sku_snapshot,
          price_snapshot,
          quantity,
          subtotal
        )
      `)
      .order('created_at', { ascending: false });

    if (user?.id) {
      query = query.or(`user_id.eq.${user.id},email.ilike.%${email || user.email}%,phone.eq.${phone || ''}`);
    } else if (email && phone) {
      query = query.or(`email.ilike.%${email}%,phone.eq.${phone}`);
    } else if (email) {
      query = query.ilike('email', `%${email}%`);
    } else if (phone) {
      query = query.eq('phone', phone);
    } else {
      return NextResponse.json({ success: true, orders: [] });
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Lỗi truy vấn đơn hàng Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mappedOrders = (orders || []).map((o: any) => ({
      id: o.code || o.order_number || o.id,
      code: o.code || o.order_number || o.id,
      date: o.created_at,
      status: o.status,
      statusLabel:
        o.status === 'delivered' ? 'Đã giao hàng' :
        o.status === 'shipping' ? 'Đang giao hàng' :
        o.status === 'confirmed' ? 'Đã xác nhận' :
        o.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý',
      total: Number(o.total || o.total_amount || 0),
      paymentMethod: o.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng',
      shippingAddress: typeof o.shipping_address === 'string' ? o.shipping_address : o.shipping_address?.address || '',
      items: (o.items || []).map((it: any) => ({
        id: it.product_id || it.id,
        name: it.name_snapshot,
        price: Number(it.price_snapshot || 0),
        quantity: Number(it.quantity || 1),
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
    });
  } catch (err: any) {
    console.error('Orders sync API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

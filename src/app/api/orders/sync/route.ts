import { NextRequest, NextResponse } from 'next/server';
import { SBUY_CONFIG } from '@/lib/sbuy';

export const dynamic = 'force-dynamic';

// Map WooCommerce order status → app status
function mapWooStatus(wooStatus: string): { status: string; statusLabel: string } {
  switch (wooStatus) {
    case 'completed':
      return { status: 'delivered', statusLabel: 'Đã giao hàng' };
    case 'processing':
      return { status: 'shipping', statusLabel: 'Đang giao hàng' };
    case 'on-hold':
    case 'pending':
      return { status: 'pending', statusLabel: 'Chờ xác nhận' };
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return { status: 'cancelled', statusLabel: 'Đã hủy' };
    default:
      return { status: 'pending', statusLabel: 'Chờ xác nhận' };
  }
}

// GET /api/orders/sync?email=user@email.com
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // email param kept for compatibility but not used for filtering
    // WooCommerce billing email may differ from user login email

    const authHeader = 'Basic ' + Buffer.from(
      `${SBUY_CONFIG.consumerKey}:${SBUY_CONFIG.consumerSecret}`
    ).toString('base64');

    // Fetch ALL recent orders (no email filter - billing email often differs from login email)
    const res = await fetch(
      `${SBUY_CONFIG.baseUrl}/wp-json/wc/v3/orders?per_page=100&orderby=date&order=desc`,
      {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('WooCommerce orders fetch failed:', res.status, errText);
      return NextResponse.json({ success: false, error: `WooCommerce API ${res.status}` }, { status: 500 });
    }

    const wooOrders: any[] = await res.json();
    if (!Array.isArray(wooOrders)) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Return rich orders with all fields for client sync and display
    const orders = wooOrders.map(o => {
      const mapped = mapWooStatus(o.status);
      const fullName = `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() ||
                       `${o.shipping?.first_name || ''} ${o.shipping?.last_name || ''}`.trim() ||
                       'Khách hàng';
      const address = o.billing?.address_1 || o.shipping?.address_1 || 'Địa chỉ nhận hàng';
      const province = o.billing?.city || o.shipping?.city || 'Hà Nội';
      const district = o.billing?.state || o.shipping?.state || '';
      const ward = o.billing?.address_2 || o.shipping?.address_2 || '';
      const dateFormatted = o.date_created
        ? new Date(o.date_created).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const products = (o.line_items || []).map((li: any) => ({
        id: String(li.product_id || li.id),
        name: li.name || 'Sản phẩm',
        price: li.price ? Math.round(Number(li.price)) : (li.quantity ? Math.round(Number(li.total || 0) / li.quantity) : 0),
        quantity: li.quantity || 1,
        image: li.image?.src || '/images/cpu-box.jpg'
      }));

      return {
        id: `ORD-${o.id}`,
        wooOrderId: o.id,
        date: dateFormatted,
        total: Math.round(parseFloat(o.total || '0')),
        shippingFee: Math.round(parseFloat(o.shipping_total || '0')),
        wooStatus: o.status,
        status: mapped.status,
        statusLabel: mapped.statusLabel,
        paymentMethodLabel: o.payment_method_title || 'Thanh toán online',
        shippingAddress: {
          name: fullName,
          phone: o.billing?.phone || o.shipping?.phone || '',
          email: o.billing?.email || '',
          address,
          province,
          district,
          ward,
          note: o.customer_note || ''
        },
        products,
        productNames: (o.line_items || []).map((li: any) => (li.name || '').toLowerCase().trim()),
        firstProductName: o.line_items?.[0]?.name || ''
      };
    });

    return NextResponse.json({ success: true, orders }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err: any) {
    console.error('Order sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}



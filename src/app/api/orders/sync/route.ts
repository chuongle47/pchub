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

    // Return simplified orders with all product names for accurate matching
    const orders = wooOrders.map(o => ({
      wooOrderId: o.id,
      total: Math.round(parseFloat(o.total || '0')),
      wooStatus: o.status,
      ...mapWooStatus(o.status),
      dateCreated: o.date_created,
      billingEmail: o.billing?.email || '',
      // ALL product names (joined) for matching
      productNames: (o.line_items || []).map((li: any) => (li.name || '').toLowerCase().trim()),
      firstProductName: o.line_items?.[0]?.name || '',
    }));

    return NextResponse.json({ success: true, orders }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err: any) {
    console.error('Order sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


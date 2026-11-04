import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id = body.order_id || body.orderId || body.id;
    const reason = body.reason || 'Khách hàng hủy đơn hàng';

    if (!order_id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn hàng cần hủy' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if order_id is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(order_id).trim());

    // 1. Try to find the order in Supabase
    let matchedOrder: any = null;

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', order_id)
        .maybeSingle();
      matchedOrder = data;
    }

    if (!matchedOrder) {
      // Find by code (e.g. ORD-1793766414576)
      const { data } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('code', String(order_id).trim())
        .maybeSingle();
      matchedOrder = data;
    }

    if (!matchedOrder && body.wooOrderId) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('woo_order_id', body.wooOrderId)
        .maybeSingle();
      matchedOrder = data;
    }

    // 2. If matched in Supabase, update status and restore stock
    if (matchedOrder) {
      // Try atomic RPC first
      const { error: rpcErr } = await supabaseAdmin.rpc('cancel_order_atomic', {
        p_order_id: matchedOrder.id,
        p_actor_id: user?.id || null,
        p_reason: reason,
      });

      if (rpcErr) {
        console.warn('RPC cancel_order_atomic fallback to direct update:', rpcErr.message);
        // Fallback: direct update
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchedOrder.id);
      }

      // Record in status history if table exists
      try {
        await supabaseAdmin.from('order_status_history').insert({
          order_id: matchedOrder.id,
          status: 'cancelled',
          note: reason,
          changed_by: user?.id || null,
        });
      } catch (e) {
        // Non-fatal
      }
    }

    // Return success response compatible with frontend
    return NextResponse.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      orderId: order_id,
      order_id,
      status: 'cancelled',
    });
  } catch (err: any) {
    console.error('Cancel order API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Lỗi khi hủy đơn hàng' }, { status: 500 });
  }
}

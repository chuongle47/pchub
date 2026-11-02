import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { order_id, reason = 'Khách hàng hủy đơn hàng' } = await req.json();
    if (!order_id) {
      return NextResponse.json({ success: false, error: 'Thiếu order_id' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: result, error } = await supabase.rpc('cancel_order_atomic', {
      p_order_id: order_id,
      p_actor_id: user?.id || null,
      p_reason: reason,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
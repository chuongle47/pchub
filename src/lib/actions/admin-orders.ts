'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';

// 1. UPDATE ORDER STATUS (WITH AUTO STOCK RESTORE ON CANCEL)
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  note?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If cancelling order, use atomic RPC to restore inventory safely
  if (newStatus === 'cancelled') {
    const { data: result, error: rpcErr } = await supabase.rpc('cancel_order_atomic', {
      p_order_id: orderId,
      p_actor_id: user?.id || null,
      p_reason: note || 'Quản trị viên hủy đơn hàng',
    });

    if (rpcErr) {
      throw new Error(rpcErr.message);
    }
  } else {
    // Regular status update
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) throw new Error(updateErr.message);

    // Insert history log
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      note: note || `Đổi trạng thái sang ${newStatus}`,
      changed_by: user?.id || null,
    });
  }

  // Fetch order info to send email notification
  const { data: order } = await supabase
    .from('orders')
    .select('code, customer_name, email')
    .eq('id', orderId)
    .single();

  if (order?.email) {
    await sendOrderStatusUpdateEmail({
      orderCode: order.code,
      customerName: order.customer_name,
      customerEmail: order.email,
      status: newStatus,
      note,
      total: 0,
      items: [],
      shippingAddress: '',
    });
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin');
  return { success: true };
}

// 2. UPDATE PAYMENT STATUS
export async function updatePaymentStatusAction(
  orderId: string,
  newPaymentStatus: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { success: true };
}

// 3. UPDATE ORDER NOTE
export async function updateOrderNoteAction(orderId: string, note: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({
      note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

// 4. SHIPPING ZONE ACTIONS
export async function createShippingZoneAction(data: {
  name: string;
  provinces: string[];
  fee: number;
  free_from?: number | null;
  is_active: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('shipping_zones').insert(data);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  return { success: true };
}

export async function updateShippingZoneAction(
  id: string,
  data: {
    name: string;
    provinces: string[];
    fee: number;
    free_from?: number | null;
    is_active: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from('shipping_zones').update(data).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  return { success: true };
}

export async function deleteShippingZoneAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  return { success: true };
}

// 5. UPDATE TAX SETTINGS
export async function updateTaxSettingsAction(vatPercentage: number) {
  const supabase = await createClient();

  const { error } = await supabase.from('settings').upsert({
    key: 'general',
    value: { vat_percentage: vatPercentage },
    description: 'Cấu hình thuế VAT bán lẻ',
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  return { success: true };
}
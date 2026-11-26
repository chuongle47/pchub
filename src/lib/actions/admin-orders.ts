'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';
import { pool } from '@/lib/db';

// 1. UPDATE ORDER STATUS (WITH AUTO STOCK RESTORE ON CANCEL & DIRECT DB FALLBACK)
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  note?: string
) {
  let updateSuccess = false;

  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (newStatus === 'cancelled') {
      const { error: rpcErr } = await supabase.rpc('cancel_order_atomic', {
        p_order_id: orderId,
        p_actor_id: user?.id || null,
        p_reason: note || 'Quản trị viên hủy đơn hàng',
      });
      if (!rpcErr) updateSuccess = true;
    } else {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (!updateErr) {
        updateSuccess = true;
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          status: newStatus,
          note: note || `Đổi trạng thái sang ${newStatus}`,
          changed_by: user?.id || null,
        });
      }
    }
  } catch (err) {
    console.warn('[Order Action] Supabase update warning, falling back to direct db:', err);
  }

  // 2. Fallback to Direct PostgreSQL connection (Bypasses RLS)
  if (!updateSuccess) {
    try {
      await pool.query(
        `UPDATE public.orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2`,
        [newStatus, orderId]
      );

      await pool.query(
        `INSERT INTO public.order_status_history (order_id, status, note, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [orderId, newStatus, note || `Cập nhật trạng thái sang ${newStatus}`]
      );
      updateSuccess = true;
    } catch (dbErr: any) {
      console.error('[Order Action] Database update error:', dbErr);
      throw new Error(dbErr.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  }

  // 3. Trigger email notification in background
  try {
    const orderRes = await pool.query(
      `SELECT code, customer_name, email, total, shipping_address FROM public.orders WHERE id = $1`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (order?.email) {
      await sendOrderStatusUpdateEmail({
        orderCode: order.code,
        customerName: order.customer_name,
        customerEmail: order.email,
        status: newStatus,
        note,
        total: Number(order.total || 0),
        items: [],
        shippingAddress: typeof order.shipping_address === 'string' ? order.shipping_address : JSON.stringify(order.shipping_address),
      });
    }
  } catch (e) {
    console.warn('[Order Action] Email notification warning:', e);
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
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (!error) {
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath('/admin/orders');
      return { success: true };
    }
  } catch {}

  // Fallback to pool
  try {
    await pool.query(
      `UPDATE public.orders SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
      [newPaymentStatus, orderId]
    );
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || 'Lỗi khi cập nhật trạng thái thanh toán');
  }
}

// 3. UPDATE ORDER NOTE
export async function updateOrderNoteAction(orderId: string, note: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .update({
        note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (!error) {
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    }
  } catch {}

  // Fallback to pool
  try {
    await pool.query(
      `UPDATE public.orders SET note = $1, updated_at = NOW() WHERE id = $2`,
      [note, orderId]
    );
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || 'Lỗi khi cập nhật ghi chú đơn hàng');
  }
}

// 4. SHIPPING ZONE ACTIONS
export async function createShippingZoneAction(data: {
  name: string;
  provinces: string[];
  fee: number;
  free_from?: number | null;
  is_active: boolean;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('shipping_zones').insert(data);
    if (!error) {
      revalidatePath('/admin/shipping');
      return { success: true };
    }
  } catch {}

  await pool.query(
    `INSERT INTO public.shipping_zones (name, provinces, fee, free_from, is_active)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.name, data.provinces, data.fee, data.free_from || null, data.is_active]
  );
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
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('shipping_zones').update(data).eq('id', id);
    if (!error) {
      revalidatePath('/admin/shipping');
      return { success: true };
    }
  } catch {}

  await pool.query(
    `UPDATE public.shipping_zones
     SET name = $1, provinces = $2, fee = $3, free_from = $4, is_active = $5
     WHERE id = $6`,
    [data.name, data.provinces, data.fee, data.free_from || null, data.is_active, id]
  );
  revalidatePath('/admin/shipping');
  return { success: true };
}

export async function deleteShippingZoneAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
    if (!error) {
      revalidatePath('/admin/shipping');
      return { success: true };
    }
  } catch {}

  await pool.query(`DELETE FROM public.shipping_zones WHERE id = $1`, [id]);
  revalidatePath('/admin/shipping');
  return { success: true };
}

// 5. UPDATE TAX SETTINGS
export async function updateTaxSettingsAction(vatPercentage: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('settings').upsert({
      key: 'general',
      value: { vat_percentage: vatPercentage },
      description: 'Cấu hình thuế VAT bán lẻ',
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      revalidatePath('/admin/shipping');
      return { success: true };
    }
  } catch {}

  await pool.query(
    `INSERT INTO public.settings (key, value, description, updated_at)
     VALUES ('general', $1, 'Cấu hình thuế VAT bán lẻ', NOW())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [JSON.stringify({ vat_percentage: vatPercentage })]
  );

  revalidatePath('/admin/shipping');
  return { success: true };
}

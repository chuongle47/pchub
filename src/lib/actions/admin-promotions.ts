'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================================================
// FLASH SALES ACTIONS
// ============================================================================

export async function createFlashSaleAction(
  saleData: {
    name: string;
    banner_url?: string | null;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  },
  items: {
    product_id: string;
    sale_price: number;
    quantity_limit: number;
  }[]
) {
  const supabase = await createClient();

  if (!saleData.name || !saleData.starts_at || !saleData.ends_at) {
    throw new Error('Vui lòng nhập tên chiến dịch và khoảng thời gian');
  }

  const { data: sale, error: saleErr } = await supabase
    .from('flash_sales')
    .insert(saleData)
    .select('id')
    .single();

  if (saleErr) throw new Error(saleErr.message);

  if (items.length > 0) {
    const itemsPayload = items.map((i) => ({
      sale_id: sale.id,
      product_id: i.product_id,
      sale_price: Number(i.sale_price),
      quantity_limit: Number(i.quantity_limit),
      sold: 0,
    }));

    const { error: itemsErr } = await supabase.from('flash_sale_items').insert(itemsPayload);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  revalidatePath('/admin/flash-sales');
  revalidatePath('/');
  return { success: true, id: sale.id };
}

export async function updateFlashSaleAction(
  id: string,
  saleData: {
    name: string;
    banner_url?: string | null;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  },
  items: {
    product_id: string;
    sale_price: number;
    quantity_limit: number;
  }[]
) {
  const supabase = await createClient();

  const { error: saleErr } = await supabase
    .from('flash_sales')
    .update(saleData)
    .eq('id', id);

  if (saleErr) throw new Error(saleErr.message);

  // Re-insert items
  await supabase.from('flash_sale_items').delete().eq('sale_id', id);

  if (items.length > 0) {
    const itemsPayload = items.map((i) => ({
      sale_id: id,
      product_id: i.product_id,
      sale_price: Number(i.sale_price),
      quantity_limit: Number(i.quantity_limit),
      sold: 0,
    }));
    await supabase.from('flash_sale_items').insert(itemsPayload);
  }

  revalidatePath('/admin/flash-sales');
  revalidatePath(`/admin/flash-sales/${id}`);
  revalidatePath('/');
  return { success: true };
}

export async function deleteFlashSaleAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('flash_sales').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/flash-sales');
  revalidatePath('/');
  return { success: true };
}

// ============================================================================
// COUPONS ACTIONS
// ============================================================================

export async function createCouponAction(data: {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order?: number;
  max_discount?: number | null;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from('coupons').insert({
    ...data,
    code: data.code.trim().toUpperCase(),
    value: Number(data.value),
    min_order: Number(data.min_order || 0),
    max_discount: data.max_discount ? Number(data.max_discount) : null,
    max_uses: data.max_uses ? Number(data.max_uses) : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function updateCouponAction(
  id: string,
  data: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    min_order?: number;
    max_discount?: number | null;
    max_uses?: number | null;
    starts_at?: string | null;
    expires_at?: string | null;
    is_active: boolean;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('coupons')
    .update({
      ...data,
      code: data.code.trim().toUpperCase(),
      value: Number(data.value),
      min_order: Number(data.min_order || 0),
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      max_uses: data.max_uses ? Number(data.max_uses) : null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/coupons');
  return { success: true };
}
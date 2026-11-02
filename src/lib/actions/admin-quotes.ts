'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. CREATE QUOTE
export async function createQuoteAction(
  quoteData: {
    customer_name: string;
    phone: string;
    email?: string | null;
    note?: string | null;
  },
  items: {
    product_id: string;
    category_id: string;
    quantity: number;
    unit_price: number;
  }[]
) {
  const supabase = await createClient();

  if (!quoteData.customer_name || !quoteData.phone || items.length === 0) {
    throw new Error('Vui lòng điền thông tin khách hàng và chọn ít nhất 1 linh kiện');
  }

  const quoteCode = `BG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);

  // Insert Quote
  const { data: quote, error: quoteErr } = await supabase
    .from('quotes')
    .insert({
      code: quoteCode,
      customer_name: quoteData.customer_name.trim(),
      phone: quoteData.phone.trim(),
      email: quoteData.email?.trim() || null,
      note: quoteData.note?.trim() || null,
      status: 'new',
      total,
    })
    .select('id')
    .single();

  if (quoteErr) throw new Error(quoteErr.message);

  // Insert Quote Items
  const quoteItemsPayload = items.map((i) => ({
    quote_id: quote.id,
    product_id: i.product_id,
    category_id: i.category_id,
    quantity: Number(i.quantity || 1),
    unit_price: Number(i.unit_price || 0),
  }));

  const { error: itemsErr } = await supabase.from('quote_items').insert(quoteItemsPayload);
  if (itemsErr) throw new Error(itemsErr.message);

  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
  return { success: true, id: quote.id, code: quoteCode };
}

// 2. UPDATE QUOTE STATUS & ASSIGNMENT
export async function updateQuoteStatusAction(
  quoteId: string,
  status: string,
  assignedTo?: string | null,
  note?: string | null
) {
  const supabase = await createClient();

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (assignedTo !== undefined) updates.assigned_to = assignedTo || null;
  if (note !== undefined) updates.note = note || null;

  const { error } = await supabase.from('quotes').update(updates).eq('id', quoteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
  return { success: true };
}

// 3. CONVERT QUOTE TO ORDER (1-Click Order Creation with Atomic Stock Decrement)
export async function convertQuoteToOrderAction(quoteId: string) {
  const supabase = await createClient();

  // Fetch Quote and items
  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .select('*, items:quote_items(*, product:products(name, sku, price, stock))')
    .eq('id', quoteId)
    .single();

  if (qErr || !quote) throw new Error('Không tìm thấy thông tin báo giá');

  const p_order = {
    customer_name: quote.customer_name,
    phone: quote.phone,
    email: quote.email,
    shipping_address: { address: 'Chuyển đổi từ Báo giá ' + quote.code },
    subtotal: quote.total,
    shipping_fee: 0,
    discount: 0,
    tax: 0,
    total: quote.total,
    payment_method: 'cod',
    payment_status: 'pending',
    note: `Đơn hàng tạo từ Báo giá #${quote.code}. ${quote.note || ''}`,
  };

  const p_items = (quote.items || []).map((i: any) => ({
    product_id: i.product_id,
    name_snapshot: i.product?.name || 'Linh kiện PC',
    sku_snapshot: i.product?.sku || null,
    price_snapshot: Number(i.unit_price),
    quantity: Number(i.quantity),
  }));

  // Call atomic RPC
  const { data: rpcRes, error: rpcErr } = await supabase.rpc('create_order_atomic', {
    p_order,
    p_items,
  });

  if (rpcErr) throw new Error(rpcErr.message);

  // Mark quote as 'won'
  await supabase.from('quotes').update({ status: 'won' }).eq('id', quoteId);

  revalidatePath('/admin/orders');
  revalidatePath('/admin/quotes');
  revalidatePath(`/admin/quotes/${quoteId}`);
  return { success: true, order_id: rpcRes.order_id, order_code: rpcRes.order_code };
}

// 4. COMPATIBILITY RULES ACTIONS
export async function createCompatRuleAction(data: {
  rule_type: string;
  source_category: string;
  target_category: string;
  config: Record<string, any>;
  is_active: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('compat_rules').insert(data);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/compat-rules');
  return { success: true };
}

export async function updateCompatRuleAction(
  id: string,
  data: {
    rule_type: string;
    source_category: string;
    target_category: string;
    config: Record<string, any>;
    is_active: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from('compat_rules').update(data).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/compat-rules');
  return { success: true };
}

export async function deleteCompatRuleAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('compat_rules').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/compat-rules');
  return { success: true };
}

// 5. COMMUNITY BUILDS MODERATION
export async function moderateCommunityBuildAction(id: string, status: 'approved' | 'hidden' | 'pending') {
  const supabase = await createClient();
  const { error } = await supabase.from('community_builds').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/compat-rules');
  revalidatePath('/community');
  return { success: true };
}
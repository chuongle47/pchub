import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderDetailView } from '@/components/admin/orders/OrderDetailView';
import { SAMPLE_ORDERS } from '@/lib/admin-sample-data';
import { pool } from '@/lib/db';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  console.log('[OrderDetail Page] resolved id:', id);
  const supabase = await createClient();

  let order: any = null;
  let items: any[] = [];
  let history: any[] = [];

  // 1. Try fetching from Supabase / PostgreSQL
  try {
    const { data: dbOrder } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${id},code.eq.${id}`)
      .single();

    if (dbOrder) {
      order = dbOrder;
    }
  } catch (err) {
    console.warn('[OrderDetail] Supabase fetch error, trying pool:', err);
  }

  if (!order) {
    try {
      const res = await pool.query(
        `SELECT * FROM public.orders WHERE id::text = $1 OR code = $1 LIMIT 1`,
        [id]
      );
      if (res.rows.length > 0) {
        order = res.rows[0];
      }
    } catch (e) {
      console.warn('[OrderDetail] Pool query warning:', e);
    }
  }

  // 2. Fetch items & history if order found
  if (order) {
    try {
      const itemsRes = await pool.query(
        `SELECT oi.*, p.name as prod_name, p.images as prod_images, p.sku as prod_sku
         FROM public.order_items oi
         LEFT JOIN public.products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [order.id]
      );

      items = itemsRes.rows.map((r: any) => ({
        id: r.id,
        product_id: r.product_id,
        name: r.name_snapshot || r.prod_name || 'Linh kiện PC',
        sku: r.sku_snapshot || r.prod_sku || 'SKU-UNKNOWN',
        price: Number(r.price_snapshot || 0),
        quantity: Number(r.quantity || 1),
        image: (r.prod_images && r.prod_images[0]) || '/images/cpu-box.jpg',
      }));

      const histRes = await pool.query(
        `SELECT * FROM public.order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );
      history = histRes.rows;
    } catch (e) {
      console.warn('[OrderDetail] Items/History query warning:', e);
    }
  }

  // 3. Fallback to SAMPLE_ORDERS for demo orders (e.g. ord-sample-1, ORD-0047, etc.)
  if (!order) {
    const sample = SAMPLE_ORDERS.find(
      (s: any) => s.id === id || s.code === id || id.toLowerCase().includes(s.code.toLowerCase())
    );

    if (sample) {
      order = {
        id: sample.id,
        code: sample.code,
        customer_name: sample.customer_name,
        phone: sample.phone,
        email: sample.email,
        shipping_address: {
          address: 'Số 18, Ngõ 92 Nguyễn Khánh Toàn',
          ward: 'Dịch Vọng',
          district: 'Cầu Giấy',
          province: 'Hà Nội',
        },
        subtotal: sample.total,
        shipping_fee: 30000,
        discount: 0,
        tax: 0,
        total: sample.total + 30000,
        payment_method: sample.payment_method || 'cod',
        payment_status: sample.payment_status || 'pending',
        status: sample.status || 'pending',
        note: 'Giao hàng giờ hành chính, gọi điện trước khi giao.',
        created_at: sample.created_at || new Date().toISOString(),
        updated_at: sample.created_at || new Date().toISOString(),
      };

      items = [
        {
          id: `item-${sample.id}-1`,
          product_id: 'prod-i9',
          name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng, LGA 1700)',
          sku: 'BX8071514900K',
          price: Math.round(sample.total * 0.6),
          quantity: 1,
          image: '/images/cpu-box.jpg',
        },
        {
          id: `item-${sample.id}-2`,
          product_id: 'prod-rog-4090',
          name: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC Edition',
          sku: 'ROG-STRIX-RTX4090-O24G',
          price: Math.round(sample.total * 0.4),
          quantity: 1,
          image: '/images/gpu-strix.jpg',
        },
      ];

      history = [
        {
          id: `hist-1`,
          order_id: sample.id,
          status: 'pending',
          note: 'Khách hàng tạo đơn hàng trực tuyến thành công',
          created_at: sample.created_at || new Date().toISOString(),
        },
      ];
    }
  }

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailView
      order={order}
      items={items}
      history={history}
    />
  );
}

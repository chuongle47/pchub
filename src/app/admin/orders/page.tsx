import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { OrderDataTable } from '@/components/admin/orders/OrderDataTable';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || '';
  const status = params.status || '';
  const payment = params.payment || '';
  const page = Math.max(Number(params.page || 1), 1);
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let orders: any[] = [];
  let totalCount = 0;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_orders', {
      p_search: q,
      p_status: status,
      p_payment: payment,
      p_limit: pageSize,
      p_offset: from,
    });

    if (!rpcError && rpcData) {
      orders = rpcData.orders || [];
      totalCount = rpcData.total || 0;
    } else {
      let query = supabase
        .from('orders')
        .select(
          'id, code, customer_name, phone, email, total, payment_method, payment_status, status, created_at',
          { count: 'exact' }
        );

      if (q) {
        query = query.or(`code.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (payment) {
        query = query.eq('payment_status', payment);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data: fallbackOrders, count: fallbackCount, error } = await query;
      if (error) {
        console.error('Error fetching admin orders:', error);
      }
      orders = fallbackOrders || [];
      totalCount = fallbackCount || 0;
    }
  } catch (err) {
    console.error('Error in AdminOrdersPage:', err);
  }

  return (
    <OrderDataTable
      orders={orders || []}
      totalCount={totalCount || 0}
      page={page}
      pageSize={pageSize}
    />
  );
}
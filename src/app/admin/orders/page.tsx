import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { OrderDataTable } from '@/components/admin/orders/OrderDataTable';
import { SAMPLE_ORDERS } from '@/lib/admin-sample-data';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    page?: string;
    test?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || '';
  const status = params.status || '';
  const payment = params.payment || '';
  const page = Math.max(Number(params.page || 1), 1);
  const showTest = params.test === '1';
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let orders: any[] = [];
  let totalCount = 0;
  const statusCounts: Record<string, number> = {
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  try {
    // 1. Fetch live status counts
    const { data: statusRows } = await supabase
      .from('orders')
      .select('status');

    if (statusRows && statusRows.length > 0) {
      statusCounts.all = statusRows.length;
      statusRows.forEach((r: any) => {
        if (r.status in statusCounts) {
          statusCounts[r.status] += 1;
        }
      });
    }

    // 2. Fetch paginated orders with filters
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

    const { data: fetchedOrders, count, error } = await query;
    if (!error && fetchedOrders) {
      orders = fetchedOrders;
      totalCount = count || 0;
    }

    // 3. Fallback to sample orders if database is empty
    if (orders.length === 0 && !q && !status && !payment) {
      orders = SAMPLE_ORDERS;
      totalCount = SAMPLE_ORDERS.length;
      statusCounts.all = SAMPLE_ORDERS.length;
      SAMPLE_ORDERS.forEach((o: any) => {
        if (o.status in statusCounts) {
          statusCounts[o.status] += 1;
        }
      });
    }
  } catch (err) {
    console.error('Error in AdminOrdersPage:', err);
    if (!orders || orders.length === 0) {
      orders = SAMPLE_ORDERS;
      totalCount = SAMPLE_ORDERS.length;
      statusCounts.all = SAMPLE_ORDERS.length;
      SAMPLE_ORDERS.forEach((o: any) => {
        if (o.status in statusCounts) {
          statusCounts[o.status] += 1;
        }
      });
    }
  }

  return (
    <OrderDataTable
      orders={orders || []}
      totalCount={totalCount || 0}
      statusCounts={statusCounts}
      page={page}
      pageSize={pageSize}
      showTest={showTest}
    />
  );
}

import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderDetailView } from '@/components/admin/orders/OrderDetailView';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: order, error },
    { data: items },
    { data: history }
  ] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
    supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: false }),
  ]);

  if (error || !order) {
    notFound();
  }

  return (
    <OrderDetailView
      order={order}
      items={items || []}
      history={history || []}
    />
  );
}
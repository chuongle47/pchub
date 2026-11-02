import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuoteDetailView } from '@/components/admin/quotes/QuoteDetailView';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminQuoteDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: quote, error },
    { data: items },
    { data: staffList }
  ] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', id).single(),
    supabase.from('quote_items').select('*, product:products(name, sku, price), category:categories(name)').eq('quote_id', id),
    supabase.from('profiles').select('id, full_name').in('role', ['admin', 'manager', 'support']),
  ]);

  if (error || !quote) {
    notFound();
  }

  const formattedItems = (items || []).map((i: any) => ({
    ...i,
    product: Array.isArray(i.product) ? i.product[0] : i.product,
    category: Array.isArray(i.category) ? i.category[0] : i.category,
  }));

  return (
    <QuoteDetailView
      quote={quote}
      items={formattedItems}
      staffList={staffList || []}
    />
  );
}
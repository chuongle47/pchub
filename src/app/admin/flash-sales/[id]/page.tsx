import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FlashSaleForm } from '@/components/admin/promotions/FlashSaleForm';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFlashSalePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: sale, error },
    { data: items },
    { data: products }
  ] = await Promise.all([
    supabase.from('flash_sales').select('*').eq('id', id).single(),
    supabase.from('flash_sale_items').select('*').eq('sale_id', id),
    supabase.from('products').select('id, name, price, stock').eq('is_active', true).order('name', { ascending: true }),
  ]);

  if (error || !sale) {
    notFound();
  }

  return (
    <FlashSaleForm
      initialData={sale}
      initialItems={items || []}
      allProducts={products || []}
    />
  );
}
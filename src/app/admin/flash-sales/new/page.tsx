import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { FlashSaleForm } from '@/components/admin/promotions/FlashSaleForm';

export const revalidate = 0;

export default async function NewFlashSalePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return <FlashSaleForm allProducts={products || []} />;
}
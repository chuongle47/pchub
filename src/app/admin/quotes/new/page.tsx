import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { QuoteNewForm } from '@/components/admin/quotes/QuoteNewForm';

export const revalidate = 0;

export default async function AdminNewQuotePage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: products }
  ] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('sort_order', { ascending: true }),
    supabase.from('products').select('id, name, price, category_id').eq('is_active', true).order('name', { ascending: true }),
  ]);

  return (
    <QuoteNewForm
      categories={categories || []}
      products={products || []}
    />
  );
}
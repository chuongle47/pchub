import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/products/ProductForm';

export default async function NewProductPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name, slug').order('name', { ascending: true }),
  ]);

  return (
    <ProductForm
      categories={categories || []}
      brands={brands || []}
    />
  );
}
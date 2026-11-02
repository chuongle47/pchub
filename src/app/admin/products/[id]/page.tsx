import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/products/ProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: product, error },
    { data: categories },
    { data: brands }
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name, slug').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name, slug').order('name', { ascending: true }),
  ]);

  if (error || !product) {
    notFound();
  }

  return (
    <ProductForm
      initialData={product}
      categories={categories || []}
      brands={brands || []}
    />
  );
}
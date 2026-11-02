import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductDataTable } from '@/components/admin/products/ProductDataTable';

export const revalidate = 0; // Fresh list for admin

interface Props {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    brand?: string;
    stock?: string;
    sale?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || '';
  const cat = params.cat || '';
  const brand = params.brand || '';
  const stock = params.stock || '';
  const isSale = params.sale === 'true';
  const page = Math.max(Number(params.page || 1), 1);
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. Build Query
  let query = supabase
    .from('products')
    .select(
      'id, name, slug, sku, price, sale_price, stock, is_active, is_hot, images, category:categories(id, name), brand:brands(id, name)',
      { count: 'exact' }
    );

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  }
  if (cat) {
    query = query.eq('category_id', cat);
  }
  if (brand) {
    query = query.eq('brand_id', brand);
  }
  if (stock === 'in_stock') {
    query = query.gt('stock', 0);
  } else if (stock === 'low_stock') {
    query = query.lte('stock', 5).gt('stock', 0);
  } else if (stock === 'out_of_stock') {
    query = query.eq('stock', 0);
  }
  if (isSale) {
    query = query.not('sale_price', 'is', null).gt('sale_price', 0);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  // 2. Fetch data in parallel
  const [
    { data: products, count: totalCount, error },
    { data: categories },
    { data: brands }
  ] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
  ]);

  if (error) {
    console.error('Error fetching admin products:', error);
  }

  const formattedProducts = (products || []).map((p: any) => ({
    ...p,
    category: Array.isArray(p.category) ? p.category[0] : p.category,
    brand: Array.isArray(p.brand) ? p.brand[0] : p.brand,
  }));

  return (
    <ProductDataTable
      products={formattedProducts}
      totalCount={totalCount || 0}
      page={page}
      pageSize={pageSize}
      categories={categories || []}
      brands={brands || []}
    />
  );
}
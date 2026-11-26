import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PromotionHubView } from '@/components/promotions/PromotionHubView';

export const metadata: Metadata = {
  title: 'Khuyến Mãi & Săn Deal Công Nghệ Hot Nhất | PCHub',
  description:
    'Tổng hợp các chương trình khuyến mãi, flash sale, mua 1 tặng 1, mã giảm giá ngày lễ và linh kiện máy tính giảm giá sốc tại PCHub.',
  openGraph: {
    title: 'Khuyến Mãi & Săn Deal Công Nghệ | PCHub',
    description: 'Săn deal linh kiện PC, Build máy tính nhận quà tặng cực khủng và mã giảm giá đến 50%.',
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function KhuyenMaiPage() {
  const supabase = await createClient();

  // Fetch active flash sales and discounted products
  let flashSales: any[] = [];
  let saleProducts: any[] = [];
  let coupons: any[] = [];

  try {
    const [{ data: fsData }, { data: prodData }, { data: cpData }] = await Promise.all([
      supabase
        .from('flash_sales')
        .select('*, items:flash_sale_items(*, product:products(*))')
        .eq('is_active', true)
        .order('ends_at', { ascending: true })
        .limit(6),
      supabase
        .from('products')
        .select('id, name, slug, price, sale_price, images, category_id, brand_id, stock, is_hot, category:categories(name)')
        .not('sale_price', 'is', null)
        .gt('sale_price', 0)
        .eq('is_active', true)
        .order('sale_price', { ascending: true })
        .limit(16),
      supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    flashSales = fsData || [];
    saleProducts = prodData || [];
    coupons = cpData || [];
  } catch (err) {
    console.error('Error loading promotion data:', err);
  }

  return (
    <PromotionHubView
      initialFlashSales={flashSales}
      initialSaleProducts={saleProducts}
      initialCoupons={coupons}
    />
  );
}

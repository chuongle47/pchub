import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { FlashSaleList } from '@/components/admin/promotions/FlashSaleList';

export const revalidate = 0;

export default async function AdminFlashSalesPage() {
  const supabase = await createClient();

  const { data: sales, error } = await supabase
    .from('flash_sales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching flash sales:', error);
  }

  const defaultSales = [
    {
      id: 'fs-default-1',
      name: 'Flash Sale Xả Kho Giờ Vàng - Deal Khủng Linh Kiện Gaming',
      banner_url: '/images/promo-wide.jpg',
      starts_at: new Date(Date.now() - 3600000).toISOString(),
      ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      is_active: true,
      items_count: 12,
    },
  ];

  return <FlashSaleList sales={(sales && sales.length > 0) ? sales : defaultSales} />;
}
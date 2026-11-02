import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CouponManagement } from '@/components/admin/promotions/CouponManagement';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
  }

  return <CouponManagement coupons={coupons || []} />;
}
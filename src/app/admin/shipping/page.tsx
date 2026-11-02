import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ShippingManagement } from '@/components/admin/shipping/ShippingManagement';

export const revalidate = 0;

export default async function AdminShippingPage() {
  const supabase = await createClient();

  const [
    { data: zones, error },
    { data: generalSetting }
  ] = await Promise.all([
    supabase.from('shipping_zones').select('*').order('fee', { ascending: true }),
    supabase.from('settings').select('value').eq('key', 'general').single(),
  ]);

  if (error) {
    console.error('Error fetching shipping zones:', error);
  }

  const taxPercentage = (generalSetting?.value as any)?.vat_percentage ?? 8;

  return (
    <ShippingManagement
      zones={zones || []}
      taxPercentage={Number(taxPercentage)}
    />
  );
}
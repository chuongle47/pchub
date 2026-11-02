import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { BrandManagement } from '@/components/admin/brands/BrandManagement';

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, is_active')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
  }

  return <BrandManagement brands={brands || []} />;
}
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CategoryManagement } from '@/components/admin/categories/CategoryManagement';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, sort_order, is_active')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return <CategoryManagement categories={categories || []} />;
}
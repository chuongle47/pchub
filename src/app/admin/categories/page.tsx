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

  // Deduplicate categories to prevent duplicate storage categories (BUG-03)
  const uniqueCategories: any[] = [];
  const seenSlugs = new Set<string>();
  const seenStorage = new Set<string>();

  for (const cat of categories || []) {
    const isStorage =
      cat.slug === 'storage' ||
      cat.slug === 'ssd-hdd' ||
      cat.slug === 'ssd' ||
      cat.slug === 'hdd' ||
      (cat.name && (cat.name.includes('Ổ Đĩa Cứng') || cat.name.includes('Ổ Cứng')));

    if (isStorage) {
      if (seenStorage.has('storage')) continue;
      seenStorage.add('storage');
      uniqueCategories.push({
        ...cat,
        name: 'SSD / HDD - Ổ Đĩa Cứng',
        slug: 'storage',
      });
      seenSlugs.add(cat.slug);
      continue;
    }

    if (!seenSlugs.has(cat.slug)) {
      seenSlugs.add(cat.slug);
      uniqueCategories.push(cat);
    }
  }

  return <CategoryManagement categories={uniqueCategories} />;
}

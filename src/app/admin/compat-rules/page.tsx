import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CompatRulesManager } from '@/components/admin/compat-rules/CompatRulesManager';

export const revalidate = 0;

export default async function AdminCompatRulesPage() {
  const supabase = await createClient();

  const [
    { data: rules },
    { data: builds },
    { data: products }
  ] = await Promise.all([
    supabase.from('compat_rules').select('*').order('created_at', { ascending: false }),
    supabase.from('community_builds').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, specs, category:categories(slug)').eq('is_active', true),
  ]);

  const formattedProducts = (products || []).map((p: any) => ({
    ...p,
    category: Array.isArray(p.category) ? p.category[0] : p.category,
  }));

  return (
    <CompatRulesManager
      rules={rules || []}
      builds={builds || []}
      products={formattedProducts}
    />
  );
}
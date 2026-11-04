import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { QuoteDataTable } from '@/components/admin/quotes/QuoteDataTable';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || '';
  const status = params.status || '';
  const page = Math.max(Number(params.page || 1), 1);
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let quotes: any[] = [];
  let totalCount = 0;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_quotes', {
      p_search: q,
      p_status: status,
      p_limit: pageSize,
      p_offset: from,
    });

    if (!rpcError && rpcData) {
      quotes = rpcData.quotes || [];
      totalCount = rpcData.total || 0;
    } else {
      let query = supabase
        .from('quotes')
        .select(
          'id, code, customer_name, phone, email, total, status, created_at, assigned_profile:profiles!assigned_to(full_name)',
          { count: 'exact' }
        );

      if (q) {
        query = query.or(`code.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
      }
      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data: fallbackQuotes, count: fallbackCount, error } = await query;
      if (error) {
        console.error('Error fetching admin quotes:', error);
      }
      quotes = fallbackQuotes || [];
      totalCount = fallbackCount || 0;
    }
  } catch (err) {
    console.error('Error in AdminQuotesPage:', err);
  }

  const formattedQuotes = (quotes || []).map((q: any) => ({
    ...q,
    assigned_profile: Array.isArray(q.assigned_profile) ? q.assigned_profile[0] : q.assigned_profile,
  }));

  return (
    <QuoteDataTable
      quotes={formattedQuotes}
      totalCount={totalCount || 0}
      page={page}
      pageSize={pageSize}
    />
  );
}
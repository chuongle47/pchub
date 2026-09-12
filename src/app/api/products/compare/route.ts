import { NextRequest, NextResponse } from 'next/server';
import { getCompareProducts } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const debug = searchParams.get('debug') === '1';

    if (!ids) {
      return NextResponse.json({ error: 'Missing product IDs' }, { status: 400 });
    }

    const idList = ids.split(',').filter(Boolean);

    // Debug mode: expose raw Supabase results
    if (debug) {
      const { data: bySlug, error: slugError } = await supabase
        .from('products')
        .select('id, slug, sku, name')
        .in('slug', idList);
      
      const { data: byId, error: idError } = await supabase
        .from('products')
        .select('id, slug, sku, name')
        .in('id', idList.filter(s => /^[0-9a-f-]{36}$/i.test(s)));

      // Also try a text search of the first id
      const { data: bySku, error: skuError } = await supabase
        .from('products')
        .select('id, slug, sku, name')
        .in('sku', idList);

      return NextResponse.json({
        requested_ids: idList,
        by_slug: { data: bySlug, error: slugError?.message },
        by_id: { data: byId, error: idError?.message },
        by_sku: { data: bySku, error: skuError?.message },
      });
    }

    const result = await getCompareProducts(ids);
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

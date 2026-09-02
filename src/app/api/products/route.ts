import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id') || searchParams.get('category') || undefined;
    const brand_id = searchParams.get('brand_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const slug = searchParams.get('slug') || undefined;
    const idsParam = searchParams.get('ids') || undefined;
    const min_price_str = searchParams.get('min_price');
    const max_price_str = searchParams.get('max_price');
    const sort = searchParams.get('sort') || 'price_asc';
    const page_str = searchParams.get('page');
    const limit_str = searchParams.get('limit');

    const min_price = min_price_str ? parseFloat(min_price_str) : undefined;
    const max_price = max_price_str ? parseFloat(max_price_str) : undefined;
    const page = page_str ? parseInt(page_str, 10) : 1;
    const limit = limit_str ? parseInt(limit_str, 10) : 16;
    const ids = idsParam ? idsParam.split(',').filter(Boolean) : undefined;

    const result = await getProducts({
      category_id,
      brand_id,
      search,
      slug,
      ids,
      min_price,
      max_price,
      sort,
      page,
      limit
    });

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCompareProducts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    if (!ids) {
      return NextResponse.json({ error: 'Missing product IDs' }, { status: 400 });
    }

    const result = await getCompareProducts(ids);
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

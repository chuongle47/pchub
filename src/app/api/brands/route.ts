import { NextRequest, NextResponse } from 'next/server';
import { getBrands } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id') || undefined;
    const brands = await getBrands(category_id);
    return NextResponse.json(brands, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

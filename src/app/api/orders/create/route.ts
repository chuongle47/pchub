import { NextRequest, NextResponse } from 'next/server';
import { createSbuyWooCommerceOrder } from '@/lib/sbuy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createSbuyWooCommerceOrder(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[WooCommerce Order Creation Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

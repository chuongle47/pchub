import { NextResponse } from 'next/server';
import { fetchSbuyWooCommercePaymentGateways, fetchSbuyWooCommerceShippingMethods } from '@/lib/sbuy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [paymentGateways, shippingMethods] = await Promise.all([
      fetchSbuyWooCommercePaymentGateways(),
      fetchSbuyWooCommerceShippingMethods()
    ]);

    return NextResponse.json({
      success: true,
      paymentGateways,
      shippingMethods
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error in checkout-config API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      paymentGateways: [],
      shippingMethods: []
    }, { status: 500 });
  }
}

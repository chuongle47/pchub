import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Lấy phương thức vận chuyển từ bảng shipping_zones Supabase nếu có
    const { data: zones } = await supabase
      .from('shipping_zones')
      .select('id, name, base_fee')
      .eq('is_active', true);

    const shippingMethods = zones && zones.length > 0
      ? zones.map(z => ({
          id: z.id,
          label: z.name,
          fee: Number(z.base_fee),
          desc: 'Giao hàng tận nơi toàn quốc',
        }))
      : [
          { id: 'standard', label: 'Giao hàng tiêu chuẩn (Toàn quốc)', fee: 30000, desc: 'Nhận hàng từ 2 - 4 ngày' },
          { id: 'express', label: 'Giao hàng hỏa tốc 2H (Nội thành)', fee: 50000, desc: 'Nhận hàng trong 2 giờ' },
        ];

    // 2. Phương thức thanh toán chuẩn Supabase
    const paymentGateways = [
      {
        id: 'cod',
        title: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng tại nhà.',
        icon: '💵',
        color: '#16a34a'
      },
      {
        id: 'bacs',
        title: 'Chuyển khoản ngân hàng (VietQR)',
        description: 'Quét mã QR chuyển khoản ngân hàng 24/7.',
        icon: '🏦',
        color: '#2563eb'
      }
    ];

    return NextResponse.json({
      success: true,
      paymentGateways,
      shippingMethods,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error in checkout-config API:', error);
    return NextResponse.json({
      success: true,
      paymentGateways: [
        { id: 'cod', title: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán tiền mặt khi nhận hàng' },
        { id: 'bacs', title: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua số tài khoản ngân hàng' }
      ],
      shippingMethods: [
        { id: 'standard', label: 'Giao hàng tiêu chuẩn', fee: 30000 }
      ]
    });
  }
}

import { NextResponse } from 'next/server';
import { fetchSbuyWooCommerceCoupon } from '@/lib/sbuy';
import { AVAILABLE_VOUCHERS } from '@/lib/vouchers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, totalPrice = 0, shippingFee = 25000 } = body;

    const normalizedCode = (code || '').trim().toUpperCase();
    if (!normalizedCode) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    // 1️⃣ Check local presets first
    const localVoucher = AVAILABLE_VOUCHERS.find(v => v.code === normalizedCode);
    if (localVoucher) {
      if (totalPrice < localVoucher.minOrder) {
        return NextResponse.json({
          success: false,
          error: `Đơn hàng tối thiểu ${localVoucher.minOrder.toLocaleString('vi-VN')}₫ để sử dụng mã ${localVoucher.code}`
        }, { status: 400 });
      }

      let discount = 0;
      if (localVoucher.type === 'percent') {
        const raw = Math.round((totalPrice * localVoucher.value) / 100);
        discount = localVoucher.maxDiscount ? Math.min(raw, localVoucher.maxDiscount) : raw;
      } else if (localVoucher.type === 'fixed') {
        discount = Math.min(localVoucher.value, totalPrice);
      }

      return NextResponse.json({
        success: true,
        code: localVoucher.code,
        discount,
        type: localVoucher.type,
        label: localVoucher.name
      });
    }

    // 2️⃣ Query live WooCommerce Coupons REST API
    const wooCoupon = await fetchSbuyWooCommerceCoupon(normalizedCode);
    if (wooCoupon) {
      const minAmount = parseFloat(wooCoupon.minimum_amount || '0');
      if (minAmount > 0 && totalPrice < minAmount) {
        return NextResponse.json({
          success: false,
          error: `Mã ${wooCoupon.code.toUpperCase()} yêu cầu đơn hàng tối thiểu ${minAmount.toLocaleString('vi-VN')}₫`
        }, { status: 400 });
      }

      const amountVal = parseFloat(wooCoupon.amount || '0');
      let discount = 0;
      let label = `Giảm ${amountVal}% từ WooCommerce`;

      if (wooCoupon.discount_type === 'percent') {
        discount = Math.round((totalPrice * amountVal) / 100);
        const maxVal = parseFloat(wooCoupon.maximum_amount || '0');
        if (maxVal > 0) {
          discount = Math.min(discount, maxVal);
        }
        label = `Giảm ${amountVal}% đơn hàng`;
      } else {
        discount = Math.min(amountVal, totalPrice);
        label = `Giảm ${amountVal.toLocaleString('vi-VN')}₫`;
      }

      return NextResponse.json({
        success: true,
        code: wooCoupon.code.toUpperCase(),
        discount,
        type: wooCoupon.discount_type === 'percent' ? 'percent' : 'fixed',
        label
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Voucher validation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Không thể xác thực mã giảm giá. Vui lòng thử lại.'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AVAILABLE_VOUCHERS } from '@/lib/vouchers';

interface CartItemInput {
  id?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
  brand?: string;
  slug?: string;
  product?: any;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, totalPrice = 0, shippingFee = 0, items = [] } = body;

    const normalizedCode = (code || '').trim().toUpperCase();
    if (!normalizedCode) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const orderTotal = Number(totalPrice || 0);
    const ship = Number(shippingFee || 0);

    // 1️⃣ ƯU TIÊN KIỂM TRA TỪ SUPABASE DATABASE (Bảng coupons do Admin quản lý)
    const supabase = await createClient();
    const { data: coupon, error: dbError } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (dbError) {
      console.warn('Lỗi kiểm tra coupons Supabase:', dbError.message);
    }

    if (coupon) {
      const now = new Date();

      // Kiểm tra ngày bắt đầu
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return NextResponse.json({
          success: false,
          error: `Mã giảm giá chỉ có hiệu lực từ ${new Date(coupon.starts_at).toLocaleDateString('vi-VN')}`
        }, { status: 400 });
      }

      // Kiểm tra ngày hết hạn
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return NextResponse.json({
          success: false,
          error: 'Mã giảm giá này đã hết hạn sử dụng'
        }, { status: 400 });
      }

      // Kiểm tra lượt sử dụng tối đa
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({
          success: false,
          error: 'Mã giảm giá đã hết lượt sử dụng'
        }, { status: 400 });
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      const minOrder = Number(coupon.min_order || 0);
      if (minOrder > 0 && orderTotal < minOrder) {
        return NextResponse.json({
          success: false,
          error: `Đơn hàng tối thiểu ${minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này`
        }, { status: 400 });
      }

      // Tính số tiền giảm giá
      let discount = 0;
      const val = Number(coupon.value || 0);
      const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : null;
      let label = '';

      if (coupon.type === 'percent') {
        const rawDiscount = Math.round((orderTotal * val) / 100);
        discount = maxDiscount && rawDiscount > maxDiscount ? maxDiscount : rawDiscount;
        label = `Giảm ${val}%${maxDiscount ? ` (tối đa ${maxDiscount.toLocaleString('vi-VN')}₫)` : ''}`;
      } else if (coupon.type === 'fixed') {
        discount = Math.min(val, orderTotal);
        label = `Giảm ${val.toLocaleString('vi-VN')}₫`;
      } else if (coupon.type === 'freeship') {
        discount = ship > 0 ? ship : 30000;
        label = `Miễn phí vận chuyển (${discount.toLocaleString('vi-VN')}₫)`;
      }

      return NextResponse.json({
        success: true,
        code: coupon.code.toUpperCase(),
        discount,
        type: coupon.type,
        label,
        source: 'supabase'
      });
    }

    // 2️⃣ DỰ PHÒNG: Kiểm tra trong danh sách Voucher mã tĩnh cài sẵn
    const localVoucher = AVAILABLE_VOUCHERS.find(v => v.code.toUpperCase() === normalizedCode);
    if (localVoucher) {
      if (orderTotal < localVoucher.minOrder) {
        return NextResponse.json({
          success: false,
          error: `Đơn hàng tối thiểu ${localVoucher.minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này`
        }, { status: 400 });
      }

      let discount = 0;
      if (localVoucher.type === 'percent') {
        const raw = Math.round((orderTotal * localVoucher.value) / 100);
        discount = localVoucher.maxDiscount ? Math.min(raw, localVoucher.maxDiscount) : raw;
      } else if (localVoucher.type === 'fixed') {
        discount = Math.min(localVoucher.value, orderTotal);
      } else if (localVoucher.type === 'freeship') {
        discount = ship > 0 ? ship : 30000;
      }

      return NextResponse.json({
        success: true,
        code: localVoucher.code,
        discount,
        type: localVoucher.type,
        label: localVoucher.name,
        source: 'preset'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Lỗi API kiểm tra voucher:', error);
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    }, { status: 500 });
  }
}

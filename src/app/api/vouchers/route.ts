import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AVAILABLE_VOUCHERS } from '@/lib/vouchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { data: dbCoupons, error } = await supabase
      .from('coupons')
      .select('id, code, type, value, min_order, max_discount, max_uses, used_count, starts_at, expires_at')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gte.${nowIso}`)
      .order('created_at', { ascending: false });

    if (!error && dbCoupons && dbCoupons.length > 0) {
      const vouchers = dbCoupons.map((c: any) => ({
        code: c.code,
        name: c.type === 'percent' 
          ? `Giảm ${c.value}%`
          : c.type === 'freeship'
          ? 'Miễn phí vận chuyển'
          : `Giảm ${Number(c.value).toLocaleString('vi-VN')}₫`,
        type: c.type,
        value: Number(c.value),
        minOrder: Number(c.min_order || 0),
        maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
        description: c.type === 'percent'
          ? `Giảm ${c.value}% ${c.max_discount ? `tối đa ${Number(c.max_discount).toLocaleString('vi-VN')}₫` : ''} cho đơn từ ${Number(c.min_order || 0).toLocaleString('vi-VN')}₫`
          : `Giảm trực tiếp ${Number(c.value).toLocaleString('vi-VN')}₫ cho đơn từ ${Number(c.min_order || 0).toLocaleString('vi-VN')}₫`,
      }));

      return NextResponse.json({ success: true, vouchers });
    }

    // Fallback nếu database chưa có voucher nào
    return NextResponse.json({ success: true, vouchers: AVAILABLE_VOUCHERS });
  } catch (err: any) {
    console.error('Lỗi lấy danh sách vouchers:', err);
    return NextResponse.json({ success: true, vouchers: AVAILABLE_VOUCHERS });
  }
}


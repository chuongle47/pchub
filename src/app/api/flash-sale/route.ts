import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    // 1. Tìm chiến dịch Flash Sale đang diễn ra trong Supabase
    const { data: activeSale, error: saleError } = await supabase
      .from('flash_sales')
      .select('id, name, banner_url, starts_at, ends_at, is_active')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .gte('ends_at', nowIso)
      .order('ends_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (saleError) {
      console.warn('Lỗi truy vấn flash_sales Supabase:', saleError.message);
    }

    if (activeSale) {
      // 2. Lấy danh sách sản phẩm trong Flash Sale
      const { data: items, error: itemsError } = await supabase
        .from('flash_sale_items')
        .select(`
          id,
          sale_price,
          quantity_limit,
          sold,
          product:products(
            id,
            name,
            slug,
            price,
            original_price,
            images,
            specs,
            category:categories(name),
            brand:brands(name)
          )
        `)
        .eq('sale_id', activeSale.id);

      if (!itemsError && items && items.length > 0) {
        const products = items
          .map((item: any) => {
            const p = Array.isArray(item.product) ? item.product[0] : item.product;
            if (!p) return null;

            const salePrice = Number(item.sale_price || p.price);
            const originalPrice = Number(p.original_price || p.price);
            const discountPercent = originalPrice > salePrice 
              ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
              : 15;

            return {
              id: p.id,
              name: p.name,
              category: p.category?.name || 'Linh kiện PC',
              brand: p.brand?.name || undefined,
              price: salePrice,
              originalPrice: originalPrice > salePrice ? originalPrice : Math.round(salePrice * 1.15),
              discount: discountPercent,
              image: (p.images && p.images[0]) || '/images/cpu-box.jpg',
              slug: p.slug,
              quantity_limit: item.quantity_limit,
              sold: item.sold || 0,
            };
          })
          .filter(Boolean);

        return NextResponse.json({
          success: true,
          name: activeSale.name,
          banner_url: activeSale.banner_url,
          active_end_time: activeSale.ends_at,
          products,
        });
      }
    }

    // 3. Fallback: Nếu chưa có chiến dịch flash sale tạo thủ công, lấy sản phẩm có sale_price hoặc hot từ bảng products Supabase
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('id, name, slug, price, sale_price, original_price, images, category:categories(name), brand:brands(name)')
      .eq('is_active', true)
      .not('sale_price', 'is', null)
      .gt('sale_price', 0)
      .order('is_hot', { ascending: false })
      .limit(10);

    if (fallbackProducts && fallbackProducts.length > 0) {
      const mapped = fallbackProducts.map((p: any) => {
        const salePrice = Number(p.sale_price);
        const originalPrice = Number(p.original_price || p.price);
        const discountPercent = originalPrice > salePrice
          ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
          : 15;

        return {
          id: p.id,
          name: p.name,
          category: p.category?.name || 'Linh kiện PC',
          brand: p.brand?.name || undefined,
          price: salePrice,
          originalPrice: originalPrice > salePrice ? originalPrice : Math.round(salePrice * 1.15),
          discount: discountPercent,
          image: (p.images && p.images[0]) || '/images/cpu-box.jpg',
          slug: p.slug,
        };
      });

      return NextResponse.json({
        success: true,
        name: 'Flash Sale Hôm Nay',
        products: mapped,
      });
    }

    return NextResponse.json({
      success: true,
      name: 'Flash Sale',
      products: [],
    });
  } catch (err: any) {
    console.error('Error fetching Supabase flash sale:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Lỗi tải flash sale', products: [] },
      { status: 500 }
    );
  }
}

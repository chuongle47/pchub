import type { Metadata } from 'next';
import HeroSlider from '@/components/home/HeroSlider';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import CategoryProductSections from '@/components/home/CategoryProductSections';
import MostViewed from '@/components/home/MostViewed';
import AIBuilderPreview from '@/components/home/AIBuilderPreview';
import BlogSection from '@/components/home/BlogSection';
import BrandStrip from '@/components/home/BrandStrip';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
  openGraph: {
    title: 'PCHub — Linh kiện PC chính hãng',
    description: 'AI tư vấn build PC, kiểm tra tương thích miễn phí',
    url: 'https://pchub-iota.vercel.app',
    siteName: 'PCHub',
    locale: 'vi_VN',
    type: 'website',
    images: ['/images/hero-bg.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PCHub — Linh kiện PC chính hãng',
    description: 'AI tư vấn build PC, kiểm tra tương thích miễn phí',
    images: ['/images/hero-bg.jpg'],
  },
  alternates: {
    canonical: 'https://pchub-iota.vercel.app',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getFlashSaleData() {
  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { data: activeSale } = await supabase
      .from('flash_sales')
      .select('id, name, banner_url, starts_at, ends_at')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .gte('ends_at', nowIso)
      .order('ends_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (activeSale) {
      const { data: items } = await supabase
        .from('flash_sale_items')
        .select(`
          sale_price,
          quantity_limit,
          sold,
          product:products(
            id,
            name,
            slug,
            price,
            images,
            category:categories(name),
            brand:brands(name)
          )
        `)
        .eq('sale_id', activeSale.id);

      if (items && items.length > 0) {
        const products = items
          .map((item: any) => {
            const p = Array.isArray(item.product) ? item.product[0] : item.product;
            if (!p) return null;
            const salePrice = Number(item.sale_price || p.price);
            const originalPrice = Number(p.price);
            return {
              id: p.id,
              name: p.name,
              category: p.category?.name || 'Linh kiện PC',
              brand: p.brand?.name,
              price: salePrice,
              originalPrice: originalPrice > salePrice ? originalPrice : Math.round(salePrice * 1.15),
              discount: originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 12,
              image: p.images?.[0] || '/images/cpu-box.jpg',
              slug: p.slug,
            };
          })
          .filter(Boolean);

        return {
          name: activeSale.name,
          banner_url: activeSale.banner_url,
          active_end_time: activeSale.ends_at,
          products,
        };
      }
    }

    // Fallback: Lấy sản phẩm có sale_price hoặc hot từ Supabase
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('id, name, slug, price, sale_price, images, category:categories(name), brand:brands(name)')
      .eq('is_active', true)
      .not('sale_price', 'is', null)
      .gt('sale_price', 0)
      .order('is_hot', { ascending: false })
      .limit(8);

    if (fallbackProducts && fallbackProducts.length > 0) {
      return {
        name: 'Flash Sale Hôm Nay',
        products: fallbackProducts.map((p: any) => {
          const salePrice = Number(p.sale_price);
          const originalPrice = Number(p.price);
          return {
            id: p.id,
            name: p.name,
            category: p.category?.name || 'Linh kiện PC',
            brand: p.brand?.name,
            price: salePrice,
            originalPrice: originalPrice > salePrice ? originalPrice : Math.round(salePrice * 1.15),
            discount: originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 12,
            image: p.images?.[0] || '/images/cpu-box.jpg',
            slug: p.slug,
          };
        }),
      };
    }
  } catch (err) {
    console.error('getFlashSaleData Supabase exception:', err);
  }
  return null;
}

export default async function HomePage() {
  const flashSaleData = await getFlashSaleData();

  return (
    <>
      {/* 1. HERO SLIDER — Full width auto-play */}
      <HeroSlider />

      {/* 2. FLASH SALE — compact product strip */}
      <FlashSaleSection initialData={flashSaleData} />

      {/* 3. BRANDS — partner strip */}
      <BrandStrip />

      {/* 4. MOST VIEWED — product HOT strip */}
      <MostViewed />

      {/* 5. CATEGORY GRID — compact component categories */}
      <CategoryGrid />

      {/* 5b. FEATURED CATEGORY PRODUCTS — CPU, Mainboard, RAM */}
      <CategoryProductSections />

      {/* 6. BLOG — compact news grid */}
      <BlogSection />

      {/* 7. AI BUILDER PREVIEW — compact CTA */}
      <AIBuilderPreview />
    </>
  );
}

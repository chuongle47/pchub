import type { Metadata } from 'next';
import HeroSlider from '@/components/home/HeroSlider';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import MostViewed from '@/components/home/MostViewed';
import AIBuilderPreview from '@/components/home/AIBuilderPreview';
import BlogSection from '@/components/home/BlogSection';
import BrandStrip from '@/components/home/BrandStrip';

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
  openGraph: {
    title: 'PCHub — Linh kiện PC chính hãng',
    description: 'AI tư vấn build PC, kiểm tra tương thích miễn phí',
    url: 'https://pchub.vn',
    siteName: 'PCHub',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://pchub.vn',
  },
};

export default function HomePage() {
  return (
    <>
      {/* 1. HERO SLIDER — Full width auto-play */}
      <HeroSlider />

      {/* 2. FLASH SALE — compact product strip */}
      <FlashSaleSection />

      {/* 3. BRANDS — partner strip */}
      <BrandStrip />

      {/* 4. MOST VIEWED — product HOT strip */}
      <MostViewed />

      {/* 5. CATEGORY GRID — compact component categories */}
      <CategoryGrid />

      {/* 6. BLOG — compact news grid */}
      <BlogSection />

      {/* 7. AI BUILDER PREVIEW — compact CTA */}
      <AIBuilderPreview />
    </>
  );
}

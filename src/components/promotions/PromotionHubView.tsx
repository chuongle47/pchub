'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  Clock,
  Tag,
  Gift,
  Sparkles,
  Calendar,
  Percent,
  CheckCircle2,
  Copy,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface PromoItem {
  id: string;
  title: string;
  tag: string;
  badgeType: 'hot' | 'dont_miss' | 'holiday' | 'percent';
  discountText: string;
  image: string;
  validUntil: string;
  category: 'holiday' | 'sale_hot' | 'bogo' | 'percent';
  couponCode?: string;
  description: string;
  products?: Array<{
    name: string;
    originalPrice: number;
    salePrice: number;
    discountPercent: number;
    image: string;
  }>;
}

// Curated promotions matching the reference layout and PCHub hardware catalog
const SAMPLE_PROMOTIONS: PromoItem[] = [
  {
    id: 'promo-hero-1',
    title: 'PCHub Siêu Đại Tiệc: Mua Combo Main + CPU Tặng RAM DDR5, Giảm 500K Hóa Đơn Từ 15 Triệu',
    tag: 'MUA 1 TẶNG 1 • GIẢM ĐẾN 50%',
    badgeType: 'hot',
    discountText: 'Giảm 500K + Tặng RAM',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    validUntil: '30/11/2026',
    category: 'bogo',
    couponCode: 'PCHUBMEGASALE',
    description: 'Chương trình tri ân khách hàng build PC: Nhận ngay thanh RAM DDR5 16GB trị giá 1.450.000₫ khi mua combo CPU Intel Gen 14 hoặc AMD Ryzen 7000 kèm Bo mạch chủ. Áp dụng cho cả đơn hàng online và tại showroom.',
    products: [
      {
        name: 'CPU Intel Core i7-14700K + Mainboard Z790 AORUS ELITE AX',
        originalPrice: 19800000,
        salePrice: 16900000,
        discountPercent: 15,
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'CPU AMD Ryzen 7 7800X3D + Mainboard B650 TUF GAMING',
        originalPrice: 17500000,
        salePrice: 14990000,
        discountPercent: 14,
        image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'promo-hero-2',
    title: 'PCHub Khao Tiệc Mua 1 Tặng 1: Mua Tản Nước AIO Tặng Fan ARGB Cao Cấp',
    tag: 'MUA 1 TẶNG 1',
    badgeType: 'hot',
    discountText: 'Mua 1 Tặng 1',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    validUntil: '30/11/2026',
    category: 'bogo',
    couponCode: 'BOGOCOOLING',
    description: 'Mua tản nhiệt nước AIO 240mm hoặc 360mm bất kỳ, tặng ngay bộ 3 quạt tản nhiệt case ARGB đồng bộ màu sắc. Chụp màn hình đơn hàng gửi Fanpage để nhận quà!',
    products: [
      {
        name: 'Tản nhiệt nước DeepCool LT720 360mm ARGB White',
        originalPrice: 3450000,
        salePrice: 2890000,
        discountPercent: 16,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'promo-hero-3',
    title: 'Mùa Hè Công Nghệ (Summer Deal): Giảm Đến 25% Màn Hình Gaming 144Hz - 240Hz',
    tag: 'SUMMER DEAL • GIẢM 25%',
    badgeType: 'dont_miss',
    discountText: 'Giảm Đến 25%',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    validUntil: '05/12/2026',
    category: 'holiday',
    couponCode: 'SUMMER25',
    description: 'Nâng cấp góc làm việc và giải trí với các dòng màn hình gaming IPS, OLED từ Dell, LG, Asus ROG và Samsung Odyssey với tần số quét 165Hz - 240Hz.',
    products: [
      {
        name: 'Màn hình ASUS TUF Gaming VG27AQ 27 inch 2K 165Hz IPS',
        originalPrice: 8490000,
        salePrice: 6390000,
        discountPercent: 25,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'promo-hero-4',
    title: 'Back To School: Sale Cực Cool Cho Học Sinh Sinh Viên Giảm Đến 50%, Mua 1 Tặng 1 Combo Phím Chuột',
    tag: 'BACK TO SCHOOL',
    badgeType: 'dont_miss',
    discountText: 'Giảm Đến 50%',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    validUntil: '15/12/2026',
    category: 'percent',
    couponCode: 'BACK2SCHOOL',
    description: 'Ưu đãi dành riêng cho HSSV chào đón năm học mới: Xuất trình thẻ học sinh/sinh viên nhận ngay voucher giảm 50% phụ kiện gear và combo bàn phím cơ + chuột công thái học.',
    products: [
      {
        name: 'Combo Bàn phím cơ DareU EK87 + Chuột DareU EM908 RGB',
        originalPrice: 1150000,
        salePrice: 575000,
        discountPercent: 50,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'promo-sale-hot-1',
    title: 'Ưu Đãi Cực Mê Cùng VNPay & Thẻ Tín Dụng: Giảm Thêm 200K Cho Đơn Hàng Từ 3 Triệu',
    tag: 'VNPAY • GIẢM 200K',
    badgeType: 'hot',
    discountText: 'Giảm 200K',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    validUntil: '31/12/2026',
    category: 'sale_hot',
    couponCode: 'VNPAY200',
    description: 'Nhập mã VNPAY200 khi quét cổng VNPay-QR hoặc thanh toán bằng thẻ Visa/Mastercard tại bước thanh toán để được giảm trực tiếp 200.000₫.',
  },
  {
    id: 'promo-sale-hot-2',
    title: 'Black Friday Sớm: Giảm Sốc 35% Card Đồ Họa RTX 4070 SUPER & RX 7800 XT',
    tag: 'BLACK FRIDAY 2026',
    badgeType: 'holiday',
    discountText: 'Giảm 35%',
    image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=600&q=80',
    validUntil: '30/11/2026',
    category: 'percent',
    couponCode: 'BFVGA35',
    description: 'Cơ hội vàng nâng cấp card đồ họa đón đầu các bom tấn game AAA. Số lượng có hạn, áp dụng cho các thương hiệu GIGABYTE, MSI, ASUS, ZOTAC.',
  },
  {
    id: 'promo-dont-miss-1',
    title: 'Chào Đón Tết Dương Lịch 2027: Quà Tặng Đỉnh Cao Khi Lắp Dàn PC Gaming Từ 25 Triệu',
    tag: 'TẾT DEAL KHỦNG',
    badgeType: 'dont_miss',
    discountText: 'Tặng Quà 2 Triệu',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    validUntil: '01/01/2027',
    category: 'holiday',
    couponCode: 'TETPCHUB',
    description: 'Mỗi dàn PC trị giá từ 25 triệu trở lên được tặng kèm combo: Ổ cứng SSD NVMe 500GB Gen 4 + Bộ phím chuột gaming + Gói vệ sinh tra keo tản nhiệt miễn phí trọn đời.',
  },
  {
    id: 'promo-dont-miss-2',
    title: 'Tuần Lễ Tai Nghe & Loa Gaming: Giảm Đến 40% Cho Thương Hiệu Razer & HyperX',
    tag: 'AUDIO DEALS',
    badgeType: 'dont_miss',
    discountText: 'Giảm 40%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    validUntil: '10/12/2026',
    category: 'percent',
    couponCode: 'AUDIO40',
    description: 'Âm thanh vòm 7.1 chuẩn studio gaming, trải nghiệm chân thực định vị từng bước chân kẻ thù. Bảo hành chính hãng 24 tháng 1 đổi 1.',
  },
];

interface Props {
  initialFlashSales?: any[];
  initialSaleProducts?: any[];
  initialCoupons?: any[];
}

export function PromotionHubView({
  initialFlashSales = [],
  initialSaleProducts = [],
  initialCoupons = [],
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sale_hot' | 'holiday' | 'percent' | 'bogo'>('all');
  const [activeModalPromo, setActiveModalPromo] = useState<PromoItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const addItemToCart = useCartStore((s: any) => s.addItem);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredPromos = selectedFilter === 'all'
    ? SAMPLE_PROMOTIONS
    : SAMPLE_PROMOTIONS.filter(p => p.category === selectedFilter);

  const heroMain = SAMPLE_PROMOTIONS[0];
  const heroTopRight = SAMPLE_PROMOTIONS[1];
  const heroBottomLeft = SAMPLE_PROMOTIONS[2];
  const heroBottomRight = SAMPLE_PROMOTIONS[3];

  const saleHotDeals = SAMPLE_PROMOTIONS.filter(p => p.badgeType === 'hot' || p.category === 'sale_hot' || p.category === 'bogo');
  const dontMissDeals = SAMPLE_PROMOTIONS.filter(p => p.badgeType === 'dont_miss' || p.category === 'holiday' || p.category === 'percent');

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-blue-600">Khuyến Mãi & Săn Deal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Đại Tiệc Khuyến Mãi PCHub</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                HOT DEAL
              </span>
            </h1>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cập nhật liên tục mỗi ngày theo sự kiện & ngày lễ</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. HERO MOSAIC BANNER GRID (Replicating exact layout from user image)     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* LEFT COLUMN: Large Hero Banner (Spanning 7 columns & 2 rows on Desktop) */}
          <div
            onClick={() => setActiveModalPromo(heroMain)}
            className="lg:col-span-7 relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 min-h-[380px] sm:min-h-[440px] flex flex-col justify-end border border-slate-200"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${heroMain.image})` }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            {/* Top Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md uppercase tracking-wide">
                {heroMain.tag}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Đến {heroMain.validUntil}
              </span>
            </div>

            {/* Bottom Title Banner Overlay (Matching the bottom box in reference screenshot) */}
            <div className="relative z-10 p-5 sm:p-7">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                {heroMain.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 line-clamp-2 leading-relaxed">
                {heroMain.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors">
                  <span>Xem Chi Tiết & Nhận Quà</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {heroMain.couponCode && (
                  <span className="text-xs font-mono font-bold text-amber-300 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-300/30">
                    Mã: {heroMain.couponCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3 Banners (1 Wide on Top, 2 Half-width on Bottom) */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
            {/* Top Right Wide Banner (Mua 1 Tặng 1 Trà Sữa/Linh Kiện Mochi Style) */}
            <div
              onClick={() => setActiveModalPromo(heroTopRight)}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 min-h-[190px] sm:min-h-[210px] flex flex-col justify-end p-5 border border-slate-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${heroTopRight.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              {/* Big Header Text (Matching "MUA 1 TẶNG 1" in screenshot) */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase drop-shadow-md">
                  MUA 1 TẶNG 1
                </span>
                <span className="block text-xs font-bold text-emerald-400 tracking-wide mt-0.5">
                  TẢN NHIỆT & QUẠT CASE ARGB
                </span>
              </div>

              {/* Bottom Card Title Overlay */}
              <div className="relative z-10 bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {heroTopRight.title}
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    Áp dụng từ nay đến {heroTopRight.validUntil}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                  Nhận Quà
                </span>
              </div>
            </div>

            {/* Bottom Two Half Banners (Summer Deal & Back to School) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 flex-1">
              {/* Bottom Left Banner: Summer Deal */}
              <div
                onClick={() => setActiveModalPromo(heroBottomLeft)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 min-h-[190px] sm:min-h-[210px] flex flex-col justify-end p-4 border border-slate-200"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${heroBottomLeft.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-600 text-white uppercase tracking-wider">
                    SUMMER DEAL
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-sky-300 transition-colors">
                    {heroBottomLeft.title}
                  </div>
                  <div className="text-[10px] text-sky-400 font-semibold mt-1">
                    {heroBottomLeft.discountText}
                  </div>
                </div>
              </div>

              {/* Bottom Right Banner: Back to School */}
              <div
                onClick={() => setActiveModalPromo(heroBottomRight)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 min-h-[190px] sm:min-h-[210px] flex flex-col justify-end p-4 border border-slate-200"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${heroBottomRight.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-900 uppercase tracking-wider">
                    BACK TO SCHOOL
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {heroBottomRight.title}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-1">
                    {heroBottomRight.discountText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CATEGORY & FILTER TABS (Theo Ngày Sale, Dịp Lễ, % Giảm)                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Tất Cả Khuyến Mãi
          </button>

          <button
            onClick={() => setSelectedFilter('sale_hot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'sale_hot'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sale Hot Hôm Nay</span>
          </button>

          <button
            onClick={() => setSelectedFilter('holiday')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'holiday'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dịp Lễ & Sự Kiện</span>
          </button>

          <button
            onClick={() => setSelectedFilter('percent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'percent'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Giảm Sâu Theo %</span>
          </button>

          <button
            onClick={() => setSelectedFilter('bogo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'bogo'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mua 1 Tặng 1</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. SECTION: "SALE HOT HÔM NAY" (Red badge header matching reference)      */}
        {/* ========================================================================= */}
        {(selectedFilter === 'all' || selectedFilter === 'sale_hot' || selectedFilter === 'bogo') && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-md shadow-xs">
                SALE HOT HÔM NAY
              </span>
              <div className="flex-1 h-0.5 bg-rose-600/20 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {saleHotDeals.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => setActiveModalPromo(promo)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                      {promo.discountText}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                      Đến {promo.validUntil}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {promo.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {promo.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {promo.couponCode ? (
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {promo.couponCode}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Áp dụng tự động</span>
                      )}
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. SECTION: "ĐỪNG BỎ LỠ" (Dark badge header matching reference)           */}
        {/* ========================================================================= */}
        {(selectedFilter === 'all' || selectedFilter === 'holiday' || selectedFilter === 'percent') && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-md shadow-xs">
                ĐỪNG BỎ LỠ
              </span>
              <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dontMissDeals.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => setActiveModalPromo(promo)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-900 uppercase">
                      {promo.tag}
                    </span>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {promo.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                      <span className="text-slate-400">Đến {promo.validUntil}</span>
                      <span className="text-blue-600 font-bold">{promo.discountText}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. SECTION: "SẢN PHẨM KHUYẾN MÃI NỔI BẬT" (Flash Sales & Products)       */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Sản Phẩm Đang Giảm Giá Sâu
              </h2>
            </div>
            <Link
              href="/search?sale=true"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Xem tất cả linh kiện giảm giá</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {initialSaleProducts.map((p) => {
              const original = Number(p.price || 0);
              const sale = Number(p.sale_price || 0);
              const discountPercent = original > sale && sale > 0 ? Math.round(((original - sale) / original) * 100) : 0;
              const imageUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  {discountPercent > 0 && (
                    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}

                  <Link href={`/product/${p.slug}`} className="block relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {p.category?.name || 'Linh kiện'}
                    </div>
                    <Link
                      href={`/product/${p.slug}`}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-2 leading-snug transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </Link>

                    <div className="pt-1">
                      <div className="text-sm font-black text-rose-600">
                        {sale.toLocaleString('vi-VN')} ₫
                      </div>
                      {original > sale && (
                        <div className="text-[11px] text-slate-400 line-through">
                          {original.toLocaleString('vi-VN')} ₫
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addItemToCart({
                          id: p.id,
                          name: p.name,
                          price: sale > 0 ? sale : original,
                          image: imageUrl,
                          quantity: 1,
                        });
                        alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Thêm vào giỏ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. PROMOTION DETAIL MODAL (Opens upon clicking any banner or promo card)  */}
        {/* ========================================================================= */}
        {activeModalPromo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Banner Image */}
              <div className="relative aspect-video w-full bg-slate-900 shrink-0">
                <img
                  src={activeModalPromo.image}
                  alt={activeModalPromo.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveModalPromo(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4">
                  <span className="px-3 py-1 rounded-md text-xs font-black bg-rose-600 text-white shadow-md">
                    {activeModalPromo.discountText}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {activeModalPromo.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-rose-600">
                      <Clock className="w-3.5 h-3.5" />
                      Hạn áp dụng: {activeModalPromo.validUntil}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">Đang diễn ra</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeModalPromo.description}
                </p>

                {/* Coupon Code Box */}
                {activeModalPromo.couponCode && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-700 block">
                        Mã giảm giá độc quyền:
                      </span>
                      <span className="text-base font-mono font-black text-blue-900 tracking-wider">
                        {activeModalPromo.couponCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(activeModalPromo.couponCode!)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode === activeModalPromo.couponCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép mã</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Products in this promotion */}
                {activeModalPromo.products && activeModalPromo.products.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Sản phẩm áp dụng trong chương trình:
                    </h4>
                    <div className="space-y-2.5">
                      {activeModalPromo.products.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white border border-slate-200"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate" title={item.name}>
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-rose-600">
                                  {item.salePrice.toLocaleString('vi-VN')} ₫
                                </span>
                                <span className="text-slate-400 line-through text-[11px]">
                                  {item.originalPrice.toLocaleString('vi-VN')} ₫
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              addItemToCart({
                                id: `promo-item-${idx}`,
                                name: item.name,
                                price: item.salePrice,
                                image: item.image,
                                quantity: 1,
                              });
                              alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                          >
                            Mua ngay
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Số lượng quà tặng có hạn theo từng ngày.
                </span>
                <button
                  onClick={() => setActiveModalPromo(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

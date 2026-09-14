'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, CircuitBoard, MemoryStick, Sparkles } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
  specs: string;
  category: string;
  brand: string;
  badge?: string;
  badgeColor?: 'red' | 'blue';
}

interface CategorySectionConfig {
  id: string;
  slug: string;
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  defaults: ProductItem[];
}

const CATEGORY_SECTIONS: CategorySectionConfig[] = [
  {
    id: 'cpu',
    slug: 'cpu',
    title: 'CPU - Bộ Vi Xử Lý',
    subTitle: 'Bộ vi xử lý Intel Core & AMD Ryzen chính hãng mới nhất',
    icon: <Cpu size={22} color="#2563eb" />,
    accentColor: '#2563eb',
    bgColor: '#f8fafc',
    defaults: [
      {
        id: 'cpu-1',
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 13990000,
        originalPrice: 15990000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i9-14900k',
        specs: '24 Cores | 32 Threads | LGA 1700 | 36MB Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'Intel',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'cpu-2',
        name: 'AMD Ryzen 9 7950X3D (Up to 5.7GHz, 16 Nhân 32 Luồng)',
        price: 15490000,
        originalPrice: 17890000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-9-7950x3d',
        specs: '16 Cores | 32 Threads | AM5 | 128MB 3D V-Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'AMD',
        badge: 'HOT GAMING',
        badgeColor: 'red',
      },
      {
        id: 'cpu-3',
        name: 'Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)',
        price: 10490000,
        originalPrice: 11990000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i7-14700k',
        specs: '20 Cores | 28 Threads | LGA 1700 | 33MB Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'Intel',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'cpu-4',
        name: 'AMD Ryzen 7 7800X3D (Up to 5.0GHz, 8 Nhân 16 Luồng)',
        price: 9890000,
        originalPrice: 11290000,
        discount: 12,
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-7-7800x3d',
        specs: '8 Cores | 16 Threads | AM5 | 96MB 3D V-Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'AMD',
        badge: 'TOP GAMING',
        badgeColor: 'red',
      },
    ],
  },
  {
    id: 'mainboard',
    slug: 'mainboard',
    title: 'Mainboard - Bo Mạch Chủ',
    subTitle: 'Bo mạch chủ Z790, B760, X670, B650 từ ASUS, MSI, Gigabyte',
    icon: <CircuitBoard size={22} color="#9333ea" />,
    accentColor: '#9333ea',
    bgColor: '#ffffff',
    defaults: [
      {
        id: 'mb-1',
        name: 'Mainboard ASUS ROG STRIX Z790-E GAMING WIFI II DDR5',
        price: 12890000,
        originalPrice: 14590000,
        discount: 12,
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-z790-e-gaming-wifi-ii',
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | PCIe 5.0 | WiFi 7',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'ASUS',
        badge: 'VIP CHẤT LƯỢNG',
        badgeColor: 'red',
      },
      {
        id: 'mb-2',
        name: 'Mainboard MSI MAG Z790 TOMAHAWK WIFI DDR5',
        price: 7690000,
        originalPrice: 8690000,
        discount: 11,
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-z790-tomahawk-wifi-ddr5',
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | Wi-Fi 6E | 16+1+1 VRM',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'MSI',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'mb-3',
        name: 'Mainboard Gigabyte Z790 AORUS ELITE AX DDR5',
        price: 7290000,
        originalPrice: 8190000,
        discount: 11,
        image: '/images/cat-mainboard.jpg',
        slug: 'gigabyte-z790-aorus-elite-ax-ddr5',
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | PCIe 5.0 | Wi-Fi 6E',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'Gigabyte',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'mb-4',
        name: 'Mainboard ASRock X670E Taichi Carrara AM5 DDR5',
        price: 13990000,
        originalPrice: 15990000,
        discount: 13,
        image: '/images/cat-mainboard.jpg',
        slug: 'asrock-x670e-taichi-carrara-am5',
        specs: 'Chipset X670E | Socket AM5 | DDR5 | 24 Phase VRM',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'ASRock',
        badge: 'CAO CẤP',
        badgeColor: 'red',
      },
    ],
  },
  {
    id: 'ram',
    slug: 'ram',
    title: 'RAM - Bộ Nhớ Trong',
    subTitle: 'Bộ nhớ RAM DDR5 & DDR4 RGB xung cao từ Corsair, G.Skill, Kingston',
    icon: <MemoryStick size={22} color="#16a34a" />,
    accentColor: '#16a34a',
    bgColor: '#f8fafc',
    defaults: [
      {
        id: 'ram-1',
        name: 'RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz',
        price: 4290000,
        originalPrice: 4890000,
        discount: 12,
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-dominator-titanium-rgb-32gb-ddr5',
        specs: 'DDR5 | 32GB (2x16GB) | Bus 6000MHz | CL30 | Expo/XMP 3.0',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Corsair',
        badge: 'HOT',
        badgeColor: 'red',
      },
      {
        id: 'ram-2',
        name: 'RAM G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz Silver',
        price: 3890000,
        originalPrice: 4490000,
        discount: 13,
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-rgb-32gb-ddr5-6400mhz',
        specs: 'DDR5 | 32GB (2x16GB) | Bus 6400MHz | CL32 | Intel XMP 3.0',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'G.Skill',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'ram-3',
        name: 'RAM Kingston Fury Beast RGB 32GB (2x16GB) DDR5 5600MHz',
        price: 2990000,
        originalPrice: 3490000,
        discount: 14,
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-rgb-32gb-ddr5-5600mhz',
        specs: 'DDR5 | 32GB (2x16GB) | Bus 5600MHz | CL36 | RGB Dynamic',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Kingston',
        badge: 'GIÁ TỐT',
        badgeColor: 'blue',
      },
      {
        id: 'ram-4',
        name: 'RAM Corsair Vengeance RGB PRO 16GB (2x8GB) DDR4 3200MHz',
        price: 1290000,
        originalPrice: 1590000,
        discount: 19,
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-rgb-pro-16gb-ddr4-3200mhz',
        specs: 'DDR4 | 16GB (2x8GB) | Bus 3200MHz | CL16 | iCUE',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Corsair',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
    ],
  },
];

export default function CategoryProductSections() {
  const [sectionData, setSectionData] = useState<Record<string, ProductItem[]>>({
    cpu: CATEGORY_SECTIONS[0].defaults,
    mainboard: CATEGORY_SECTIONS[1].defaults,
    ram: CATEGORY_SECTIONS[2].defaults,
  });

  useEffect(() => {
    async function loadAllSections() {
      const updatedData: Record<string, ProductItem[]> = {};

      for (const section of CATEGORY_SECTIONS) {
        try {
          const res = await fetch(`/api/products?category=${section.slug}&limit=4`);
          if (!res.ok) throw new Error('Fetch error');
          const data = await res.json();

          if (data.products && data.products.length > 0) {
            const mapped: ProductItem[] = data.products.map((p: any, idx: number) => {
              const price = Number(p.price);
              const origPrice = Number(p.original_price ?? p.originalPrice) || Math.round(price * 1.14);
              const discount = Math.round(((origPrice - price) / origPrice) * 100);
              return {
                id: p.id,
                name: p.name,
                price,
                originalPrice: origPrice,
                discount: discount > 0 ? discount : 12,
                image: p.image_url || (section.slug === 'mainboard' ? '/images/cat-mainboard.jpg' : (section.slug === 'ram' ? '/images/ram-rgb.jpg' : '/images/cpu-box.jpg')),
                slug: p.slug,
                specs: p.specs ? Object.entries(p.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ') : 'Chính hãng PCHub 36 tháng',
                category: p.category_name || section.title,
                brand: p.brand_name || 'PCHub',
                badge: idx === 0 ? 'BÁN CHẠY' : (idx === 1 ? 'HOT' : undefined),
                badgeColor: idx === 0 ? 'blue' : 'red',
              };
            });
            updatedData[section.id] = mapped;
          } else {
            updatedData[section.id] = section.defaults;
          }
        } catch (err) {
          updatedData[section.id] = section.defaults;
        }
      }

      setSectionData(updatedData);
    }

    loadAllSections();
  }, []);

  return (
    <div className="category-product-sections">
      {CATEGORY_SECTIONS.map((sec) => {
        const products = sectionData[sec.id] || sec.defaults;
        return (
          <section
            key={sec.id}
            style={{
              background: sec.bgColor,
              padding: '36px 0 40px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
              
              {/* Header của từng danh mục */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: `${sec.accentColor}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {sec.icon}
                    </div>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Sản phẩm {sec.title}
                    </h2>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 38px' }}>
                    {sec.subTitle}
                  </p>
                </div>

                <Link
                  href={`/danh-muc/${sec.slug}`}
                  className="view-all-btn"
                >
                  Xem tất cả <ArrowRight size={14} />
                </Link>
              </div>

              {/* Lưới sản phẩm 4 cột */}
              <div className="home-grid-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    image={p.image}
                    category={p.category}
                    brand={p.brand}
                    specs={p.specs}
                    price={p.price}
                    originalPrice={p.originalPrice}
                    discount={p.discount}
                    badge={p.badge}
                    badgeColor={p.badgeColor}
                    stock={true}
                    showCompare={false}
                  />
                ))}
              </div>

            </div>
          </section>
        );
      })}
    </div>
  );
}

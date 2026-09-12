'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShoppingCart, Cpu, CircuitBoard, MemoryStick, Monitor, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/shop/ProductCard';

interface TabProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
  rating: number;
  reviews: number;
  specs: string;
  category: string;
  brand: string;
  badge?: string;
  badgeColor?: 'red' | 'blue';
}

interface TabGroup {
  id: string;
  catId: string;
  slug: string;
  label: string;
  subTitle: string;
  icon: React.ReactNode;
  subTabs: string[];
  bgColor: string;
  accentColor: string;
  bannerImg: string;
  defaults: TabProduct[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    id: 'cpu',
    slug: 'cpu',
    catId: 'c1000000-0000-0000-0000-000000000001',
    label: 'CPU - Bộ Vi Xử Lý',
    subTitle: 'Intel & AMD Ryzen chính hãng',
    icon: <Cpu size={20} />,
    subTabs: ['Tất cả CPU', 'Intel Core', 'AMD Ryzen'],
    bgColor: '#eff6ff',
    accentColor: '#2563eb',
    bannerImg: '/images/cpu-box.jpg',
    defaults: [
      {
        id: 'p-cpu-1',
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 13990000,
        originalPrice: 15990000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i9-14900k',
        rating: 5,
        reviews: 84,
        specs: '24 Cores | 32 Threads | LGA 1700 | 36MB Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'Intel',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-cpu-2',
        name: 'AMD Ryzen 9 7950X3D (Up to 5.7GHz, 16 Nhân 32 Luồng)',
        price: 15490000,
        originalPrice: 17890000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-9-7950x3d',
        rating: 5,
        reviews: 62,
        specs: '16 Cores | 32 Threads | AM5 | 128MB 3D V-Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'AMD',
        badge: 'HOT',
        badgeColor: 'red',
      },
      {
        id: 'p-cpu-3',
        name: 'Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)',
        price: 10490000,
        originalPrice: 11990000,
        discount: 13,
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i7-14700k',
        rating: 5,
        reviews: 105,
        specs: '20 Cores | 28 Threads | LGA 1700 | 33MB Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'Intel',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-cpu-4',
        name: 'AMD Ryzen 7 7800X3D (Up to 5.0GHz, 8 Nhân 16 Luồng)',
        price: 9890000,
        originalPrice: 11290000,
        discount: 12,
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-7-7800x3d',
        rating: 5,
        reviews: 142,
        specs: '8 Cores | 16 Threads | AM5 | 96MB 3D V-Cache',
        category: 'CPU - Bộ Vi Xử Lý',
        brand: 'AMD',
        badge: 'HOT GAMING',
        badgeColor: 'red',
      },
    ],
  },
  {
    id: 'mainboard',
    slug: 'mainboard',
    catId: 'c1000000-0000-0000-0000-000000000002',
    label: 'Mainboard - Bo Mạch Chủ',
    subTitle: 'Z790, B760, X670, B650 cao cấp',
    icon: <CircuitBoard size={20} />,
    subTabs: ['Tất cả Mainboard', 'ASUS', 'MSI', 'Gigabyte'],
    bgColor: '#faf5ff',
    accentColor: '#9333ea',
    bannerImg: '/images/cat-mainboard.jpg',
    defaults: [
      {
        id: 'p-mb-1',
        name: 'Mainboard ASUS ROG STRIX Z790-E GAMING WIFI II DDR5',
        price: 12890000,
        originalPrice: 14590000,
        discount: 12,
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-z790-e-gaming-wifi-ii',
        rating: 5,
        reviews: 38,
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | PCIe 5.0 | WiFi 7',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'ASUS',
        badge: 'VIP',
        badgeColor: 'red',
      },
      {
        id: 'p-mb-2',
        name: 'Mainboard MSI MAG Z790 TOMAHAWK WIFI DDR5',
        price: 7690000,
        originalPrice: 8690000,
        discount: 11,
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-z790-tomahawk-wifi-ddr5',
        rating: 5,
        reviews: 55,
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | Wi-Fi 6E | 16+1+1 Phase VRM',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'MSI',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-mb-3',
        name: 'Mainboard Gigabyte Z790 AORUS ELITE AX DDR5',
        price: 7290000,
        originalPrice: 8190000,
        discount: 11,
        image: '/images/cat-mainboard.jpg',
        slug: 'gigabyte-z790-aorus-elite-ax-ddr5',
        rating: 5,
        reviews: 49,
        specs: 'Chipset Z790 | LGA 1700 | DDR5 | PCIe 5.0 | Wi-Fi 6E',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'Gigabyte',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-mb-4',
        name: 'Mainboard ASRock X670E Taichi Carrara AM5 DDR5',
        price: 13990000,
        originalPrice: 15990000,
        discount: 13,
        image: '/images/cat-mainboard.jpg',
        slug: 'asrock-x670e-taichi-carrara-am5',
        rating: 5,
        reviews: 21,
        specs: 'Chipset X670E | Socket AM5 | DDR5 | 24 Phase VRM | PCIe 5.0',
        category: 'Mainboard - Bo Mạch Chủ',
        brand: 'ASRock',
        badge: 'CAP CẤP',
        badgeColor: 'red',
      },
    ],
  },
  {
    id: 'ram',
    slug: 'ram',
    catId: 'c1000000-0000-0000-0000-000000000003',
    label: 'RAM - Bộ Nhớ Trong',
    subTitle: 'DDR5 & DDR4 RGB tốc độ cao',
    icon: <MemoryStick size={20} />,
    subTabs: ['Tất cả RAM', 'RAM DDR5', 'RAM DDR4', 'Corsair'],
    bgColor: '#f0fdf4',
    accentColor: '#16a34a',
    bannerImg: '/images/ram-rgb.jpg',
    defaults: [
      {
        id: 'p-ram-1',
        name: 'RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz',
        price: 4290000,
        originalPrice: 4890000,
        discount: 12,
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-dominator-titanium-rgb-32gb-ddr5',
        rating: 5,
        reviews: 73,
        specs: 'DDR5 | 32GB (2x16GB) | Bus 6000MHz | CL30 | Expo/XMP 3.0',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Corsair',
        badge: 'HOT',
        badgeColor: 'red',
      },
      {
        id: 'p-ram-2',
        name: 'RAM G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz Silver',
        price: 3890000,
        originalPrice: 4490000,
        discount: 13,
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-rgb-32gb-ddr5-6400mhz',
        rating: 5,
        reviews: 64,
        specs: 'DDR5 | 32GB (2x16GB) | Bus 6400MHz | CL32 | Intel XMP 3.0',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'G.Skill',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-ram-3',
        name: 'RAM Kingston Fury Beast RGB 32GB (2x16GB) DDR5 5600MHz',
        price: 2990000,
        originalPrice: 3490000,
        discount: 14,
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-rgb-32gb-ddr5-5600mhz',
        rating: 5,
        reviews: 58,
        specs: 'DDR5 | 32GB (2x16GB) | Bus 5600MHz | CL36 | RGB Dynamic',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Kingston',
        badge: 'GIÁ TỐT',
        badgeColor: 'blue',
      },
      {
        id: 'p-ram-4',
        name: 'RAM Corsair Vengeance RGB PRO 16GB (2x8GB) DDR4 3200MHz',
        price: 1290000,
        originalPrice: 1590000,
        discount: 19,
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-rgb-pro-16gb-ddr4-3200mhz',
        rating: 5,
        reviews: 112,
        specs: 'DDR4 | 16GB (2x8GB) | Bus 3200MHz | CL16 | iCUE Software',
        category: 'RAM - Bộ Nhớ Trong',
        brand: 'Corsair',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
    ],
  },
  {
    id: 'gpu',
    slug: 'gpu',
    catId: 'c1000000-0000-0000-0000-000000000004',
    label: 'GPU - Card Màn Hình',
    subTitle: 'NVIDIA RTX 40 Series & AMD Radeon',
    icon: <Monitor size={20} />,
    subTabs: ['Tất cả GPU', 'NVIDIA RTX', 'AMD Radeon'],
    bgColor: '#fff7ed',
    accentColor: '#ea580c',
    bannerImg: '/images/gpu-strix.jpg',
    defaults: [
      {
        id: 'p-gpu-1',
        name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X',
        price: 54990000,
        originalPrice: 59990000,
        discount: 8,
        image: '/images/gpu-strix.jpg',
        slug: 'asus-rog-strix-geforce-rtx-4090',
        rating: 5,
        reviews: 95,
        specs: 'VRAM: 24GB GDDR6X | Bus: 384-bit | PCIe 4.0 | DLSS 3',
        category: 'GPU - Card Màn Hình',
        brand: 'ASUS',
        badge: 'KING OF GPU',
        badgeColor: 'red',
      },
      {
        id: 'p-gpu-2',
        name: 'MSI GeForce RTX 4080 SUPER 16G GAMING X SLIM',
        price: 31990000,
        originalPrice: 35990000,
        discount: 11,
        image: '/images/gpu-white.jpg',
        slug: 'msi-geforce-rtx-4080-super-16g-gaming-x-slim',
        rating: 5,
        reviews: 44,
        specs: 'VRAM: 16GB GDDR6X | Bus: 256-bit | TRI FROZR 3',
        category: 'GPU - Card Màn Hình',
        brand: 'MSI',
        badge: 'HOT',
        badgeColor: 'red',
      },
      {
        id: 'p-gpu-3',
        name: 'Gigabyte GeForce RTX 4070 Ti SUPER EAGLE OC 16G',
        price: 23490000,
        originalPrice: 26290000,
        discount: 11,
        image: '/images/gpu-white.jpg',
        slug: 'gigabyte-geforce-rtx-4070-ti-super-eagle-oc-16g',
        rating: 5,
        reviews: 31,
        specs: 'VRAM: 16GB GDDR6X | Bus: 256-bit | WINDFORCE 3X',
        category: 'GPU - Card Màn Hình',
        brand: 'Gigabyte',
        badge: 'BÁN CHẠY',
        badgeColor: 'blue',
      },
      {
        id: 'p-gpu-4',
        name: 'ASUS TUF Gaming GeForce RTX 4060 Ti 8GB GDDR6',
        price: 11890000,
        originalPrice: 13490000,
        discount: 12,
        image: '/images/gpu-strix.jpg',
        slug: 'asus-tuf-gaming-geforce-rtx-4060-ti-8gb',
        rating: 5,
        reviews: 86,
        specs: 'VRAM: 8GB GDDR6 | Bus: 128-bit | Axial-tech Fans',
        category: 'GPU - Card Màn Hình',
        brand: 'ASUS',
        badge: 'QUỐC DÂN',
        badgeColor: 'blue',
      },
    ],
  },
];

export default function TabbedProducts() {
  const [activeGroup, setActiveGroup] = useState('cpu');
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<TabProduct[]>(TAB_GROUPS[0].defaults);
  const [loading, setLoading] = useState(false);

  const group = TAB_GROUPS.find(g => g.id === activeGroup) || TAB_GROUPS[0];

  useEffect(() => {
    let isSubscribed = true;

    async function loadGroupProducts() {
      setLoading(true);
      try {
        let search = '';
        if (activeGroup === 'cpu') {
          if (activeSubTab === 1) search = 'Intel';
          else if (activeSubTab === 2) search = 'AMD';
        } else if (activeGroup === 'mainboard') {
          if (activeSubTab === 1) search = 'ASUS';
          else if (activeSubTab === 2) search = 'MSI';
          else if (activeSubTab === 3) search = 'Gigabyte';
        } else if (activeGroup === 'ram') {
          if (activeSubTab === 1) search = 'DDR5';
          else if (activeSubTab === 2) search = 'DDR4';
          else if (activeSubTab === 3) search = 'Corsair';
        } else if (activeGroup === 'gpu') {
          if (activeSubTab === 1) search = 'NVIDIA';
          else if (activeSubTab === 2) search = 'AMD';
        }

        const params = new URLSearchParams();
        params.set('category', group.slug);
        if (search) params.set('search', search);
        params.set('limit', '8');

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('API fetch error');
        const data = await res.json();

        if (isSubscribed && data.products && data.products.length > 0) {
          const mapped: TabProduct[] = data.products.map((p: any, idx: number) => {
            const price = Number(p.price);
            const origPrice = Number(p.original_price ?? p.originalPrice) || Math.round(price * 1.14);
            const discount = Math.round(((origPrice - price) / origPrice) * 100);
            return {
              id: p.id,
              name: p.name,
              price,
              originalPrice: origPrice,
              discount: discount > 0 ? discount : 12,
              image: p.image_url || group.bannerImg,
              slug: p.slug,
              rating: 5,
              reviews: Math.floor(Math.random() * 50) + 30,
              specs: p.specs ? Object.entries(p.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ') : 'Chính hãng PCHub',
              category: p.category_name || group.label,
              brand: p.brand_name || group.label.split(' - ')[0],
              badge: idx === 0 ? 'BÁN CHẠY' : (idx === 1 ? 'HOT' : undefined),
              badgeColor: idx === 0 ? 'blue' : 'red',
            };
          });
          setDisplayProducts(mapped);
        } else if (isSubscribed) {
          // Fallback filter on default products if DB returned empty
          if (search) {
            const filtered = group.defaults.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
            setDisplayProducts(filtered.length > 0 ? filtered : group.defaults);
          } else {
            setDisplayProducts(group.defaults);
          }
        }
      } catch (err) {
        if (isSubscribed) {
          setDisplayProducts(group.defaults);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadGroupProducts();

    return () => {
      isSubscribed = false;
    };
  }, [activeGroup, activeSubTab, group]);

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    setActiveSubTab(0);
  };

  return (
    <section className="home-tabbed-products" style={{ background: '#ffffff', padding: '32px 0 44px', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Sparkles size={13} /> SẢN PHẨM TIÊU BIỂU
              </span>
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#0f172a',
              margin: '6px 0 0 0',
              letterSpacing: '-0.02em',
            }}>
              Linh Kiện Tiêu Biểu Theo Danh Mục
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
              Tuyển chọn các dòng CPU, Mainboard, RAM & GPU bán chạy nhất tại PCHub
            </p>
          </div>

          <Link
            href={`/danh-muc/${group.slug}`}
            style={{
              color: group.accentColor,
              fontSize: '13.5px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: group.bgColor,
              transition: 'all 0.2s',
            }}
          >
            Xem tất cả {group.label.split(' - ')[0]} <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Selector Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}>
          {TAB_GROUPS.map(g => {
            const isActive = activeGroup === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleGroupChange(g.id)}
                style={{
                  padding: '12px 22px',
                  borderRadius: '14px',
                  border: `2px solid ${isActive ? g.accentColor : '#e2e8f0'}`,
                  background: isActive ? g.accentColor : '#fff',
                  color: isActive ? '#fff' : '#334155',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 6px 18px ${g.accentColor}33` : '0 1px 3px rgba(0,0,0,0.03)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{g.icon}</span>
                <span>{g.label.split(' - ')[0]}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#fff' : '#64748b',
                }}>
                  {g.label.split(' - ')[1] || 'Hot'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs / Filter Tags */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          background: '#f8fafc',
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
        }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
            Lọc dòng sản phẩm:
          </span>
          {group.subTabs.map((sub, idx) => {
            const isSubActive = activeSubTab === idx;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubTab(idx)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: isSubActive ? group.accentColor : '#fff',
                  color: isSubActive ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSubActive ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Product Cards Lưới 4 cột */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Đang tải danh mục {group.label}...</p>
          </div>
        ) : (
          <div className="home-grid-4">
            {displayProducts.map(p => (
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
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}


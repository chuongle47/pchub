'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { summarizeSpecs } from '@/lib/product-ui';

interface HotProduct {
  id: string;
  badge: string;
  badgeColor: 'red' | 'blue';
  image: string;
  category: string;
  name: string;
  specs: string;
  price: number;
  originalPrice: number;
  discount: number;
  slug: string;
}

const DEFAULT_HOT: HotProduct[] = [
  { id: 'p-2', badge: 'HOT', badgeColor: 'red', image: '/images/gpu-strix.jpg', category: 'GPU - Card Màn Hình', name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB', specs: 'VRAM: 24GB GDDR6X | Bus: 384-bit', price: 54990000, originalPrice: 59990000, discount: 8, slug: 'asus-rog-strix-geforce-rtx-4090' },
  { id: 'p-1', badge: 'BÁN CHẠY', badgeColor: 'blue', image: '/images/cpu-box.jpg', category: 'CPU - Bộ Vi Xử Lý', name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)', specs: '24 Cores | 32 Threads | LGA 1700', price: 13990000, originalPrice: 15990000, discount: 12, slug: 'intel-core-i9-14900k' },
  { id: 'p-3', badge: 'BÁN CHẠY', badgeColor: 'blue', image: '/images/ram-corsair.jpg', category: 'RAM - Bộ Nhớ Trong', name: 'RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5', specs: 'Capacity: 32GB | Speed: 6000MHz', price: 4290000, originalPrice: 4890000, discount: 12, slug: 'corsair-dominator-titanium-rgb-32gb-ddr5' },
  { id: 'p-4', badge: 'HOT', badgeColor: 'red', image: '/images/ssd-samsung.jpg', category: 'SSD / HDD', name: 'SSD Samsung 990 PRO 2TB PCIe Gen 4.0 x4 NVMe', specs: 'Read: 7450MB/s | Write: 6900MB/s', price: 4690000, originalPrice: 5190000, discount: 10, slug: 'samsung-990-pro-2tb-nvme' }
];

export default function MostViewed() {
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const [products, setProducts] = useState<HotProduct[]>(DEFAULT_HOT);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHotProducts() {
      try {
        const res = await fetch('/api/products?sort=price_desc&limit=4');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const mapped: HotProduct[] = data.products.map((p: any, idx: number) => {
            const price = Number(p.price);
            return {
              id: p.id,
              badge: idx === 0 ? 'HOT' : 'BÁN CHẠY',
              badgeColor: idx === 0 ? 'red' : 'blue',
              image: p.image_url || '/images/gpu-strix.jpg',
              category: p.category_name || 'Linh kiện PC',
              name: p.name,
              specs: summarizeSpecs(p.specs, p.sku),
              price,
              originalPrice: price,
              discount: 0,
              slug: p.slug
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load hot products:', err);
      }
    }
    loadHotProducts();
  }, []);

  const handleAdd = (p: HotProduct, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      category: p.category,
      brand: '',
      slug: p.slug,
    });
    setOpen(true);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <section className="home-hot-products" style={{ background: '#f8fafc', padding: '36px 0 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', color: '#ef4444' }}>🔥</span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Sản phẩm cực HOT
            </h2>
          </div>

          <Link href="/search?hot=true" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Xem tất cả
          </Link>
        </div>

        {/* 4 Column Cards Grid matching exact screenshot */}
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải sản phẩm từ catalog...</p>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {products.map(p => {
            const isAdded = addedId === p.id;

            return (
              <Link key={p.id} href={`/product/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'none';
                }}
                >
                  {/* Top Left Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 2,
                    background: p.badgeColor === 'red' ? '#ef4444' : '#2563eb',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}>
                    {p.badge}
                  </div>

                  {/* Image Container */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    marginBottom: '14px',
                  }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }}
                      onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                    />
                  </div>

                  {/* Subtitle Category in Blue */}
                  <div style={{
                    fontSize: '11px',
                    color: '#3b82f6',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}>
                    {p.category}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: '1.35',
                    marginBottom: '6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '38px',
                  }}>
                    {p.name}
                  </h3>

                  {/* Feature Specs Line */}
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '14px',
                    fontWeight: 500,
                  }}>
                    {p.specs}
                  </div>

                  {/* Price & Tag & Shopping Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>
                          {p.price.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>

                    {/* Dark Rounded Square Cart Button */}
                    <button
                      onClick={e => handleAdd(p, e)}
                      aria-label="Thêm vào giỏ hàng"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isAdded ? '#16a34a' : '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isAdded) e.currentTarget.style.background = '#2563eb';
                      }}
                      onMouseLeave={e => {
                        if (!isAdded) e.currentTarget.style.background = '#0f172a';
                      }}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}



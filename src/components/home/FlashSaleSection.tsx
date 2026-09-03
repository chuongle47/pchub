'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface FlashProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
}

const DEFAULT_FLASH: FlashProduct[] = [
  { id: 'p-1', name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)', category: 'CPU - Bộ Vi Xử Lý', price: 13990000, originalPrice: 15990000, discount: 12, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k' },
  { id: 'p-2', name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB', category: 'GPU - Card Màn Hình', price: 54990000, originalPrice: 59990000, discount: 8, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4090' },
  { id: 'p-3', name: 'RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz', category: 'RAM - Bộ Nhớ Trong', price: 4290000, originalPrice: 4890000, discount: 12, image: '/images/ram-corsair.jpg', slug: 'corsair-dominator-titanium-rgb-32gb-ddr5' },
  { id: 'p-4', name: 'SSD Samsung 990 PRO 2TB PCIe Gen 4.0 x4 NVMe', category: 'SSD / HDD - Ổ Đĩa Cứng', price: 4690000, originalPrice: 5190000, discount: 10, image: '/images/ssd-samsung.jpg', slug: 'samsung-990-pro-2tb-nvme' }
];

export default function FlashSaleSection() {
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const [products, setProducts] = useState<FlashProduct[]>(DEFAULT_FLASH);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFlashProducts() {
      try {
        const res = await fetch('/api/products?limit=4&sort=price_asc');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const mapped: FlashProduct[] = data.products.map((p: any) => {
            const price = Number(p.price);
            const originalPrice = price;
            return {
              id: p.id,
              name: p.name,
              category: p.category_name || 'Linh kiện PC',
              price,
              originalPrice,
              discount: 0,
              image: p.image_url || '/images/cpu-box.jpg',
              slug: p.slug
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load flash sale products:', err);
      }
    }
    loadFlashProducts();
  }, []);

  const handleAddCart = (p: FlashProduct, e: React.MouseEvent) => {
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
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="home-flash-sale" style={{ background: '#ffffff', padding: '24px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Pink/Red Banner Box Header */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecdd3',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#ef4444',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>⚡</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#ef4444',
                  margin: 0,
                  letterSpacing: '-0.3px',
                  textTransform: 'uppercase',
                }}>FLASH SALE</h2>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Giá tốt trong catalog</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {products.map(p => {
            const isAdded = addedId === p.id;

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'none';
                }}
                >
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    marginBottom: '12px',
                  }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }}
                      onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                    />
                  </div>

                  {/* Product Subtitle / Category */}
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginBottom: '4px',
                    fontWeight: 500,
                  }}>
                    {p.category}
                  </div>

                  {/* Product Name */}
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: '1.4',
                    marginBottom: '10px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '36px',
                  }}>
                    {p.name}
                  </h3>

                  {/* Price & Cart Icon Button Container */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: '#0f172a',
                      }}>
                        {p.price.toLocaleString('vi-VN')}₫
                      </div>
                    </div>

                    {/* Round Shopping Cart Button */}
                    <button
                      onClick={e => handleAddCart(p, e)}
                      aria-label="Thêm vào giỏ hàng"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isAdded ? '#16a34a' : '#1e293b',
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
                        if (!isAdded) e.currentTarget.style.background = '#1e293b';
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
      </div>
    </section>
  );
}
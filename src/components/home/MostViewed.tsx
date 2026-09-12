'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { summarizeSpecs, getProductOriginalPrice } from '@/lib/product-ui';
import ProductCard from '@/components/shop/ProductCard';

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
  {
    id: 'hot-1',
    badge: 'HOT',
    badgeColor: 'red',
    image: '/images/cpu-box.jpg',
    category: 'CPU - Bộ Vi Xử Lý',
    name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
    specs: 'LGA1700 · 24 Nhân 32 Luồng · 6.0GHz',
    price: 13990000,
    originalPrice: 16490000,
    discount: 15,
    slug: 'intel-core-i9-14900k'
  },
  {
    id: 'hot-2',
    badge: 'BÁN CHẠY',
    badgeColor: 'blue',
    image: '/images/gpu-strix.jpg',
    category: 'GPU - Card Màn Hình',
    name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB',
    specs: '24GB GDDR6X · 384-bit · PCI Express 4.0',
    price: 54990000,
    originalPrice: 62990000,
    discount: 13,
    slug: 'asus-rog-strix-geforce-rtx-4090'
  }
];

export default function MostViewed() {
  const [products, setProducts] = useState<HotProduct[]>(DEFAULT_HOT);

  useEffect(() => {
    async function loadHotProducts() {
      try {
        const res = await fetch('/api/products?limit=8&sort=price_desc');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const mapped: HotProduct[] = data.products.map((p: any, idx: number) => {
            const price = Number(p.price);
            const origPrice = Number(p.original_price || p.originalPrice) || getProductOriginalPrice(price, p.slug);
            const discount = Math.round(((origPrice - price) / origPrice) * 100);
            return {
              id: p.id,
              badge: idx === 0 ? 'HOT' : 'BÁN CHẠY',
              badgeColor: idx === 0 ? 'red' : 'blue',
              image: p.image_url || '/images/gpu-strix.jpg',
              category: p.category_name || 'Linh kiện PC',
              name: p.name,
              specs: summarizeSpecs(p.specs, p.sku),
              price,
              originalPrice: origPrice,
              discount,
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

          <Link href="/search?hot=true" className="view-all-btn">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4 Column Cards Grid matching exact screenshot */}
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải sản phẩm từ catalog...</p>
        ) : (
        <div className="home-grid-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              image={p.image}
              category={p.category}
              brand={p.category.split(' - ')[0] || p.category}
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



'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/shop/ProductCard';
import { getProductOriginalPrice, resolveProductOriginalPrice } from '@/lib/product-ui';

interface FlashProduct {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
}

interface FlashSaleSectionProps {
  endTime?: string | Date | number;
}

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

function calculateTimeRemaining(targetEndTime?: string | Date | number): TimerState {
  const now = new Date();
  let target: Date;
  if (targetEndTime) {
    target = new Date(targetEndTime);
  } else {
    // 2-hour rolling Flash Sale session (e.g. 0-2h, 2-4h, 4-6h, 6-8h, 8-10h, 10-12h, 12-14h, 14-16h, 16-18h, 18-20h, 20-22h, 22-24h)
    const currentHour = now.getHours();
    const nextSessionHour = currentHour + (2 - (currentHour % 2));
    target = new Date(now);
    if (nextSessionHour >= 24) {
      target.setDate(target.getDate() + 1);
      target.setHours(0, 0, 0, 0);
    } else {
      target.setHours(nextSessionHour, 0, 0, 0);
    }
  }

  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { hours: 1, minutes: 59, seconds: 59, isEnded: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { hours, minutes, seconds, isEnded: false };
}

export default function FlashSaleSection({ endTime }: FlashSaleSectionProps = {}) {
  const [products, setProducts] = useState<FlashProduct[]>([]);

  // Real-time Countdown Timer state with live values, avoiding --:--:--
  const [timer, setTimer] = useState<TimerState>(() => calculateTimeRemaining(endTime));

  useEffect(() => {
    setTimer(calculateTimeRemaining(endTime));
    const interval = setInterval(() => {
      setTimer(calculateTimeRemaining(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    async function loadFlashProducts() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          // Lọc các sản phẩm trong API có giảm giá (badge 'sale' hoặc có giá gốc cao hơn giá bán)
          const onSaleProducts = data.products.filter((p: any) => 
            p.badge === 'sale' || 
            (p.original_price && Number(p.original_price) > Number(p.price)) ||
            (p.originalPrice && Number(p.originalPrice) > Number(p.price))
          );

          // Ưu tiên chọn các sản phẩm giảm giá từ API trước, nếu chưa đủ 4 sản phẩm thì bổ sung các sản phẩm khác
          const otherProducts = data.products.filter((p: any) => !onSaleProducts.some((s: any) => s.id === p.id));
          const selected = [...onSaleProducts, ...otherProducts].slice(0, 4);

          const mapped: FlashProduct[] = selected.map((p: any) => {
            const price = Number(p.price);
            const orig = Number(p.original_price || p.originalPrice || 0);

            // Calculation based on real original price or realistic discount
            const originalPrice = orig > price ? orig : Math.round((price * 1.15) / 10000) * 10000;
            const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

            return {
              id: p.id,
              name: p.name,
              category: p.category_name || 'Linh kiện PC',
              brand: p.brand_name || p.brand || undefined,
              price,
              originalPrice,
              discount: discount > 0 ? discount : 12,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#ef4444',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                }}>FLASH SALE</h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                }}>
                  ƯU ĐÃI GIỜ VÀNG
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Sản phẩm giá tốt theo khung giờ — Số lượng có hạn</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            {!timer.isEnded ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#fee2e2',
                color: '#dc2626',
                padding: '3px 9px',
                borderRadius: '20px',
                border: '1px solid #fecaca',
                letterSpacing: '0.02em',
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.35)',
                }} />
                ĐANG DIỄN RA
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#f1f5f9',
                color: '#64748b',
                padding: '3px 9px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                letterSpacing: '0.02em',
              }}>
                ĐÃ KẾT THÚC
              </span>
            )}

            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              {timer.isEnded ? 'Phiên ưu đãi đã kết thúc:' : 'Kết thúc trong:'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                background: timer.isEnded ? '#64748b' : '#ef4444',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 900,
                minWidth: '28px',
                textAlign: 'center',
                boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(timer.hours).padStart(2, '0')}
              </span>
              <span style={{ fontWeight: 900, color: timer.isEnded ? '#64748b' : '#ef4444' }}>:</span>
              <span style={{
                background: timer.isEnded ? '#64748b' : '#ef4444',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 900,
                minWidth: '28px',
                textAlign: 'center',
                boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(timer.minutes).padStart(2, '0')}
              </span>
              <span style={{ fontWeight: 900, color: timer.isEnded ? '#64748b' : '#ef4444' }}>:</span>
              <span style={{
                background: timer.isEnded ? '#64748b' : '#ef4444',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 900,
                minWidth: '28px',
                textAlign: 'center',
                boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(timer.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="home-grid-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              image={p.image}
              category={p.category}
              brand={p.brand}
              price={p.price}
              originalPrice={p.originalPrice}
              discount={p.discount}
              stock={true}
              showCompare={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
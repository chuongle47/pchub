'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/shop/ProductCard';
import { getProductOriginalPrice, resolveProductOriginalPrice } from '@/lib/product-ui';

export interface FlashProduct {
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

export interface FlashSaleSectionProps {
  endTime?: string | Date | number;
  initialData?: any;
}

export function mapFlashProducts(rawList: any[]): FlashProduct[] {
  return rawList.map((p: any) => {
    const price = Number(p.sale_price || p.price);
    const orig = Number(p.regular_price || p.originalPrice || 0);
    const originalPrice = orig > price ? orig : Math.round((price * 1.15) / 10000) * 10000;
    const discount = Number(p.discount_percent) || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 15);

    return {
      id: String(p.id),
      name: p.name,
      category: p.category || (p.name.toLowerCase().includes('loa') ? 'Loa máy tính' : p.name.toLowerCase().includes('chuột') ? 'Chuột Gaming' : p.name.toLowerCase().includes('case') ? 'Vỏ Case' : p.name.toLowerCase().includes('ram') ? 'RAM' : 'Linh kiện PC'),
      brand: p.brand || (p.name.includes('Logitech') ? 'Logitech' : p.name.includes('Edifier') ? 'Edifier' : p.name.includes('Razer') ? 'Razer' : p.name.includes('NZXT') ? 'NZXT' : p.name.includes('Corsair') ? 'Corsair' : undefined),
      price,
      originalPrice,
      discount: discount > 0 ? discount : 15,
      image: p.image || '/images/cpu-box.jpg',
      slug: p.slug || String(p.id),
    };
  });
}

export default function FlashSaleSection({ endTime, initialData }: FlashSaleSectionProps = {}) {
  const initialProducts = initialData && Array.isArray(initialData.products) && initialData.products.length > 0
    ? mapFlashProducts(initialData.products)
    : [];
  const initialEnd = initialData?.active_end_time || endTime;

  const [products, setProducts] = useState<FlashProduct[]>(initialProducts);
  const [targetEndTime, setTargetEndTime] = useState<string | Date | number | undefined>(initialEnd);

  // Real-time Countdown Timer state with live values, avoiding --:--:--
  const [timer, setTimer] = useState<TimerState>(() => calculateTimeRemaining(targetEndTime));

  useEffect(() => {
    setTimer(calculateTimeRemaining(targetEndTime));
    const interval = setInterval(() => {
      setTimer(calculateTimeRemaining(targetEndTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetEndTime]);

  useEffect(() => {
    async function loadFlashProducts() {
      try {
        // 1. Ưu tiên tải sản phẩm từ Plugin WordPress Flash Sale (/api/flash-sale)
        const fsRes = await fetch('/api/flash-sale', { cache: 'no-store' });
        if (fsRes.ok) {
          const fsData = await fsRes.json();
          if (fsData && Array.isArray(fsData.products) && fsData.products.length > 0) {
            const mappedFs = mapFlashProducts(fsData.products);
            setProducts(mappedFs);

            if (fsData.active_end_time && !endTime) {
              setTargetEndTime(fsData.active_end_time);
            }
            return;
          }
        }

        // 2. Dự phòng: Nếu WordPress không trả về sản phẩm flash sale, tải sản phẩm giảm giá từ kho
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const onSaleProducts = data.products.filter((p: any) => 
            p.badge === 'sale' || 
            (p.original_price && Number(p.original_price) > Number(p.price)) ||
            (p.originalPrice && Number(p.originalPrice) > Number(p.price))
          );

          const otherProducts = data.products.filter((p: any) => !onSaleProducts.some((s: any) => s.id === p.id));
          const selected = [...onSaleProducts, ...otherProducts].slice(0, 4);

          const mapped: FlashProduct[] = selected.map((p: any) => {
            const price = Number(p.price);
            const orig = Number(p.original_price || p.originalPrice || 0);
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
  }, [endTime]);

  return (
    <section className="home-flash-sale" style={{ background: '#ffffff', padding: '24px 0', scrollMarginTop: '100px' }}>
      <style>{`
        .flash-sale-banner-box {
          background: #fef2f2;
          border: 1px solid #fecdd3;
          border-radius: 14px;
          padding: 14px 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .flash-sale-subtext {
          font-size: 12px;
          color: #64748b;
          display: block;
          margin-top: 2px;
        }
        .flash-sale-timer-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .flash-sale-banner-box {
            padding: 12px 14px;
            gap: 10px;
          }
          .flash-sale-subtext {
            font-size: 11px;
          }
          .flash-sale-timer-wrap {
            width: 100%;
            justify-content: space-between;
            align-items: center;
            padding-top: 10px;
            border-top: 1px dashed #fecdd3;
            flex-wrap: nowrap;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Pink/Red Banner Box Header */}
        <div className="flash-sale-banner-box">
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
              flexShrink: 0,
            }}>⚡</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#ef4444',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>FLASH SALE</h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                  whiteSpace: 'nowrap',
                }}>
                  ƯU ĐÃI GIỜ VÀNG
                </span>
              </div>
              <span className="flash-sale-subtext">
                Sản phẩm giá tốt theo khung giờ — Số lượng có hạn
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flash-sale-timer-wrap">
            {!timer.isEnded ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                background: '#fee2e2',
                color: '#dc2626',
                padding: '3px 9px',
                borderRadius: '20px',
                border: '1px solid #fecaca',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.35)',
                  flexShrink: 0,
                }} />
                ĐANG DIỄN RA
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                background: '#f1f5f9',
                color: '#64748b',
                padding: '3px 9px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                ĐÃ KẾT THÚC
              </span>
            )}

            {/* Combined Timer Label and Digit Blocks */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {timer.isEnded ? 'Đã kết thúc:' : 'Kết thúc trong:'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <span style={{
                  background: timer.isEnded ? '#64748b' : '#ef4444',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  minWidth: '26px',
                  textAlign: 'center',
                  boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(timer.hours).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 900, color: timer.isEnded ? '#64748b' : '#ef4444', fontSize: '12px' }}>:</span>
                <span style={{
                  background: timer.isEnded ? '#64748b' : '#ef4444',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  minWidth: '26px',
                  textAlign: 'center',
                  boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(timer.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 900, color: timer.isEnded ? '#64748b' : '#ef4444', fontSize: '12px' }}>:</span>
                <span style={{
                  background: timer.isEnded ? '#64748b' : '#ef4444',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  minWidth: '26px',
                  textAlign: 'center',
                  boxShadow: timer.isEnded ? 'none' : '0 2px 4px rgba(239,68,68,0.2)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(timer.seconds).padStart(2, '0')}
                </span>
              </div>
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
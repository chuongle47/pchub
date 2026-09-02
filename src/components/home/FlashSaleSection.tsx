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

export default function FlashSaleSection() {
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFlashProducts() {
      try {
        const res = await fetch('/api/products?limit=4&sort=price_asc');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const mapped: FlashProduct[] = data.products.map((p: any) => {
            const price = Number(p.price);
            const originalPrice = Math.round(price * 1.15);
            return {
              id: p.id,
              name: p.name,
              category: p.category_name || 'Linh kiện PC',
              price: price,
              originalPrice: originalPrice,
              discount: 15,
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
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nhanh tay kẻo lỡ</span>
              </div>
            </div>
          </div>

          {/* Countdown Boxes: 07 : 14 : 21 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['07', '14', '21'].map((val, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: '#64748b', fontWeight: 800, fontSize: '14px' }}>:</span>}
                <div style={{
                  background: '#e2e8f0',
                  color: '#1e293b',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}>
                  {val}
                </div>
              </React.Fragment>
            ))}
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
                  {/* Top Left Discount Pill Tag */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2,
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}>
                    -{p.discount}%
                  </div>

                  {/* Product Image */}
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
                      <del style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {p.originalPrice.toLocaleString('vi-VN')}₫
                      </del>
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


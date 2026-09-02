'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface TabProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  slug: string;
  rating: number;
  reviews: number;
}

const TAB_GROUPS = [
  {
    id: 'cpu',
    catId: 'c1000000-0000-0000-0000-000000000001',
    label: 'CPU',
    icon: '🔲',
    subTabs: ['Intel Core', 'AMD Ryzen', 'Tất cả CPU'],
    bgColor: '#eff6ff',
    accentColor: '#2563eb',
  },
  {
    id: 'gpu',
    catId: 'c1000000-0000-0000-0000-000000000004',
    label: 'GPU',
    icon: '🎮',
    subTabs: ['NVIDIA', 'AMD Radeon', 'Tất cả GPU'],
    bgColor: '#f5f3ff',
    accentColor: '#7c3aed',
  },
  {
    id: 'ram-ssd',
    catId: 'c1000000-0000-0000-0000-000000000003',
    label: 'RAM & SSD',
    icon: '💾',
    subTabs: ['RAM DDR5', 'RAM DDR4', 'Ổ cứng SSD'],
    bgColor: '#f0fdf4',
    accentColor: '#16a34a',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '11px' }}>★</span>
      ))}
      <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px' }}>({rating})</span>
    </div>
  );
}

export default function TabbedProducts() {
  const [activeGroup, setActiveGroup] = useState('cpu');
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<TabProduct[]>([]);
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const [addedId, setAddedId] = useState<string | null>(null);

  const group = TAB_GROUPS.find(g => g.id === activeGroup)!;

  useEffect(() => {
    async function loadGroupProducts() {
      try {
        let catId = group.catId;
        let search = '';
        if (activeGroup === 'ram-ssd' && activeSubTab === 2) {
          catId = 'c1000000-0000-0000-0000-000000000005'; // Storage
        } else if (activeGroup === 'cpu') {
          if (activeSubTab === 0) search = 'Intel';
          else if (activeSubTab === 1) search = 'AMD';
        } else if (activeGroup === 'gpu') {
          if (activeSubTab === 0) search = 'ASUS';
          else if (activeSubTab === 1) search = 'Sapphire';
        }

        const params = new URLSearchParams();
        if (catId) params.set('category_id', catId);
        if (search) params.set('search', search);
        params.set('limit', '6');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.products) {
          const mapped: TabProduct[] = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            originalPrice: Math.round(Number(p.price) * 1.15),
            discount: 15,
            image: p.image_url || '/images/cpu-box.jpg',
            slug: p.slug,
            rating: 5,
            reviews: 42
          }));
          setDisplayProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load tabbed products:', err);
      }
    }
    loadGroupProducts();
  }, [activeGroup, activeSubTab]);

  const handleGroup = (id: string) => {
    setActiveGroup(id);
    setActiveSubTab(0);
  };

  const handleAddCart = (p: TabProduct, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image, category: group.label, brand: '', slug: p.slug });
    setOpen(true);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <section style={{ background: '#fff', padding: '32px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Main tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #f1f5f9',
          marginBottom: '24px',
          gap: '0',
        }}>
          {TAB_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => handleGroup(g.id)}
              style={{
                padding: '10px 28px',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                borderBottom: activeGroup === g.id ? `2px solid ${g.accentColor}` : '2px solid transparent',
                marginBottom: '-2px',
                color: activeGroup === g.id ? g.accentColor : '#64748b',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{g.icon}</span> {g.label}
            </button>
          ))}
        </div>

        {/* Content: sidebar + grid */}
        <div style={{ display: 'flex', gap: '20px' }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <div style={{
              background: group.bgColor,
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              height: '140px',
            }}>
              {group.icon}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.subTabs.map((sub, i) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(i)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: activeSubTab === i ? 700 : 500,
                    background: activeSubTab === i ? group.accentColor : 'transparent',
                    color: activeSubTab === i ? '#fff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (activeSubTab !== i) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    if (activeSubTab !== i) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {sub}
                  {activeSubTab === i && <ChevronRight size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT GRID */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {displayProducts.slice(0, 6).map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                  >
                    {/* Image */}
                    <div style={{
                      background: '#f8fafc',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      {p.discount && (
                        <span style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: '#ef4444', color: '#fff',
                          padding: '1px 6px', borderRadius: '4px',
                          fontSize: '10px', fontWeight: 800,
                        }}>-{p.discount}%</span>
                      )}
                      <img src={p.image} alt={p.name} style={{ maxHeight: '90px', maxWidth: '90%', objectFit: 'contain' }} />
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px' }}>
                      <p style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: '1.4',
                        marginBottom: '5px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '30px',
                      }}>{p.name}</p>

                      <StarRating rating={p.rating} />

                      <div style={{ margin: '5px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                          {p.price.toLocaleString('vi-VN')} ₫
                        </span>
                        {p.originalPrice && (
                          <del style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                            {p.originalPrice.toLocaleString('vi-VN')} ₫
                          </del>
                        )}
                      </div>

                      <button
                        onClick={e => handleAddCart(p, e)}
                        style={{
                          width: '100%',
                          background: addedId === p.id ? '#16a34a' : group.accentColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 0',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <ShoppingCart size={11} />
                        {addedId === p.id ? '✓ Đã thêm' : 'Thêm giỏ'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link
                href={`/search?category=${activeGroup}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: group.accentColor,
                  border: `1px solid ${group.accentColor}`,
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = group.bgColor)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Xem tất cả {group.label} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

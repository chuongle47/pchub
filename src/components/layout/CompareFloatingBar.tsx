'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, X, Trash2, ChevronRight } from 'lucide-react';
import { useCompareStore } from '@/lib/store';
import { getProductImage } from '@/lib/product-ui';

interface ProductMin {
  id: string;
  slug: string;
  name: string;
  category?: string;
  image: string;
  price: number;
}

export default function CompareFloatingBar() {
  const router = useRouter();
  const { items, activeCategory, removeCompare, clearCompare } = useCompareStore();
  const [products, setProducts] = useState<ProductMin[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync products when compare items change
  useEffect(() => {
    if (!items || items.length === 0) {
      setProducts([]);
      return;
    }

    async function loadCompareItems() {
      setLoading(true);
      try {
        const idsParam = items.join(',');
        const res = await fetch(`/api/products/compare?ids=${encodeURIComponent(idsParam)}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const mapped: ProductMin[] = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category_name || 'Linh kiện',
            image: getProductImage({ name: p.name, categoryName: p.category_name, image_url: p.image_url }),
            price: Number(p.price),
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch floating compare items:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCompareItems();
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  const handleCompareClick = () => {
    const idsParam = items.join(',');
    router.push(`/so-sanh?ids=${encodeURIComponent(idsParam)}`);
  };

  const displayCategory = activeCategory || products[0]?.category || 'Cùng danh mục';

  return (
    <div
      className="compare-floating-bar"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        width: '92%',
        maxWidth: '820px',
        background: '#0f172a',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '12px 18px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backdropFilter: 'blur(12px)',
        fontFamily: 'var(--font-primary, system-ui, sans-serif)',
      }}
    >
      {/* Left: Info badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            background: 'var(--color-primary, #2563eb)',
            color: '#fff',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 800,
          }}
        >
          <ArrowLeftRight size={15} />
          <span>So sánh {displayCategory}: ({items.length}/4)</span>
        </div>
      </div>

      {/* Center: Selected Products Thumbnails */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          maxWidth: '440px',
          padding: '2px 0',
        }}
      >
        {items.map((slug) => {
          const prod = products.find((p) => p.slug === slug || p.id === slug);
          return (
            <div
              key={slug}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '4px 8px 4px 4px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={prod?.image || '/images/cpu-box.jpg'}
                  alt={prod?.name || slug}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  maxWidth: '90px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#cbd5e1',
                }}
                title={prod?.name || slug}
              >
                {prod?.name ? prod.name.split(' ')[0] + ' ' + (prod.name.split(' ')[1] || '') : slug}
              </span>

              <button
                type="button"
                onClick={() => removeCompare(slug, prod?.id)}
                title="Xóa sản phẩm này"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Right: Actions (Clear All & Compare Now) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={clearCompare}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <Trash2 size={13} />
          <span>Xóa tất cả</span>
        </button>

        <button
          type="button"
          onClick={handleCompareClick}
          style={{
            background: 'var(--color-primary, #2563eb)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary, #2563eb)')}
        >
          <span>So sánh ngay ({items.length})</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

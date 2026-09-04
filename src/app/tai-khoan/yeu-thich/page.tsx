'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function WishlistPage() {
  const ids = useWishlistStore(state => state.ids);
  const toggle = useWishlistStore(state => state.toggle);
  const addItem = useCartStore(state => state.addItem);
  const setOpen = useCartStore(state => state.setOpen);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (!ids || ids.length === 0) {
        setProducts([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(','))}`);
        const data = await res.json();
        if (data.products) {
          const mapped = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            nameVi: p.name,
            price: Number(p.price),
            category: p.category_name || 'Linh kiện',
            brand: p.brand_name || 'Chính hãng',
            images: [p.image_url || '/images/gpu-strix.jpg']
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      }
    }
    loadWishlistProducts();
  }, [ids]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Danh sách yêu thích</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Theo dõi biến động giá và lưu trữ các sản phẩm quan tâm</p>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 800,
          color: '#2563eb',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '4px 14px',
          borderRadius: '20px',
        }}>
          {products.length} sản phẩm
        </span>
      </div>

      {products.length ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '20px',
        }}>
          {products.map(product => (
            <div
              key={product.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Image box */}
              <div style={{
                position: 'relative',
                background: '#f8fafc',
                width: '100%',
                aspectRatio: '1 / 1',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <Link href={`/product/${product.slug}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={product.images[0]}
                    alt={product.nameVi}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  }}
                  aria-label="Bỏ yêu thích"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>

              {/* Content box */}
              <div style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                gap: '12px',
              }}>
                <div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    {product.brand} · {product.category}
                  </span>
                  <Link
                    href={`/product/${product.slug}`}
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      textDecoration: 'none',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.nameVi}
                  </Link>
                </div>

                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#2563eb',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                  }}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      addItem({ id: product.id, name: product.nameVi, price: product.price, image: product.images[0], category: product.category, brand: product.brand, slug: product.slug });
                      setOpen(true);
                    }}
                    style={{
                      width: '100%',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                    }}
                  >
                    <ShoppingCart size={15} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <Heart size={48} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Chưa có sản phẩm yêu thích</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px auto 0 auto', maxWidth: '360px' }}>Nhấn biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại danh sách theo dõi tại đây.</p>
          <Link
            href="/"
            style={{
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Khám phá sản phẩm <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
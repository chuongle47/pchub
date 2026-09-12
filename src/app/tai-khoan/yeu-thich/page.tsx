'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/lib/store';
import ProductCard from '@/components/shop/ProductCard';

export default function WishlistPage() {
  const ids = useWishlistStore(state => state.ids);
  const toggle = useWishlistStore(state => state.toggle);
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
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.nameVi || product.name}
              slug={product.slug}
              image={product.images?.[0]}
              images={product.images}
              price={product.price}
              originalPrice={product.originalPrice}
              category={product.category}
              brand={product.brand}
              stock={true}
            />
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
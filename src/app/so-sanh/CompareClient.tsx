'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftRight, Check, ChevronRight, X, Trash2, Plus, ShoppingCart } from 'lucide-react';
import { useCompareStore, useCartStore } from '@/lib/store';
import { formatVnd, getProductImage } from '@/lib/product-ui';

interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  categorySlug?: string;
  image: string;
  specs: Record<string, any>;
  warrantyMonths: number;
}

export default function CompareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIdsParam = searchParams.get('ids');

  const { items, activeCategory, removeCompare, clearCompare } = useCompareStore();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync compare items from URL or Store
  useEffect(() => {
    let slugsToFetch: string[] = [];

    if (urlIdsParam) {
      slugsToFetch = urlIdsParam.split(',').filter(Boolean);
    } else if (items && items.length > 0) {
      slugsToFetch = items;
      // Auto-update URL query params if missing
      router.replace(`/so-sanh?ids=${encodeURIComponent(items.join(','))}`);
    }

    if (slugsToFetch.length === 0) {
      setProducts([]);
      setSpecKeys([]);
      setLoading(false);
      return;
    }

    async function fetchCompareData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/compare?ids=${encodeURIComponent(slugsToFetch.join(','))}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const mapped: CompareProduct[] = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            stock: Number(p.stock ?? 15),
            brand: p.brand_name || 'Thương hiệu',
            category: p.category_name || 'Danh mục',
            categorySlug: p.category_slug || p.category_id,
            image: getProductImage({ name: p.name, categoryName: p.category_name, image_url: p.image_url }),
            specs: p.specs || {},
            warrantyMonths: 36,
          }));

          setProducts(mapped);
          setSpecKeys(data.specKeys || [...new Set(mapped.flatMap((m) => Object.keys(m.specs)))]);
        }
      } catch (err) {
        console.error('Failed to load compare products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompareData();
  }, [urlIdsParam, items]);

  const handleRemoveProduct = (slug: string) => {
    removeCompare(slug);
    const newProducts = products.filter((p) => p.slug !== slug && p.id !== slug);
    setProducts(newProducts);
    const remainingSlugs = newProducts.map((p) => p.slug);
    if (remainingSlugs.length > 0) {
      router.replace(`/so-sanh?ids=${encodeURIComponent(remainingSlugs.join(','))}`);
    } else {
      router.replace('/so-sanh');
    }
  };

  const handleClearAll = () => {
    clearCompare();
    setProducts([]);
    router.replace('/so-sanh');
  };

  const handleAddToCart = (product: CompareProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
      slug: product.slug,
    });
    setCartOpen(true);
  };

  const currentCategoryName = activeCategory || products[0]?.category || null;
  const currentCategoryParam = products[0]?.categorySlug || currentCategoryName || '';

  const tableMinWidth = `${160 + Math.max(products.length, 1) * 220}px`;
  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: `160px repeat(${Math.max(products.length, 1)}, minmax(200px, 1fr))`,
  } as const;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>So sánh sản phẩm</span>
        </div>

        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
              PCHUB COMPARE TOOL — SO SÁNH CÙNG DANH MỤC
            </div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', lineHeight: 1.2, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowLeftRight size={28} color="#2563eb" /> So sánh chi tiết thông số
            </h1>
            {currentCategoryName && (
              <div style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '13px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '8px',
              }}>
                🏷️ Đang so sánh sản phẩm trong danh mục: <strong>{currentCategoryName}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {products.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} />
                <span>Xóa tất cả</span>
              </button>
            )}

            <Link
              href={currentCategoryParam ? `/search?category=${encodeURIComponent(currentCategoryParam)}` : '/search'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Plus size={15} />
              <span>{currentCategoryName ? `Thêm sản phẩm ${currentCategoryName}` : 'Thêm sản phẩm'}</span>
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Đang tải dữ liệu so sánh...</div>
          </div>
        ) : products.length < 2 ? (
          /* Empty / Insufficient Products State */
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '64px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#eff6ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ArrowLeftRight size={32} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Vui lòng chọn ít nhất 2 sản phẩm để đối chiếu
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              Bạn có thể nhấn vào biểu tượng <strong>So sánh (⇄)</strong> trên bất kỳ thẻ sản phẩm nào ở Trang chủ hoặc Trang Tìm kiếm để bắt đầu đối chiếu.
            </p>
            <Link
              href="/search"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>Khám phá sản phẩm ngay</span>
            </Link>
          </div>
        ) : (
          /* Comparison Table */
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: tableMinWidth }}>
                
                {/* Header Row: Products */}
                <div style={columnsStyle}>
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '20px 16px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 800,
                      borderBottom: '2px solid #e2e8f0',
                    }}
                  >
                    SẢN PHẨM ({products.length})
                  </div>

                  {products.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        padding: '16px',
                        borderLeft: '1px solid #e2e8f0',
                        borderBottom: '2px solid #e2e8f0',
                        position: 'relative',
                        background: '#ffffff',
                      }}
                    >
                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.slug)}
                        title="Bỏ khỏi so sánh"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#f1f5f9',
                          border: 'none',
                          color: '#64748b',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        <X size={14} />
                      </button>

                      {/* Image */}
                      <div
                        style={{
                          aspectRatio: '4 / 3',
                          width: '100%',
                          background: '#ffffff',
                          border: '1px solid #f1f5f9',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '12px',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Category Badge */}
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {product.category}
                      </div>

                      {/* Product Name */}
                      <Link
                        href={`/product/${product.slug}`}
                        style={{
                          display: 'block',
                          color: '#0f172a',
                          fontSize: '13.5px',
                          lineHeight: '1.4',
                          fontWeight: 700,
                          textDecoration: 'none',
                          minHeight: '38px',
                          marginBottom: '8px',
                        }}
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      {/* Price */}
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>
                        {formatVnd(product.price)}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShoppingCart size={14} />
                        <span>Mua ngay</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Info & Specs Table Rows */}
                <div style={columnsStyle}>
                  {/* Brand Row */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', color: '#475569', fontSize: '12px', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                    THƯƠNG HIỆU
                  </div>
                  {products.map((p) => (
                    <div key={p.id} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>
                      {p.brand}
                    </div>
                  ))}

                  {/* Stock Row */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', color: '#475569', fontSize: '12px', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                    TÌNH TRẠNG KHO
                  </div>
                  {products.map((p) => (
                    <div key={p.id} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: p.stock > 0 ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                      {p.stock > 0 ? `Sẵn hàng (${p.stock} sp)` : 'Hết hàng'}
                    </div>
                  ))}

                  {/* Warranty Row */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', color: '#475569', fontSize: '12px', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                    BẢO HÀNH
                  </div>
                  {products.map((p) => (
                    <div key={p.id} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} />
                      <span>{p.warrantyMonths} tháng</span>
                    </div>
                  ))}

                  {/* Dynamic Technical Specs Rows */}
                  {specKeys.map((key, idx) => (
                    <React.Fragment key={key}>
                      <div
                        style={{
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          padding: '12px 16px',
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {key.toUpperCase()}
                      </div>
                      {products.map((p) => {
                        const val = p.specs[key];
                        const displayVal = Array.isArray(val) ? val.join(', ') : val !== undefined && val !== null ? String(val) : '—';
                        return (
                          <div
                            key={p.id}
                            style={{
                              background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                              borderLeft: '1px solid #e2e8f0',
                              borderBottom: '1px solid #e2e8f0',
                              padding: '12px 16px',
                              fontSize: '12.5px',
                              color: '#0f172a',
                              fontWeight: 500,
                            }}
                          >
                            {displayVal}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

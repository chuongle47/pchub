'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Sliders, RotateCcw, Star, Heart, ArrowLeftRight,
  ChevronRight, Sparkles, Bot, Layers, Grid, List, 
  Check, X, Cpu 
} from 'lucide-react';
import { fetchCategories, fetchBrands, fetchProducts } from '@/lib/api';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySearch = searchParams?.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['ASUS', 'Gigabyte']);
  const [vram, setVram] = useState<string[]>(['8GB']);
  const [pcie, setPcie] = useState<string[]>(['PCIe 4.0']);
  const [priceRange, setPriceRange] = useState<[number, number]>([5000000, 60000000]);
  const [activeTab, setActiveTab] = useState<'products' | 'builds' | 'articles'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<string[]>([]);

  const isSearchQuery = querySearch.trim().length > 0;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryParam = searchParams?.get('category') || '';

  useEffect(() => {
    async function loadSearchProducts() {
      try {
        setLoading(true);
        const paramsObj = new URLSearchParams();
        if (querySearch) paramsObj.set('search', querySearch);
        if (categoryParam) paramsObj.set('category_id', categoryParam);
        if (sort) paramsObj.set('sort', sort);
        paramsObj.set('limit', '20');

        const res = await fetch(`/api/products?${paramsObj.toString()}`);
        const data = await res.json();
        if (data.products) {
          const mapped = data.products.map((p: any) => {
            const price = Number(p.price);
            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand_name || 'Chính hãng',
              price: price,
              oldPrice: Math.round(price * 1.15),
              badge: 'HOT',
              badgeColor: '#ef4444',
              sale: '-15%',
              stars: 5,
              reviews: 24,
              stock: true,
              tag: 'Tương thích',
              image: p.image_url || '/images/gpu-strix.jpg',
              isAiRecommend: true,
              buttonStyle: 'primary'
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSearchProducts();
  }, [querySearch, categoryParam, sort]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleCompare = (slug: string) => {
    setCompareItems(current => current.includes(slug)
      ? current.filter(item => item !== slug)
      : current.length < 4 ? [...current, slug] : current);
  };

  const toggleBrand = (b: string) => {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Graphics Cards</span>
        </div>

        {/* Search header (If searched) */}
        {isSearchQuery && (
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Kết quả tìm kiếm cho "{querySearch}"
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              47 kết quả — 0.24s
            </p>
            
            {/* Tag Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {['RTX 4070 Super', 'RTX 4070 Ti', 'ASUS', 'GIGABYTE'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* AI Insight Box */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                  AI Insight
                </h4>
                <p style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>
                  RTX 4070 Super là lựa chọn tốt nhất trong tầm giá 13–16tr năm 2026, cung cấp hiệu năng vượt trội hơn khoảng 15% so với bản thường trong khi tiêu thụ điện năng tương đương.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('products')}
                style={{
                  padding: '10px 4px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: activeTab === 'products' ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === 'products' ? '2px solid #2563eb' : 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Sản phẩm (43)
              </button>
              <button 
                onClick={() => setActiveTab('builds')}
                style={{
                  padding: '10px 4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'builds' ? '#2563eb' : '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Build (12)
              </button>
              <button 
                onClick={() => setActiveTab('articles')}
                style={{
                  padding: '10px 4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'articles' ? '#2563eb' : '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Bài viết (8)
              </button>
            </div>
          </div>
        )}

        {/* 2 COLUMNS WORKSPACE LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* LEFT SIDEBAR FILTER */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Advisor Box */}
            <div style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '13.5px' }}>
                <Sparkles size={16} />
                Hỏi AI
              </div>
              <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                Không chắc nên chọn GPU nào? Hãy để AI tìm cấu hình phù hợp nhất cho bạn.
              </p>
              <Link href="/search?ai=true" style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Khám phá ngay →
              </Link>
            </div>

            {/* Filter Brands */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
                THƯƠNG HIỆU
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'ASUS', count: 12 },
                  { name: 'MSI', count: 10 },
                  { name: 'Gigabyte', count: 15 },
                  { name: 'ZOTAC', count: 6 }
                ].map(item => (
                  <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(item.name)}
                      onChange={() => toggleBrand(item.name)}
                      style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                    />
                    <span>{item.name} {isSearchQuery && `(${item.count})`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Price */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
                MỨC GIÁ
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', padding: '6px 10px', fontSize: '12.5px', textAlign: 'center' }}>
                  5tr
                </div>
                <span style={{ color: '#94a3b8' }}>-</span>
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', padding: '6px 10px', fontSize: '12.5px', textAlign: 'center' }}>
                  60tr
                </div>
              </div>
            </div>

            {/* Filter VRAM */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
                VRAM
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['8GB', '12GB', '16GB', '24GB'].map(v => {
                  const active = vram.includes(v);
                  return (
                    <button
                      key={v}
                      onClick={() => setVram(prev => active ? prev.filter(x => x !== v) : [...prev, v])}
                      style={{
                        padding: '7px 0',
                        textAlign: 'center',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid',
                        background: active ? '#2563eb' : '#fff',
                        color: active ? '#fff' : '#475569',
                        borderColor: active ? '#2563eb' : '#e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Interface */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
                GIAO TIẾP
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['PCIe 4.0', 'PCIe 5.0'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={pcie.includes(p)}
                      onChange={() => setPcie(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* RIGHT PRODUCTS GRID */}
          <main>
            
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                {!isSearchQuery && (
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    Tìm thấy 124 sản phẩm
                  </h2>
                )}
                
                {/* Active Filter Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>Lọc theo:</span>
                  {selectedBrands.map(b => (
                    <span key={b} style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      color: '#334155',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {b}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => toggleBrand(b)} />
                    </span>
                  ))}
                  {vram.map(v => (
                    <span key={v} style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      color: '#334155',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {v}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setVram([])} />
                    </span>
                  ))}
                  <button 
                    onClick={() => { setSelectedBrands([]); setVram([]); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Sort & Grid/List View */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 500
                  }}
                >
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="relevant">Phù hợp nhất</option>
                </select>

                <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    style={{ padding: '8px', background: viewMode === 'grid' ? '#f1f5f9' : '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    <Grid size={16} color={viewMode === 'grid' ? '#2563eb' : '#64748b'} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    style={{ padding: '8px', background: viewMode === 'list' ? '#f1f5f9' : '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    <List size={16} color={viewMode === 'list' ? '#2563eb' : '#64748b'} />
                  </button>
                </div>
              </div>
            </div>

            {/* 4 COLUMNS PRODUCT GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {products.map(p => (
                <div key={p.id} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  {/* Top Badges */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '4px', zIndex: 2 }}>
                    {p.badge && (
                      <span style={{
                        background: p.badgeColor || '#ef4444',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {p.badge}
                      </span>
                    )}
                    {p.sale && (
                      <span style={{
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        SALE {p.sale}
                      </span>
                    )}
                  </div>

                  {/* Heart Wishlist */}
                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: wishlist.includes(p.id) ? '#ef4444' : '#94a3b8',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  >
                    <Heart size={16} fill={wishlist.includes(p.id) ? '#ef4444' : 'none'} />
                  </button>

                  {/* Product Image */}
                  <Link href={`/product/${p.slug}`} style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', padding: '10px', textDecoration: 'none' }}>
                    <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </Link>

                  {/* Stars Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill="#fbbf24" stroke="none" />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>({p.reviews})</span>
                  </div>

                  {/* Title */}
                  <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: '1.35',
                      height: '36px',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      {p.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                      {formatPrice(p.price)}
                    </span>
                    {p.oldPrice && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        {formatPrice(p.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                    Còn hàng
                  </div>

                  {/* Tag Pill */}
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Bot size={11} color="#2563eb" />
                      {p.tag}
                    </span>
                  </div>

                  {/* Detail and compare actions */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '6px' }}>
                    <Link href={`/product/${p.slug}`} style={{
                      flex: 1,
                      padding: '9px 6px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'center',
                      textDecoration: 'none',
                      border: p.buttonStyle === 'primary' ? 'none' : '1.5px solid #2563eb',
                      background: p.buttonStyle === 'primary' ? '#2563eb' : '#fff',
                      color: p.buttonStyle === 'primary' ? '#fff' : '#2563eb',
                      cursor: 'pointer'
                    }}>
                      Xem chi tiết
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(p.slug)}
                      aria-label={compareItems.includes(p.slug) ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                      title={compareItems.includes(p.slug) ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                      style={{
                        width: '38px',
                        borderRadius: '8px',
                        border: `1.5px solid ${compareItems.includes(p.slug) ? '#2563eb' : '#e2e8f0'}`,
                        background: compareItems.includes(p.slug) ? '#eff6ff' : '#fff',
                        color: '#2563eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowLeftRight size={15} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {compareItems.length > 0 && (
              <div style={{
                position: 'fixed',
                left: '50%',
                bottom: '20px',
                transform: 'translateX(-50%)',
                zIndex: 300,
                width: 'min(620px, calc(100% - 32px))',
                background: '#0f172a',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(15,23,42,0.3)',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Đã chọn {compareItems.length}/4 sản phẩm</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setCompareItems([])} style={{ color: '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Xóa</button>
                  <Link href={`/so-sanh?ids=${compareItems.join(',')}`} style={{ background: '#2563eb', color: '#fff', borderRadius: '7px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>So sánh ngay</Link>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '36px' }}>
              <button style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600 }}>
                1
              </button>
              <button style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
                2
              </button>
              <button style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600 }}>
                3
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: '#94a3b8' }}>...</span>
              <button style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600 }}>
                6
              </button>
            </div>

          </main>

        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}

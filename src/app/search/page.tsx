'use client';

import React, { useState, useEffect, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Sliders, RotateCcw, Star, Heart, ArrowLeftRight,
  ChevronRight, Sparkles, Bot, Grid, List, 
  Check, X, ShoppingCart, Filter, CheckCircle2, ChevronDown
} from 'lucide-react';
import { fetchCategories, fetchBrands } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams?.get('search') || searchParams?.get('q') || '';
  const urlCategory = searchParams?.get('category') || searchParams?.get('category_id') || '';
  const urlBrand = searchParams?.get('brand') || searchParams?.get('brand_id') || '';
  const urlMinPrice = searchParams?.get('min_price') || '';
  const urlMaxPrice = searchParams?.get('max_price') || '';
  const urlSort = searchParams?.get('sort') || 'price_asc';
  const urlPage = parseInt(searchParams?.get('page') || '1', 10);

  // Search input state
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(urlBrand ? urlBrand.split(',') : []);
  const [minPriceInput, setMinPriceInput] = useState<string>(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<string>(urlMaxPrice);
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>(urlMinPrice);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>(urlMaxPrice);
  const [sort, setSort] = useState<string>(urlSort);
  const [currentPage, setCurrentPage] = useState<number>(urlPage);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Metadata arrays fetched from API
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [brandsList, setBrandsList] = useState<BrandItem[]>([]);

  // Product Data state
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number }>({
    total: 0,
    page: 1,
    limit: 16,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stores
  const addItemToCart = useCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);

  // Compare items
  const [compareItems, setCompareItems] = useState<string[]>([]);

  // Sync state with URL params on URL change
  useEffect(() => {
    setSearchInput(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedBrands(urlBrand ? urlBrand.split(',') : []);
    setMinPriceInput(urlMinPrice);
    setMaxPriceInput(urlMaxPrice);
    setAppliedMinPrice(urlMinPrice);
    setAppliedMaxPrice(urlMaxPrice);
    setSort(urlSort);
    setCurrentPage(urlPage);
  }, [urlSearch, urlCategory, urlBrand, urlMinPrice, urlMaxPrice, urlSort, urlPage]);

  // Fetch Categories & Brands for sidebar
  useEffect(() => {
    fetchCategories()
      .then((rows) => {
        if (Array.isArray(rows)) setCategoriesList(rows);
      })
      .catch((err) => console.error('Failed to load categories:', err));

    fetchBrands()
      .then((rows) => {
        if (Array.isArray(rows)) setBrandsList(rows);
      })
      .catch((err) => console.error('Failed to load brands:', err));
  }, []);

  // Pure client-side memoized product sorting (100% instant, 0 network requests)
  const displayedProducts = React.useMemo(() => {
    const copy = [...products];
    if (sort === 'price_asc') copy.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') copy.sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc') copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name_desc') copy.sort((a, b) => b.name.localeCompare(a.name));
    return copy;
  }, [products, sort]);

  // Main Products Fetching effect (re-fetches when search, category, brand, price, or page change)
  useEffect(() => {
    async function loadFilteredProducts() {
      try {
        setLoading(true);
        const paramsObj = new URLSearchParams();

        if (urlSearch) paramsObj.set('search', urlSearch);
        if (selectedCategory) paramsObj.set('category_id', selectedCategory);
        if (selectedBrands.length > 0) paramsObj.set('brand_id', selectedBrands.join(','));
        if (appliedMinPrice) paramsObj.set('min_price', appliedMinPrice);
        if (appliedMaxPrice) paramsObj.set('max_price', appliedMaxPrice);
        paramsObj.set('page', currentPage.toString());
        paramsObj.set('limit', '16');

        const res = await fetch(`/api/products?${paramsObj.toString()}`);
        const data = await res.json();

        if (data.products) {
          const mapped = data.products.map((p: any) => {
            const price = Number(p.price);
            const origPrice = p.original_price ? Number(p.original_price) : Math.round(price * 1.15);
            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              categoryName: p.category_name || 'Linh kiện',
              brandName: p.brand_name || 'Chính hãng',
              price: price,
              oldPrice: origPrice > price ? origPrice : null,
              saleTag: origPrice > price ? `-${Math.round((1 - price / origPrice) * 100)}%` : null,
              stock: p.stock > 0,
              stockCount: p.stock ?? 10,
              image: p.image_url || '/images/gpu-strix.jpg',
              specs: p.specs || {},
            };
          });
          
          setProducts(mapped);
          if (data.pagination) {
            setPagination(data.pagination);
          } else {
            setPagination({ total: mapped.length, page: 1, limit: 16, totalPages: 1 });
          }
        } else {
          setProducts([]);
          setPagination({ total: 0, page: 1, limit: 16, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to search products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadFilteredProducts();
  }, [urlSearch, selectedCategory, selectedBrands, appliedMinPrice, appliedMaxPrice, currentPage]);

  // Instant In-Memory Sort Handler (Pure state update, zero router navigation or re-fetching)
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  // Update URL state helper
  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams?.toString() || '');
    
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });

    // Reset page to 1 on filter changes if page wasn't explicitly provided
    if (!('page' in newParams)) {
      current.delete('page');
      setCurrentPage(1);
    }

    const queryStr = current.toString();
    router.push(`/search${queryStr ? `?${queryStr}` : ''}`);
  };

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim() || null });
  };

  const handleCategorySelect = (catSlugOrId: string) => {
    const nextCat = selectedCategory === catSlugOrId ? null : catSlugOrId;
    setSelectedCategory(nextCat || '');
    updateQueryParams({ category: nextCat });
  };

  const handleBrandToggle = (brandNameOrId: string) => {
    let nextBrands: string[];
    if (selectedBrands.includes(brandNameOrId)) {
      nextBrands = selectedBrands.filter(b => b !== brandNameOrId);
    } else {
      nextBrands = [...selectedBrands, brandNameOrId];
    }
    setSelectedBrands(nextBrands);
    updateQueryParams({ brand: nextBrands.length > 0 ? nextBrands.join(',') : null });
  };

  const handleApplyPriceFilter = () => {
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
    updateQueryParams({
      min_price: minPriceInput || null,
      max_price: maxPriceInput || null,
    });
  };

  const handlePricePreset = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    updateQueryParams({
      min_price: min || null,
      max_price: max || null,
    });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setSort('price_asc');
    setCurrentPage(1);
    router.push('/search');
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setToastMessage(`Đã thêm "${product.name.slice(0, 30)}..." vào giỏ hàng`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleCompare = (slug: string) => {
    setCompareItems(current => 
      current.includes(slug)
        ? current.filter(item => item !== slug)
        : current.length < 4 ? [...current, slug] : current
    );
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const activeFilterCount = (urlSearch ? 1 : 0) + 
    (selectedCategory ? 1 : 0) + 
    selectedBrands.length + 
    (appliedMinPrice || appliedMaxPrice ? 1 : 0);

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '24px 0 60px' }}>
      
      {/* Notification Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Tìm kiếm & Lọc sản phẩm</span>
        </div>

        {/* Top Search Banner Input */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập tên sản phẩm, thương hiệu hoặc từ khóa (CPU, RTX 4070, RAM 16GB...)"
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 44px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.background = '#f8fafc';
                }}
              />
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); updateQueryParams({ search: null }); }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} color="#475569" />
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              <Search size={16} />
              Tìm kiếm
            </button>
          </form>

          {/* Quick Search Tag Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Gợi ý HOT:</span>
            {['RTX 4070', 'Intel Core i7', 'Ryzen 7', 'RAM DDR5', 'SSD NVMe', 'ASUS ROG'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => { setSearchInput(tag); updateQueryParams({ search: tag }); }}
                style={{
                  background: urlSearch === tag ? '#eff6ff' : '#ffffff',
                  border: urlSearch === tag ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: urlSearch === tag ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* LEFT FILTER SIDEBAR */}
          <aside style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}>
            
            {/* Filter Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                <Filter size={18} color="#2563eb" />
                <span>Bộ lọc sản phẩm</span>
                {activeFilterCount > 0 && (
                  <span style={{
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* AI Advisor Box */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontWeight: 800, fontSize: '13px' }}>
                <Sparkles size={16} />
                <span>AI Hỗ trợ chọn linh kiện</span>
              </div>
              <p style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.4' }}>
                Cần tư vấn build PC theo ngân sách & nhu cầu? Chat ngay với AI Advisor.
              </p>
            </div>

            {/* CATEGORIES FILTER */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.03em' }}>
                Danh mục linh kiện
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedCategory === '' ? '#eff6ff' : 'transparent',
                    color: selectedCategory === '' ? '#2563eb' : '#475569',
                    fontSize: '13px',
                    fontWeight: selectedCategory === '' ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>Tất cả danh mục</span>
                </button>
                {categoriesList.map(cat => {
                  const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug || cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        color: isSelected ? '#2563eb' : '#475569',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span>{cat.name}</span>
                      {cat.product_count !== undefined && (
                        <span style={{ fontSize: '11px', color: isSelected ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                          ({cat.product_count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BRANDS FILTER */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.03em' }}>
                Thương hiệu ({brandsList.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {brandsList.map(brand => {
                  const isChecked = selectedBrands.includes(brand.name) || selectedBrands.includes(brand.id) || selectedBrands.includes(brand.slug);
                  return (
                    <label
                      key={brand.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: isChecked ? '#0f172a' : '#475569',
                        fontWeight: isChecked ? 700 : 500,
                        cursor: 'pointer',
                        padding: '4px 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand.name)}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span>{brand.name}</span>
                      </div>
                      {brand.product_count !== undefined && (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({brand.product_count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* PRICE RANGE FILTER */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.03em' }}>
                Khoảng giá (VNĐ)
              </h4>

              {/* Quick Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {[
                  { label: 'Tất cả mức giá', min: '', max: '' },
                  { label: 'Dưới 5 triệu', min: '0', max: '5000000' },
                  { label: '5 triệu - 15 triệu', min: '5000000', max: '15000000' },
                  { label: '15 triệu - 30 triệu', min: '15000000', max: '30000000' },
                  { label: 'Trên 30 triệu', min: '30000000', max: '' },
                ].map(preset => {
                  const isActive = appliedMinPrice === preset.min && appliedMaxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePricePreset(preset.min, preset.max)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: isActive ? '#eff6ff' : '#ffffff',
                        color: isActive ? '#2563eb' : '#475569',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Inputs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="number"
                  placeholder="Từ (đ)"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                  }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Đến (đ)"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPriceFilter}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 0',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Áp dụng giá
              </button>
            </div>

          </aside>

          {/* RIGHT PRODUCTS GRID & RESULTS */}
          <main>
            
            {/* Results Header Toolbar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}>
              
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {urlSearch ? `Kết quả cho "${urlSearch}"` : 'Tất cả sản phẩm'}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Tìm thấy <strong style={{ color: '#2563eb' }}>{pagination.total}</strong> sản phẩm phù hợp
                </p>
              </div>

              {/* Controls: Sort & Grid/List View */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Sắp xếp:</span>
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="price_asc">Giá: Thấp đến cao</option>
                    <option value="price_desc">Giá: Cao đến thấp</option>
                    <option value="name_asc">Tên sản phẩm: A - Z</option>
                    <option value="name_desc">Tên sản phẩm: Z - A</option>
                  </select>
                </div>

                <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Xem dạng lưới"
                    style={{
                      padding: '8px 12px',
                      background: viewMode === 'grid' ? '#eff6ff' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      color: viewMode === 'grid' ? '#2563eb' : '#64748b',
                    }}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="Xem dạng danh sách"
                    style={{
                      padding: '8px 12px',
                      background: viewMode === 'list' ? '#eff6ff' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      color: viewMode === 'list' ? '#2563eb' : '#64748b',
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

            </div>

            {/* ACTIVE FILTERS CHIPS */}
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Đang lọc:</span>
                
                {urlSearch && (
                  <span style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    Từ khóa: "{urlSearch}"
                    <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => { setSearchInput(''); updateQueryParams({ search: null }); }} />
                  </span>
                )}

                {selectedCategory && (
                  <span style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    Danh mục: {categoriesList.find(c => c.slug === selectedCategory || c.id === selectedCategory)?.name || selectedCategory}
                    <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleCategorySelect('')} />
                  </span>
                )}

                {selectedBrands.map(b => (
                  <span key={b} style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {b}
                    <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleBrandToggle(b)} />
                  </span>
                ))}

                {(appliedMinPrice || appliedMaxPrice) && (
                  <span style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    Giá: {appliedMinPrice ? formatPrice(Number(appliedMinPrice)) : '0đ'} - {appliedMaxPrice ? formatPrice(Number(appliedMaxPrice)) : '∞'}
                    <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handlePricePreset('', '')} />
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr', gap: '20px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', height: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '10px' }}></div>
                    <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '4px', width: '60%' }}></div>
                    <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '90%' }}></div>
                    <div style={{ height: '24px', background: '#f1f5f9', borderRadius: '4px', width: '40%', marginTop: 'auto' }}></div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              /* EMPTY RESULT STATE */
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8',
                }}>
                  <Search size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '420px', margin: '0 auto 24px' }}>
                  Thử tìm kiếm với từ khóa khác hoặc xóa bỏ một số điều kiện lọc giá, thương hiệu hiện tại.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              /* PRODUCTS DISPLAY GRID / LIST */
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
                gap: '20px',
              }}>
                {displayedProducts.map(p => {
                  const isWishlisted = wishlistIds.includes(p.id);
                  const isCompared = compareItems.includes(p.slug);

                  if (viewMode === 'list') {
                    return (
                      <div key={p.id} style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}>
                        <Link href={`/product/${p.slug}`} style={{ width: '140px', height: '120px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </Link>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                            {p.brandName} · {p.categoryName}
                          </span>
                          <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
                              {p.name}
                            </h3>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                              {formatPrice(p.price)}
                            </span>
                            {p.oldPrice && (
                              <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                {formatPrice(p.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, p)}
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px 18px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <ShoppingCart size={15} />
                            Thêm giỏ hàng
                          </button>
                          <Link href={`/product/${p.slug}`} style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '10px',
                            padding: '8px 18px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            textAlign: 'center',
                            textDecoration: 'none',
                          }}>
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  // Grid View Card
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Sale Badge */}
                      {p.saleTag && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: '#ef4444',
                          color: '#ffffff',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          zIndex: 2,
                        }}>
                          SALE {p.saleTag}
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlistStore(p.id)}
                        aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 2,
                          color: isWishlisted ? '#ef4444' : '#94a3b8',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Heart size={15} fill={isWishlisted ? '#ef4444' : 'none'} />
                      </button>

                      {/* Product Image */}
                      <Link
                        href={`/product/${p.slug}`}
                        style={{
                          height: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '14px',
                          padding: '10px',
                          textDecoration: 'none',
                        }}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </Link>

                      {/* Category & Brand */}
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {p.brandName}
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
                          marginBottom: '10px',
                        }}>
                          {p.name}
                        </h3>
                      </Link>

                      {/* Price Section */}
                      <div style={{ marginTop: 'auto', marginBottom: '12px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                          {formatPrice(p.price)}
                        </div>
                        {p.oldPrice && (
                          <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatPrice(p.oldPrice)}
                          </div>
                        )}
                      </div>

                      {/* Stock indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: p.stock ? '#16a34a' : '#ef4444', fontWeight: 600, marginBottom: '14px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.stock ? '#16a34a' : '#ef4444', display: 'inline-block' }}></span>
                        {p.stock ? 'Còn hàng' : 'Tạm hết hàng'}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, p)}
                          style={{
                            flex: 1,
                            padding: '9px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
                          }}
                        >
                          <ShoppingCart size={14} />
                          Mua ngay
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCompare(p.slug)}
                          title={isCompared ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            border: `1.5px solid ${isCompared ? '#2563eb' : '#e2e8f0'}`,
                            background: isCompared ? '#eff6ff' : '#ffffff',
                            color: '#2563eb',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* FLOATING COMPARE BAR */}
            {compareItems.length > 0 && (
              <div style={{
                position: 'fixed',
                left: '50%',
                bottom: '24px',
                transform: 'translateX(-50%)',
                zIndex: 300,
                width: 'min(600px, calc(100% - 32px))',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 12px 32px rgba(15,23,42,0.35)',
              }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700 }}>
                  Đã chọn <span style={{ color: '#38bdf8' }}>{compareItems.length}/4</span> sản phẩm để so sánh
                </span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setCompareItems([])}
                    style={{ color: '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600 }}
                  >
                    Bỏ chọn
                  </button>
                  <Link
                    href={`/so-sanh?ids=${compareItems.join(',')}`}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    So sánh ngay →
                  </Link>
                </div>
              </div>
            )}

            {/* REAL PAGINATION */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateQueryParams({ page: (currentPage - 1).toString() })}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage <= 1 ? 0.5 : 1,
                  }}
                >
                  Trước
                </button>

                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => updateQueryParams({ page: pNum.toString() })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: isActive ? 'none' : '1px solid #cbd5e1',
                        background: isActive ? '#2563eb' : '#ffffff',
                        color: isActive ? '#ffffff' : '#0f172a',
                        fontSize: '13px',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => updateQueryParams({ page: (currentPage + 1).toString() })}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage >= pagination.totalPages ? 0.5 : 1,
                  }}
                >
                  Sau
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Đang tải trang tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}

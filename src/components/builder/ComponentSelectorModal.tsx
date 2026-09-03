'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, Filter, ArrowUpDown, Tag } from 'lucide-react';
import seed from '@/lib/seed.json';

export interface ComponentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotKey: string;
  categoryTitle: string;
  onSelectProduct: (product: any) => void;
  currentSelectedId?: string;
}

export default function ComponentSelectorModal({
  isOpen,
  onClose,
  slotKey,
  categoryTitle,
  onSelectProduct,
  currentSelectedId,
}: ComponentSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'UNDER_5M' | '5M_15M' | 'OVER_15M'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC'>('DEFAULT');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedBrand('ALL');
    setPriceRange('ALL');
    setSortBy('DEFAULT');

    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?limit=36&category=${slotKey}`);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          // Fallback to seed.json matching slot
          const filteredSeed = seed.products.filter(p => {
            const cat = (p.category_id || '').toLowerCase();
            const slug = (p.slug || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            return slug.includes(slotKey) || cat.includes(slotKey) || name.includes(slotKey);
          });
          setProducts(filteredSeed.length > 0 ? filteredSeed : seed.products.slice(0, 16));
        }
      } catch (err) {
        console.error('Failed to fetch modal products:', err);
        const filteredSeed = seed.products.filter(p => p.slug.includes(slotKey));
        setProducts(filteredSeed.length > 0 ? filteredSeed : seed.products.slice(0, 16));
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [isOpen, slotKey]);

  // Extract unique brands dynamically
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach(p => {
      const bName = p.brand_name || p.brand || (p.name.split(' ')[0]);
      if (bName && bName.length > 1) {
        brandsSet.add(bName.toUpperCase());
      }
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // 1. Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku && p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }

      // 2. Brand filter
      if (selectedBrand !== 'ALL') {
        const bName = (p.brand_name || p.brand || p.name.split(' ')[0] || '').toUpperCase();
        if (!bName.includes(selectedBrand)) return false;
      }

      // 3. Price range filter
      const price = Number(p.price);
      if (priceRange === 'UNDER_5M' && price >= 5000000) return false;
      if (priceRange === '5M_15M' && (price < 5000000 || price > 15000000)) return false;
      if (priceRange === 'OVER_15M' && price <= 15000000) return false;

      return true;
    });

    // 4. Sorting
    if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, searchTerm, selectedBrand, priceRange, sortBy]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal Card — Extra Wide Layout (1200px) */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '94%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1',
      }}>
        
        {/* Header Bar */}
        <div style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              BỘ LỌC TÌM KIẾM LINH KIỆN
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '2px 0 0', color: '#ffffff' }}>
              Chọn {categoryTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-Filter Action Bar */}
        <div style={{
          padding: '16px 28px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Row 1: Search & Sorting */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={`Tìm tên linh kiện, dòng sản phẩm, socket trong mục ${categoryTitle}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 44px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#ffffff',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }} />
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="#64748b" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="DEFAULT">Sắp xếp: Mặc định</option>
                <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Row 2: Brand Filters & Price Ranges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            
            {/* Brand Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={13} /> Thương hiệu:
              </span>

              <button
                onClick={() => setSelectedBrand('ALL')}
                style={{
                  background: selectedBrand === 'ALL' ? '#2563eb' : '#ffffff',
                  color: selectedBrand === 'ALL' ? '#ffffff' : '#475569',
                  border: `1px solid ${selectedBrand === 'ALL' ? '#2563eb' : '#cbd5e1'}`,
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Tất cả
              </button>

              {availableBrands.slice(0, 7).map(brand => {
                const isActive = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    style={{
                      background: isActive ? '#2563eb' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      border: `1px solid ${isActive ? '#2563eb' : '#cbd5e1'}`,
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            {/* Price Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[
                { label: 'Tất cả giá', value: 'ALL' },
                { label: '< 5 Tr', value: 'UNDER_5M' },
                { label: '5Tr – 15Tr', value: '5M_15M' },
                { label: '> 15 Tr', value: 'OVER_15M' },
              ].map(p => {
                const isActive = priceRange === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPriceRange(p.value as any)}
                    style={{
                      background: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#64748b',
                      border: `1px solid ${isActive ? '#0f172a' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Products Grid — 4 Columns Layout */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <p style={{ fontWeight: 700, fontSize: '15px' }}>Đang tải danh sách linh kiện từ Supabase...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Không tìm thấy linh kiện phù hợp với bộ lọc.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Vui lòng thử xóa từ khóa tìm kiếm hoặc chọn lại thương hiệu khác.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('ALL');
                  setPriceRange('ALL');
                }}
                style={{
                  marginTop: '16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '18px',
            }}>
              {filteredProducts.map(p => {
                const isSelected = p.id === currentSelectedId;
                const price = Number(p.price);
                const brand = p.brand_name || p.brand || (p.name.split(' ')[0]);

                return (
                  <div
                    key={p.id}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 6px 16px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '12px',
                        position: 'relative',
                      }}>
                        <img
                          src={p.image_url || p.image || '/images/cpu-box.jpg'}
                          alt={p.name}
                          style={{ maxHeight: '115px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                        />

                        {brand && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            letterSpacing: '0.4px',
                          }}>
                            {brand.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: '1.45',
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '38px',
                      }}>
                        {p.name}
                      </h4>
                    </div>

                    <div>
                      {/* Price Tag */}
                      <div style={{
                        fontSize: '17px',
                        fontWeight: 900,
                        color: '#ef4444',
                        margin: '8px 0 12px',
                        letterSpacing: '-0.3px',
                      }}>
                        {price.toLocaleString('vi-VN')} ₫
                      </div>

                      {/* CTA Select Button */}
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        style={{
                          width: '100%',
                          background: isSelected ? '#16a34a' : '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? 'none' : '0 2px 8px rgba(37,99,235,0.25)',
                          transition: 'background 0.2s',
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={16} /> Đã chọn
                          </>
                        ) : (
                          'Chọn linh kiện này'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

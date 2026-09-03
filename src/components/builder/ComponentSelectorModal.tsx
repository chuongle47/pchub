'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Cpu, Layers, HardDrive, Zap, Box, Fan, Sliders } from 'lucide-react';
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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');

    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?limit=24&category=${slotKey}`);
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
          setProducts(filteredSeed.length > 0 ? filteredSeed : seed.products.slice(0, 12));
        }
      } catch (err) {
        console.error('Failed to fetch modal products:', err);
        // Fallback to seed
        const filteredSeed = seed.products.filter(p => p.slug.includes(slotKey));
        setProducts(filteredSeed.length > 0 ? filteredSeed : seed.products.slice(0, 12));
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [isOpen, slotKey]);

  if (!isOpen) return null;

  // Filter local search
  const displayedProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal Card */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '840px',
        maxHeight: '85vh',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Danh mục linh kiện
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0', color: '#ffffff' }}>
              Chọn {categoryTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
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
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar Bar */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={`Tìm kiếm tên linh kiện, mã SKU trong mục ${categoryTitle}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                background: '#ffffff',
              }}
            />
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Đang tải danh sách linh kiện từ Supabase...</p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>Không tìm thấy linh kiện nào phù hợp.</p>
              <p style={{ fontSize: '13px' }}>Thử tìm kiếm với từ khóa khác.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}>
              {displayedProducts.map(p => {
                const isSelected = p.id === currentSelectedId;
                const price = Number(p.price);

                return (
                  <div
                    key={p.id}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
                    }}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        height: '130px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        marginBottom: '12px',
                      }}>
                        <img
                          src={p.image_url || p.image || '/images/cpu-box.jpg'}
                          alt={p.name}
                          style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                        />
                      </div>

                      {/* Product Name */}
                      <h4 style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '36px',
                      }}>
                        {p.name}
                      </h4>
                    </div>

                    <div>
                      {/* Price */}
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: '#2563eb',
                        margin: '8px 0 12px',
                      }}>
                        {price.toLocaleString('vi-VN')} ₫
                      </div>

                      {/* Choose Button */}
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        style={{
                          width: '100%',
                          background: isSelected ? '#16a34a' : '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
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

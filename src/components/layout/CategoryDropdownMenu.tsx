'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Search, ChevronRight, Sparkles } from 'lucide-react';

export interface CategoryMenuItem {
  name: string;
  slug: string;
  icon: string;
  desc: string;
  badge?: string;
}

const CATEGORY_ITEMS: CategoryMenuItem[] = [
  { name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu', icon: '💻', desc: 'Intel Core i5/i7/i9 & AMD Ryzen', badge: 'HOT' },
  { name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard', icon: '🔌', desc: 'Z790, B760, X670, B650 ASUS/MSI', badge: 'BÁN CHẠY' },
  { name: 'RAM - Bộ Nhớ Trong', slug: 'ram', icon: '🧠', desc: 'DDR4 & DDR5 3200Mhz-6400Mhz' },
  { name: 'GPU - Card Màn Hình', slug: 'gpu', icon: '🎮', desc: 'NVIDIA RTX 40-Series & AMD Radeon', badge: 'HOT' },
  { name: 'SSD / HDD - Ổ Đĩa Cứng', slug: 'storage', icon: '💾', desc: 'NVMe M.2 PCIe 4.0 1TB, 2TB' },
  { name: 'PSU - Nguồn Máy Tính', slug: 'psu', icon: '⚡', desc: '80 Plus Gold, Modular 650W-1200W' },
  { name: 'Case - Vỏ Máy Tính', slug: 'case', icon: '📦', desc: 'Bể kính Panorama, Dual Chamber' },
  { name: 'Tản Nhiệt (Cooling)', slug: 'cooling', icon: '❄️', desc: 'Tản nước AIO 240/360mm & Tản khí' },
  { name: 'Màn Hình Gaming', slug: 'monitor', icon: '🖥️', desc: '240Hz, OLED, IPS, 2K/4K Gaming' },
  { name: 'Bàn Phím & Chuột', slug: 'gear', icon: '⌨️', desc: 'Bàn phím cơ, Chuột không dây' },
  { name: 'Tai Nghe & Audio', slug: 'headset', icon: '🎧', desc: 'Tai nghe Gaming 7.1, Loa soundbar' },
];

export default function CategoryDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = CATEGORY_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Category Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: isOpen ? '#ffffff' : '#f8fafc',
          color: '#0f172a',
          border: `1px solid ${isOpen ? '#2563eb' : '#cbd5e1'}`,
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Menu size={17} color="#2563eb" />
        <span>Danh mục sản phẩm</span>
        <ChevronDown
          size={15}
          color="#64748b"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 999,
            width: '300px',
            maxWidth: '92vw',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
            padding: '16px',
            animation: 'fadeInSlide 0.2s ease-out forwards',
          }}
        >
          {/* Quick Search inside Category Dropdown */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Tìm nhanh danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '12.5px',
                color: '#0f172a',
                outline: 'none',
              }}
              autoFocus
            />
            <Search
              size={14}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </div>

          {/* Header Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '8px',
              marginBottom: '8px',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span>Tất cả linh kiện & phụ kiện</span>
            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={12} /> {filteredCategories.length} danh mục
            </span>
          </div>

          {/* Category List */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '2px',
            }}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7.5px 10px',
                    borderRadius: '7px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#1e293b';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </Link>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Không tìm thấy danh mục phù hợp.
              </div>
            )}
          </div>

          {/* Footer View All Link */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
            }}
          >
            <Link
              href="/danh-muc/tat-ca"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Xem tất cả sản phẩm & linh kiện <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

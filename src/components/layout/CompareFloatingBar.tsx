'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Trash2, ChevronRight } from 'lucide-react';
import { useCompareStore } from '@/lib/store';

export default function CompareFloatingBar() {
  const router = useRouter();
  const { items, activeCategory, clearCompare } = useCompareStore();

  if (!items || items.length === 0) {
    return null;
  }

  const handleCompareClick = () => {
    const idsParam = items.join(',');
    router.push(`/so-sanh?ids=${encodeURIComponent(idsParam)}`);
  };

  const displayCategory = activeCategory || 'Sản phẩm';

  return (
    <div
      className="compare-floating-bar"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        background: '#0f172a',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '10px 16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backdropFilter: 'blur(12px)',
        fontFamily: 'var(--font-primary, system-ui, sans-serif)',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Icon + Danh mục + Số lượng */}
      <div
        style={{
          background: 'rgba(37,99,235,0.2)',
          color: '#93c5fd',
          borderRadius: '10px',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12.5px',
          fontWeight: 700,
        }}
      >
        <ArrowLeftRight size={14} />
        <span>So sánh {displayCategory}</span>
        <span
          style={{
            background: '#2563eb',
            color: '#fff',
            borderRadius: '999px',
            padding: '1px 8px',
            fontSize: '12px',
            fontWeight: 800,
          }}
        >
          {items.length}/3
        </span>
      </div>

      {/* Nút Xóa tất cả */}
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
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '8px',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <Trash2 size={13} />
        <span>Xóa</span>
      </button>

      {/* Nút So sánh ngay */}
      <button
        type="button"
        onClick={handleCompareClick}
        style={{
          background: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
      >
        <span>So sánh ngay ({items.length})</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

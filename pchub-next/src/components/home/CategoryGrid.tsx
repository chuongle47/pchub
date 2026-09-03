'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, CircuitBoard, MemoryStick, Monitor, HardDrive, Zap, Box, Fan } from 'lucide-react';
import { fetchCategories } from '@/lib/api';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  cpu: Cpu,
  mainboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Monitor,
  storage: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
};

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetchCategories()
      .then((rows: CategoryItem[]) => {
        if (Array.isArray(rows)) setCategories(rows);
      })
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="home-category-grid" style={{ background: '#ffffff', padding: '32px 0 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: '24px',
        }}>
          Danh mục linh kiện
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(categories.length, 8)}, 1fr)`,
          gap: '16px',
        }}>
          {categories.map(cat => {
            const IconComponent = ICON_MAP[cat.slug] || Cpu;
            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.slug)}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    border: '1px solid #e2e8f0',
                  }}>
                    <IconComponent size={22} />
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    {cat.name.split(' - ')[0]}
                  </div>
                  {typeof cat.product_count === 'number' && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cat.product_count} SP</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

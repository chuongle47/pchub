'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBrands } from '@/lib/api';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
}

export default function BrandStrip() {
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    fetchBrands()
      .then((rows: BrandItem[]) => {
        if (Array.isArray(rows)) setBrands(rows.filter(b => b.is_active !== false).slice(0, 12));
      })
      .catch(() => setBrands([]));
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="home-brands" style={{ background: '#ffffff', padding: '24px 0 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '20px',
        }}>
          Thương hiệu đối tác
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/search?search=${encodeURIComponent(brand.name)}`}
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 24px',
                minWidth: '100px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 900,
                color: '#1e293b',
                letterSpacing: '1px',
              }}>
                {brand.name.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

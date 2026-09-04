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

const TOP_FAMOUS_BRANDS = ['INTEL', 'AMD', 'ASUS', 'MSI', 'GIGABYTE', 'SAMSUNG'];

export default function BrandStrip() {
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    fetchBrands()
      .then((rows: BrandItem[]) => {
        if (Array.isArray(rows) && rows.length > 0) {
          const filtered = rows.filter(b => b.is_active !== false);
          // Sort to prioritize top famous brands and slice top 6
          const sorted = [...filtered].sort((a, b) => {
            const posA = TOP_FAMOUS_BRANDS.indexOf(a.name.toUpperCase());
            const posB = TOP_FAMOUS_BRANDS.indexOf(b.name.toUpperCase());
            const orderA = posA !== -1 ? posA : 99;
            const orderB = posB !== -1 ? posB : 99;
            return orderA - orderB;
          });
          setBrands(sorted.slice(0, 6));
        } else {
          setFallback();
        }
      })
      .catch(() => setFallback());
  }, []);

  const setFallback = () => {
    setBrands(
      TOP_FAMOUS_BRANDS.map(name => ({
        id: name.toLowerCase(),
        name,
        slug: name.toLowerCase(),
      }))
    );
  };

  if (brands.length === 0) return null;

  return (
    <section className="home-brands" style={{ background: '#ffffff', padding: '24px 0 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '20px',
          letterSpacing: '-0.02em',
        }}>
          Thương hiệu đối tác
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '16px',
          maxWidth: '960px',
          margin: '0 auto',
        }}>
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/search?search=${encodeURIComponent(brand.name)}`}
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#1e293b',
                letterSpacing: '0.05em',
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


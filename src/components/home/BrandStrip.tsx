'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchBrands } from '@/lib/api';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
}

const TOP_FAMOUS_BRANDS = [
  'INTEL',
  'AMD',
  'NVIDIA',
  'ASUS',
  'MSI',
  'GIGABYTE',
  'ASROCK',
  'CORSAIR',
  'G.SKILL',
  'KINGSTON',
  'SAMSUNG',
];

const BRAND_LOCAL_LOGOS: Record<string, string> = {
  INTEL: '/brands/intel.svg',
  AMD: '/brands/amd.svg',
  ASUS: '/brands/asus.svg',
  MSI: '/brands/msi.svg',
  GIGABYTE: '/brands/gigabyte.svg',
  SAMSUNG: '/brands/samsung.svg',
  NVIDIA: '/brands/nvidia.svg',
  CORSAIR: '/brands/corsair.svg',
  ASROCK: '/brands/asrock.svg',
  KINGSTON: '/brands/kingston.svg',
  'G.SKILL': '/brands/gskill.svg',
  GSKILL: '/brands/gskill.svg',
};

export default function BrandStrip() {
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    fetchBrands()
      .then((rows: BrandItem[]) => {
        if (Array.isArray(rows) && rows.length > 0) {
          const filtered = rows.filter(b => b.is_active !== false);
          const sorted = [...filtered].sort((a, b) => {
            const posA = TOP_FAMOUS_BRANDS.indexOf(a.name.toUpperCase());
            const posB = TOP_FAMOUS_BRANDS.indexOf(b.name.toUpperCase());
            const orderA = posA !== -1 ? posA : 99;
            const orderB = posB !== -1 ? posB : 99;
            return orderA - orderB;
          });
          setBrands(sorted.slice(0, 8));
        } else {
          setFallback();
        }
      })
      .catch(() => setFallback());
  }, []);

  const setFallback = () => {
    setBrands(
      TOP_FAMOUS_BRANDS.slice(0, 8).map(name => ({
        id: name.toLowerCase(),
        name,
        slug: name.toLowerCase(),
      }))
    );
  };

  if (brands.length === 0) return null;

  return (
    <section className="home-brands" style={{ background: '#ffffff', padding: '32px 0 36px' }}>
      <style>{`
        .brand-strip-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 1240px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .brand-strip-grid {
            gap: 14px;
          }
        }
        @media (min-width: 1024px) {
          .brand-strip-grid {
            grid-template-columns: repeat(8, 1fr);
            gap: 14px;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '22px',
          letterSpacing: '-0.02em',
        }}>
          Thương hiệu đối tác
        </h2>

        <div className="brand-strip-grid">
          {brands.map((brand: BrandItem) => {
            const brandKey = brand.name.toUpperCase();
            const cleanKey = brandKey.replace(/[^A-Z0-9]/g, '');
            const logoSrc = BRAND_LOCAL_LOGOS[brandKey] || BRAND_LOCAL_LOGOS[cleanKey] || (brand as any).logo_url || (brand as any).image_url;

            return (
              <Link
                key={brand.id}
                href={`/search?search=${encodeURIComponent(brand.name)}`}
                title={brand.name}
                style={{
                  textDecoration: 'none',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  height: '64px',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {logoSrc ? (
                  <>
                    <img 
                      src={logoSrc} 
                      alt={brand.name} 
                      style={{
                        maxHeight: '28px',
                        maxWidth: '95px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                        const fallbackSpan = e.currentTarget.parentElement?.querySelector('.brand-fallback-text') as HTMLElement;
                        if (fallbackSpan) fallbackSpan.style.display = 'inline-block';
                      }}
                    />
                    <span 
                      className="brand-fallback-text"
                      style={{
                        display: 'none',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#1e293b',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {brand.name.toUpperCase()}
                    </span>
                  </>
                ) : (
                  <span 
                    className="brand-fallback-text"
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#1e293b',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {brand.name.toUpperCase()}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

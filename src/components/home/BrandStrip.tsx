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
    <section className="home-brands" style={{ background: '#ffffff', padding: '28px 0 32px' }}>
      <style>{`
        .brand-strip-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          max-width: 1240px;
          margin: 0 auto;
        }
        .brand-card-item {
          text-decoration: none;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px 8px;
          height: 54px;
          text-align: center;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          overflow: hidden;
          box-sizing: border-box;
        }
        .brand-card-item:hover {
          border-color: #2563eb;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
          transform: translateY(-2px);
        }
        .brand-logo-img {
          max-height: 22px;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        @media (min-width: 640px) {
          .brand-strip-grid {
            gap: 12px;
          }
          .brand-card-item {
            padding: 10px 12px;
            height: 60px;
          }
          .brand-logo-img {
            max-height: 26px;
          }
        }
        @media (min-width: 1024px) {
          .brand-strip-grid {
            grid-template-columns: repeat(8, 1fr);
            gap: 14px;
          }
          .brand-card-item {
            padding: 12px 14px;
            height: 64px;
          }
          .brand-logo-img {
            max-height: 28px;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '18px',
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
                className="brand-card-item"
              >
                {logoSrc ? (
                  <>
                    <img 
                      src={logoSrc} 
                      alt={brand.name} 
                      className="brand-logo-img"
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
                        fontSize: '11px',
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
                      fontSize: '11px',
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

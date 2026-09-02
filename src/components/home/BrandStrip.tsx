'use client';

import React from 'react';
import Link from 'next/link';

const BRANDS = [
  { name: 'ROG', color: '#1e293b' },
  { name: 'GIGABYTE', color: '#334155' },
  { name: 'MSI', color: '#475569' },
  { name: 'CORSAIR', color: '#1e293b' },
  { name: 'KINGSTON', color: '#334155' },
  { name: 'AMD', color: '#dc2626' },
  { name: 'INTEL', color: '#2563eb' },
];

export default function BrandStrip() {
  return (
    <section className="home-brands" style={{
      background: '#ffffff',
      padding: '24px 0 32px',
    }}>
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
          {BRANDS.map((brand, i) => (
            <Link
              key={i}
              href={`/search?search=${brand.name}`}
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
                color: brand.color,
                letterSpacing: '1px',
              }}>
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, HardDrive, Zap, Shield, Monitor } from 'lucide-react';

const CATEGORIES = [
  { name: 'CPU', icon: Cpu, href: '/search?category=cpu' },
  { name: 'VGA', icon: Monitor, href: '/search?category=vga' },
  { name: 'RAM', icon: Zap, href: '/search?category=ram' },
  { name: 'Ổ cứng', icon: HardDrive, href: '/search?category=ssd' },
  { name: 'Nguồn', icon: Shield, href: '/search?category=psu' },
];

export default function CategoryGrid() {
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
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
        }}>
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
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

                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1e293b',
                  }}>
                    {cat.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Cpu, CircuitBoard, MemoryStick, Monitor, HardDrive, 
  Zap, Box, Fan, Tv, Keyboard, Headphones, ArrowRight,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { fetchCategories } from '@/lib/api';

const CATEGORY_IMAGES: Record<string, string> = {
  cpu: '/images/cpu-box.jpg',
  mainboard: '/images/cat-mainboard.jpg',
  ram: '/images/ram-rgb.jpg',
  gpu: '/images/gpu-strix.jpg',
  storage: '/images/ssd-nvme.jpg',
  psu: '/images/cat-psu.jpg',
  case: '/images/hero-pc.jpg',
  cooling: '/images/build-neon.jpg',
  monitor: '/images/cat-monitor.jpg',
  gear: '/images/cat-gear.jpg',
  headset: '/images/cat-headset.jpg',
};

const CATEGORY_BADGES: Record<string, string> = {
  cpu: 'CPU',
  mainboard: 'Mainboard',
  ram: 'RAM',
  gpu: 'GPU',
  storage: 'SSD / HDD',
  psu: 'PSU',
  case: 'Case',
  cooling: 'Cooling',
  monitor: 'Monitor',
  gear: 'Gaming Gear',
  headset: 'Audio',
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  cpu: Cpu,
  mainboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Monitor,
  storage: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
  monitor: Tv,
  gear: Keyboard,
  headset: Headphones,
};

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories()
      .then((rows: CategoryItem[]) => {
        if (Array.isArray(rows)) setCategories(rows);
      })
      .catch(() => setCategories([]));
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="home-category-grid" style={{ background: '#ffffff', padding: '36px 0 44px' }}>
      <style>{`
        .category-row-container {
          display: flex;
          align-items: stretch;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 2px 14px;
        }

        .category-row-container::-webkit-scrollbar {
          display: none;
        }

        .category-card {
          flex: 0 0 136px;
          min-width: 136px;
          scroll-snap-align: start;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          aspect-ratio: 3.4 / 5;
        }

        @media (min-width: 1220px) {
          .category-card {
            flex: 1 1 0;
            min-width: 98px;
          }
        }

        .category-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }

        .category-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 55%, rgba(0, 0, 0, 0.1) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px 9px;
          transition: background 0.3s ease;
        }

        .category-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 9.5px;
          font-weight: 700;
          margin-bottom: 5px;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.25);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .category-card-title {
          font-size: 11.5px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 3px 0;
          line-height: 1.25;
          letter-spacing: -0.01em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .category-card-count {
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: color 0.3s ease;
          white-space: nowrap;
        }

        .category-card-action {
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.3s ease;
          color: #38bdf8;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
        }

        .category-card:hover {
          transform: translateY(-4px);
          border-color: #2563eb;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
        }

        .category-card:hover .category-card-img {
          transform: scale(1.08);
        }

        .category-card:hover .category-card-overlay {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.65) 60%, rgba(37, 99, 235, 0.2) 100%);
        }

        .category-card:hover .category-card-badge {
          background: #2563eb;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .category-card:hover .category-card-action {
          opacity: 1;
          transform: translateY(0);
        }

        .category-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .category-nav-btn:hover {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff6ff;
          transform: scale(1.05);
        }

        .view-all-btn {
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s ease;
        }

        .view-all-btn:hover {
          gap: 6px;
        }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Danh mục linh kiện
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Khám phá linh kiện máy tính chính hãng theo từng danh mục
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Cuộn sang trái"
                className="category-nav-btn"
                title="Trước"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Cuộn sang phải"
                className="category-nav-btn"
                title="Sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link href="/search" className="view-all-btn">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div ref={scrollRef} className="category-row-container">
          {categories.map(cat => {
            const IconComponent = ICON_MAP[cat.slug] || Cpu;
            const bgImage = CATEGORY_IMAGES[cat.slug] || '/images/cpu-box.jpg';
            const badgeLabel = CATEGORY_BADGES[cat.slug] || cat.name.split(' (')[0].split(' - ')[0];

            return (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="category-card"
                title={`Xem sản phẩm danh mục ${cat.name}`}
              >
                <img
                  src={bgImage}
                  alt={cat.name}
                  className="category-card-img"
                  onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                />

                <div className="category-card-overlay">
                  <div className="category-card-badge">
                    <IconComponent size={11} />
                    <span>{badgeLabel}</span>
                  </div>

                  <h3 className="category-card-title">
                    {cat.name}
                  </h3>

                  <div className="category-card-count">
                    <span>{cat.product_count ?? 0} SP</span>
                  </div>

                  <div className="category-card-action">
                    <span>Khám phá</span>
                    <ArrowRight size={10} />
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

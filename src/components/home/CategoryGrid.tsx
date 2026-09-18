'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Cpu, CircuitBoard, MemoryStick, HardDrive, 
  Zap, Box, Fan, Tv, Keyboard, Headphones, ArrowRight,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { fetchCategories } from '@/lib/api';

// Custom high-precision SVG icon for GPU / Graphics Card
const GpuIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
    <circle cx="16" cy="12" r="2.5" />
    <path d="M6 18v2M10 18v2M14 18v2M18 18v2" />
  </svg>
);

interface CategoryStyleConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  color: string;
  bgLight: string;
  bgGradient: string;
  borderColor: string;
}

const CATEGORY_CONFIG: Record<string, CategoryStyleConfig> = {
  cpu: {
    icon: Cpu,
    badge: 'CPU',
    color: '#2563eb', // Vibrant Blue
    bgLight: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#93c5fd',
  },
  gpu: {
    icon: GpuIcon,
    badge: 'GPU',
    color: '#7c3aed', // Purple / Violet
    bgLight: '#f5f3ff',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    borderColor: '#c4b5fd',
  },
  mainboard: {
    icon: CircuitBoard,
    badge: 'Mainboard',
    color: '#4f46e5', // Indigo
    bgLight: '#eef2ff',
    bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    borderColor: '#a5b4fc',
  },
  ram: {
    icon: MemoryStick,
    badge: 'RAM',
    color: '#059669', // Emerald Green
    bgLight: '#ecfdf5',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderColor: '#6ee7b7',
  },
  storage: {
    icon: HardDrive,
    badge: 'SSD / HDD',
    color: '#d97706', // Amber
    bgLight: '#fffbeb',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#fcd34d',
  },
  psu: {
    icon: Zap,
    badge: 'PSU',
    color: '#ea580c', // Orange
    bgLight: '#fff7ed',
    bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    borderColor: '#fdba74',
  },
  case: {
    icon: Box,
    badge: 'Case',
    color: '#475569', // Slate
    bgLight: '#f8fafc',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderColor: '#cbd5e1',
  },
  cooling: {
    icon: Fan,
    badge: 'Cooling',
    color: '#0891b2', // Cyan
    bgLight: '#ecfeff',
    bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    borderColor: '#67e8f9',
  },
  monitor: {
    icon: Tv,
    badge: 'Monitor',
    color: '#1d4ed8', // Royal Blue
    bgLight: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#93c5fd',
  },
  gear: {
    icon: Keyboard,
    badge: 'Gaming Gear',
    color: '#e11d48', // Rose
    bgLight: '#fff1f2',
    bgGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    borderColor: '#fda4af',
  },
  headset: {
    icon: Headphones,
    badge: 'Audio',
    color: '#0d9488', // Teal
    bgLight: '#f0fdfa',
    bgGradient: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    borderColor: '#5eead4',
  },
  keyboard: {
    icon: Keyboard,
    badge: 'Keyboard',
    color: '#2563eb',
    bgLight: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#93c5fd',
  },
  mouse: {
    icon: Keyboard,
    badge: 'Mouse',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    borderColor: '#c4b5fd',
  },
  laptop: {
    icon: Tv,
    badge: 'Laptop',
    color: '#0891b2',
    bgLight: '#ecfeff',
    bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    borderColor: '#67e8f9',
  },
};

const DEFAULT_CONFIG: CategoryStyleConfig = {
  icon: Cpu,
  badge: 'Phần cứng',
  color: '#2563eb',
  bgLight: '#eff6ff',
  bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  borderColor: '#93c5fd',
};

function getCategoryConfig(slug: string, name: string): CategoryStyleConfig {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (s === 'cpu' || n.includes('cpu') || n.includes('vi xử lý')) return CATEGORY_CONFIG.cpu;
  if (s === 'gpu' || s === 'vga' || n.includes('gpu') || n.includes('card màn')) return CATEGORY_CONFIG.gpu;
  if (s === 'mainboard' || s === 'mb' || n.includes('mainboard') || n.includes('bo mạch')) return CATEGORY_CONFIG.mainboard;
  if (s === 'ram' || n.includes('ram') || n.includes('bộ nhớ')) return CATEGORY_CONFIG.ram;
  if (s === 'storage' || s === 'ssd' || s === 'hdd' || n.includes('ssd') || n.includes('ổ cứng')) return CATEGORY_CONFIG.storage;
  if (s === 'psu' || n.includes('psu') || n.includes('nguồn')) return CATEGORY_CONFIG.psu;
  if (s === 'case' || n.includes('case') || n.includes('vỏ')) return CATEGORY_CONFIG.case;
  if (s === 'cooling' || n.includes('tản nhiệt') || n.includes('cooling')) return CATEGORY_CONFIG.cooling;
  if (s === 'monitor' || n.includes('màn hình') || n.includes('monitor')) return CATEGORY_CONFIG.monitor;
  if (s === 'keyboard' || s.includes('phim') || n.includes('bàn phím') || n.includes('keyboard')) return CATEGORY_CONFIG.keyboard;
  if (s === 'mouse' || s.includes('chuot') || n.includes('chuột') || n.includes('mouse') || n.includes('lót')) return CATEGORY_CONFIG.mouse;
  if (s === 'headset' || s === 'speaker' || s === 'audio' || n.includes('tai nghe') || n.includes('loa') || n.includes('audio')) return CATEGORY_CONFIG.headset;
  if (s === 'laptop' || n.includes('laptop')) return CATEGORY_CONFIG.laptop;

  return DEFAULT_CONFIG;
}

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
    <section className="home-category-grid" style={{ background: '#ffffff', padding: '20px 0 24px' }}>
      <style>{`
        .cat-grid-row-container {
          display: flex;
          align-items: stretch;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 2px 8px;
        }

        .cat-grid-row-container::-webkit-scrollbar {
          display: none;
        }

        .cat-grid-card {
          flex: 0 0 115px !important;
          min-width: 115px !important;
          height: auto !important;
          max-height: 125px !important;
          scroll-snap-align: start;
          position: relative;
          border-radius: 12px;
          background: #ffffff !important;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start !important;
          text-align: center;
          padding: 12px 6px 10px;
          box-sizing: border-box;
        }

        @media (min-width: 1220px) {
          .cat-grid-card {
            flex: 1 1 0 !important;
            min-width: 90px !important;
          }
        }

        .cat-grid-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          transition: all 0.25s ease;
        }

        .cat-grid-card:hover .cat-grid-icon-wrapper {
          transform: scale(1.08) translateY(-1px);
        }

        .cat-grid-card-badge {
          display: inline-block;
          padding: 1.5px 6px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 700;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .cat-grid-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 28px;
          transition: color 0.2s ease;
        }

        .cat-grid-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent-color);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 2px 8px var(--accent-border-rgba);
        }

        .cat-grid-card:hover .cat-grid-card-title {
          color: var(--accent-color);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Danh mục linh kiện
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
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

        <div ref={scrollRef} className="cat-grid-row-container">
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat.slug] || DEFAULT_CONFIG;
            const IconComponent = config.icon;

            return (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="cat-grid-card"
                title={`Xem sản phẩm danh mục ${cat.name}`}
                style={{
                  '--accent-color': config.color,
                  '--accent-border-rgba': `${config.color}33`,
                } as React.CSSProperties}
              >
                <div 
                  className="cat-grid-icon-wrapper"
                  style={{
                    background: config.bgGradient,
                    color: config.color,
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  <IconComponent size={20} />
                </div>

                <span
                  className="cat-grid-card-badge"
                  style={{
                    background: config.bgLight,
                    color: config.color,
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  {config.badge}
                </span>

                <h3 className="cat-grid-card-title">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


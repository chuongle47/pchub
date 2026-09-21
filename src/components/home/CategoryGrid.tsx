'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Cpu, CircuitBoard, MemoryStick, HardDrive, 
  Zap, Box, Fan, Tv, Keyboard, Headphones, Mouse, Volume2, ArrowRight,
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
  color: string;
  bgLight: string;
  bgGradient: string;
  borderColor: string;
}

const CATEGORY_CONFIG: Record<string, CategoryStyleConfig> = {
  cpu: {
    icon: Cpu,
    color: '#2563eb', // Vibrant Blue
    bgLight: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#bfdbfe',
  },
  gpu: {
    icon: GpuIcon,
    color: '#7c3aed', // Purple / Violet
    bgLight: '#f5f3ff',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    borderColor: '#ddd6fe',
  },
  mainboard: {
    icon: CircuitBoard,
    color: '#4f46e5', // Indigo
    bgLight: '#eef2ff',
    bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    borderColor: '#c7d2fe',
  },
  ram: {
    icon: MemoryStick,
    color: '#059669', // Emerald Green
    bgLight: '#ecfdf5',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderColor: '#a7f3d0',
  },
  storage: {
    icon: HardDrive,
    color: '#d97706', // Amber
    bgLight: '#fffbeb',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#fde68a',
  },
  psu: {
    icon: Zap,
    color: '#ea580c', // Orange
    bgLight: '#fff7ed',
    bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    borderColor: '#fed7aa',
  },
  case: {
    icon: Box,
    color: '#475569', // Slate
    bgLight: '#f8fafc',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderColor: '#cbd5e1',
  },
  cooling: {
    icon: Fan,
    color: '#0891b2', // Cyan
    bgLight: '#ecfeff',
    bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    borderColor: '#a5f3fc',
  },
  monitor: {
    icon: Tv,
    color: '#1d4ed8', // Royal Blue
    bgLight: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#bfdbfe',
  },
  keyboard: {
    icon: Keyboard,
    color: '#e11d48', // Rose
    bgLight: '#fff1f2',
    bgGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    borderColor: '#fecdd3',
  },
  mouse: {
    icon: Mouse,
    color: '#9333ea', // Purple
    bgLight: '#faf5ff',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    borderColor: '#e9d5ff',
  },
  headset: {
    icon: Headphones,
    color: '#0d9488', // Teal
    bgLight: '#f0fdfa',
    bgGradient: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    borderColor: '#99f6e4',
  },
  speaker: {
    icon: Volume2,
    color: '#db2777', // Pink
    bgLight: '#fdf2f8',
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    borderColor: '#fbcfe8',
  },
};

const DEFAULT_CONFIG: CategoryStyleConfig = {
  icon: Cpu,
  color: '#2563eb',
  bgLight: '#eff6ff',
  bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  borderColor: '#bfdbfe',
};

function getCategoryConfig(slug: string, name: string): CategoryStyleConfig {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (s === 'cpu' || n.includes('cpu') || n.includes('vi xử lý')) return CATEGORY_CONFIG.cpu;
  if (s === 'gpu' || s === 'vga' || n.includes('gpu') || n.includes('vga') || n.includes('card')) return CATEGORY_CONFIG.gpu;
  if (s === 'mainboard' || s === 'mb' || n.includes('mainboard') || n.includes('bo mạch')) return CATEGORY_CONFIG.mainboard;
  if (s === 'ram' || n.includes('ram') || n.includes('bộ nhớ')) return CATEGORY_CONFIG.ram;
  if (s === 'storage' || s === 'o-cung' || s === 'ssd' || s === 'hdd' || n.includes('ssd') || n.includes('ổ cứng')) return CATEGORY_CONFIG.storage;
  if (s === 'psu' || s === 'nguon' || n.includes('psu') || n.includes('nguồn')) return CATEGORY_CONFIG.psu;
  if (s === 'case' || n.includes('case') || n.includes('vỏ')) return CATEGORY_CONFIG.case;
  if (s === 'cooling' || s === 'tan-nhiet' || n.includes('tản nhiệt') || n.includes('cooling')) return CATEGORY_CONFIG.cooling;
  if (s === 'monitor' || s.includes('man-hinh') || n.includes('màn hình') || n.includes('monitor')) return CATEGORY_CONFIG.monitor;
  if (s === 'keyboard' || s === 'ban-phim' || n.includes('bàn phím') || n.includes('keyboard')) return CATEGORY_CONFIG.keyboard;
  if (s === 'mouse' || s === 'chuot' || n.includes('chuột') || n.includes('mouse')) return CATEGORY_CONFIG.mouse;
  if (s === 'headset' || s === 'tai-nghe' || n.includes('tai nghe')) return CATEGORY_CONFIG.headset;
  if (s === 'speaker' || s === 'loa-may-tinh' || n.includes('loa')) return CATEGORY_CONFIG.speaker;

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
        if (Array.isArray(rows)) {
          // Lọc bỏ danh mục cha chung chung và trùng lặp
          const seen = new Set<string>();
          const clean = rows.filter(cat => {
            const s = cat.slug.toLowerCase();
            if (s === 'linh-kien-may-tinh' || s === 'linh-kien') return false;
            
            // Chuẩn hóa để tránh trùng lặp giữa 'man-hinh' và 'man-hinh-may-tinh'
            let norm = s;
            if (s.includes('man-hinh')) norm = 'man-hinh';
            if (s.includes('phim')) norm = 'ban-phim';
            if (s.includes('chuot')) norm = 'chuot';
            if (s.includes('tai-nghe')) norm = 'tai-nghe';
            if (s.includes('loa')) norm = 'loa';
            
            if (seen.has(norm)) return false;
            seen.add(norm);
            return true;
          });
          setCategories(clean);
        }
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
    <section className="home-category-grid" style={{ background: '#ffffff', padding: '24px 0' }}>
      <style>{`
        .cat-grid-row-container {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 6px 2px 10px;
        }

        .cat-grid-row-container::-webkit-scrollbar {
          display: none;
        }

        .cat-grid-card {
          flex: 0 0 108px !important;
          width: 108px !important;
          min-width: 108px !important;
          height: 108px !important;
          scroll-snap-align: start;
          border-radius: 14px;
          background: #ffffff !important;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          text-align: center;
          padding: 10px 8px;
          box-sizing: border-box;
        }

        .cat-grid-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .cat-grid-card:hover .cat-grid-icon-wrapper {
          transform: scale(1.1) translateY(-2px);
        }

        .cat-grid-card-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-height: 30px;
          text-align: center;
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
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .view-all-btn {
          font-size: 13px;
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .view-all-btn:hover {
          color: #1d4ed8;
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
            const config = getCategoryConfig(cat.slug, cat.name);
            const IconComponent = config.icon;

            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.slug)}`}
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
                  <IconComponent size={22} />
                </div>

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

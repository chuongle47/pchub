'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Edit3, Plus, Share2, Trash2, SlidersHorizontal, Monitor, CheckCircle2 } from 'lucide-react';

type Build = { id: string; name: string; purpose: 'Gaming' | 'Streaming'; price: number; parts: string; updated: string; image: string; status: string };

const BUILDS: Build[] = [
  { id: 'build-01', name: 'My Gaming Beast Build 2026', purpose: 'Gaming', price: 55820000, parts: 'i9-14900K · RTX 4090 · 64GB DDR5', updated: '20/08/2026', image: '/images/hero-pc.jpg', status: 'Tương thích 100%' },
  { id: 'build-02', name: 'Streaming Setup 2026', purpose: 'Streaming', price: 68990000, parts: 'Ryzen 9 7950X · RTX 4080 · 64GB DDR5', updated: '12/08/2026', image: '/images/build-neon.jpg', status: 'Tương thích 100%' },
];

export default function MyBuildsPage() {
  const [filter, setFilter] = useState<'all' | Build['purpose']>('all');
  const [builds, setBuilds] = useState(BUILDS);
  const visibleBuilds = filter === 'all' ? builds : builds.filter(build => build.purpose === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Build PC của tôi</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Quản lý và tiếp tục xây dựng các cấu hình máy tính đã lưu</p>
        </div>
        <Link
          href="/build-pc"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} /> Tạo cấu hình mới
        </Link>
      </div>

      {/* Toolbar filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['all', 'Gaming', 'Streaming'] as const).map(type => {
            const count = type === 'all' ? builds.length : builds.filter(b => b.purpose === type).length;
            const isSelected = filter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? '#ffffff' : '#475569',
                  background: isSelected ? '#2563eb' : '#ffffff',
                  border: isSelected ? 'none' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {type === 'all' ? 'Tất cả' : type} ({count})
              </button>
            );
          })}
        </div>

        <button type="button" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12.5px',
          fontWeight: 700,
          color: '#64748b',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          <SlidersHorizontal size={14} /> Mới cập nhật
        </button>
      </div>

      {/* Builds Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {visibleBuilds.map(build => {
          const partsArray = build.parts.split(' · ');
          return (
            <article key={build.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              {/* Image Banner */}
              <div style={{ position: 'relative', height: '170px', background: '#0f172a', overflow: 'hidden' }}>
                <img src={build.image} alt={build.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 2,
                }}>
                  {build.purpose}
                </span>
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(22, 163, 74, 0.95)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 2,
                }}>
                  <CheckCircle2 size={12} /> {build.status}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.4' }}>{build.name}</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Cập nhật lần cuối: {build.updated}</p>
                </div>

                {/* Specs Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>CPU</span>
                    <strong style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{partsArray[0]}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>GPU</span>
                    <strong style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{partsArray[1]}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>RAM</span>
                    <strong style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{partsArray[2]}</strong>
                  </div>
                </div>

                {/* Price & Actions Footer */}
                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '17px', fontFamily: 'monospace' }}>
                    {build.price.toLocaleString('vi-VN')} ₫
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Link
                      href="/build-pc"
                      style={{
                        padding: '6px',
                        color: '#64748b',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <button
                      type="button"
                      style={{
                        padding: '6px',
                        color: '#64748b',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Sao chép"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '6px',
                        color: '#64748b',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Chia sẻ"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilds(current => current.filter(item => item.id !== build.id))}
                      style={{
                        padding: '6px',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Xóa cấu hình"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visibleBuilds.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
          <Monitor size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Chưa có cấu hình PC nào</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Tạo các cấu hình PC gaming hoặc đồ họa tùy chỉnh và lưu lại tại đây.</p>
        </div>
      )}
    </div>
  );
}

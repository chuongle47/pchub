'use client';

import React from 'react';
import Link from 'next/link';

const COMMUNITY_BUILDS = [
  {
    id: 'build1',
    name: 'Project Neon — Gaming 4K Ultra',
    image: '/images/build-neon.jpg',
    tags: ['Gaming', '4K', 'RGB'],
    priceRange: '40-45 triệu',
    authorName: 'Nguyễn Văn Bình',
    authorAvatar: '',
    components: 'i9-14900K · RTX 4090 · 64GB DDR5 · 4TB NVMe',
    totalPrice: 42500000,
    likes: 234,
    views: 12400,
    isVerified: true,
  },
  {
    id: 'build2',
    name: 'Silent Render Node — Workstation',
    image: '/images/build-neon.jpg',
    tags: ['Workstation', 'Silent', '3D Render'],
    priceRange: '55-60 triệu',
    authorName: 'Trần Thị Mai',
    authorAvatar: '',
    components: 'Threadripper 7960X · RTX 4080 · 128GB DDR5 · 8TB SSD',
    totalPrice: 57800000,
    likes: 189,
    views: 8900,
    isVerified: true,
  },
  {
    id: 'build3',
    name: '1080p Sweet Spot — Budget Gaming',
    image: '/images/build-neon.jpg',
    tags: ['Gaming', 'Budget', '1080p'],
    priceRange: '15-18 triệu',
    authorName: 'Lê Minh Tuấn',
    authorAvatar: '',
    components: 'Ryzen 5 7600X · RTX 4060 Ti · 32GB DDR5 · 1TB NVMe',
    totalPrice: 16800000,
    likes: 445,
    views: 21300,
    isVerified: false,
  },
];

export default function CommunityBuilds() {
  return (
    <section style={{ background: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            🖥️ Cấu hình từ cộng đồng
          </h2>
          <Link href="/community" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Xem tất cả →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {COMMUNITY_BUILDS.map(build => (
            <div key={build.id} style={{
              background: '#fff',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
            >
              {/* Thumbnail */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                position: 'relative',
              }}>
                🖥️
                {/* Tags */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                  {build.tags.map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontWeight: 600,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px' }}>
                {/* Author + stats */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', color: '#fff', fontWeight: 700,
                    }}>
                      {build.authorName.charAt(0)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{build.authorName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#94a3b8' }}>
                    <span>❤️ {build.likes}</span>
                    <span>👁 {build.views.toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                  lineHeight: '1.4',
                }}>{build.name}</h3>

                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginBottom: '12px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{build.components}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#2563eb',
                      fontFamily: 'monospace',
                    }}>
                      {build.totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                    {build.isVerified && (
                      <span style={{
                        marginLeft: '6px',
                        fontSize: '10px',
                        color: '#16a34a',
                        fontWeight: 600,
                      }}>✅ Đã kiểm tra</span>
                    )}
                  </div>
                  <Link href={`/community`} style={{
                    fontSize: '11px',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Xem & Sao chép</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

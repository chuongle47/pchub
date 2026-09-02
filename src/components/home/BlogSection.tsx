'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 'bp1',
    slug: 'review-rtx-4070-ti-super',
    title: 'Đánh giá chi tiết RTX 4070 Ti Super: Hiệu năng đỉnh cao cho 4K',
    thumbnail: '/images/gpu-white.jpg',
    category: 'ĐÁNH GIÁ',
    date: '15/05/2024',
  },
  {
    id: 'bp2',
    slug: 'huong-dan-chon-tan-nhiet-aio',
    title: 'Hướng dẫn chọn tản nhiệt nước AIO cho Core i9-14900K',
    thumbnail: '/images/hero-pc.jpg',
    category: 'HƯỚNG DẪN',
    date: '12/05/2024',
  },
  {
    id: 'bp3',
    slug: 'top-5-cau-hinh-pc-choi-game',
    title: 'Top 5 cấu hình PC chơi game đáng mua nhất tháng 5',
    thumbnail: '/images/cpu-box.jpg',
    category: 'TỔNG HỢP',
    date: '10/05/2024',
  },
];

export default function BlogSection() {
  return (
    <section className="home-blog" style={{ background: '#ffffff', padding: '32px 0 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Bài viết & Đánh giá
            </h2>
          </div>
          <Link href="/community" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Xem tất cả →
          </Link>
        </div>

        {/* 3 Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {BLOG_POSTS.map(post => (
            <Link
              key={post.id}
              href={`/community`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'none';
              }}
              >
                {/* Image */}
                <div style={{
                  height: '180px',
                  overflow: 'hidden',
                  background: '#f8fafc',
                }}>
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={e => { e.currentTarget.src = '/images/gpu-white.jpg'; }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  {/* Category Tag & Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      color: '#2563eb',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}>
                      {post.category}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ color: '#94a3b8' }}>{post.date}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: '1.5',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


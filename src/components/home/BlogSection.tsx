'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  date: string;
}

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'bp1',
    slug: 'review-rtx-4070-ti-super',
    title: 'Đánh giá chi tiết RTX 4070 Ti Super: Hiệu năng đỉnh cao cho 4K',
    excerpt: 'Khám phá sức mạnh thực tế của GeForce RTX 4070 Ti Super qua các bài test game AAA khắt khe ở độ phân giải 4K. Cùng trải nghiệm công nghệ DLSS 3.5 đỉnh cao và hiệu suất tản nhiệt ấn tượng.',
    thumbnail: '/images/gpu-white.jpg',
    category: 'ĐÁNH GIÁ',
    date: '15/05/2026',
  },
  {
    id: 'bp2',
    slug: 'huong-dan-chon-tan-nhiet-aio',
    title: 'Hướng dẫn chọn tản nhiệt nước AIO cho Core i9-14900K',
    excerpt: 'Core i9-14900K cần hệ thống giải nhiệt cực mạnh để duy trì xung nhịp 6.0GHz ổn định. Xem ngay top các mẫu tản AIO 360mm xuất sắc nhất giúp CPU luôn mát mẻ và tối ưu tuổi thọ.',
    thumbnail: '/images/hero-pc.jpg',
    category: 'HƯỚNG DẪN',
    date: '12/05/2026',
  },
  {
    id: 'bp3',
    slug: 'top-5-cau-hinh-pc-choi-game',
    title: 'Top 5 cấu hình PC chơi game đáng mua nhất tháng 5',
    excerpt: 'Tổng hợp 5 bộ máy tính chơi game tối ưu nhất trong từng phân khúc ngân sách từ 15 đến 50 triệu đồng. Cấu hình được cân chỉnh kỹ lưỡng cho trải nghiệm mượt mà mọi tựa game hot hiện nay.',
    thumbnail: '/images/cpu-box.jpg',
    category: 'TỔNG HỢP',
    date: '10/05/2026',
  },
];

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts?limit=3');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
            const mapped: BlogPost[] = data.posts.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              excerpt: p.excerpt || (p.content ? p.content.slice(0, 140) + '...' : ''),
              thumbnail: p.cover_url || '/images/hero-pc.jpg',
              category: p.type === 'guide' ? 'HƯỚNG DẪN' : p.type === 'review' ? 'ĐÁNH GIÁ' : 'TIN TỨC',
              date: new Date(p.published_at || p.created_at).toLocaleDateString('vi-VN'),
            }));
            setPosts(mapped);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết từ Supabase:', err);
      }
    }
    fetchPosts();
  }, []);

  return (
    <section className="home-blog" style={{ background: '#ffffff', padding: '32px 0 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={22} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Bài viết & Tin công nghệ
            </h2>
          </div>
          <Link href="/blog" className="view-all-btn">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {/* 3 Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(37,99,235,0.12)';
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f1f5f9';
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
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                }}>
                  {/* Category & Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {post.category}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                    }}>
                      {post.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: '1.4',
                    margin: '0 0 8px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.5',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1,
                  }}>
                    {post.excerpt}
                  </p>

                  {/* Read More Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#2563eb',
                    marginTop: 'auto',
                  }}>
                    Đọc tiếp <ArrowRight size={14} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

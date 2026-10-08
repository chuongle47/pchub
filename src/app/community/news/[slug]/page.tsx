'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, ArrowLeft, Share2, Check, Bookmark, 
  ArrowRight, Tag, BookOpen, User, Eye, Sparkles
} from 'lucide-react';
import { 
  CommunityPost, INITIAL_COMMUNITY_POSTS 
} from '@/data/community-data';

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<CommunityPost[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const found = INITIAL_COMMUNITY_POSTS.find(p => p.slug === resolvedParams.slug || p.id === resolvedParams.slug);
    if (found) {
      setPost(found);
      const related = INITIAL_COMMUNITY_POSTS
        .filter(p => p.id !== found.id && p.category === found.category)
        .slice(0, 3);
      setRelatedPosts(related.length > 0 ? related : INITIAL_COMMUNITY_POSTS.filter(p => p.id !== found.id).slice(0, 3));
    }
  }, [resolvedParams.slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  if (!post) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', minHeight: '60vh', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          Đang tải bài viết...
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          Vui lòng đợi giây lát hoặc quay lại chuyên mục tin tức.
        </p>
        <Link 
          href="/community?tab=news"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#2563eb',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Quay lại Tin tức & Hướng dẫn
        </Link>
      </div>
    );
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `https://pchub-iota.vercel.app${post.cover}`,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PCHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pchub-iota.vercel.app/images/hero-pc.jpg',
      },
    },
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 80px' }}>
      
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Toast Alert */}
        {copiedToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} color="#22c55e" />
            <span>Đã sao chép liên kết bài viết vào bộ nhớ tạm!</span>
          </div>
        )}

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/community?tab=news" style={{ color: '#64748b', textDecoration: 'none' }}>Tin tức & Hướng dẫn</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </span>
        </nav>

        {/* Main Article Container */}
        <article style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          marginBottom: '36px'
        }}>
          {/* Category & Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px'
            }}>
              {post.category}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
              <Clock size={13} /> {post.readingMinutes} phút đọc
            </span>

            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              • Ngày đăng: {post.publishedAt}
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', lineHeight: '1.3', marginBottom: '20px' }}>
            {post.title}
          </h1>

          {/* Author info & Share button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            marginBottom: '24px',
            borderBottom: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {post.author.avatar}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{post.author.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{post.author.role}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} /> Chia sẻ bài viết
            </button>
          </div>

          {/* Cover Image */}
          <div style={{ height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '28px', background: '#0f172a' }}>
            <img 
              src={post.cover} 
              alt={post.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Excerpt Lead */}
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#334155',
            lineHeight: '1.7',
            padding: '16px 20px',
            background: '#f8fafc',
            borderLeft: '4px solid #2563eb',
            borderRadius: '0 12px 12px 0',
            marginBottom: '28px'
          }}>
            {post.excerpt}
          </div>

          {/* Article Body */}
          <div style={{
            fontSize: '15.5px',
            lineHeight: '1.8',
            color: '#1e293b',
          }}>
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '32px 0 14px' }}>
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} style={{ fontSize: '17px', fontWeight: 800, color: '#1e40af', margin: '24px 0 10px' }}>
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n- ');
                return (
                  <ul key={index} style={{ paddingLeft: '20px', margin: '12px 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((item, i) => (
                      <li key={i} style={{ color: '#334155' }}>
                        {item.replace(/^- /, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('---')) {
                return <hr key={index} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '28px 0' }} />;
              }
              return (
                <p key={index} style={{ margin: '0 0 16px', color: '#334155' }}>
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '24px', marginTop: '32px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={14} /> Thẻ bài viết:
              </span>
              {post.tags.map(tag => (
                <span key={tag} style={{ background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '18px' }}>
              📚 Bài viết liên quan
            </h2>

            <div className="home-grid-3">
              {relatedPosts.map(rp => (
                <Link
                  key={rp.id}
                  href={`/community/news/${rp.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                      <img src={rp.cover} alt={rp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>
                        {rp.category}
                      </span>
                      <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', lineHeight: '1.35', marginBottom: '6px' }}>
                        {rp.title}
                      </h3>
                      <div style={{ marginTop: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                        {rp.publishedAt} · {rp.readingMinutes} phút đọc
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, cover_url, seo_title, seo_description')
    .eq('slug', slug)
    .maybeSingle();

  if (!post) return { title: 'Bài viết không tồn tại | PCHub' };

  return {
    title: `${post.seo_title || post.title} | PCHub`,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_url ? [post.cover_url] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, content, cover_url, type, published_at, created_at, author:profiles!author_id(full_name, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!post) {
    notFound();
  }

  const author = Array.isArray(post.author) ? post.author[0] : post.author;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px 80px' }}>
      <Link
        href="/blog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '14px',
          textDecoration: 'none',
          marginBottom: '24px',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} /> Quay lại danh sách bài viết
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#2563eb',
          background: '#eff6ff',
          padding: '4px 10px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {post.type === 'guide' ? 'Hướng dẫn' : post.type === 'review' ? 'Đánh giá' : 'Tin tức'}
        </span>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: '1.3',
          margin: '16px 0 16px',
        }}>
          {post.title}
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: '#64748b',
          fontSize: '14px',
          paddingBottom: '20px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {author?.full_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} />
              <span style={{ fontWeight: 600, color: '#334155' }}>{author.full_name}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} />
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {post.cover_url && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', maxHeight: '420px' }}>
          <img
            src={post.cover_url}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {post.excerpt && (
        <div style={{
          fontSize: '17px',
          lineHeight: '1.6',
          color: '#334155',
          fontWeight: 500,
          fontStyle: 'italic',
          background: '#f8fafc',
          padding: '16px 20px',
          borderRadius: '12px',
          borderLeft: '4px solid #2563eb',
          marginBottom: '28px',
        }}>
          {post.excerpt}
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.8',
          color: '#1e293b',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {post.content}
      </div>
    </div>
  );
}


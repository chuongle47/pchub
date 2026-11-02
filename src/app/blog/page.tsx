import React from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Tin tức & Đánh giá công nghệ | PCHub',
  description: 'Cập nhật tin tức công nghệ mới nhất, hướng dẫn build PC, đánh giá linh kiện máy tính chuyên sâu.',
};

export default async function BlogIndexPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_url, type, published_at, created_at, author:profiles!author_id(full_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const postList = posts || [];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Newspaper size={28} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Tin tức & Bài viết công nghệ
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Chia sẻ kiến thức phần cứng, hướng dẫn tối ưu máy tính và phân tích xu hướng công nghệ từ đội ngũ PCHub.
        </p>
      </div>

      {postList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px' }}>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Hiện tại chưa có bài viết mới. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {postList.map((post: any) => {
            const author = Array.isArray(post.author) ? post.author[0] : post.author;
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                  <div style={{ height: '200px', overflow: 'hidden', background: '#f1f5f9' }}>
                    <img
                      src={post.cover_url || '/images/hero-pc.jpg'}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {post.type === 'guide' ? 'Hướng dẫn' : post.type === 'review' ? 'Đánh giá' : 'Tin tức'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {author?.full_name && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} />
                          {author.full_name}
                        </span>
                      )}
                    </div>

                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: '1.4',
                      margin: '0 0 10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </h2>

                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      lineHeight: '1.6',
                      margin: '0 0 16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1
                    }}>
                      {post.excerpt}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      Đọc chi tiết <ArrowRight size={15} />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

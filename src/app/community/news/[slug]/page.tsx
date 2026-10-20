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
            fontFamily: "var(--font-primary), 'Inter', -apple-system, sans-serif",
          }}>
            {(() => {
              // Parse inline formatting (bold, code, italic)
              const renderInline = (text: string) => {
                const parts: React.ReactNode[] = [];
                // Regex for **bold**, `code`, *italic*
                const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
                let lastIndex = 0;
                let match;

                while ((match = regex.exec(text)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                  }
                  const token = match[0];
                  if (token.startsWith('**') && token.endsWith('**')) {
                    parts.push(
                      <strong key={match.index} style={{ fontWeight: 700, color: '#0f172a' }}>
                        {token.slice(2, -2)}
                      </strong>
                    );
                  } else if (token.startsWith('`') && token.endsWith('`')) {
                    parts.push(
                      <code key={match.index} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: '#2563eb', fontFamily: 'monospace' }}>
                        {token.slice(1, -1)}
                      </code>
                    );
                  } else if (token.startsWith('*') && token.endsWith('*')) {
                    parts.push(
                      <em key={match.index} style={{ fontStyle: 'italic', color: '#475569' }}>
                        {token.slice(1, -1)}
                      </em>
                    );
                  }
                  lastIndex = regex.lastIndex;
                }
                if (lastIndex < text.length) {
                  parts.push(text.substring(lastIndex));
                }
                return parts.length > 0 ? parts : text;
              };

              // Parse markdown line by line into structured elements
              const lines = post.content.split(/\r?\n/);
              const blocks: React.ReactNode[] = [];
              let i = 0;

              while (i < lines.length) {
                const line = lines[i].trim();

                if (!line) {
                  i++;
                  continue;
                }

                // 1. Heading 2 (##)
                if (line.startsWith('## ')) {
                  const headingText = line.replace(/^##\s*/, '');
                  blocks.push(
                    <h2 key={`h2-${i}`} style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '36px 0 16px',
                      lineHeight: '1.4',
                      fontFamily: "var(--font-primary)"
                    }}>
                      {renderInline(headingText)}
                    </h2>
                  );
                  i++;
                  continue;
                }

                // 2. Heading 3 (###)
                if (line.startsWith('### ')) {
                  const headingText = line.replace(/^###\s*/, '');
                  blocks.push(
                    <h3 key={`h3-${i}`} style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      margin: '26px 0 12px',
                      lineHeight: '1.4',
                      fontFamily: "var(--font-primary)"
                    }}>
                      {renderInline(headingText)}
                    </h3>
                  );
                  i++;
                  continue;
                }

                // 3. Horizontal divider
                if (line === '---' || line === '***') {
                  blocks.push(
                    <hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />
                  );
                  i++;
                  continue;
                }

                // 4. Blockquotes (> ...)
                if (line.startsWith('> ')) {
                  const quoteLines: string[] = [];
                  while (i < lines.length && lines[i].trim().startsWith('>')) {
                    quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
                    i++;
                  }
                  blocks.push(
                    <blockquote key={`quote-${i}`} style={{
                      margin: '20px 0',
                      padding: '14px 20px',
                      background: '#f8fafc',
                      borderLeft: '4px solid #3b82f6',
                      borderRadius: '0 10px 10px 0',
                      color: '#475569',
                      fontStyle: 'italic',
                      lineHeight: '1.8',
                      fontFamily: "var(--font-primary)"
                    }}>
                      {renderInline(quoteLines.join(' '))}
                    </blockquote>
                  );
                  continue;
                }

                // 5. Markdown Table Detection
                if (line.startsWith('|')) {
                  const tableLines: string[] = [];
                  while (i < lines.length && lines[i].trim().startsWith('|')) {
                    tableLines.push(lines[i].trim());
                    i++;
                  }
                  if (tableLines.length >= 2) {
                    const parseCells = (rowStr: string) => rowStr.split('|').slice(1, -1).map(c => c.trim());
                    const headerCells = parseCells(tableLines[0]);
                    const dataRows = tableLines.slice(1).filter(r => r.replace(/[\s|:-]/g, '').length > 0);

                    blocks.push(
                      <div key={`table-wrapper-${i}`} style={{
                        overflowX: 'auto',
                        margin: '24px 0 32px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '14px',
                          textAlign: 'left',
                          fontFamily: "var(--font-primary)"
                        }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                              {headerCells.map((th, thIdx) => (
                                <th key={thIdx} style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                                  {renderInline(th)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dataRows.map((row, rIdx) => {
                              const cells = parseCells(row);
                              return (
                                <tr key={rIdx} style={{
                                  background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                  borderBottom: rIdx === dataRows.length - 1 ? 'none' : '1px solid #e2e8f0',
                                }}>
                                  {cells.map((td, tdIdx) => (
                                    <td key={tdIdx} style={{ padding: '12px 16px', color: '#334155' }}>
                                      {renderInline(td)}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  continue;
                }

                // 6. Unordered Lists (- or *)
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  const items: string[] = [];
                  while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
                    items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
                    i++;
                  }
                  blocks.push(
                    <ul key={`ul-${i}`} style={{
                      paddingLeft: '22px',
                      margin: '14px 0 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {items.map((item, idx) => (
                        <li key={idx} style={{ color: '#334155', lineHeight: '1.8', fontFamily: "var(--font-primary)" }}>
                          {renderInline(item)}
                        </li>
                      ))}
                    </ul>
                  );
                  continue;
                }

                // 7. Ordered Lists (1. 2. 3.)
                if (/^\d+\.\s/.test(line)) {
                  const items: string[] = [];
                  while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                    items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
                    i++;
                  }
                  blocks.push(
                    <ol key={`ol-${i}`} style={{
                      paddingLeft: '24px',
                      margin: '14px 0 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {items.map((item, idx) => (
                        <li key={idx} style={{ color: '#334155', lineHeight: '1.8', fontFamily: "var(--font-primary)" }}>
                          {renderInline(item)}
                        </li>
                      ))}
                    </ol>
                  );
                  continue;
                }

                // 8. Regular paragraph
                const paraLines: string[] = [];
                while (
                  i < lines.length &&
                  lines[i].trim() &&
                  !lines[i].trim().startsWith('## ') &&
                  !lines[i].trim().startsWith('### ') &&
                  !lines[i].trim().startsWith('- ') &&
                  !lines[i].trim().startsWith('* ') &&
                  !/^\d+\.\s/.test(lines[i].trim()) &&
                  !lines[i].trim().startsWith('|') &&
                  !lines[i].trim().startsWith('> ') &&
                  lines[i].trim() !== '---' &&
                  lines[i].trim() !== '***'
                ) {
                  paraLines.push(lines[i].trim());
                  i++;
                }

                if (paraLines.length > 0) {
                  blocks.push(
                    <p key={`p-${i}`} style={{
                      margin: '0 0 18px',
                      color: '#334155',
                      lineHeight: '1.85',
                      fontFamily: "var(--font-primary)"
                    }}>
                      {renderInline(paraLines.join(' '))}
                    </p>
                  );
                }
              }

              return blocks;
            })()}
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

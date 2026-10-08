'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, Share2, Layers, ShoppingCart, Check, 
  Sparkles, ArrowLeft, MessageSquare, ShieldCheck, 
  Zap, AlertTriangle, AlertCircle, Bookmark, Copy, 
  ExternalLink, User, Send, CornerDownRight, Flag
} from 'lucide-react';
import { 
  CommunityBuild, CommunityComment,
  INITIAL_COMMUNITY_BUILDS,
  getStoredCommunityBuilds, getLikedBuildIds, toggleLikeBuildId,
  getSavedCommunityBuildIds, toggleSaveCommunityBuildId,
  getStoredComments, addCommunityComment
} from '@/data/community-data';
import { useCartStore, useAuthStore } from '@/lib/store';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [build, setBuild] = useState<CommunityBuild | null>(null);
  const [similarBuilds, setSimilarBuilds] = useState<CommunityBuild[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeResolution, setActiveResolution] = useState<'1080p' | '1440p' | '4k'>('1440p');

  const addMultipleItems = useCartStore(s => s.addMultipleItems);
  const openCart = useCartStore(s => s.openCart);
  const authUser = useAuthStore(s => s.user);

  useEffect(() => {
    const allBuilds = getStoredCommunityBuilds();
    const found = allBuilds.find(b => b.id === resolvedParams.id || b.slug === resolvedParams.id);
    
    if (found) {
      setBuild(found);
      setLikesCount(found.likes);
      setIsLiked(getLikedBuildIds().includes(found.id));
      setIsSaved(getSavedCommunityBuildIds().includes(found.id));
      setComments(getStoredComments(found.id));

      // Similar builds
      const similar = allBuilds
        .filter(b => b.id !== found.id && b.category === found.category)
        .slice(0, 3);
      setSimilarBuilds(similar.length > 0 ? similar : allBuilds.filter(b => b.id !== found.id).slice(0, 3));
    }
  }, [resolvedParams.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLike = () => {
    if (!build) return;
    const res = toggleLikeBuildId(build.id);
    setIsLiked(res.isLiked);
    setLikesCount(prev => prev + res.countDelta);
  };

  const handleSave = () => {
    if (!build) return;
    const saved = toggleSaveCommunityBuildId(build.id);
    setIsSaved(saved);
    showToast(saved ? 'Đã lưu cấu hình vào mục yêu thích!' : 'Đã bỏ lưu cấu hình.');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  const handleLoadInBuildPc = () => {
    if (!build) return;
    const preset = {
      title: build.title,
      budgetLabel: formatVND(build.price),
      components: {
        cpu: build.parts.cpu.name,
        gpu: build.parts.gpu.name,
        ram: build.parts.ram.name,
        mainboard: build.parts.mainboard?.name,
        storage: build.parts.ssd?.name,
        psu: build.parts.psu?.name,
        case: build.parts.case?.name,
        cooling: build.parts.cooler?.name,
      }
    };
    try {
      localStorage.setItem('pchub_pending_ai_preset', JSON.stringify(preset));
    } catch (e) {
      console.error('Error saving pending preset:', e);
    }
    router.push('/build-pc');
  };

  const handleAddAllToCart = () => {
    if (!build) return;
    const itemsToAdd = [
      { id: `part-cpu-${build.id}`, name: build.parts.cpu.name, price: build.parts.cpu.price, quantity: 1, image: build.parts.cpu.image || '/images/cpu-box.jpg', category: 'CPU' },
      { id: `part-gpu-${build.id}`, name: build.parts.gpu.name, price: build.parts.gpu.price, quantity: 1, image: build.parts.gpu.image || '/images/gpu-strix.jpg', category: 'GPU' },
      { id: `part-ram-${build.id}`, name: build.parts.ram.name, price: build.parts.ram.price, quantity: 1, image: build.parts.ram.image || '/images/ram-rgb.jpg', category: 'RAM' },
      ...(build.parts.mainboard ? [{ id: `part-mb-${build.id}`, name: build.parts.mainboard.name, price: build.parts.mainboard.price, quantity: 1, image: build.parts.mainboard.image || '/images/cat-mainboard.jpg', category: 'Mainboard' }] : []),
      ...(build.parts.ssd ? [{ id: `part-ssd-${build.id}`, name: build.parts.ssd.name, price: build.parts.ssd.price, quantity: 1, image: build.parts.ssd.image || '/images/ssd-nvme.jpg', category: 'SSD' }] : []),
      ...(build.parts.psu ? [{ id: `part-psu-${build.id}`, name: build.parts.psu.name, price: build.parts.psu.price, quantity: 1, image: build.parts.psu.image || '/images/cat-psu.jpg', category: 'PSU' }] : []),
      ...(build.parts.case ? [{ id: `part-case-${build.id}`, name: build.parts.case.name, price: build.parts.case.price, quantity: 1, image: build.parts.case.image || '/images/hero-pc.jpg', category: 'Case' }] : []),
      ...(build.parts.cooler ? [{ id: `part-cooler-${build.id}`, name: build.parts.cooler.name, price: build.parts.cooler.price, quantity: 1, image: build.parts.cooler.image || '/images/hero-pc.jpg', category: 'Cooler' }] : []),
    ];

    addMultipleItems(itemsToAdd);
    openCart();
    showToast(`🛒 Đã thêm trọn bộ ${itemsToAdd.length} linh kiện vào giỏ hàng!`);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !build) return;

    if (!authUser) {
      router.push(`/login?redirect=/community/builds/${build.id}`);
      return;
    }

    const newComment: CommunityComment = {
      id: `comm-${Date.now()}`,
      buildId: build.id,
      user: {
        name: authUser?.name || 'Thành viên PCHub',
        avatar: (authUser?.name || 'U').charAt(0).toUpperCase(),
        email: authUser?.email || '',
      },
      content: commentInput.trim(),
      createdAt: 'Vừa xong',
      likes: 0
    };

    addCommunityComment(newComment);
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
    showToast('Đã gửi bình luận của bạn!');
  };

  const handlePostReply = (parentId: string) => {
    if (!replyInput.trim() || !build) return;

    if (!authUser) {
      router.push(`/login?redirect=/community/builds/${build.id}`);
      return;
    }

    const newReply: CommunityComment = {
      id: `reply-${Date.now()}`,
      buildId: build.id,
      user: {
        name: authUser?.name || 'Thành viên PCHub',
        avatar: (authUser?.name || 'U').charAt(0).toUpperCase(),
      },
      content: replyInput.trim(),
      parentId: parentId,
      createdAt: 'Vừa xong',
      likes: 0
    };

    addCommunityComment(newReply);
    setComments(prev => [...prev, newReply]);
    setReplyToId(null);
    setReplyInput('');
    showToast('Đã gửi phản hồi!');
  };

  if (!build) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', minHeight: '60vh', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          Đang tải thông tin cấu hình...
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          Vui lòng đợi giây lát hoặc quay lại danh mục cộng đồng.
        </p>
        <Link 
          href="/community"
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
          <ArrowLeft size={16} /> Quay lại danh sách cấu hình
        </Link>
      </div>
    );
  }

  // Parts list helper
  const partsArray = [
    { key: 'CPU (Bộ vi xử lý)', part: build.parts.cpu },
    { key: 'VGA (Card đồ họa)', part: build.parts.gpu },
    { key: 'RAM (Bộ nhớ trong)', part: build.parts.ram },
    { key: 'Mainboard (Bo mạch)', part: build.parts.mainboard },
    { key: 'SSD (Ổ cứng lưu trữ)', part: build.parts.ssd },
    { key: 'PSU (Nguồn máy tính)', part: build.parts.psu },
    { key: 'Case (Vỏ thùng máy)', part: build.parts.case },
    { key: 'Cooling (Tản nhiệt)', part: build.parts.cooler },
  ].filter(p => !!p.part);

  // Parent & Nested comments
  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Toast Alert */}
        {toastMessage && (
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
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Check size={16} color="#22c55e" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/community" style={{ color: '#64748b', textDecoration: 'none' }}>Cộng đồng</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {build.title}
          </span>
        </nav>

        {/* TOP SECTION: Build Title & Action Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          marginBottom: '28px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* Title & Author */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.3px'
                }}>
                  {build.category}
                </span>

                {build.aiVerified && (
                  <span style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}>
                    <Sparkles size={13} />
                    AI Verified Tương Thích 100%
                  </span>
                )}

                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Đăng ngày {build.createdAt}
                </span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '14px', lineHeight: '1.25' }}>
                {build.title}
              </h1>

              {/* Author Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {build.author.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{build.author.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{build.author.role || 'Thành viên PCHub'}</div>
                </div>
              </div>
            </div>

            {/* Price & Primary CTA Buttons */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              minWidth: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>TỔNG GIÁ ƯỚC TÍNH</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb' }}>
                  {formatVND(build.price)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  <ShoppingCart size={17} />
                  Thêm tất cả vào giỏ hàng
                </button>

                <button
                  type="button"
                  onClick={handleLoadInBuildPc}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '11px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <Layers size={17} color="#2563eb" />
                  Mở trong Build PC để tùy biến
                </button>
              </div>

              {/* Like / Save / Share bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={handleLike}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isLiked ? '#ef4444' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#64748b'} />
                  {likesCount} Thích
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isSaved ? '#2563eb' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <Bookmark size={16} fill={isSaved ? '#2563eb' : 'none'} color={isSaved ? '#2563eb' : '#64748b'} />
                  {isSaved ? 'Đã lưu' : 'Lưu'}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={16} />
                  Chia sẻ
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 2-COLUMNS MAIN CONTENT AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
          
          {/* LEFT / MAIN COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Build Cover Photo & Story */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ height: '380px', position: 'relative', background: '#0f172a' }}>
                <img 
                  src={build.image} 
                  alt={build.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                  📖 Câu chuyện & Trải nghiệm của tác giả
                </h2>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                  {build.description}
                </p>

                {/* Tags */}
                {build.tags && build.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px' }}>
                    {build.tags.map(t => (
                      <span key={t} style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FULL COMPONENTS BREAKDOWN TABLE */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    🛠️ Bảng linh kiện chi tiết ({partsArray.length} món)
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Giá bán lẻ chính hãng niêm yết tại PCHub (Đã bao gồm VAT & Bảo hành 36 tháng)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShoppingCart size={14} /> Thêm tất cả vào giỏ
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>LINH KIỆN</th>
                      <th style={{ padding: '12px 16px' }}>TÊN SẢN PHẨM & THÔNG SỐ</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>GIÁ NIÊM YẾT</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>MUA LẺ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partsArray.map((row, idx) => (
                      <tr key={row.key} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#334155', whiteSpace: 'nowrap' }}>
                          {row.key}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.part.name}</div>
                          {row.part.specs && (
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{row.part.specs}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#2563eb', whiteSpace: 'nowrap' }}>
                          {formatVND(row.part.price)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <Link
                            href={`/search?q=${encodeURIComponent(row.part.name)}`}
                            title="Tìm sản phẩm trên PCHub"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              color: '#2563eb',
                              textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ background: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                      <td colSpan={2} style={{ padding: '16px', fontWeight: 900, color: '#1e3a8a', fontSize: '14.5px' }}>
                        TỔNG GIÁ TRỊ CẤU HÌNH:
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 900, color: '#2563eb', fontSize: '18px' }}>
                        {formatVND(build.price)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PERFORMANCE & BENCHMARK FPS BLOCK */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#eab308" />
                    Đánh giá hiệu năng thực tế (Benchmarks & FPS)
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Khung hình trung bình (Average FPS) đo kiểm thực tế trên các tựa game đình đám
                  </p>
                </div>

                {/* Resolution Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                  {(['1080p', '1440p', '4k'] as const).map(res => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setActiveResolution(res)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeResolution === res ? '#2563eb' : 'transparent',
                        color: activeResolution === res ? '#ffffff' : '#64748b',
                        transition: 'all 0.15s'
                      }}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {build.fpsBenchmarks.map(bm => {
                  const fpsValue = activeResolution === '1080p' ? bm.res1080p : activeResolution === '1440p' ? bm.res1440p : bm.res4k;
                  const percent = Math.min(100, Math.round((fpsValue / 300) * 100));

                  return (
                    <div key={bm.game}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{bm.game} ({bm.settings})</span>
                        <span style={{ fontWeight: 900, color: fpsValue >= 60 ? '#16a34a' : '#ea580c' }}>
                          {fpsValue} FPS
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: fpsValue >= 120 ? 'linear-gradient(90deg, #3b82f6, #10b981)' : fpsValue >= 60 ? '#2563eb' : '#f59e0b',
                          borderRadius: '9999px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Power Consumption Gauge */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>ĐIỆN TIÊU THỤ NGHỈ (IDLE)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                    ~{build.powerConsumption.idleWatt} Watts
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>TẢI NẶNG ĐỈNH (FULL LOAD)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
                    ~{build.powerConsumption.loadWatt} Watts
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>NGUỒN KHUYẾN NGHỊ (PSU)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                    {build.powerConsumption.recommendedPsuWatt}W Gold / Platinum
                  </div>
                </div>
              </div>
            </div>

            {/* AI COMPATIBILITY REPORT BLOCK */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Kiểm định tương thích phần cứng bởi AI
                </h2>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                fontSize: '13.5px',
                color: '#166534',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> {build.aiCompatibility.summary}
                </div>
              </div>

              {/* 4 Check Points Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a' }}>✓</span> Socket CPU & Bo Mạch
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{build.aiCompatibility.socketInfo}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a' }}>✓</span> Công Suất Bộ Nguồn (PSU)
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{build.aiCompatibility.psuInfo}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a' }}>✓</span> Không Gian Vỏ Case & Chiều Dài GPU
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{build.aiCompatibility.clearanceInfo}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a' }}>✓</span> Hiệu Suất Tản Nhiệt CPU
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{build.aiCompatibility.coolerInfo}</div>
                </div>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <MessageSquare size={20} color="#2563eb" />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Thảo luận & Bình luận ({comments.length})
                </h2>
              </div>

              {/* New Comment Input Box */}
              <form onSubmit={handlePostComment} style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {authUser?.name ? authUser.name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <textarea
                      rows={2}
                      placeholder={authUser ? "Viết bình luận, thắc mắc về cấu hình này..." : "Đăng nhập để tham gia bình luận cùng cộng đồng..."}
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '13.5px',
                        outline: 'none',
                        background: '#f8fafc',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        type="submit"
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={14} /> Gửi bình luận
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rootComments.length === 0 ? (
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
                  </p>
                ) : (
                  rootComments.map(c => {
                    const replies = comments.filter(r => r.parentId === c.id);

                    return (
                      <div key={c.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                        {/* Parent Comment */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {c.user.avatar}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>{c.user.name}</span>
                              <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{c.createdAt}</span>
                            </div>

                            <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 6px', lineHeight: '1.5' }}>
                              {c.content}
                            </p>

                            <button
                              type="button"
                              onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CornerDownRight size={12} /> Trả lời
                            </button>

                            {/* Reply Input Box */}
                            {replyToId === c.id && (
                              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder={`Trả lời ${c.user.name}...`}
                                  value={replyInput}
                                  onChange={e => setReplyInput(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #cbd5e1',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handlePostReply(c.id)}
                                  style={{
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 14px',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Gửi
                                </button>
                              </div>
                            )}

                            {/* Nested Replies (1 level) */}
                            {replies.length > 0 && (
                              <div style={{ marginTop: '12px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {replies.map(r => (
                                  <div key={r.id} style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: '#e2e8f0',
                                      color: '#1e293b',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {r.user.avatar}
                                    </div>
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{r.user.name}</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{r.createdAt}</span>
                                      </div>
                                      <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0', lineHeight: '1.45' }}>
                                        {r.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* SIMILAR BUILDS */}
            {similarBuilds.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
                  💡 Cấu hình tương tự trong danh mục {build.category}
                </h2>

                <div className="home-grid-3">
                  {similarBuilds.map(sb => (
                    <Link
                      key={sb.id}
                      href={`/community/builds/${sb.id}`}
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
                        <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                          <img src={sb.image} alt={sb.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            {sb.category}
                          </span>
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                            {sb.title}
                          </h3>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            {sb.parts.cpu.name.split('(')[0]} · {sb.parts.gpu.name.split('(')[0]}
                          </div>
                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#2563eb' }}>
                              {formatVND(sb.price)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>
                              Xem chi tiết →
                            </span>
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

      </div>
    </div>
  );
}

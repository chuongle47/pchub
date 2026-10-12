'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, MessageSquare, Mail, MapPin, Clock, 
  Send, CheckCircle2, ChevronRight, Sparkles, 
  Building2, ArrowRight, ShieldCheck, HelpCircle,
  ExternalLink, Loader2
} from 'lucide-react';
import { CONTACT_CONFIG, Showroom } from '@/lib/contactConfig';
import { useUIStore } from '@/lib/store';

export default function ContactPage() {
  const setChatOpen = useUIStore(s => s.setChatOpen);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom>(CONTACT_CONFIG.showrooms[0]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Tư vấn cấu hình PC & Báo giá',
    budget: '20 - 30 triệu',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setFormError('Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Nội dung tin nhắn.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          subject: `${formData.subject} (Ngân sách: ${formData.budget})`,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gửi tin nhắn không thành công.');
      }

      setSubmittedTicket(data.ticketId || `PCHUB-${Date.now().toString().slice(-6)}`);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Tư vấn cấu hình PC & Báo giá',
        budget: '20 - 30 triệu',
        message: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Đã xảy ra sự cố kết nối. Vui lòng thử lại hoặc gọi Hotline.');
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: 'PCHub có hỗ trợ tư vấn cấu hình PC online và giao hàng tận nơi không?',
      a: 'Có! PCHub hỗ trợ tư vấn 24/7 qua Hotline 0901 234 567, Zalo OA và Chatbot AI. Chúng tôi giao hàng hỏa tốc trong 2 giờ tại TP.HCM và Hà Nội, đồng thời giao hàng chống sốc toàn quốc.',
    },
    {
      q: 'Thời gian bảo hành và đổi trả linh kiện tại các Showroom như thế nào?',
      a: 'Mọi linh kiện chính hãng tại PCHub đều được bảo hành từ 36 đến 60 tháng. Đổi mới 100% trong 30 ngày đầu nếu phát sinh lỗi từ nhà sản xuất.',
    },
    {
      q: 'Tôi có thể mang linh kiện có sẵn đến cửa hàng để nhờ lắp ráp hoàn thiện không?',
      a: 'Hoàn toàn được! Đội ngũ kỹ thuật viên PCHub hỗ trợ kiểm tra tương thích, vệ sinh và lắp ráp hoàn chỉnh kèm dịch vụ đi dây gọn gàng, test stress nhiệt độ miễn phí khi mua kèm linh kiện tại cửa hàng.',
    },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Top Banner / Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
        color: '#ffffff',
        padding: '52px 20px 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Trang chủ</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Liên hệ & Showroom</span>
          </nav>

          <div style={{ maxWidth: '760px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#93c5fd',
              marginBottom: '16px'
            }}>
              <Sparkles size={14} color="#60a5fa" />
              <span>Hỗ trợ kỹ thuật & Tư vấn phần cứng 24/7</span>
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
              Liên hệ với PCHub Technology
            </h1>
            <p style={{ fontSize: '15.5px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Chúng tôi luôn sẵn sàng lắng nghe, tư vấn cấu hình tối ưu theo ngân sách và đồng hành cùng mọi trải nghiệm công nghệ của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1200px', margin: '-32px auto 0', padding: '0 20px 80px', position: 'relative', zIndex: 2 }}>
        
        {/* 1. Fast Action Buttons Cards (Extracted from WordPress Nút liên hệ nổi) */}
        <section aria-label="Các kênh liên hệ trực tiếp" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          marginBottom: '40px'
        }}>
          {/* Card 1: Gọi điện Hotline */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00c853 0%, #00a651 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 166, 81, 0.25)',
              }}>
                <Phone size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hotline Trực Tiếp
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px' }}>
                  0901 234 567
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Tư vấn kỹ thuật & báo giá hỏa tốc
                </p>
              </div>
            </div>
            <a
              href="tel:0901234567"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#00a651',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '11px 16px',
                borderRadius: '10px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Phone size={16} />
              <span>Gọi ngay bây giờ</span>
            </a>
          </div>

          {/* Card 2: Chat Zalo */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0084ff 0%, #0068ff 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 104, 255, 0.25)',
                fontWeight: 900,
                fontSize: '15px'
              }}>
                Zalo
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#0068ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Zalo OA Chính Thức
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px' }}>
                  0901 234 567
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Chat gửi ảnh linh kiện, cấu hình PC
                </p>
              </div>
            </div>
            <a
              href="https://zalo.me/0901234567"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#0068ff',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '11px 16px',
                borderRadius: '10px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <ExternalLink size={16} />
              <span>Mở Chat Zalo</span>
            </a>
          </div>

          {/* Card 3: Facebook Messenger */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00b2fe 0%, #0084ff 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 132, 255, 0.25)',
              }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Facebook Fanpage
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px' }}>
                  @pchub
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Nhận tin nhắn cộng đồng & bảo hành
                </p>
              </div>
            </div>
            <a
              href="https://m.me/pchub"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#0084ff',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '11px 16px',
                borderRadius: '10px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <ExternalLink size={16} />
              <span>Chat Messenger</span>
            </a>
          </div>

          {/* Card 4: AI Advisor Assistant */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '16px',
            border: '1px solid #bfdbfe',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Trí Tuệ Nhân Tạo
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', margin: '2px 0 4px' }}>
                  PCHub AI Advisor
                </h3>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                  Tự động kiểm tra TDP & tương thích CPU-VGA
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '11px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Sparkles size={16} />
              <span>Mở AI Advisor ngay</span>
            </button>
          </div>
        </section>

        {/* 2. Form & Showroom Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          marginBottom: '50px'
        }}>
          
          {/* Left Column: Interactive Contact Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px'
              }}>
                <Send size={14} />
                <span>Gửi Tin Nhắn / Yêu Cầu Báo Giá</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Để lại thông tin hỗ trợ
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Chuyên viên PCHub sẽ phản hồi và gửi bảng báo giá tối ưu qua Zalo / Số điện thoại trong 15-30 phút.
              </p>
            </div>

            {submittedTicket ? (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <CheckCircle2 size={30} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>
                  Gửi yêu cầu thành công!
                </h3>
                <p style={{ fontSize: '13.5px', color: '#15803d', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Mã tiếp nhận: <strong>{submittedTicket}</strong>.<br />
                  Chuyên viên sẽ liên hệ lại qua số điện thoại để hỗ trợ bạn ngay lập tức.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Gửi thêm yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    color: '#dc2626',
                    fontWeight: 600
                  }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                      onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Số điện thoại / Zalo *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0901 234 567"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                      onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Email nhận báo giá
                    </label>
                    <input
                      type="email"
                      placeholder="tenban@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                      onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Chủ đề hỗ trợ
                    </label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Tư vấn cấu hình PC & Báo giá">Tư vấn cấu hình PC & Báo giá</option>
                      <option value="Kiểm tra tương thích linh kiện">Kiểm tra tương thích linh kiện</option>
                      <option value="Hỗ trợ kỹ thuật & Bảo hành">Hỗ trợ kỹ thuật & Bảo hành</option>
                      <option value="Tra cứu tiến độ đơn hàng">Tra cứu tiến độ đơn hàng</option>
                      <option value="Đặt hàng doanh nghiệp & Net quán">Đặt hàng doanh nghiệp / Net quán</option>
                      <option value="Khác">Chủ đề khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Dự trù ngân sách dự kiến
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Dưới 15 triệu', '15 - 25 triệu', '25 - 40 triệu', 'Trên 40 triệu', 'Linh kiện lẻ'].map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormData({ ...formData, budget: b })}
                        style={{
                          border: formData.budget === b ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: formData.budget === b ? '#eff6ff' : '#ffffff',
                          color: formData.budget === b ? '#1d4ed8' : '#475569',
                          fontWeight: formData.budget === b ? 700 : 500,
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Nội dung chi tiết yêu cầu *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả nhu cầu sử dụng (chơi game gì, làm đồ họa hay văn phòng), các linh kiện mong muốn hoặc yêu cầu khác..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #0055d4 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px 20px',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 85, 212, 0.3)',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Gửi yêu cầu tư vấn ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Showroom System & Location Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hệ Thống Trải Nghiệm
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                    Showroom PCHub toàn quốc
                  </h2>
                </div>
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  {CONTACT_CONFIG.showrooms.length} Cửa hàng
                </div>
              </div>

              {/* Showroom selector tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
                {CONTACT_CONFIG.showrooms.map(sr => (
                  <button
                    key={sr.id}
                    type="button"
                    onClick={() => setSelectedShowroom(sr)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: selectedShowroom.id === sr.id ? 700 : 500,
                      background: selectedShowroom.id === sr.id ? '#2563eb' : '#f8fafc',
                      color: selectedShowroom.id === sr.id ? '#ffffff' : '#475569',
                      border: selectedShowroom.id === sr.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    {sr.city} - {sr.name.split('Showroom ')[1] || sr.name}
                  </button>
                ))}
              </div>

              {/* Active Showroom Details Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedShowroom.name}
                  </h4>
                  {selectedShowroom.isHeadquarter && (
                    <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      Trụ sở chính
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569' }}>
                    <MapPin size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedShowroom.address}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
                    <Phone size={16} color="#00a651" style={{ flexShrink: 0 }} />
                    <span>Hotline: <strong style={{ color: '#0f172a' }}>{selectedShowroom.phone}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
                    <Clock size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span>Mở cửa: {selectedShowroom.hours}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <a
                    href={`tel:${selectedShowroom.phone.replace(/\s+/g, '')}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#00a651',
                      color: '#fff',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} />
                    <span>Gọi cửa hàng</span>
                  </a>

                  <a
                    href={selectedShowroom.directionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <MapPin size={14} />
                    <span>Chỉ đường Maps</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed Frame */}
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                height: '240px',
                position: 'relative'
              }}>
                <iframe
                  title={`Bản đồ ${selectedShowroom.name}`}
                  src={selectedShowroom.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Frequently Asked Questions (FAQ) Section */}
        <section style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              <HelpCircle size={15} />
              <span>Giải Đáp Thắc Mắc</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Câu hỏi thường gặp về hỗ trợ khách hàng
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Một số thông tin hữu ích giúp bạn giải quyết thắc mắc nhanh chóng nhất
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '860px', margin: '0 auto' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: isOpen ? '#f8fafc' : '#ffffff',
                    transition: 'all 0.2s',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                      color: '#2563eb',
                      fontWeight: 900
                    }}>
                      →
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link
              href="/support"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563eb',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Xem đầy đủ chính sách bảo hành & đổi trả chi tiết</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

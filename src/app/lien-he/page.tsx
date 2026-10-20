'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Phone, MessageSquare, Mail, MapPin, Clock, 
  Send, CheckCircle2, ChevronRight, Sparkles, 
  Building2, ArrowRight, ShieldCheck, HelpCircle,
  ExternalLink, Loader2
} from 'lucide-react';
import { CONTACT_CONFIG, Showroom, ContactButton } from '@/lib/contactConfig';
import { useUIStore } from '@/lib/store';

function ZaloIcon({ size = 26 }: { size?: number }) {
  const zaloPath =
    'M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9453-1.0753 0-1.945.8706-1.945 1.9453 0 1.0746.8697 1.9453 1.945 1.9453z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <path
        d="M18 4C9.716 4 3 10.18 3 17.8c0 4.15 1.98 7.88 5.12 10.45l-1.32 3.86a.8.8 0 0 0 1.03.99l5.02-2.12c1.6.53 3.33.82 5.15.82 8.284 0 15-6.18 15-13.8S26.284 4 18 4z"
        fill="#ffffff"
      />
      <g transform="translate(6, 5.8)">
        <path d={zaloPath} fill="#0068ff" />
      </g>
    </svg>
  );
}

export default function ContactPage() {
  const setChatOpen = useUIStore(s => s.setChatOpen);
  const [config, setConfig] = useState(CONTACT_CONFIG);
  const [buttons, setButtons] = useState<ContactButton[]>(
    CONTACT_CONFIG.buttons.filter(b => b.enabled && b.value && b.value.trim().length > 0)
  );

  // Dynamic fetch to sync with WordPress / server changes in real time
  useEffect(() => {
    const fetchLatest = () => {
      fetch('/api/contact-buttons?t=' + Date.now())
        .then(r => r.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.buttons)) {
            setButtons(data.buttons);
            if (data.hotline) setConfig(c => ({ ...c, hotline: data.hotline, hotlineDisplay: data.hotlineDisplay || data.hotline }));
            if (data.zalo) setConfig(c => ({ ...c, zalo: data.zalo }));
            if (data.address) setConfig(c => ({ ...c, address: data.address }));
          }
        })
        .catch(() => {});
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const phoneButton = buttons.find(b => b.type === 'phone') || {
    label: 'Call now',
    value: config.hotline,
    href: `tel:${config.hotline}`,
    color: '#00a651'
  };

  const zaloButton = buttons.find(b => b.type === 'zalo') || {
    label: 'Chat Zalo',
    value: config.zalo,
    href: `https://zalo.me/${config.zalo}`,
    color: '#0068ff'
  };

  const messengerButton = buttons.find(b => b.type === 'messenger' && b.value);

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
      setFormError(err.message || `Đã xảy ra sự cố. Vui lòng liên hệ Hotline: ${config.hotline}`);
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: 'PCHub có hỗ trợ tư vấn cấu hình PC online và giao hàng tận nơi không?',
      a: `Có! PCHub hỗ trợ tư vấn 24/7 qua Hotline ${config.hotlineDisplay}, Zalo ${config.zalo} và Chatbot AI. Chúng tôi giao hàng hỏa tốc trong 2 giờ và đóng gói chuyên dụng chống sốc trên toàn quốc.`,
    },
    {
      q: 'Thời gian bảo hành và đổi trả linh kiện tại Showroom như thế nào?',
      a: 'Mọi linh kiện chính hãng tại PCHub đều được bảo hành từ 36 đến 60 tháng. Đổi mới 100% trong 30 ngày đầu nếu phát sinh lỗi từ nhà sản xuất.',
    },
    {
      q: 'Tôi có thể mang linh kiện có sẵn đến cửa hàng để nhờ lắp ráp hoàn thiện không?',
      a: `Hoàn toàn được! Đội ngũ kỹ thuật viên PCHub tại địa chỉ ${config.address} luôn sẵn sàng hỗ trợ kiểm tra tương thích, vệ sinh và lắp ráp hoàn chỉnh kèm dịch vụ đi dây gọn gàng, test stress nhiệt độ miễn phí.`,
    },
  ];

  const showroom = config.showrooms[0];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Top Banner / Hero Header (High Contrast Crisp White Text) */}
      <section style={{
        background: 'linear-gradient(135deg, #091e42 0%, #0c367b 45%, #1d4ed8 100%)',
        color: '#ffffff',
        padding: '56px 20px 68px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.25)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#bfdbfe', marginBottom: '20px' }}>
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Trang chủ</Link>
            <ChevronRight size={14} color="#93c5fd" />
            <span style={{ color: '#67e8f9', fontWeight: 700 }}>Liên hệ & Showroom</span>
          </nav>

          <div style={{ maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Sparkles size={15} color="#38bdf8" />
              <span>Hỗ trợ kỹ thuật & Tư vấn phần cứng 24/7</span>
            </div>

            {/* Title with forced pure white and crisp contrast */}
            <h1 style={{
              fontSize: 'clamp(30px, 4.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: '16px',
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
              letterSpacing: '-0.5px'
            }}>
              Liên hệ với PCHub Technology
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#f1f5f9',
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 500,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Chúng tôi luôn sẵn sàng lắng nghe, tư vấn cấu hình tối ưu theo ngân sách và đồng hành cùng mọi trải nghiệm công nghệ của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1200px', margin: '-32px auto 0', padding: '0 20px 80px', position: 'relative', zIndex: 2 }}>
        
        {/* 1. Fast Action Buttons Cards (Synced from WordPress) */}
        {/* 1. Fast Action Buttons Cards (Synced from WordPress) */}
        <section aria-label="Các kênh liên hệ trực tiếp" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {buttons.map((btn) => {
            const isPhone = btn.type === 'phone';
            const isZalo = btn.type === 'zalo';
            const isMessenger = btn.type === 'messenger';
            const btnColor = btn.color || (isPhone ? '#00c853' : isMessenger ? '#0084ff' : '#0068ff');
            
            return (
              <div key={btn.id || btn.type} style={{
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
                    background: btnColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${btnColor}40`,
                    fontWeight: 900,
                    fontSize: '15px'
                  }}>
                    {isPhone && <Phone size={24} />}
                    {isZalo && <ZaloIcon size={26} />}
                    {isMessenger && <MessageSquare size={24} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: btnColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isPhone && 'Hotline Trực Tiếp'}
                      {isMessenger && 'Facebook Messenger'}
                      {isZalo && 'Zalo Tư Vấn Trực Tiếp'}
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '2px 0 4px' }}>
                      {isMessenger ? (btn.value.startsWith('@') ? btn.value : `@${btn.value}`) : btn.value}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                      {isPhone && 'Tư vấn kỹ thuật & báo giá hỏa tốc'}
                      {isMessenger && 'Hỗ trợ kỹ thuật & giải đáp 24/7'}
                      {isZalo && 'Chat gửi ảnh linh kiện, cấu hình PC'}
                    </p>
                  </div>
                </div>
                <a
                  href={btn.href}
                  target={btn.openNewTab ? '_blank' : '_self'}
                  rel={btn.openNewTab ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: btnColor,
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {isPhone && <Phone size={16} />}
                  {isZalo && <ExternalLink size={16} />}
                  {isMessenger && <MessageSquare size={16} />}
                  <span>{btn.label}</span>
                </a>
              </div>
            );
          })}

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
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a', margin: '2px 0 4px' }}>
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
                fontSize: '14px',
                padding: '12px 16px',
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
                {/* Banner chuyển sang trang Báo Giá riêng */}
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1.5px solid #93c5fd',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#2563eb" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                      Cần tính toán dự toán & báo giá cấu hình PC chi tiết?
                    </span>
                  </div>
                  <Link
                    href="/bao-gia"
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Trang Báo Giá PC Riêng →</span>
                  </Link>
                </div>

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
                  <span>Gửi Tin Nhắn / Hỗ Trợ Kỹ Thuật</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Để lại thông tin hỗ trợ
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Chuyên viên PCHub sẽ phản hồi và hỗ trợ giải đáp thắc mắc qua Zalo / Số điện thoại trong 15-30 phút.
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
                      placeholder="0322 323 233"
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

          {/* Right Column: Single Official Store Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}>
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Địa Chỉ Trực Tiếp
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  Showroom & Trụ Sở PCHub
                </h2>
              </div>

              {/* Showroom Details Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {showroom.name}
                  </h4>
                  <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    Trụ sở chính
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#334155' }}>
                    <MapPin size={18} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{config.address}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                    <Phone size={17} color="#00a651" style={{ flexShrink: 0 }} />
                    <span>Hotline: <strong style={{ color: '#0f172a' }}>{phoneButton.value}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                    <Mail size={17} color="#0284c7" style={{ flexShrink: 0 }} />
                    <span>Email: <strong style={{ color: '#0f172a' }}>{config.email}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                    <Clock size={17} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span>Mở cửa: <strong>{config.workingHours}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <a
                    href={`tel:${phoneButton.value.replace(/\s+/g, '')}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#00a651',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={15} />
                    <span>Gọi cửa hàng</span>
                  </a>

                  <a
                    href={showroom.directionUrl}
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
                      border: '1.5px solid #bfdbfe',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <MapPin size={15} />
                    <span>Chỉ đường Maps</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed Frame */}
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                height: '250px',
                position: 'relative'
              }}>
                <iframe
                  title={`Bản đồ ${config.address}`}
                  src={showroom.mapEmbedUrl}
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

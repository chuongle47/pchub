'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8' }}>

      {/* MAIN FOOTER — 4 columns */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>

          {/* COL 1 — About + Contact */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>PCHub</span>
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Linh kiện chính hãng</p>
            </div>
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '20px',
            }}>
              Chuyên cung cấp linh kiện máy tính chính hãng.
              AI tư vấn tương thích 24/7. Bảo hành 36 tháng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: MapPin, text: '123 Nguyễn Trãi, Q.1, TP.HCM' },
                { icon: Phone, text: '1900-6789 (8:00–22:00)' },
                { icon: Mail, text: 'support@pchub.vn' },
                { icon: Clock, text: 'Mở cửa 7 ngày | 8:00–20:00' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                  <Icon size={13} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#64748b' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2 — Store Locations */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '16px', fontSize: '14px' }}>Cửa hàng PCHub</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'TP.HCM — 123 Nguyễn Trãi, Q.1',
                'TP.HCM — 456 Lê Văn Việt, Q.9',
                'Hà Nội — 789 Cầu Giấy',
                'Đà Nẵng — 321 Nguyễn Văn Linh',
                'Cần Thơ — 654 Trần Hưng Đạo',
              ].map(loc => (
                <li key={loc}>
                  <Link href="#" style={{
                    color: '#64748b',
                    fontSize: '12px',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >• {loc}</Link>
                </li>
              ))}
              <li>
                <Link href="/support" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                  Xem tất cả →
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3 — Information */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '16px', fontSize: '14px' }}>Thông tin</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Về PCHub', href: '/support' },
                { label: 'Liên hệ', href: '/support' },
                { label: 'Chính sách bảo hành', href: '/support' },
                { label: 'Chính sách đổi trả', href: '/support' },
                { label: 'Hướng dẫn mua hàng', href: '/support' },
                { label: 'Blog & Hướng dẫn', href: '/community' },
                { label: 'Cộng đồng PC', href: '/community' },
              ].map(link => (
                <li key={link.href + link.label}>
                  <Link href={link.href} style={{
                    color: '#64748b', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Product Categories */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '16px', fontSize: '14px' }}>Danh mục sản phẩm</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'CPU — Bộ xử lý', href: '/search?category=cpu' },
                { label: 'GPU — Card đồ họa', href: '/search?category=gpu' },
                { label: 'RAM — Bộ nhớ', href: '/search?category=ram' },
                { label: 'SSD & Storage', href: '/search?category=ssd' },
                { label: 'Mainboard', href: '/search?category=mainboard' },
                { label: 'PSU — Nguồn', href: '/search?category=psu' },
                { label: '🖥️ PC Builder', href: '/build-pc' },
                { label: '👥 Cộng đồng', href: '/community' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    color: '#64748b', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NEWSLETTER BAR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '3px' }}>Đăng ký nhận tin</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Giảm ngay 10% đơn đầu tiên + tin tức công nghệ mỗi tuần</p>
          </div>
          <form style={{ display: 'flex', gap: '8px', minWidth: '360px' }} onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email của bạn..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '9px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button type="submit" style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>Đăng ký</button>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {/* Payment icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { name: 'VNPay', bg: '#1a56db' },
              { name: 'MoMo', bg: '#ae2070' },
              { name: 'ZaloPay', bg: '#007dff' },
              { name: 'Visa', bg: '#1a1f71' },
              { name: 'MC', bg: '#eb001b' },
              { name: 'COD', bg: '#16a34a' },
            ].map(p => (
              <div key={p.name} style={{
                background: p.bg,
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.3px',
                opacity: 0.75,
              }}>{p.name}</div>
            ))}
          </div>

          <p style={{ fontSize: '11px', color: '#475569' }}>
            PCHub © 2026. All Rights Reserved. Tác giả: Lê Văn Chương
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { label: 'f', name: 'Facebook', href: 'https://facebook.com/pchub' },
              { label: '▶', name: 'YouTube', href: 'https://youtube.com/pchub' },
              { label: '◎', name: 'Instagram', href: 'https://instagram.com/pchub' },
            ].map(({ label, name, href }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              aria-label={name}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1 }}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

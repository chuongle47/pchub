'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: '#94a3b8' }}>

      {/* MAIN FOOTER — 4 columns */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div className="responsive-footer-grid">

          {/* COL 1 — About + Contact */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>PCHub</span>
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Linh kiện PC chính hãng</p>
            </div>
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '20px',
            }}>
              Chuyên cung cấp linh kiện máy tính chính hãng 100%.
              Tư vấn AI tương thích 24/7. Bảo hành 36 tháng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: MapPin, text: 'Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh' },
                { icon: Phone, text: '0322 323 233 (Hotline 8:00 – 21:30 hàng ngày)' },
                { icon: Mail, text: 'support@pchub.vn' },
                { icon: Clock, text: 'Mở cửa: 8:00 – 21:30 (Thứ 2 – Chủ nhật)' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                  <Icon size={13} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#64748b' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2 — Store Location */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '16px', fontSize: '14px' }}>Trụ sở & Showroom PCHub</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <div style={{ fontSize: '12.5px', color: '#e2e8f0', fontWeight: 600 }}>Showroom & Trung Tâm Kỹ Thuật</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.5 }}>
                  Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh
                </div>
              </li>
              <li>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  📞 Hotline: <a href="tel:0322323233" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>0322 323 233</a>
                </div>
              </li>
              <li>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  💬 Zalo: <a href="https://zalo.me/0333333333" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>0333 333 333</a>
                </div>
              </li>
              <li>
                <Link href="/lien-he" aria-label="Xem bản đồ và chỉ đường đến PCHub" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  Xem bản đồ & hướng dẫn đường đi <ArrowRight size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3 — Information */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '16px', fontSize: '14px' }}>Thông tin & Hỗ trợ</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Về PCHub', href: '/support#ve-pchub' },
                { label: 'Liên hệ hỗ trợ', href: '/lien-he' },
                { label: 'Chính sách bảo hành', href: '/support#chinh-sach-bao-hanh' },
                { label: 'Chính sách đổi trả', href: '/support#chinh-sach-doi-tra' },
                { label: 'Hướng dẫn mua hàng', href: '/support#huong-dan-mua-hang' },
                { label: 'Blog & Hướng dẫn', href: '/community?tab=news' },
                { label: 'Cộng đồng PC', href: '/community?tab=builds' },
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
                { label: 'CPU – Bộ vi xử lý', href: '/search?category=cpu' },
                { label: 'GPU – Card đồ họa', href: '/search?category=gpu' },
                { label: 'RAM – Bộ nhớ trong', href: '/search?category=ram' },
                { label: 'SSD & Ổ cứng', href: '/search?category=ssd' },
                { label: 'Mainboard – Bo mạch chủ', href: '/search?category=mainboard' },
                { label: 'PSU – Nguồn máy tính', href: '/search?category=psu' },
                { label: '🖥️ Build PC', href: '/build-pc' },
                { label: '👥 Cộng đồng PC', href: '/community?tab=builds' },
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
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '3px' }}>Đăng ký nhận thông tin ưu đãi</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Nhận voucher giảm 10% cho đơn hàng đầu tiên và tin tức công nghệ</p>
          </div>
          <form style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '380px' }} onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              aria-label="Địa chỉ email nhận tin"
              style={{
                flex: 1,
                minWidth: 0,
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
              background: 'var(--color-primary)',
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
            © 2026 PCHub. Bản quyền thuộc về PCHub. Hệ thống phân phối linh kiện PC chính hãng & Build PC bằng AI.
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
                e.currentTarget.style.background = 'var(--color-primary)';
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

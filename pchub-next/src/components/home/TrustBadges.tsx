'use client';

import React from 'react';

const BADGES = [
  {
    icon: '🚚',
    title: 'Giao hàng toàn quốc',
    desc: 'Giao nhanh 2-4 giờ nội thành',
    color: '#2563eb',
  },
  {
    icon: '✅',
    title: 'Hàng chính hãng 100%',
    desc: 'Bảo hành hãng 36 tháng',
    color: '#16a34a',
  },
  {
    icon: '🤖',
    title: 'AI tư vấn 24/7',
    desc: 'Kiểm tra tương thích miễn phí',
    color: '#7c3aed',
  },
  {
    icon: '🔄',
    title: 'Đổi trả 7 ngày',
    desc: 'Không cần lý do, dễ dàng',
    color: '#ea580c',
  },
  {
    icon: '💳',
    title: 'Thanh toán đa dạng',
    desc: 'VNPay · MoMo · ZaloPay · COD',
    color: '#0891b2',
  },
];

export default function TrustBadges() {
  return (
    <section style={{
      background: '#fff',
      borderBottom: '1px solid #f1f5f9',
      padding: '0',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
      }}>
        {BADGES.map((b, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 16px',
            borderRight: i < 4 ? '1px solid #f1f5f9' : 'none',
            transition: 'background 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              fontSize: '28px',
              flexShrink: 0,
              lineHeight: 1,
            }}>{b.icon}</span>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '2px',
              }}>{b.title}</div>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                lineHeight: '1.4',
              }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

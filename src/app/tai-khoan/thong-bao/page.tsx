'use client';

import { Bell, Package, Tag, ShieldCheck } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Đơn hàng đang giao',
    message: 'Đơn hàng ORD-20260820-0089 đã được bàn giao cho đơn vị vận chuyển GHN và đang trên đường đến bạn.',
    time: '10 phút trước',
    unread: true,
    icon: Package,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 2,
    title: 'Ưu đãi mã giảm giá mới',
    message: 'Sản phẩm ASUS ROG Strix RTX 4070 Ti Super đang có ưu đãi giảm giá 5%. Áp dụng mã PCHUB10.',
    time: '2 giờ trước',
    unread: false,
    icon: Tag,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fef3c7',
  },
  {
    id: 3,
    title: 'Tiếp nhận yêu cầu bảo hành',
    message: 'Yêu cầu bảo hành mã WC-2026-0809 đã được kỹ thuật viên tiếp nhận và đang tiến hành kiểm tra.',
    time: 'Hôm qua',
    unread: false,
    icon: ShieldCheck,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#d1fae5',
  },
];

export default function NotificationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thông báo của tôi</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Cập nhật tin tức đơn hàng, bảo hành và khuyến mãi mới nhất</p>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 800,
          color: '#2563eb',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '4px 14px',
          borderRadius: '20px',
        }}>
          3 thông báo
        </span>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        {NOTIFICATIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                background: item.unread ? '#f8fafc' : '#ffffff',
                borderBottom: idx < NOTIFICATIONS.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: item.bg,
                border: `1px solid ${item.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={item.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.title}
                    {item.unread && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                    )}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{item.time}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0', lineHeight: '1.5' }}>{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
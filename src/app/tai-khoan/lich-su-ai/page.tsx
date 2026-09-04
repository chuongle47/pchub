'use client';

import Link from 'next/link';
import { Bot, Sparkles, Calendar, ArrowRight } from 'lucide-react';

const AI_HISTORY = [
  {
    title: 'Build PC Gaming 30 triệu',
    desc: 'AI Advisor đã phân tích & đề xuất 8 linh kiện tương thích tối ưu hiệu năng 4K Ultra.',
    date: '20/08/2026',
    score: '9.8/10',
    type: 'Cấu hình PC',
  },
  {
    title: 'Chọn PSU cho RTX 4070 Ti Super',
    desc: 'Khuyến nghị nguồn 750W 80 Plus Gold chuẩn PCIe Gen 5 12VHPWR.',
    date: '18/08/2026',
    score: '9.9/10',
    type: 'Tương thích linh kiện',
  },
  {
    title: 'Tư vấn nâng cấp RAM bo mạch B650',
    desc: 'Mainboard hiện hỗ trợ tối đa 64GB DDR5 Dual Channel bus 6000MHz.',
    date: '12/08/2026',
    score: '9.5/10',
    type: 'Tư vấn kỹ thuật',
  },
];

export default function AIHistoryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Lịch sử AI Chat & Tư vấn</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Xem lại các đoạn hội thoại tư vấn và phân tích từ AI Advisor</p>
        </div>
        <Link
          href="/kiem-tra-tuong-thich"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={16} /> Hỏi AI Advisor mới
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {AI_HISTORY.map((item) => (
          <div
            key={item.title}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
              }}>
                <Bot size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.title}</h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '2px 10px',
                    borderRadius: '20px',
                  }}>
                    {item.type}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8', paddingTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {item.date}</span>
                  <span>✨ Điểm tương thích AI: <strong style={{ color: '#059669' }}>{item.score}</strong></span>
                </div>
              </div>
            </div>

            <Link
              href="/kiem-tra-tuong-thich"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: '#f8fafc',
                color: '#2563eb',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Xem chi tiết <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
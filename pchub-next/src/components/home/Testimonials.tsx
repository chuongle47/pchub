'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'PCHub có AI tư vấn cực kỳ thông minh! Mình chỉ nói budget 25tr, AI gợi ý ngay cấu hình gaming chuẩn không cần chỉnh. Mua xong hài lòng 100%.',
    name: 'Nguyễn Văn Bình',
    role: 'Gamer — TP.HCM',
    rating: 5,
    productBought: 'RTX 4070 Ti Super',
  },
  {
    id: 2,
    quote: 'Hàng chính hãng, đóng gói cẩn thận, giao GHN cực nhanh. i9-14900K về trong ngày. PCHub là địa chỉ uy tín nhất mình từng mua linh kiện.',
    name: 'Trần Thị Mai',
    role: 'Kỹ sư phần mềm — Hà Nội',
    rating: 5,
    productBought: 'Intel Core i9-14900K',
  },
  {
    id: 3,
    quote: 'Công cụ PC Builder quá tiện! Chọn linh kiện xong AI báo ngay PSU 750W không đủ cho RTX 4090. Tư vấn kịp thời, saved mình khỏi lỗi đắt tiền.',
    name: 'Lê Minh Tuấn',
    role: 'Content Creator — Đà Nẵng',
    rating: 5,
    productBought: 'RTX 4090 ASUS ROG',
  },
  {
    id: 4,
    quote: 'Bảo hành 36 tháng không lo. RTX 4070 Ti bị artifact sau 8 tháng, PCHub đổi card mới trong 5 ngày không hỏi nhiều. Dịch vụ hậu mãi tốt nhất.',
    name: 'Hoàng Văn Cường',
    role: 'Streamer — TP.HCM',
    rating: 5,
    productBought: 'RTX 4070 Ti ASUS',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#e2e8f0', fontSize: '16px' }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(1, c + 1));

  return (
    <section style={{ background: '#f8fafc', padding: '40px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 900,
          textAlign: 'center',
          color: '#0f172a',
          marginBottom: '28px',
        }}>⭐ Khách hàng nói gì về PCHub</h2>

        <div style={{ position: 'relative', overflow: 'hidden', padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            transform: `translateX(calc(-${current * 50}% - ${current * 10}px))`,
            transition: 'transform 0.4s ease',
          }}>
            {TESTIMONIALS.map(t => (
              <div key={t.id} style={{
                flexShrink: 0,
                width: 'calc(50% - 10px)',
                background: '#fff',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                {/* Big quote mark */}
                <span style={{
                  fontSize: '72px',
                  color: '#f1f5f9',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1',
                  display: 'block',
                  marginBottom: '-16px',
                }}>"</span>

                <StarRating rating={t.rating} />

                <p style={{
                  color: '#475569',
                  fontSize: '14px',
                  lineHeight: '1.75',
                  fontStyle: 'italic',
                  marginBottom: '20px',
                }}>"{t.quote}"</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#fff',
                    fontWeight: 800,
                    flexShrink: 0,
                    border: '2px solid #eff6ff',
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '2px' }}>{t.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.role}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8' }}>
                    Mua: {t.productBought}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            disabled={current === 0}
            style={{
              position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)',
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#fff', border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: current === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: current === 0 ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronLeft size={18} color="#64748b" />
          </button>

          <button
            onClick={next}
            disabled={current === 1}
            style={{
              position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)',
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#fff', border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: current === 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: current === 1 ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronRight size={18} color="#64748b" />
          </button>
        </div>

        {/* Dot nav */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {[0, 1].map(i => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === current ? '#2563eb' : '#e2e8f0',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

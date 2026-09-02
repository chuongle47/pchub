'use client';

import React from 'react';
import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section style={{ background: '#f8fafc', padding: '24px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          minHeight: '200px',
          background: 'linear-gradient(135deg, #0F1929 0%, #1e1b4b 50%, #4c1d95 100%)',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-80px', right: '33%',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(139,92,246,0.1)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', right: '25%',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)', pointerEvents: 'none',
          }} />

          {/* Left text */}
          <div style={{ position: 'relative', zIndex: 10, padding: '40px 48px', flex: 1 }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '2px',
              color: '#a78bfa',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>🤖 AI POWERED — MIỄN PHÍ</span>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#fff',
              lineHeight: '1.2',
              margin: '0 0 4px',
            }}>Build PC Gaming</h2>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 900,
              lineHeight: '1.2',
              margin: '0 0 12px',
              background: 'linear-gradient(to right, #a78bfa, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Với AI Tư vấn Miễn Phí</h2>

            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              marginBottom: '20px',
              maxWidth: '380px',
              lineHeight: '1.7',
            }}>
              Chọn linh kiện → AI tự động kiểm tra tương thích → Thêm vào giỏ hàng.
              Hoàn toàn miễn phí. Không cần đăng ký.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <Link href="/build-pc" style={{
                padding: '11px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                color: '#4c1d95',
                background: 'linear-gradient(to right, #a78bfa, #c084fc)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >🖥️ Thử PC Builder ngay →</Link>

              <Link href="/community" style={{
                color: '#94a3b8',
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >Xem cộng đồng →</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {['✅ AI kiểm tra 10 thông số', '✅ 1-click thêm giỏ', '✅ Lưu & chia sẻ'].map(t => (
                <span key={t} style={{ fontSize: '11px', color: '#64748b' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div style={{
            flexShrink: 0,
            paddingRight: '48px',
            position: 'relative',
            zIndex: 10,
          }}>
            {/* AI badge */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '-16px',
              background: '#fff',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 20,
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>✅ AI Kiểm tra</span>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0' }}>100% Tương thích</p>
            </div>

            {/* PC Builder mini preview */}
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '16px',
              width: '280px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
                🖥️ PC Builder
              </p>
              {[
                { label: 'CPU', name: 'Intel Core i9-14900K', ok: true, price: '13.99M' },
                { label: 'GPU', name: 'Chưa chọn', ok: false, price: '' },
                { label: 'RAM', name: 'G.Skill 32GB DDR5', ok: true, price: '3.29M' },
              ].map(slot => (
                <div key={slot.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '7px',
                  marginBottom: '5px',
                  background: slot.ok ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.04)',
                  border: slot.ok ? '1px solid rgba(22,163,74,0.2)' : '1px dashed rgba(255,255,255,0.1)',
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', width: '28px' }}>{slot.label}</span>
                  <span style={{
                    flex: 1, fontSize: '10px',
                    color: slot.ok ? '#e2e8f0' : '#475569',
                    fontStyle: slot.ok ? 'normal' : 'italic',
                  }}>{slot.name}</span>
                  {slot.ok && <span style={{ fontSize: '9px', color: '#34d399' }}>✅</span>}
                  {slot.price && (
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: '#818cf8' }}>
                      {slot.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

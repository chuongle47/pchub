'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/lib/store';

export default function HeroSlider() {
  const setChatOpen = useUIStore((s) => s.setChatOpen);

  return (
    <section className="home-hero" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
      color: '#fff',
      padding: 'clamp(32px, 5vw, 52px) 0 clamp(36px, 5vw, 56px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '15%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(0, 0, 0, 0) 75%)',
        pointerEvents: 'none',
      }} />

      <div className="home-hero-grid" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'grid',
        gap: '24px',
        alignItems: 'center',
      }}>
        {/* Left Column: Content */}
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 4.8vw, 38px)',
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: '14px',
            letterSpacing: '-0.5px',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>Linh kiện chính hãng</span>
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}>
              Tư vấn AI tương thích 24/7
            </span>
          </h1>

          <p style={{
            color: '#cbd5e1',
            fontSize: '15px',
            lineHeight: '1.6',
            marginBottom: '28px',
            maxWidth: '520px',
          }}>
            Lựa chọn linh kiện PC chuẩn cấu hình cùng trợ lý Tư vấn AI. Đảm bảo 100% tương thích socket, nguồn và kích thước.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/build-pc"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'none'; }}
            >
              Build PC ngay
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
            >
              <Bot size={16} style={{ color: '#38bdf8' }} />
              Tư vấn AI
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Graphic */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            height: '285px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.3), 0 0 25px rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: '#0f172a',
          }}>
            <img
              src="/images/hero-pc.jpg"
              alt="Linh kiện PC chính hãng tại PCHub"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onError={e => {
                e.currentTarget.src = '/images/gpu-strix.jpg';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}


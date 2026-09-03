'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2 } from 'lucide-react';

export default function HeroSlider() {
  return (
    <section className="home-hero" style={{
      background: 'linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)',
      color: '#fff',
      padding: '48px 0',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '25%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'center',
      }}>
        {/* Left Column: Content */}
        <div>
          <h1 style={{
            fontSize: '38px',
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>Linh kiện chính hãng</span>
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}>
              AI tư vấn tương thích
            </span>
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '15px',
            lineHeight: '1.6',
            marginBottom: '28px',
            maxWidth: '520px',
          }}>
            Kiểm tra tương thích linh kiện nhờ AI. Chatbot AI tư vấn ngọt ngào cho theo ngân sách và nhu cầu của bạn.
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
              Xây dựng PC ngay
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/kiem-tra-tuong-thich"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
            >
              <Bot size={16} style={{ color: '#38bdf8' }} />
              Kiểm tra tương thích
            </Link>
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
            height: '280px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#090d16',
          }}>
            <img
              src="/images/hero-pc.jpg"
              alt="Linh kiện PC chính hãng PCHub"
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
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(11, 15, 25, 0.6) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}


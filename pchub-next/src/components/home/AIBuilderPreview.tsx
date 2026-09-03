'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight } from 'lucide-react';

export default function AIBuilderPreview() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/search?ai=true&q=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push('/search?ai=true');
    }
  };

  return (
    <section className="home-ai-builder" style={{
      padding: '32px 0 48px',
      background: '#ffffff',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '16px',
          padding: '32px 40px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'center',
          boxShadow: '0 12px 32px rgba(37, 99, 235, 0.25)',
        }}>
          {/* Left Text Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px',
            }}>
              <Bot size={14} />
              AI Consultation
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: '1.2',
              marginBottom: '10px',
            }}>
              AI tư vấn cấu hình PC
            </h2>

            <p style={{
              color: '#dbeafe',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '460px',
            }}>
              Giúp bạn tối ưu dung lượng và ngân sách mà bạn có, AI sẽ tự động đề xuất cấu hình tối ưu nhất trong vài giây.
            </p>
          </div>

          {/* Right Input Bar */}
          <div>
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '6px 6px 6px 16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Nhập nhu cầu (ví dụ: PC chơi game 25 triệu...)"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
              >
                Tư vấn ngay
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


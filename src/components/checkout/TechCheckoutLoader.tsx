'use client';

import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface TechCheckoutLoaderProps {
  progress: number; // 0 - 100
  step?: 1 | 2 | 3;
  statusMessage?: string;
  orderId?: string;
}

export default function TechCheckoutLoader({
  progress,
  orderId = 'ORD-PCHUB'
}: TechCheckoutLoaderProps) {
  const isDone = progress >= 95;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Sleek Glass Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Central Icon Ring */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isDone ? '#dcfce7' : '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          transition: 'all 0.3s ease'
        }}>
          {isDone ? (
            <CheckCircle2 size={36} color="#16a34a" />
          ) : (
            <Loader2 size={32} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
          )}
        </div>

        {/* Main Status Text */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '6px',
          letterSpacing: '-0.3px'
        }}>
          {isDone ? 'Đặt hàng thành công!' : 'Đang xử lý đơn hàng...'}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#64748b',
          margin: '0 0 20px 0',
          lineHeight: '1.4'
        }}>
          {isDone ? 'Đang chuyển hướng sang trang hoàn tất...' : 'Vui lòng chờ trong giây lát, hệ thống đang chuyển hướng...'}
        </p>

        {/* Clean Glowing Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.max(8, progress)}%`,
            background: 'linear-gradient(90deg, #2563eb, #16a34a)',
            borderRadius: '999px',
            transition: 'width 0.35s ease-out'
          }} />
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#94a3b8',
          fontVariantNumeric: 'tabular-nums'
        }}>
          Mã đơn hàng: <span style={{ color: '#2563eb' }}>{orderId}</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

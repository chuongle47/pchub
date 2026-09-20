'use client';

import React from 'react';
import { ShieldCheck, Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface TechCheckoutLoaderProps {
  progress: number; // 0 - 100
  step: 1 | 2 | 3;
  statusMessage?: string;
  orderId?: string;
}

const STEP_LOGS = [
  { id: 1, text: 'Mã hóa thông tin & Bảo mật SSL 256-bit' },
  { id: 2, text: 'Đồng bộ đơn hàng lên WooCommerce Sbuy API System' },
  { id: 3, text: 'Xác thực thanh toán thành công & Khởi tạo hóa đơn' },
];

export default function TechCheckoutLoader({
  progress,
  step,
  statusMessage,
  orderId = 'ORD-PCHUB'
}: TechCheckoutLoaderProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Background Cyber Ambient Glows */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '20%',
        left: '30%',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(0,0,0,0) 70%)',
        bottom: '20%',
        right: '30%',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      {/* Main Glass Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Scanline effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
          animation: 'scanline 2s infinite linear'
        }} />

        {/* Security Badge Header */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(14, 165, 233, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '6px 14px',
          borderRadius: '20px',
          color: '#38bdf8',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          marginBottom: '28px'
        }}>
          <ShieldCheck size={16} color="#38bdf8" />
          <span>CYBER CHECKOUT v2.4 • SSL SECURED</span>
        </div>

        {/* Animated Central Orbital Ring + CPU icon */}
        <div style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Outer Rotating Glowing Ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed rgba(56, 189, 248, 0.4)',
            animation: 'spin 8s linear infinite'
          }} />
          {/* Inner Pulsing Pulse Ring */}
          <div style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#38bdf8',
            borderRightColor: '#818cf8',
            animation: 'spin 1.5s linear infinite'
          }} />
          {/* Core CPU Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
          }}>
            <Cpu size={30} color="#38bdf8" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Status Heading */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#f8fafc',
          marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          Đang xử lý đơn hàng...
        </h3>
        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          margin: '0 0 24px 0',
          fontVariantNumeric: 'tabular-nums'
        }}>
          Mã giao dịch: <strong style={{ color: '#38bdf8' }}>{orderId}</strong>
        </p>

        {/* High-Tech Glowing Progress Bar */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#cbd5e1'
          }}>
            <span>Tiến trình đồng bộ</span>
            <span style={{ color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '999px',
            overflow: 'hidden',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(5, progress)}%`,
              background: 'linear-gradient(90deg, #00f0ff, #3b82f6, #10b981)',
              borderRadius: '999px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)'
            }} />
          </div>
        </div>

        {/* Step-by-Step Console Logs */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}>
          {STEP_LOGS.map((item) => {
            const isFinished = step > item.id || progress >= 95;
            const isCurrent = step === item.id && progress < 95;

            return (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: isFinished ? '#4ade80' : isCurrent ? '#38bdf8' : '#64748b',
                fontWeight: isCurrent || isFinished ? 600 : 400,
                transition: 'all 0.3s ease'
              }}>
                {isFinished ? (
                  <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                ) : isCurrent ? (
                  <Loader2 size={16} color="#38bdf8" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1.5px solid #475569',
                    flexShrink: 0
                  }} />
                )}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <Sparkles size={13} color="#38bdf8" />
          <span>Vui lòng không đóng trình duyệt trong khi đang xử lý</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes scanline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

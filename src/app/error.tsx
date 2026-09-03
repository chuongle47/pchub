'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#fef2f2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertTriangle size={28} />
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '8px',
        }}>
          Có lỗi xảy ra khi tải trang
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}>
          Hệ thống vừa gặp một sự cố nhỏ. Bạn có thể thử tải lại trang hoặc quay về trang chủ PCHub.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <RefreshCw size={16} /> Thử lại
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid #cbd5e1',
            }}
          >
            <Home size={16} /> Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

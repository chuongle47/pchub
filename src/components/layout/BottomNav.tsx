'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Cpu, Bot, ShoppingCart, User } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const setChatOpen = useUIStore((s) => s.setChatOpen);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const cartCount = isHydrated ? getItemCount() : 0;

  return (
    <div className="mobile-bottom-nav" style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 400,
      background: '#0f172a',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      display: 'none', // Overridden in CSS media query for <= 768px
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        height: '58px',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        {/* 1. Trang chủ */}
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: pathname === '/' ? '#38bdf8' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: pathname === '/' ? 800 : 500,
          }}
        >
          <Home size={19} />
          <span>Trang chủ</span>
        </Link>

        {/* 2. Tìm kiếm */}
        <Link
          href="/search"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: pathname.startsWith('/search') || pathname.startsWith('/tim-kiem') ? '#38bdf8' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: pathname.startsWith('/search') ? 800 : 500,
          }}
        >
          <Search size={19} />
          <span>Tìm kiếm</span>
        </Link>

        {/* 3. Build PC (Elevated Central Button) */}
        <Link
          href="/build-pc"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginTop: '-20px',
            border: '3px solid #0f172a',
          }}>
            <Cpu size={22} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: pathname.startsWith('/build-pc') ? '#38bdf8' : '#e2e8f0',
            marginTop: '2px',
          }}>
            Build PC
          </span>
        </Link>

        {/* 4. Tư vấn AI */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          <Bot size={19} color="#38bdf8" />
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Tư vấn AI</span>
        </button>

        {/* 5. Giỏ hàng */}
        <button
          type="button"
          onClick={toggleCart}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500,
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-8px',
                background: '#ef4444',
                color: '#fff',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                fontSize: '9px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span>Giỏ hàng</span>
        </button>
      </div>
    </div>
  );
}

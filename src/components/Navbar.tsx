'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Bot, Heart, Menu, X } from 'lucide-react';
import { useCartStore, useUIStore, useWishlistStore } from '@/lib/store';
import CartDrawer from './layout/CartDrawer';

interface NavLink {
  label: string;
  href: string;
  highlight?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Xây dựng PC', href: '/build-pc', highlight: true },
  { label: 'Linh kiện', href: '/search' },
  { label: 'Phụ kiện Gaming', href: '/search?category=gear' },
  { label: 'Laptop', href: '/search?category=laptop' },
  { label: 'Khuyến mãi', href: '/search?sale=true' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchVal, setSearchVal] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { count, setOpen, isOpen } = useCartStore();
  const setChatOpen = useUIStore(state => state.setChatOpen);
  const wishlistCount = useWishlistStore(s => s.ids.length);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const cartCount = isHydrated ? count() : 0;
  const visibleWishlistCount = isHydrated ? wishlistCount : 0;
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '6px 0',
        fontSize: '11px',
        color: '#94a3b8',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>🚚 Miễn phí giao hàng đơn từ 500K · Hotline: <span style={{ color: '#38bdf8', fontWeight: 700 }}>1900-6789</span></span>
          <span>✅ Bảo hành chính hãng 36 tháng · 🔄 Đổi trả 7 ngày dễ dàng</span>
        </div>
      </div>

      <header style={{
        background: '#0b0f19',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          gap: '20px',
        }}>
          {/* Brand Logo */}
          <Link href="/" style={{
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '8px',
              padding: '2px 8px',
              fontSize: '18px',
              color: '#fff',
            }}>PC</span>
            Hub
          </Link>

          {/* Search Bar */}
          {!isAuthPage && (
            <form onSubmit={handleSearchSubmit} style={{
              flex: 1,
              maxWidth: '420px',
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện, cấu hình..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '9999px',
                  padding: '8px 16px 8px 40px',
                  fontSize: '13px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'rgba(59,130,246,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
              />
              <Search size={15} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.4)',
              }} />
            </form>
          )}

          {/* Navigation Categories */}
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label={isMobileNavOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(open => !open)}
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`navbar-links${isMobileNavOpen ? ' is-open' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '13px',
            fontWeight: 500,
          }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileNavOpen(false)}
                style={{
                  color: link.highlight ? '#38bdf8' : pathname === link.href ? '#fff' : 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  fontWeight: link.highlight ? 700 : 500,
                  transition: 'all 0.15s',
                  background: pathname === link.href ? 'rgba(255,255,255,0.07)' : 'transparent',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!link.highlight && pathname !== link.href) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!link.highlight && pathname !== link.href) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}>
            {/* Wishlist */}
            <Link
              href="/search?wishlist=true"
              aria-label={`Danh sách yêu thích${visibleWishlistCount ? ` (${visibleWishlistCount})` : ''}`}
              style={{
                position: 'relative',
                color: 'rgba(255,255,255,0.85)',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
              }}
            >
              <Heart size={18} />
              {visibleWishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: '#fff',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{visibleWishlistCount > 9 ? '9+' : visibleWishlistCount}</span>
              )}
            </Link>

            {/* AI Advisor */}
            <button type="button" onClick={() => setChatOpen(true)} aria-label="Mở AI Advisor" style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              marginRight: '6px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
            }}>
              <Bot size={15} />
              ✨ AI Advisor
            </button>

            {/* Cart button */}
            <button
              onClick={() => setOpen(!isOpen)}
              style={{
                position: 'relative',
                color: 'rgba(255,255,255,0.85)',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: '#fff',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>

            {/* User */}
            <Link href="/login" style={{
              color: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            }}
            >
              <User size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}

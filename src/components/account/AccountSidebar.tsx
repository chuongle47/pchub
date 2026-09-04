'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Bell, Bot, Heart, LayoutDashboard, MapPin, Monitor, Package, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface AccountSidebarProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
}

const links = [
  ['/tai-khoan', 'Tổng quan', LayoutDashboard],
  ['/tai-khoan/don-hang', 'Đơn hàng của tôi', Package],
  ['/tai-khoan/yeu-thich', 'Yêu thích', Heart],
  ['/tai-khoan/bao-hanh', 'Yêu cầu bảo hành', ShieldCheck],
  ['/tai-khoan/lich-su-ai', 'Lịch sử AI Chat', Bot],
  ['/tai-khoan/thong-bao', 'Thông báo', Bell],
  ['/tai-khoan/build-cua-toi', 'Build PC của tôi', Monitor],
  ['/tai-khoan/ho-so', 'Thông tin cá nhân', UserRound],
  ['/tai-khoan/dia-chi', 'Địa chỉ giao hàng', MapPin],
] as const;

export default function AccountSidebar({ userName, userEmail, avatarUrl }: AccountSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    localStorage.removeItem('pchub-profile-extra');
    logout();
  };

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* User profile summary */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '16px',
        marginBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 800,
          margin: '0 auto 10px',
          boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
          overflow: 'hidden',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            userName.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{userName}</h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.map(([href, label, Icon]) => {
          const isActive = pathname === href || (href !== '/tai-khoan' && pathname.startsWith(href));
          
          return (
            <Link 
              key={href} 
              href={href} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#ffffff' : '#475569',
                background: isActive ? '#2563eb' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Icon size={17} color={isActive ? '#ffffff' : '#64748b'} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
        <button 
          type="button"
          onClick={handleLogout} 
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#dc2626',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={17} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  );
}
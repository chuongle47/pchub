'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Bot, Heart, LayoutDashboard, MapPin, Monitor, Package, ShieldCheck, UserRound, CreditCard } from 'lucide-react';

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
  ['/ecard', 'Thẻ E-Card (NKS)', CreditCard],
] as const;

export default function AccountSidebar({ userName, userEmail, avatarUrl }: AccountSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'nks_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'pchub-user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    
    // Clear localStorage
    localStorage.removeItem('pchub-profile-extra');
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <aside className="account-sidebar">
      <div className="account-user-card">
        <div className="account-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : userName.charAt(0)}
        </div>
        <div className="account-user-name">{userName}</div>
        <div className="account-user-email">{userEmail}</div>
      </div>
      <nav className="account-nav">
        {links.map(([href, label, Icon]) => (
          <Link key={href} href={href} className="account-nav-link">
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="account-logout-section">
        <button onClick={handleLogout} className="account-nav-link account-logout-link">
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
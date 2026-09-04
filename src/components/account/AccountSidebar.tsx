'use client';

import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Bot, Heart, LayoutDashboard, MapPin, Monitor, Package, ShieldCheck, UserRound } from 'lucide-react';
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
    <aside className="w-full md:w-72 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm shrink-0">
      {/* User profile summary */}
      <div className="text-center pb-5 mb-4 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-2xl mx-auto mb-3 shadow-md border-2 border-white overflow-hidden aspect-square">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            userName.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <h3 className="font-extrabold text-slate-900 text-base">{userName}</h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px] mx-auto">{userEmail}</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {links.map(([href, label, Icon]) => {
          const isActive = pathname === href || (href !== '/tai-khoan' && pathname.startsWith(href));
          
          return (
            <Link 
              key={href} 
              href={href} 
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} className="text-rose-500" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  );
}
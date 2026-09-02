import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { Bell, Bot, Heart, LayoutDashboard, MapPin, Monitor, Package, ShieldCheck, UserRound, CreditCard, LogOut } from 'lucide-react';
import LogoutButton from '@/components/account/LogoutButton';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/tai-khoan');
  
  // Extract NKS user data if available
  const nksUser = (user as any).user || user;
  const avatarUrl = nksUser?.avatar || null;
  const userName = nksUser?.name || user?.name || 'Khách hàng';
  const userEmail = nksUser?.email || user?.email || '';
  
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
  
  return <div className="account-shell"><div className="account-layout"><aside className="account-sidebar"><div className="account-user-card"><div className="account-avatar">{avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : userName.charAt(0)}</div><div className="account-user-name">{userName}</div><div className="account-user-email">{userEmail}</div></div><nav className="account-nav">{links.map(([href, label, Icon]) => <Link key={href} href={href} className="account-nav-link"><Icon size={16} />{label}</Link>)}</nav><div className="account-logout-section"><LogoutButton /></div></aside><main className="account-content">{children}</main></div></div>;
}
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/tai-khoan');
  
  // Extract NKS user data if available
  const nksUser = (user as any).user || user;
  const avatarUrl = nksUser?.avatar || null;
  const userName = nksUser?.name || user?.name || 'Khách hàng';
  const userEmail = nksUser?.email || user?.email || '';
  
  return (
    <div className="account-shell">
      <div className="account-layout">
        <AccountSidebar userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} />
        <main className="account-content">{children}</main>
      </div>
    </div>
  );
}
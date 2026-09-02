'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
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
    <button
      onClick={handleLogout}
      className="account-nav-link account-logout-link"
    >
      <LogOut size={16} />
      Đăng xuất
    </button>
  );
}
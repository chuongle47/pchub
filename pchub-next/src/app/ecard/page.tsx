import { AuthProvider } from '@/components/ecard/AuthContext';
import DashboardPage from '@/components/ecard/page';

export const metadata = {
  title: 'Quản lý Ecard | PCHub',
  description: 'Đăng nhập và quản lý thông tin Ecard NKS của bạn.',
};

export default function EcardRoute() {
  return (
    <AuthProvider>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardPage />
      </div>
    </AuthProvider>
  );
}

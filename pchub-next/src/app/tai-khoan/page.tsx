import { getCurrentUser } from '@/lib/auth';
import OrderDashboard from '@/components/account/OrderDashboard';

export default async function AccountPage() {
  const user = await getCurrentUser();
  return <div className="account-dashboard">
    <div className="account-page-heading"><div><p>Customer Portal</p><h1>Đơn hàng của tôi</h1></div><span className="account-date">Cập nhật lần cuối: hôm nay</span></div>
    <OrderDashboard />
  </div>;
}
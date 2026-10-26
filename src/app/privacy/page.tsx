import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Chính sách bảo mật | PCHub Store',
  description: 'Cam kết bảo mật thông tin cá nhân và dữ liệu thanh toán của khách hàng tại PCHub.',
};

export default function PrivacyPage() {
  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '40px 20px' }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '36px 40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            <ArrowLeft size={16} /> Quay lại trang Đăng ký
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Chính sách bảo mật thông tin
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Bảo vệ quyền riêng tư & dữ liệu người dùng PCHub
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              1. Mục đích thu thập thông tin
            </h2>
            <p>
              PCHub thu thập thông tin cá nhân của bạn (họ tên, email, số điện thoại, địa chỉ nhận hàng) chỉ nhằm phục vụ việc xử lý đơn hàng, liên hệ giao nhận linh kiện máy tính, cung cấp hỗ trợ kỹ thuật và thông báo ưu đãi bảo hành.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              2. Phạm vi sử dụng thông tin
            </h2>
            <p>
              Dữ liệu của bạn được sử dụng nội bộ trong hệ thống PCHub và các đối tác vận chuyển được ủy quyền để thực hiện giao hàng tận nơi. Chúng tôi cam kết tuyệt đối không bán, chia sẻ hoặc tiết lộ thông tin cá nhân cho bên thứ ba vì mục đích thương mại.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              3. Tiêu chuẩn bảo mật dữ liệu
            </h2>
            <p>
              Mật khẩu người dùng được mã hóa bằng thuật toán an toàn trước khi lưu trữ. Mọi giao dịch qua cổng thanh toán đều được bảo vệ bằng giao thức mã hóa SSL/TLS tiêu chuẩn quốc tế.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              4. Quyền của khách hàng đối với thông tin cá nhân
            </h2>
            <p>
              Bạn có quyền kiểm tra, cập nhật, điều chỉnh thông tin cá nhân bất cứ lúc nào tại trang <Link href="/tai-khoan/ho-so" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Hồ sơ cá nhân</Link> hoặc yêu cầu ban quản trị PCHub hỗ trợ xóa tài khoản vĩnh viễn.
            </p>
          </section>
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Địa chỉ: Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh
          </span>
          <Link
            href="/terms"
            style={{ fontSize: '13.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            &larr; Xem Điều khoản dịch vụ
          </Link>
        </div>
      </div>
    </div>
  );
}

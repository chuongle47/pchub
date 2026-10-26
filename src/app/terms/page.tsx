import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Điều khoản dịch vụ | PCHub Store',
  description: 'Quy định và điều khoản sử dụng dịch vụ tại hệ thống máy tính & linh kiện PCHub.',
};

export default function TermsPage() {
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
            href="/login"
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
            <ArrowLeft size={16} /> Quay lại trang Đăng nhập
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <FileText size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Điều khoản dịch vụ PCHub
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Cập nhật lần cuối: Tháng 10/2026
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              1. Chấp thuận các điều khoản
            </h2>
            <p>
              Chào mừng bạn đến với PCHub (pchub-iota.vercel.app). Khi đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên hệ thống, bạn xác nhận đã đọc, hiểu và hoàn toàn đồng ý tuân thủ các quy định được nêu trong Điều khoản dịch vụ này.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              2. Đăng ký & Bảo mật tài khoản
            </h2>
            <p>
              Người dùng có trách nhiệm cung cấp thông tin chính xác, đầy đủ khi tạo tài khoản (bao gồm họ tên, email hợp lệ và mật khẩu tối thiểu 8 ký tự). Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              3. Đặt hàng, Thanh toán & Build PC
            </h2>
            <p>
              - PCHub cung cấp công cụ xây dựng cấu hình máy tính (Góc Build PC) tự động tính toán điện năng, khả năng tương thích linh kiện và xuất báo giá chi tiết.<br />
              - Giá niêm yết trên website là giá đã bao gồm VAT và có hiệu lực tại thời điểm đặt hàng. Chúng tôi hỗ trợ nhiều hình thức thanh toán bao gồm tiền mặt khi nhận hàng (COD) và chuyển khoản ngân hàng qua cổng WooCommerce an toàn.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              4. Chính sách bảo hành & Đổi trả linh kiện
            </h2>
            <p>
              Tất cả linh kiện phần cứng (CPU, VGA, Mainboard, RAM, PSU, SSD...) bán tại PCHub đều là hàng chính hãng 100%, có tem bảo hành và được hưởng chính sách bảo hành theo tiêu chuẩn của nhà sản xuất từ 12 đến 36 tháng.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              5. Quyền và nghĩa vụ của người dùng
            </h2>
            <p>
              Nghiêm cấm mọi hành vi can thiệp trái phép vào hệ thống, gian lận voucher khuyến mãi, hoặc phát tán nội dung gây hại. PCHub có quyền tạm khóa hoặc chấm dứt tài khoản vi phạm các điều khoản trên.
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
            Thắc mắc về điều khoản? Liên hệ hotline: <strong style={{ color: '#0f172a' }}>0322323233</strong>
          </span>
          <Link
            href="/privacy"
            style={{ fontSize: '13.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            Xem Chính sách bảo mật &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

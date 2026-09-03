import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      padding: '48px 0 24px',
      marginTop: 'auto',
      color: '#475569',
      fontSize: '13px',
    }}>
      <div className="container" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
          gap: '32px',
          marginBottom: '36px',
        }}>
          {/* Company Info */}
          <div>
            <Link href="/" style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#0f172a',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
            }}>
              <span style={{
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '16px',
              }}>PC</span>
              Hub
            </Link>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              maxWidth: '320px',
              fontSize: '13px',
              margin: '0 0 16px',
            }}>
              Chuyên cung cấp linh kiện máy tính, PC cấu hình cao, chất lượng hàng đầu. Hỗ trợ lắp ráp theo nhu cầu.
            </p>
          </div>

          {/* Column 1: VỀ PCHUB */}
          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              VỀ PCHUB
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/about" style={{ textDecoration: 'none', color: '#64748b' }}>Giới thiệu</Link></li>
              <li><Link href="/support" style={{ textDecoration: 'none', color: '#64748b' }}>Liên hệ</Link></li>
              <li><Link href="/privacy" style={{ textDecoration: 'none', color: '#64748b' }}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 2: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              HỖ TRỢ KHÁCH HÀNG
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/support" style={{ textDecoration: 'none', color: '#64748b' }}>Bảo hành</Link></li>
              <li><Link href="/support" style={{ textDecoration: 'none', color: '#64748b' }}>Đổi trả</Link></li>
              <li><Link href="/shipping" style={{ textDecoration: 'none', color: '#64748b' }}>Shipping</Link></li>
              <li><Link href="/privacy" style={{ textDecoration: 'none', color: '#64748b' }}>Security</Link></li>
            </ul>
          </div>

          {/* Column 3: Thanh toán an toàn */}
          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Thanh toán an toàn
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#2563eb',
              }}>VNPAY</span>
              <span style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#d97706',
              }}>MoMo</span>
              <span style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0284c7',
              }}>ZaloPay</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '12px',
        }}>
          © 2024 PCHub. All rights reserved. | Linh kiện máy tính chính hãng
        </div>
      </div>
    </footer>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, MessageCircle, Phone, Mail, QrCode, 
  MapPin, ChevronRight, ChevronDown, CheckCircle2, 
  ShieldAlert, Clock, CreditCard, HelpCircle 
} from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Làm sao để biết Nguồn (PSU) của tôi có đủ công suất?',
      a: 'Bạn có thể sử dụng công cụ Build PC của PCHub để hệ thống AI tự động cộng dồn TDP của CPU, GPU và linh kiện, sau đó đề xuất bộ nguồn có mức công suất dự phòng an toàn từ 20-30%.'
    },
    {
      q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?',
      a: 'Nội thành TP.HCM và Hà Nội: Giao hàng hỏa tốc trong 2-4 giờ. Các tỉnh thành khác: Giao hàng tiêu chuẩn từ 1-3 ngày làm việc.'
    },
    {
      q: 'Chính sách đổi trả linh kiện khi không tương thích như thế nào?',
      a: 'Trong vòng 7 ngày đầu, nếu linh kiện mua tại PCHub không tương thích với hệ thống của bạn, chúng tôi hỗ trợ đổi sang linh kiện tương thích khác hoặc hoàn tiền theo quy định.'
    }
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Trung tâm hỗ trợ
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Chúng tôi hỗ trợ 24/7 để giúp bạn xử lý đơn hàng, bảo hành và các vấn đề về linh kiện PC.
          </p>
        </div>

        {/* 1. TRUNG TÂM HỖ TRỢ 24/7 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '36px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Trung tâm hỗ trợ 24/7
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {[
              { label: 'AI Chat', icon: Bot },
              { label: 'Live Chat', icon: MessageCircle },
              { label: 'Hotline', icon: Phone },
              { label: 'Email', icon: Mail },
              { label: 'Zalo OA', icon: QrCode },
              { label: 'Showroom', icon: MapPin }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px 12px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ color: '#2563eb' }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. FAQ SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', marginBottom: '48px' }}>
          
          {/* Left: Category list */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Danh mục Câu hỏi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Hướng dẫn lắp ráp PC',
                'Kiểm tra tương thích linh kiện',
                'Cài đặt hệ điều hành & Driver'
              ].map((text, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}>
                  <span>{text}</span>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Accordions */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Câu hỏi phổ biến
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. WARRANTY POLICY & TOC (SIDEBAR LAYOUT) */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '36px', alignItems: 'flex-start', marginBottom: '48px' }}>
          
          {/* Table of Contents */}
          <aside style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            position: 'sticky',
            top: '90px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Mục lục
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>1. Chính sách bảo hành</span>
              <span style={{ paddingLeft: '12px', color: '#64748b' }}>- Thời gian bảo hành</span>
              <span style={{ paddingLeft: '12px', color: '#64748b' }}>- Quy trình bảo hành</span>
              <span style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>2. Chính sách đổi trả</span>
              <span style={{ paddingLeft: '12px', color: '#64748b' }}>- Bảng thời gian đổi trả</span>
              <span style={{ paddingLeft: '12px', color: '#64748b' }}>- Thời gian hoàn tiền</span>
            </div>
          </aside>

          {/* Policy Content */}
          <div>
            
            {/* Section 1: Warranty Policy */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Chính sách bảo hành
              </h2>
              
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Thời gian bảo hành theo linh kiện
              </h4>

              {/* Table */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Loại linh kiện</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Thời gian (Tháng)</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: 'CPU (Vi xử lý)', time: '36', note: 'Bảo hành chính hãng' },
                      { item: 'VGA (Card đồ họa)', time: '36', note: 'Không áp dụng cho trâu cày' },
                      { item: 'Mainboard (Bo mạch chủ)', time: '36', note: 'Bảo hành chính hãng' },
                      { item: 'RAM (Bộ nhớ trong)', time: '36 - 60', note: 'Tùy thuộc thương hiệu' }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{row.item}</td>
                        <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: 700 }}>{row.time}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 6 Steps Warranty Process */}
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '14px' }}>
                Quy trình bảo hành (6 Bước)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { step: '1', title: 'Tiếp nhận thông tin', desc: 'Khách hàng liên hệ qua Hotline hoặc tạo ticket bảo hành trên website.' },
                  { step: '2', title: 'Kiểm tra sơ bộ', desc: 'Kỹ thuật viên hướng dẫn xử lý từ xa hoặc xác nhận cần gửi sản phẩm.' },
                  { step: '3', title: 'Gửi/Nhận sản phẩm', desc: 'Khách hàng mang đến Showroom hoặc gửi qua dịch vụ vận chuyển.' },
                  { step: '4', title: 'Thẩm định lỗi', desc: 'Trung tâm bảo hành xác định nguyên nhân và tình trạng linh kiện (1-3 ngày).' },
                  { step: '5', title: 'Tiến hành sửa chữa/Đổi mới', desc: 'Xử lý lỗi hoặc thay thế linh kiện tương đương theo quy định của hãng.' },
                  { step: '6', title: 'Hoàn trả sản phẩm', desc: 'Thông báo khách hàng đến nhận hoặc gửi trả qua đường bưu điện.' }
                ].map(s => (
                  <div key={s.step} style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#0055d4',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {s.step}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{s.title}</h5>
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.45' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Section 2: Return & Refund Policy */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Chính sách đổi trả
              </h2>
              
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Quy định đổi trả 7 ngày
              </h4>

              {/* Table */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Điều kiện</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>1-7 Ngày đầu</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Sau 7 Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Sản phẩm Lỗi do NSX</td>
                      <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 700 }}>Đổi mới 100%</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>Bảo hành theo quy định</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Sản phẩm không Lỗi (khách đổi ý)</td>
                      <td style={{ padding: '12px 16px', color: '#ea580c', fontWeight: 600 }}>Thu phí 15-20% giá trị</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>Thỏa thuận mua lại</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Tình trạng vật lý</td>
                      <td colSpan={2} style={{ padding: '12px 16px', color: '#64748b' }}>
                        Phải giữ nguyên hộp, phụ kiện, không trầy xước, móp méo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Refund Time Cards */}
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Thời gian hoàn tiền
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Thanh toán VNPAY / Thẻ tín dụng</h5>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Tiền hoàn về tài khoản</p>
                  </div>
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}>
                    3-5 Ngày
                  </span>
                </div>

                <div style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Thanh toán COD / Chuyển khoản trực tiếp</h5>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Tiền hoàn về tài khoản</p>
                  </div>
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}>
                    5-7 Ngày
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

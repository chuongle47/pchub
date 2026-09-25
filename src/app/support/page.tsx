'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, MessageCircle, Phone, Mail, QrCode, 
  MapPin, ChevronRight, ChevronDown, CheckCircle2, 
  ShieldCheck, Clock, CreditCard, HelpCircle,
  Truck, Award, Cpu, ShoppingBag
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
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Trung tâm thông tin & Hỗ trợ khách hàng
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Hệ sinh thái thông tin, chính sách bảo hành, đổi trả và hướng dẫn mua sắm linh kiện PC chính hãng tại PCHub.
          </p>
        </div>

        {/* 1. VỀ PCHUB SECTION */}
        <section 
          id="ve-pchub" 
          style={{
            scrollMarginTop: '100px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '36px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--color-primary-light, #e8f0fe)', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}>
              <Award size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Về PCHub Technology
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                Hệ thống bán lẻ linh kiện PC chính hãng và nền tảng PC Builder tích hợp AI thông minh
              </p>
            </div>
          </div>

          <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.7', marginBottom: '24px' }}>
            Được thành lập với sứ mệnh đơn giản hóa quy trình xây dựng dàn máy tính cho cộng đồng game thủ, nhà sáng tạo nội dung và kỹ sư công nghệ, <strong>PCHub</strong> tự hào là đơn vị tiên phong ứng dụng trí tuệ nhân tạo (AI) trong việc tự động kiểm tra độ tương thích giữa các linh kiện CPU, GPU, Mainboard, RAM và Nguồn. Chúng tôi cam kết mang lại trải nghiệm mua sắm minh bạch, tối ưu chi phí và chuẩn hóa kỹ thuật cao nhất.
          </p>

          {/* 4 Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { icon: ShieldCheck, title: '100% Chính Hãng', desc: 'Đầy đủ hóa đơn VAT, chứng nhận phân phối chính hãng từ Intel, AMD, ASUS, MSI, Gigabyte, Corsair.' },
              { icon: Cpu, title: 'AI Tương Thích Chuẩn Xác', desc: 'Thuật toán AI tự động tính toán công suất TDP, kiểm tra socket, kích thước vỏ case và băng thông bus.' },
              { icon: Truck, title: 'Giao Hàng Siêu Tốc 2H', desc: 'Hỏa tốc nội thành 2 giờ và đóng gói chuyên dụng chống sốc đạt chuẩn cho khách hàng toàn quốc.' },
              { icon: Clock, title: 'Bảo Hành Vàng 36 Tháng', desc: 'Chính sách bảo hành 1 đổi 1 trong 30 ngày đầu và hỗ trợ kỹ thuật trọn đời sản phẩm.' }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ color: 'var(--color-primary)' }}>
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{p.title}</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. LIÊN HỆ & TRUNG TÂM HỖ TRỢ 24/7 */}
        <section 
          id="lien-he" 
          style={{
            scrollMarginTop: '100px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '36px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--color-primary-light, #e8f0fe)', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}>
              <Phone size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Liên hệ & Kênh hỗ trợ 24/7
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp thắc mắc và hỗ trợ xử lý sự cố
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { label: 'AI Chatbot', info: 'Tư vấn 24/7', icon: Bot, href: '/build-pc' },
              { label: 'Live Support', info: '8:00 - 22:00', icon: MessageCircle, href: 'https://zalo.me/pchub' },
              { label: 'Hotline 1900 8888', info: 'Cước phí 1.000đ/p', icon: Phone, href: 'tel:19008888' },
              { label: 'Email CSKH', info: 'support@pchub.vn', icon: Mail, href: 'mailto:support@pchub.vn' },
              { label: 'Zalo OA', info: 'Official PCHub', icon: QrCode, href: 'https://zalo.me/pchub' },
              { label: 'Hệ thống Showroom', info: 'Hà Nội & TP.HCM', icon: MapPin, href: '#showroom' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <a 
                  key={idx} 
                  href={item.href}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px 14px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ color: 'var(--color-primary)' }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {item.info}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* 3. HƯỚNG DẪN MUA HÀNG SECTION */}
        <section 
          id="huong-dan-mua-hang" 
          style={{
            scrollMarginTop: '100px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '36px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--color-primary-light, #e8f0fe)', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Hướng dẫn mua hàng & Thanh toán
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                4 bước đơn giản để sở hữu linh kiện hoặc dàn máy PC tùy biến tại PCHub
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { step: '01', title: 'Chọn sản phẩm / Build PC', desc: 'Tìm kiếm linh kiện theo danh mục hoặc sử dụng trình PC Builder để lên cấu hình trọn gói.' },
              { step: '02', title: 'Kiểm tra tương thích AI', desc: 'Hệ thống tự động xác nhận socket CPU, bus RAM và công suất nguồn PSU phù hợp trước khi đặt mua.' },
              { step: '03', title: 'Xác nhận đơn & Thanh toán', desc: 'Chọn phương thức thanh toán linh hoạt: VNPay, MoMo, thẻ tín dụng, chuyển khoản hoặc COD.' },
              { step: '04', title: 'Nhận hàng & Bảo hành', desc: 'Kiểm tra tem niêm phong, kích hoạt bảo hành điện tử qua số điện thoại và hỗ trợ lắp ráp tận nơi.' }
            ].map(s => (
              <div key={s.step} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                position: 'relative'
              }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'rgba(0,85,212,0.12)', position: 'absolute', top: '12px', right: '16px' }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* FAQ Accordion embedded inside Purchase Guide */}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Câu hỏi thường gặp khi mua sắm
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
        </section>

        {/* 4 & 5. WARRANTY & RETURN POLICIES WITH STICKY SIDEBAR */}
        <div className="support-layout-grid">
          
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
              Mục lục chính sách
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <a href="#ve-pchub" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, padding: '4px 0' }}>
                1. Về PCHub
              </a>
              <a href="#lien-he" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, padding: '4px 0' }}>
                2. Liên hệ 24/7
              </a>
              <a href="#huong-dan-mua-hang" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, padding: '4px 0' }}>
                3. Hướng dẫn mua hàng
              </a>
              <a href="#chinh-sach-bao-hanh" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700, padding: '4px 0' }}>
                4. Chính sách bảo hành
              </a>
              <a href="#chinh-sach-doi-tra" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, padding: '4px 0' }}>
                5. Chính sách đổi trả
              </a>
            </div>
          </aside>

          {/* Policy Content Column */}
          <div>
            
            {/* Section 4: Warranty Policy */}
            <section id="chinh-sach-bao-hanh" style={{ scrollMarginTop: '100px', marginBottom: '44px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Chính sách bảo hành chính hãng
              </h2>
              
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Thời gian bảo hành theo linh kiện
              </h4>

              {/* Table */}
              <div className="table-responsive" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
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
                      { item: 'CPU (Vi xử lý)', time: '36', note: 'Bảo hành chính hãng Intel / AMD' },
                      { item: 'VGA (Card đồ họa)', time: '36', note: 'Chính hãng (không bảo hành trâu cày coin)' },
                      { item: 'Mainboard (Bo mạch chủ)', time: '36', note: 'Bảo hành chính hãng đổi mới 30 ngày đầu' },
                      { item: 'RAM (Bộ nhớ trong)', time: '36 - 60', note: '1 đổi 1 ngay lập tức khi lỗi chip' },
                      { item: 'SSD / HDD', time: '36 - 60', note: 'Theo chính sách bảo hành TBW hãng' },
                      { item: 'Nguồn máy tính (PSU)', time: '36 - 120', note: 'Tùy chuẩn 80 Plus Bronze/Gold/Platinum' }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{row.item}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 700 }}>{row.time}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 6 Steps Warranty Process */}
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '14px' }}>
                Quy trình tiếp nhận bảo hành (6 Bước)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {[
                  { step: '1', title: 'Tiếp nhận thông tin', desc: 'Khách hàng liên hệ qua Hotline 1900 8888 hoặc tạo ticket bảo hành trên website.' },
                  { step: '2', title: 'Kiểm tra sơ bộ', desc: 'Kỹ thuật viên hướng dẫn kiểm tra từ xa hoặc xác nhận cần gửi sản phẩm.' },
                  { step: '3', title: 'Gửi/Nhận sản phẩm', desc: 'Khách hàng mang đến Showroom hoặc gửi qua bưu cục vận chuyển liên kết.' },
                  { step: '4', title: 'Thẩm định lỗi', desc: 'Trung tâm kỹ thuật xác định nguyên nhân và tình trạng linh kiện (1-3 ngày làm việc).' },
                  { step: '5', title: 'Sửa chữa / Đổi mới', desc: 'Xử lý lỗi hoặc đổi mới linh kiện tương đương theo quy định của nhà sản xuất.' },
                  { step: '6', title: 'Hoàn trả khách hàng', desc: 'Thông báo nhận máy tại trung tâm hoặc giao trả tận nhà miễn phí cước vận chuyển.' }
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
                      background: 'var(--color-primary)',
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
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.45', margin: 0 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </section>

            {/* Section 5: Return & Refund Policy */}
            <section id="chinh-sach-doi-tra" style={{ scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Chính sách đổi trả & Hoàn tiền
              </h2>
              
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Quy định đổi trả linh kiện
              </h4>

              {/* Table */}
              <div className="table-responsive" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Điều kiện sản phẩm</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Trong 7 ngày đầu</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>Sau 7 ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Lỗi do nhà sản xuất</td>
                      <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 700 }}>Đổi mới 100% miễn phí</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>Bảo hành tiêu chuẩn chính hãng</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Không tương thích hệ thống</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 700 }}>Đổi linh kiện tương thích khác</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>Hỗ trợ thu đổi có khấu hao</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Khách đổi ý (không có lỗi)</td>
                      <td style={{ padding: '12px 16px', color: '#ea580c', fontWeight: 600 }}>Khấu hao 10-15% giá trị</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>Thỏa thuận mua lại theo thời giá</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>Tình trạng ngoại quan</td>
                      <td colSpan={2} style={{ padding: '12px 16px', color: '#64748b' }}>
                        Phải giữ nguyên hộp, số serial/IMEI trùng khớp, đầy đủ phụ kiện và hóa đơn mua hàng.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Refund Time Cards */}
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Thời gian giải ngân hoàn tiền
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ví VNPay / MoMo / ZaloPay</h5>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Hoàn về ví nguồn</p>
                  </div>
                  <span style={{ background: '#eff6ff', color: 'var(--color-primary)', fontWeight: 800, fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}>
                    1-2 Ngày
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
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Thẻ tín dụng / Ghi nợ quốc tế</h5>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Tùy kỳ sao kê ngân hàng</p>
                  </div>
                  <span style={{ background: '#eff6ff', color: 'var(--color-primary)', fontWeight: 800, fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}>
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
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Chuyển khoản ngân hàng / COD</h5>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Chuyển khoản 24/7</p>
                  </div>
                  <span style={{ background: '#eff6ff', color: 'var(--color-primary)', fontWeight: 800, fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}>
                    24 Giờ
                  </span>
                </div>
              </div>

            </section>

          </div>

        </div>

      </div>
    </div>
  );
}

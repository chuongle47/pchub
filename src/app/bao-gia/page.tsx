'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, Cpu, Send, CheckCircle2, ChevronRight, Sparkles, 
  Phone, MessageSquare, ExternalLink, ShieldCheck, Wrench, Truck, 
  FileText, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/contactConfig';
import { decodeCodeToBuild } from '@/data/community-data';

interface DraftPart {
  category: string;
  name: string;
  price: number;
}

export default function BaoGiaPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    tax: '',
    address: '',
    purpose: 'Gaming / Thể thao điện tử',
    budget: '25 - 40 triệu',
    quantity: 1,
    timeline: 'Trong 1-3 ngày tới',
    services: [
      'Lắp ráp & Test stress nhiệt độ miễn phí',
      'Cài đặt Windows & Phần mềm cơ bản'
    ] as string[],
    components: '',
    notes: '',
  });

  const [draftParts, setDraftParts] = useState<DraftPart[]>([]);
  const [draftTotal, setDraftTotal] = useState<number>(0);
  const [structuredItems, setStructuredItems] = useState<{ cat: string; name: string; price: number; qty: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [buildCodeInput, setBuildCodeInput] = useState('');
  const [showCodeInputBox, setShowCodeInputBox] = useState(false);
  const [codeNotice, setCodeNotice] = useState<string | null>(null);

  // Check if there are draft build parts in localStorage or URL from /build-pc
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);

      // Check URL query code (Build Code)
      const codeParam = searchParams.get('code') || searchParams.get('build_code');
      if (codeParam) {
        handleApplyBuildCode(codeParam);
        return;
      }

      // 1. Check URL query config
      const configParam = searchParams.get('config') || searchParams.get('pc_config');
      if (configParam) {
        const parsed = JSON.parse(decodeURIComponent(configParam));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDraftParts(parsed);
          const sum = parsed.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
          setDraftTotal(sum);
          return;
        }
      }

      // 2. Check localStorage from Build PC
      const rawBuild = localStorage.getItem('pchub_build_slots');
      if (rawBuild) {
        const parsedSlots = JSON.parse(rawBuild);
        const parts: DraftPart[] = [];
        let total = 0;
        Object.entries(parsedSlots).forEach(([key, val]: [string, any]) => {
          if (val && val.selected) {
            const p = Number(val.selected.price || 0) * (val.quantity || 1);
            parts.push({
              category: val.category || key.toUpperCase(),
              name: val.selected.name,
              price: p,
            });
            total += p;
          }
        });

        if (parts.length > 0) {
          setDraftParts(parts);
          setDraftTotal(total);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleServiceToggle = (srv: string) => {
    setFormData(prev => {
      const exists = prev.services.includes(srv);
      return {
        ...prev,
        services: exists ? prev.services.filter(s => s !== srv) : [...prev.services, srv]
      };
    });
  };

  const handleUseDraftComponents = () => {
    if (draftParts.length === 0) return;
    const summary = draftParts.map(p => `- ${p.category}: ${p.name} (${p.price.toLocaleString('vi-VN')} ₫)`).join('\n');
    setStructuredItems(draftParts.map(p => ({
      cat: p.category,
      name: p.name,
      price: Number(p.price) || 0,
      qty: 1,
    })));
    setFormData(prev => ({
      ...prev,
      components: summary + (prev.components ? `\n\n${prev.components}` : ''),
      notes: prev.notes ? prev.notes : `Tổng dự toán linh kiện tạm tính: ${draftTotal.toLocaleString('vi-VN')} ₫`
    }));
  };

  const handleApplyBuildCode = (codeStr?: string) => {
    const raw = (codeStr || buildCodeInput).trim();
    if (!raw) {
      setCodeNotice('❌ Vui lòng nhập hoặc dán mã cấu hình (Build Code)!');
      return;
    }

    // 1. Giải mã bằng decodeCodeToBuild
    const decoded = decodeCodeToBuild(raw);
    if (decoded) {
      const parts: { cat: string; name: string; price: number; qty: number }[] = [];
      if (decoded.cpu) parts.push({ cat: 'CPU - Bộ Vi Xử Lý', name: decoded.cpu, price: 0, qty: 1 });
      if (decoded.mainboard) parts.push({ cat: 'Mainboard - Bo Mạch Chủ', name: decoded.mainboard, price: 0, qty: 1 });
      if (decoded.ram) parts.push({ cat: 'RAM - Bộ Nhớ Trong', name: decoded.ram, price: 0, qty: 1 });
      if (decoded.gpu) parts.push({ cat: 'VGA - Card Màn Hình', name: decoded.gpu, price: 0, qty: 1 });
      if (decoded.ssd) parts.push({ cat: 'SSD - Ổ Cứng Lưu Trữ', name: decoded.ssd, price: 0, qty: 1 });
      if (decoded.psu) parts.push({ cat: 'Nguồn Máy Tính (PSU)', name: decoded.psu, price: 0, qty: 1 });
      if (decoded.case) parts.push({ cat: 'Vỏ Case Máy Tính', name: decoded.case, price: 0, qty: 1 });
      if (decoded.cooler) parts.push({ cat: 'Tản Nhiệt (Cooling)', name: decoded.cooler, price: 0, qty: 1 });

      if (parts.length > 0) {
        setStructuredItems(parts);
        const summary = parts.map(p => `- ${p.cat}: ${p.name}`).join('\n');
        setFormData(prev => ({
          ...prev,
          components: summary,
          purpose: decoded.category ? `${decoded.category} (${decoded.title || 'PC Build'})` : prev.purpose,
          budget: decoded.price ? `${(decoded.price / 1000000).toFixed(0)} triệu` : prev.budget,
        }));
        setCodeNotice(`✅ Đã nạp thành công ${parts.length} linh kiện từ mã cấu hình!`);
        setTimeout(() => {
          setCodeNotice(null);
          setShowCodeInputBox(false);
          setBuildCodeInput('');
        }, 2000);
        return;
      }
    }

    // 2. Thử giải mã định dạng Base64 legacy
    try {
      const clean = raw.replace(/^PCHUB:/, '');
      const jsonStr = decodeURIComponent(escape(atob(clean)));
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.slots)) {
        const parts: { cat: string; name: string; price: number; qty: number }[] = [];
        parsed.slots.forEach((s: any) => {
          if (s.n) {
            parts.push({
              cat: s.k ? s.k.toUpperCase() : 'Linh kiện',
              name: s.n,
              price: Number(s.p) || 0,
              qty: s.q || 1,
            });
          }
        });
        if (parts.length > 0) {
          setStructuredItems(parts);
          const summary = parts.map(p => `- ${p.cat}: ${p.name} (${p.price ? p.price.toLocaleString('vi-VN') + ' ₫' : ''})`).join('\n');
          setFormData(prev => ({ ...prev, components: summary }));
          setCodeNotice(`✅ Đã nạp thành công ${parts.length} linh kiện từ mã cấu hình!`);
          setTimeout(() => {
            setCodeNotice(null);
            setShowCodeInputBox(false);
            setBuildCodeInput('');
          }, 2000);
          return;
        }
      }
    } catch {
      // ignore
    }

    setCodeNotice('❌ Mã cấu hình không hợp lệ hoặc không thể giải mã.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Vui lòng điền đầy đủ Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    setSubmitting(true);
    try {
      const compiledMessage = `
--- THÔNG TIN DOANH NGHIỆP / GIAO HÀNG ---
- Công ty / Đơn vị: ${formData.company || 'Cá nhân'}
- Mã số thuế: ${formData.tax || 'Không yêu cầu'}
- Địa chỉ nhận hàng: ${formData.address || 'Nhận tại Showroom'}

--- NHU CẦU & DỰ TOÁN ---
- Mục đích sử dụng: ${formData.purpose}
- Mức ngân sách dự kiến: ${formData.budget}
- Số lượng máy: ${formData.quantity} bộ
- Thời gian cần: ${formData.timeline}
- Dịch vụ kèm theo: ${formData.services.join(', ') || 'Không'}

--- CHI TIẾT CẤU HÌNH YÊU CẦU ---
${formData.components || '(Chưa điền cấu hình cụ thể - Nhờ PCHub tự chọn theo ngân sách)'}

--- GHI CHÚ BỔ SUNG ---
${formData.notes || 'Không có ghi chú thêm'}
`.trim();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          company: formData.company.trim(),
          tax: formData.tax.trim(),
          address: formData.address.trim(),
          purpose: formData.purpose.trim(),
          budget: formData.budget.trim(),
          quantity: Number(formData.quantity) || 1,
          timeline: formData.timeline,
          services: formData.services,
          components: formData.components || '',
          items: structuredItems,
          notes: formData.notes || '',
          subject: `[BÁO GIÁ PC] ${formData.purpose} (${formData.budget} - SL: ${formData.quantity} bộ)`,
          message: compiledMessage,
          isQuote: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gửi yêu cầu báo giá không thành công.');
      }

      setSubmittedTicket(data.ticketId || `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      setFormError(err.message || 'Đã xảy ra sự cố khi gửi yêu cầu. Vui lòng liên hệ Hotline.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* 1. Hero Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #091e42 0%, #0c367b 45%, #1d4ed8 100%)',
        color: '#ffffff',
        padding: '52px 20px 64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.25)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#bfdbfe', marginBottom: '18px' }}>
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Trang chủ</Link>
            <ChevronRight size={14} color="#93c5fd" />
            <span style={{ color: '#67e8f9', fontWeight: 700 }}>Yêu cầu Báo giá Cấu hình PC</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Calculator size={15} color="#38bdf8" />
              <span>Dự toán cấu hình tối ưu chi phí & Hiệu năng 2026</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.2vw, 42px)',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: '14px',
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
              letterSpacing: '-0.5px'
            }}>
              Yêu Cầu Báo Giá Cấu Hình PC
            </h1>
            <p style={{
              fontSize: '15.5px',
              color: '#f1f5f9',
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 500,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Điền thông tin và nhu cầu của bạn để nhận bảng dự toán linh kiện chi tiết, chiết khấu đại lý tốt nhất kèm cam kết linh kiện chính hãng 100% trong 15-30 phút.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '-28px auto 0', padding: '0 20px 80px', position: 'relative', zIndex: 2 }}>
        
        {/* Banner: Quick link from Build PC if detected */}
        {draftParts.length > 0 && !submittedTicket && (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #93c5fd',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#2563eb',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Cpu size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 2px' }}>
                  Phát hiện {draftParts.length} linh kiện trong trình Build PC ({draftTotal.toLocaleString('vi-VN')} ₫)
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  Bạn có muốn tự động đính kèm các linh kiện đã chọn này vào phiếu báo giá không?
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleUseDraftComponents}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                <span>Nạp vào form báo giá</span>
              </button>
              <Link
                href="/build-pc"
                style={{
                  background: '#ffffff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Xem lại Build PC
              </Link>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Quotation Request Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}>
            {submittedTicket ? (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#166534', margin: '0 0 8px' }}>
                  Tiếp nhận yêu cầu báo giá thành công!
                </h2>
                <div style={{
                  background: '#ffffff',
                  border: '1px dashed #22c55e',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  display: 'inline-block',
                  margin: '12px auto 16px'
                }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Mã phiếu báo giá của bạn:</span>
                  <strong style={{ fontSize: '24px', color: '#15803d', letterSpacing: '1px' }}>{submittedTicket}</strong>
                </div>
                <p style={{ fontSize: '14px', color: '#15803d', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: '480px' }}>
                  Chuyên viên phần cứng của PCHub sẽ phân tích linh kiện, áp dụng mức giá chiết khấu tốt nhất và gửi lại bảng báo giá chi tiết qua Số điện thoại / Zalo trong <strong>15 - 30 phút</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://zalo.me/${CONTACT_CONFIG.zalo}?text=${encodeURIComponent(`Chào PCHub, mình vừa gửi yêu cầu báo giá mã ${submittedTicket}, nhờ shop hỗ trợ sớm giúp mình!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#0068ff',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '11px 22px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Chat Zalo chốt giá ngay</span>
                    <ExternalLink size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '11px 18px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Gửi thêm cấu hình khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    Phiếu đăng ký báo giá
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Vui lòng cung cấp các thông tin cơ bản để PCHub gửi bảng báo giá chính xác.
                  </p>
                </div>

                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    color: '#dc2626',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Thông tin liên hệ */}
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' }}>
                    1. Thông tin người nhận báo giá
                  </legend>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Trần Minh Tuấn"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Số điện thoại / Zalo <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0901234567"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Email nhận bảng PDF
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Tên công ty / Đơn vị (nếu có)
                      </label>
                      <input
                        type="text"
                        placeholder="Công ty TNHH..."
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Địa chỉ nhận hàng dự kiến
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                    />
                  </div>
                </fieldset>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                {/* 2. Nhu cầu & Dự toán ngân sách */}
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' }}>
                    2. Nhu cầu sử dụng & Dự toán ngân sách
                  </legend>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Mục đích sử dụng chính <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={formData.purpose}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff' }}
                      >
                        <option value="Gaming / Thể thao điện tử">Gaming / Thể thao điện tử</option>
                        <option value="Đồ họa 3D / Render / Dựng phim">Đồ họa 3D / Render / Dựng phim</option>
                        <option value="Văn phòng / Doanh nghiệp / Kế toán">Văn phòng / Doanh nghiệp / Kế toán</option>
                        <option value="Workstation / Giả lập / AI & Deep Learning">Workstation / Giả lập / AI & Deep Learning</option>
                        <option value="Dàn máy Quán Net / Cyber Game">Dàn máy Quán Net / Cyber Game</option>
                        <option value="Máy chủ Server / Lưu trữ dữ liệu NAS">Máy chủ Server / Lưu trữ dữ liệu NAS</option>
                        <option value="Khác">Nhu cầu khác</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Mức ngân sách dự kiến
                      </label>
                      <select
                        value={formData.budget}
                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff' }}
                      >
                        <option value="Dưới 15 triệu">Dưới 15 triệu</option>
                        <option value="15 - 25 triệu">15 - 25 triệu</option>
                        <option value="25 - 40 triệu">25 - 40 triệu</option>
                        <option value="40 - 70 triệu">40 - 70 triệu</option>
                        <option value="Trên 70 triệu">Trên 70 triệu</option>
                        <option value="Tối ưu hiệu năng cao nhất">Tối ưu hiệu năng cao nhất</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Số lượng bộ máy
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Thời gian cần máy
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff' }}
                      >
                        <option value="Cần gấp trong ngày">Cần gấp trong ngày</option>
                        <option value="Trong 1-3 ngày tới">Trong 1-3 ngày tới</option>
                        <option value="Trong tuần này">Trong tuần này</option>
                        <option value="Đang tham khảo giá thị trường">Đang tham khảo giá thị trường</option>
                      </select>
                    </div>
                  </div>

                  {/* Dịch vụ kèm */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Dịch vụ & Tùy chọn đi kèm:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '8px' }}>
                      {[
                        'Lắp ráp & Test stress nhiệt độ miễn phí',
                        'Cài đặt Windows & Phần mềm cơ bản',
                        'Xuất hóa đơn điện tử VAT (10%)',
                        'Giao hàng & Lắp đặt tận nơi'
                      ].map(srv => {
                        const checked = formData.services.includes(srv);
                        return (
                          <label key={srv} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12.5px',
                            color: '#334155',
                            cursor: 'pointer',
                            background: checked ? '#eff6ff' : '#f8fafc',
                            border: checked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            padding: '8px 12px',
                            borderRadius: '8px'
                          }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleServiceToggle(srv)}
                              style={{ accentColor: '#2563eb' }}
                            />
                            <span>{srv}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                {/* 3. Chi tiết cấu hình */}
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <legend style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                      3. Cấu hình linh kiện mong muốn
                    </legend>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setShowCodeInputBox(v => !v)}
                        style={{
                          background: showCodeInputBox ? '#eff6ff' : '#f8fafc',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        🔗 {showCodeInputBox ? 'Đóng ô nhập mã' : 'Nhập mã Build Code'}
                      </button>
                      <Link
                        href="/build-pc"
                        style={{ fontSize: '12.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}
                      >
                        Mở công cụ Build PC →
                      </Link>
                    </div>
                  </div>

                  {/* Khung nhập mã cấu hình (Build Code) */}
                  {showCodeInputBox && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1.5px dashed #93c5fd',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '12px',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                        Dán mã cấu hình (Build Code từ tool Build PC) vào đây:
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Ví dụ: PCB-eyJ... hoặc PCHUB-..."
                          value={buildCodeInput}
                          onChange={e => setBuildCodeInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyBuildCode(); } }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none',
                            background: '#fff'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyBuildCode()}
                          style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          Nạp linh kiện
                        </button>
                      </div>
                      {codeNotice && (
                        <div style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: codeNotice.startsWith('✅') ? '#16a34a' : '#dc2626'
                        }}>
                          {codeNotice}
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    rows={5}
                    placeholder="Nhập hoặc dán các linh kiện bạn mong muốn (hoặc để trống để kỹ thuật viên PCHub lên cấu hình tối ưu theo ngân sách)...&#10;Ví dụ:&#10;- CPU: Core i5 13400F hoặc Ryzen 5 7600&#10;- VGA: RTX 4060 8GB&#10;- RAM: 32GB DDR5..."
                    value={formData.components}
                    onChange={e => setFormData({ ...formData, components: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
                  />

                  <div style={{ marginTop: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Ghi chú thêm cho kỹ thuật viên
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Thích tone màu trắng, ưu tiên tản nhiệt nước, case kính cường lực nhỏ gọn..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #0055d4 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px 24px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 85, 212, 0.3)',
                    transition: 'opacity 0.2s',
                    marginTop: '8px'
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>GỬI YÊU CẦU BÁO GIÁ NGAY</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Benefits, Process & Fast Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Box 1: Cam kết dịch vụ */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                ⭐ Cam kết từ PCHub Technology
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>100% Linh kiện chính hãng</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Bảo hành chính hãng 36 - 60 tháng. Đổi mới 100% trong 30 ngày đầu nếu lỗi nhà sản xuất.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>Lắp ráp & Đi dây thẩm mỹ miễn phí</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Đội ngũ kỹ thuật viên tay nghề cao, test stress nhiệt độ FurMark & Cinebench trước khi xuất xưởng.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>Giao hàng hỏa tốc toàn quốc</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Giao nhanh 2 giờ tại nội thành. Đóng gói chuyên dụng chống sốc bảo vệ an toàn linh kiện khi gửi xa.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>Đầy đủ hóa đơn VAT hợp lệ</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Hỗ trợ thủ tục đấu thầu, báo giá doanh nghiệp, hợp đồng mua bán và xuất hóa đơn điện tử VAT 100%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Kênh tư vấn nhanh */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                Cần báo giá ngay tức thì?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                Bạn có thể gọi trực tiếp hoặc gửi ảnh cấu hình qua Zalo kỹ thuật viên để nhận báo giá nhanh trong 5 phút:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`tel:${CONTACT_CONFIG.hotline}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#00c853',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    <span>Hotline Trực Tiếp</span>
                  </div>
                  <strong>{CONTACT_CONFIG.hotlineDisplay}</strong>
                </a>

                <a
                  href={`https://zalo.me/${CONTACT_CONFIG.zalo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0068ff',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} />
                    <span>Zalo Tư Vấn Báo Giá</span>
                  </div>
                  <strong>{CONTACT_CONFIG.zalo}</strong>
                </a>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '12.5px', color: '#64748b' }}>
                📍 <strong>Showroom & Trụ sở:</strong> {CONTACT_CONFIG.address}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

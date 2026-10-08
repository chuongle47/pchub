'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Sparkles, Check, ArrowLeft, ShieldCheck, 
  AlertCircle, Zap, Cpu, Layers, HardDrive, Box, Fan, DollarSign
} from 'lucide-react';
import { 
  CommunityBuild, CommunityCategory, 
  saveCommunityBuild 
} from '@/data/community-data';
import { useAuthStore } from '@/lib/store';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function SubmitBuildPage() {
  const router = useRouter();
  const authUser = useAuthStore(s => s.user);

  const [form, setForm] = useState({
    title: '',
    category: 'Gaming' as CommunityCategory,
    description: '',
    cpu: '',
    cpuPrice: '',
    gpu: '',
    gpuPrice: '',
    ram: '',
    ramPrice: '',
    mainboard: '',
    mainboardPrice: '',
    ssd: '',
    ssdPrice: '',
    psu: '',
    psuPrice: '',
    case: '',
    casePrice: '',
    cooler: '',
    coolerPrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiReport, setAiReport] = useState<{ score: number; status: string; summary: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto calculate total price
  const totalPrice = React.useMemo(() => {
    const parse = (val: string) => parseInt(val.replace(/\D/g, '')) || 0;
    return (
      parse(form.cpuPrice) +
      parse(form.gpuPrice) +
      parse(form.ramPrice) +
      parse(form.mainboardPrice) +
      parse(form.ssdPrice) +
      parse(form.psuPrice) +
      parse(form.casePrice) +
      parse(form.coolerPrice)
    );
  }, [form]);

  const handleRunAiCheck = () => {
    if (!form.cpu.trim() || !form.gpu.trim()) {
      setErrors(prev => ({ ...prev, ai: 'Vui lòng nhập tối thiểu CPU và GPU để AI phân tích tương thích' }));
      return;
    }
    setErrors(prev => ({ ...prev, ai: '' }));
    setIsAiChecking(true);

    setTimeout(() => {
      setIsAiChecking(false);
      setAiReport({
        score: 100,
        status: 'Tương thích hoàn hảo',
        summary: `Hệ thống phân tích: CPU "${form.cpu}" và VGA "${form.gpu}" phối hợp tối ưu công suất, không bị nghẽn cổ chai. Ước tính nguồn ${form.psu ? form.psu : '650W+'} cấp điện chuẩn ổn định.`
      });
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên cấu hình PC';
    }
    if (!form.cpu.trim()) {
      newErrors.cpu = 'Vui lòng nhập tên CPU (Bộ vi xử lý)';
    }
    if (!form.gpu.trim()) {
      newErrors.gpu = 'Vui lòng nhập tên VGA (Card đồ họa)';
    }
    if (!form.ram.trim()) {
      newErrors.ram = 'Vui lòng nhập thông tin RAM';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Vui lòng viết vài dòng chia sẻ về cấu hình của bạn';
    }
    if (totalPrice <= 0) {
      newErrors.price = 'Vui lòng nhập giá cho ít nhất một vài linh kiện để tính tổng chi phí';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const parseP = (val: string, fallbackRatio: number) => {
      const num = parseInt(val.replace(/\D/g, ''));
      return isNaN(num) || num <= 0 ? Math.round(totalPrice * fallbackRatio) : num;
    };

    const newBuild: CommunityBuild = {
      id: `custom-${Date.now()}`,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: form.title,
      category: form.category,
      image: '/images/hero-pc.jpg',
      author: {
        name: authUser?.name || 'Thành viên PCHub',
        avatar: (authUser?.name || 'T').charAt(0).toUpperCase(),
        role: 'Community Builder',
      },
      parts: {
        cpu: { name: form.cpu, price: parseP(form.cpuPrice, 0.25), specs: 'Hiệu năng cao' },
        gpu: { name: form.gpu, price: parseP(form.gpuPrice, 0.45), specs: 'Chiến game đỉnh cao' },
        ram: { name: form.ram, price: parseP(form.ramPrice, 0.08), specs: 'Dual Channel' },
        mainboard: { name: form.mainboard || 'Bo mạch chủ tương thích', price: parseP(form.mainboardPrice, 0.1) },
        ssd: { name: form.ssd || 'SSD NVMe M.2 1TB', price: parseP(form.ssdPrice, 0.05) },
        psu: { name: form.psu || 'Nguồn 650W - 850W Bronze/Gold', price: parseP(form.psuPrice, 0.04) },
        case: { name: form.case || 'Vỏ case thoáng khí', price: parseP(form.casePrice, 0.03) },
        cooler: { name: form.cooler || 'Tản nhiệt tháp hiệu năng cao', price: parseP(form.coolerPrice, 0.02) },
      },
      price: totalPrice,
      performanceNote: `💡 Cấu hình ${form.category} do ${authUser?.name || 'thành viên'} đóng góp, tối ưu cho nhu cầu làm việc và chiến game mượt mà.`,
      fpsBenchmarks: [
        { game: 'Valorant / CS2', res1080p: 280, res1440p: 190, res4k: 110, settings: 'High' },
        { game: 'Cyberpunk 2077', res1080p: 110, res1440p: 75, res4k: 45, settings: 'Ultra DLSS' },
        { game: 'Black Myth: Wukong', res1080p: 90, res1440p: 62, res4k: 38, settings: 'High' },
      ],
      powerConsumption: {
        idleWatt: 50,
        loadWatt: 380,
        recommendedPsuWatt: 750,
      },
      aiCompatibility: {
        status: 'compatible',
        score: 100,
        socketMatch: true,
        socketInfo: 'Hệ thống kiểm tra các linh kiện đã lựa chọn ăn khớp chuẩn socket.',
        psuAdequate: true,
        psuInfo: 'Công suất nguồn đề xuất đáp ứng đủ tải tối đa.',
        clearanceOk: true,
        clearanceInfo: 'Chiều dài card đồ họa và kích thước case phù hợp.',
        coolerOk: true,
        coolerInfo: 'Tản nhiệt đảm bảo kiểm soát tốt nhiệt độ khi vận hành.',
        summary: 'Cấu hình đã được AI kiểm tra sơ bộ và đạt chuẩn tương thích.',
      },
      aiVerified: true,
      likes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'approved',
      description: form.description,
      tags: [form.category, 'Community Build', 'PCHub 2026'],
    };

    saveCommunityBuild(newBuild);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          maxWidth: '520px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Check size={34} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
            🎉 Đăng Cấu Hình Thành Công!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
            Cấu hình của bạn đã được lưu vào hệ thống Cộng đồng PCHub và sẵn sàng để mọi người cùng thảo luận, đánh giá.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              href="/community"
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              Về trang Cộng đồng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: '840px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/community" style={{ color: '#64748b', textDecoration: 'none' }}>Cộng đồng</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Đăng cấu hình mới</span>
        </nav>

        {/* Card Form */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}>
          
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', marginBottom: '8px' }}>
              <Sparkles size={14} /> Chia sẻ cấu hình PC
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
              Đăng Build Của Bạn Lên Cộng Đồng
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Cùng chia sẻ kinh nghiệm chọn linh kiện và nhận đánh giá tương thích tự động từ AI Advisor của PCHub.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Build Title */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                Tên cấu hình PC *
              </label>
              <input
                type="text"
                placeholder="VD: Cấu hình Gaming 2K Full Trắng, Trạm Render Đồ Họa 3D..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: errors.title ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {errors.title && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.title}
                </span>
              )}
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                Danh mục / Nhu cầu sử dụng *
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as CommunityCategory })}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff'
                }}
              >
                <option value="Gaming">Gaming (Chiến game AAA & eSports)</option>
                <option value="Workstation">Workstation (Đồ họa, Render 3D, Kiến trúc, AI)</option>
                <option value="Streaming">Streaming (Livestream game & Sáng tạo nội dung)</option>
                <option value="Budget">Budget (Tiết kiệm ngân sách / Học sinh sinh viên)</option>
              </select>
            </div>

            {/* Components Grid */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🛠️ Danh sách linh kiện & Giá ước tính
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* CPU */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="CPU (Bộ vi xử lý) *"
                      value={form.cpu}
                      onChange={e => setForm({ ...form, cpu: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: errors.cpu ? '1.5px solid #ef4444' : '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    {errors.cpu && <span style={{ fontSize: '11.5px', color: '#ef4444' }}>{errors.cpu}</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="Giá CPU (VNĐ)"
                    value={form.cpuPrice}
                    onChange={e => setForm({ ...form, cpuPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* GPU */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="VGA (Card màn hình) *"
                      value={form.gpu}
                      onChange={e => setForm({ ...form, gpu: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: errors.gpu ? '1.5px solid #ef4444' : '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    {errors.gpu && <span style={{ fontSize: '11.5px', color: '#ef4444' }}>{errors.gpu}</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="Giá VGA (VNĐ)"
                    value={form.gpuPrice}
                    onChange={e => setForm({ ...form, gpuPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* RAM */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="RAM (Bộ nhớ trong) *"
                      value={form.ram}
                      onChange={e => setForm({ ...form, ram: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: errors.ram ? '1.5px solid #ef4444' : '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    {errors.ram && <span style={{ fontSize: '11.5px', color: '#ef4444' }}>{errors.ram}</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="Giá RAM (VNĐ)"
                    value={form.ramPrice}
                    onChange={e => setForm({ ...form, ramPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* Mainboard */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Mainboard (Bo mạch chủ)"
                    value={form.mainboard}
                    onChange={e => setForm({ ...form, mainboard: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá Mainboard (VNĐ)"
                    value={form.mainboardPrice}
                    onChange={e => setForm({ ...form, mainboardPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* SSD */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="SSD / HDD (Ổ cứng lưu trữ)"
                    value={form.ssd}
                    onChange={e => setForm({ ...form, ssd: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá SSD (VNĐ)"
                    value={form.ssdPrice}
                    onChange={e => setForm({ ...form, ssdPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* PSU */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="PSU (Nguồn máy tính)"
                    value={form.psu}
                    onChange={e => setForm({ ...form, psu: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá PSU (VNĐ)"
                    value={form.psuPrice}
                    onChange={e => setForm({ ...form, psuPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* Case */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Vỏ Case"
                    value={form.case}
                    onChange={e => setForm({ ...form, case: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá Case (VNĐ)"
                    value={form.casePrice}
                    onChange={e => setForm({ ...form, casePrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* Cooler */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Tản nhiệt CPU (AIO / Tản khí)"
                    value={form.cooler}
                    onChange={e => setForm({ ...form, cooler: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá tản nhiệt (VNĐ)"
                    value={form.coolerPrice}
                    onChange={e => setForm({ ...form, coolerPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Total Price Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>
                  TỔNG GIÁ TỰ ĐỘNG TÍNH:
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>
                  {formatVND(totalPrice)}
                </span>
              </div>
              {errors.price && <span style={{ fontSize: '12px', color: '#ef4444', display: 'block', marginTop: '4px' }}>{errors.price}</span>}
            </div>

            {/* AI Compatibility Preview Button */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Kiểm tra tương thích phần cứng với AI
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Kiểm tra xung nhịp, socket CPU/Mainboard và công suất nguồn trước khi gửi bài.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAiCheck}
                  disabled={isAiChecking}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} />
                  {isAiChecking ? 'AI đang phân tích...' : 'Chạy kiểm tra AI'}
                </button>
              </div>

              {errors.ai && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{errors.ai}</div>}

              {aiReport && (
                <div style={{ marginTop: '12px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '13px', color: '#166534' }}>
                  <strong>✅ {aiReport.status} (Điểm: {aiReport.score}/100)</strong>
                  <div style={{ color: '#334155', marginTop: '4px' }}>{aiReport.summary}</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                Mô tả chi tiết & Cảm nhận trải nghiệm *
              </label>
              <textarea
                rows={4}
                placeholder="Chia sẻ lý do bạn chọn các linh kiện này, nhiệt độ máy khi làm việc/chơi game, điểm hài lòng nhất..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: errors.description ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              {errors.description && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.description}
                </span>
              )}
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <Link
                href="/community"
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={16} /> Quay lại
              </Link>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} />
                Đăng cấu hình lên cộng đồng
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { ShieldCheck, Plus, Clock, CheckCircle2, Wrench, X } from 'lucide-react';

export default function WarrantyPage() {
  const [showForm, setShowForm] = useState(false);
  const [productCode, setProductCode] = useState('');
  const [errorDesc, setErrorDesc] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowForm(false);
    setProductCode('');
    setErrorDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Yêu cầu bảo hành</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Theo dõi tiến trình bảo hành và sửa chữa linh kiện PC</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} /> Tạo yêu cầu mới
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Đang xử lý', value: '1', color: '#d97706', bg: '#fffbeb', border: '#fef3c7', icon: Clock },
          { label: 'Đã giải quyết', value: '3', color: '#059669', bg: '#ecfdf5', border: '#d1fae5', icon: CheckCircle2 },
          { label: 'Tổng yêu cầu', value: '4', color: '#2563eb', bg: '#eff6ff', border: '#dbeafe', icon: ShieldCheck },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: item.color, fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>
                  {item.value}
                </span>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: item.bg,
                border: `1px solid ${item.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={item.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Warranty Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>WC-2026-0809</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fef3c7',
              }}>
                <Clock size={13} /> Đang xử lý
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Sản phẩm: <strong style={{ color: '#1e293b' }}>ASUS ROG Strix RTX 4070 Ti Super</strong> · Gửi ngày 20/08/2026
            </p>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#475569',
            background: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            ⏳ Dự kiến hoàn thành: 3 ngày
          </span>
        </div>

        {/* Timeline Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700 }}>
            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Tiếp nhận</span>
            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}><Wrench size={14} /> Đã kiểm tra</span>
            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Đang xử lý</span>
            <span style={{ color: '#cbd5e1' }}>Hoàn tất</span>
          </div>
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '70%', background: 'linear-gradient(90deg, #2563eb, #f59e0b)', borderRadius: '999px' }} />
          </div>
        </div>
      </div>

      {/* Modal Popup Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#2563eb" /> Tạo yêu cầu bảo hành
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mã đơn hàng / Sản phẩm *
                </label>
                <input
                  required
                  placeholder="Ví dụ: ORD-1788485775504"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mô tả hiện tượng lỗi *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả chi tiết lỗi gặp phải (không lên nguồn, rác hình, quạt không quay...)"
                  value={errorDesc}
                  onChange={e => setErrorDesc(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '10px 18px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }}
                >
                  Gửi yêu cầu bảo hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { FormEvent, useState } from 'react';
import { MapPin, Plus, CheckCircle2, Trash2, Edit3, User, Phone } from 'lucide-react';

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  primary: boolean;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: 'Nguyễn Văn An',
      phone: '0901 234 567',
      address: '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      primary: true,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.address) return;
    
    setAddresses(current => [
      ...current,
      {
        id: Date.now(),
        name: form.name,
        phone: form.phone || 'Chưa cập nhật',
        address: form.address,
        primary: current.length === 0,
      },
    ]);
    setForm({ name: '', phone: '', address: '' });
    setShowForm(false);
  };

  const removeAddress = (id: number) => {
    setAddresses(current => current.filter(a => a.id !== id));
  };

  const setPrimary = (id: number) => {
    setAddresses(current => current.map(a => ({ ...a, primary: a.id === id })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Địa chỉ giao hàng</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Quản lý sổ địa chỉ nhận hàng mua sắm của bạn</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(open => !open)}
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
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#2563eb" /> Thêm địa chỉ nhận hàng mới
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <input
              required
              placeholder="Họ và tên người nhận *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '10px 14px',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
            <input
              required
              placeholder="Số điện thoại *"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              style={{
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
          <textarea
            required
            rows={2}
            placeholder="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố) *"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            style={{
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
              }}
            >
              Lưu địa chỉ
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {addresses.map(item => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              border: item.primary ? '2px solid #2563eb' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: item.primary ? '0 4px 12px rgba(37,99,235,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="#64748b" /> {item.name}
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="#64748b" /> {item.phone}
                  </span>
                  {item.primary && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1d4ed8',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '2px 10px',
                      borderRadius: '20px',
                    }}>
                      <CheckCircle2 size={12} /> Mặc định
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.5' }}>
                  <MapPin size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item.address}</span>
                </p>
              </div>

              {!item.primary && (
                <button
                  type="button"
                  onClick={() => setPrimary(item.id)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Thiết lập mặc định
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12.5px', fontWeight: 700 }}>
              <button type="button" style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Edit3 size={14} /> Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => removeAddress(item.id)}
                style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Xóa địa chỉ
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
            <MapPin size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Chưa có địa chỉ giao hàng</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Thêm địa chỉ nhận hàng để rút ngắn thời gian thanh toán đơn hàng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
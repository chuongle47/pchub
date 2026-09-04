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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Địa chỉ giao hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý sổ địa chỉ nhận hàng mua sắm của bạn</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(open => !open)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" /> Thêm địa chỉ nhận hàng mới
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Họ và tên người nhận *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <input
              required
              placeholder="Số điện thoại *"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 text-xs font-semibold font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <textarea
            required
            rows={2}
            placeholder="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố) *"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Lưu địa chỉ
            </button>
          </div>
        </form>
      )}

      {/* Address cards */}
      <div className="space-y-4">
        {addresses.map(item => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
              item.primary ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" /> {item.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> {item.phone}
                  </span>
                  {item.primary && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 size={12} /> Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5 pt-1">
                  <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>{item.address}</span>
                </p>
              </div>

              {!item.primary && (
                <button
                  type="button"
                  onClick={() => setPrimary(item.id)}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 self-start"
                >
                  Thiết lập mặc định
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs font-bold">
              <button type="button" className="text-blue-600 hover:underline flex items-center gap-1">
                <Edit3 size={13} /> Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => removeAddress(item.id)}
                className="text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 size={13} /> Xóa địa chỉ
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Chưa có địa chỉ giao hàng</h3>
            <p className="text-xs text-slate-500 mt-1">Thêm địa chỉ nhận hàng để rút ngắn thời gian thanh toán đơn hàng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
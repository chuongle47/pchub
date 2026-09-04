'use client';

import { FormEvent, useState } from 'react';
import { ShieldCheck, Plus, Clock, CheckCircle2, Wrench, PackageSearch, X } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Yêu cầu bảo hành</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi tiến trình bảo hành và sửa chữa linh kiện PC</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={16} /> Tạo yêu cầu mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Đang xử lý', value: '1', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: Clock },
          { label: 'Đã giải quyết', value: '3', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
          { label: 'Tổng yêu cầu', value: '4', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: ShieldCheck },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`border rounded-2xl p-4 bg-white shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className={`text-2xl font-extrabold font-mono mt-1 ${item.color}`}>{item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.bg}`}>
                <Icon size={20} className={item.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active warranty card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-extrabold text-slate-900 text-base">WC-2026-0809</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={13} /> Đang xử lý
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sản phẩm: <strong className="text-slate-700">ASUS ROG Strix RTX 4070 Ti Super</strong> · Gửi ngày 20/08/2026
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            ⏳ Dự kiến hoàn thành: 3 ngày
          </span>
        </div>

        {/* Progress timeline */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span className="text-blue-600 flex items-center gap-1"><CheckCircle2 size={13} /> Tiếp nhận</span>
            <span className="text-blue-600 flex items-center gap-1"><Wrench size={13} /> Đã kiểm tra</span>
            <span className="text-amber-600 flex items-center gap-1"><Clock size={13} /> Đang xử lý</span>
            <span className="text-slate-300">Hoàn tất</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full transition-all duration-500" />
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" /> Tạo yêu cầu bảo hành
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã đơn hàng / Sản phẩm *</label>
                <input
                  required
                  placeholder="Ví dụ: ORD-1788485775504"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 text-xs font-semibold font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả hiện tượng lỗi *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả chi tiết lỗi gặp phải (không lên nguồn, rác hình, quạt không quay...)"
                  value={errorDesc}
                  onChange={e => setErrorDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
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
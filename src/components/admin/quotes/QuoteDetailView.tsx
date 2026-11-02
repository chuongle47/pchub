'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  ShoppingCart,
  CheckCircle,
  Clock,
  PhoneCall,
  User,
  Phone,
  Mail,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Save,
} from 'lucide-react';
import {
  updateQuoteStatusAction,
  convertQuoteToOrderAction,
} from '@/lib/actions/admin-quotes';

interface Props {
  quote: any;
  items: any[];
  staffList: { id: string; full_name: string }[];
}

export function QuoteDetailView({ quote, items, staffList }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(quote.status);
  const [assignedTo, setAssignedTo] = useState(quote.assigned_to || '');
  const [note, setNote] = useState(quote.note || '');

  const [savingStatus, setSavingStatus] = useState(false);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    setMessage(null);
    try {
      await updateQuoteStatusAction(quote.id, status, assignedTo, note);
      setMessage({ type: 'success', text: 'Cập nhật trạng thái báo giá thành công!' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi cập nhật báo giá.' });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!confirm(`Xác nhận chuyển báo giá #${quote.code} thành đơn hàng chính thức? Hệ thống sẽ tạo đơn và tự động trừ kho linh kiện.`)) {
      return;
    }

    setConverting(true);
    setMessage(null);
    try {
      const res = await convertQuoteToOrderAction(quote.id);
      alert(`🎉 Đã chuyển thành công thành Đơn hàng #${res.order_code}!`);
      router.push(`/admin/orders/${res.order_id}`);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi chuyển thành đơn hàng.' });
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quotes"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white font-mono">{quote.code}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                {quote.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tạo lúc: {new Date(quote.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>In báo giá</span>
          </button>

          {quote.status !== 'won' && (
            <button
              onClick={handleConvertToOrder}
              disabled={converting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              <span>Chốt đơn (Tạo Order)</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Components List & Customer details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Components breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cấu hình linh kiện đề xuất ({items.length})
            </h2>

            <div className="divide-y divide-slate-800/80">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                      {item.category?.name || 'Linh kiện'}
                    </span>
                    <div className="text-xs font-semibold text-white truncate mt-0.5">
                      {item.product?.name || 'Sản phẩm'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Đơn giá: {Number(item.unit_price).toLocaleString('vi-VN')} ₫ x {item.quantity}
                    </div>
                  </div>
                  <div className="text-right font-bold text-amber-400 text-xs whitespace-nowrap">
                    {Number(item.unit_price * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Tổng giá trị cấu hình:</span>
              <span className="text-amber-400 text-base font-mono">
                {Number(quote.total).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Khách hàng yêu cầu</span>
            </h2>
            <div className="text-sm font-semibold text-white pt-1">{quote.customer_name}</div>
            <div className="text-xs text-slate-300">Số điện thoại: <strong>{quote.phone}</strong></div>
            {quote.email && <div className="text-xs text-slate-400">Email: {quote.email}</div>}
          </div>
        </div>

        {/* Right 1 Col: Process & Assignment */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Xử lý báo giá
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Trạng thái liên hệ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="new">Mới nhận (New)</option>
                <option value="contacted">Đã liên hệ tư vấn (Contacted)</option>
                <option value="won">Đã chốt đơn (Won)</option>
                <option value="cancelled">Khách hủy / Không mua (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nhân viên phụ trách
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chưa phân công --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Ghi chú tư vấn
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú nhu cầu khách: chơi game 2K, làm đồ họa render..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSaveStatus}
              disabled={savingStatus}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Lưu cập nhật</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
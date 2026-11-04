'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Plus, Pencil, Trash2, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { deleteFlashSaleAction } from '@/lib/actions/admin-promotions';

interface FlashSaleItem {
  id: string;
  name: string;
  banner_url: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  items_count?: number;
}

interface Props {
  sales: FlashSaleItem[];
}

export function FlashSaleList({ sales }: Props) {
  const router = useRouter();

  const getStatus = (start: string, end: string, active: boolean) => {
    if (!active) return { label: 'Tạm tắt', class: 'bg-slate-800 text-slate-400 border-slate-700' };
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) {
      return { label: 'Sắp diễn ra', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    } else if (now >= startTime && now <= endTime) {
      return { label: 'Đang diễn ra 🔥', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' };
    } else {
      return { label: 'Đã kết thúc', class: 'bg-slate-800 text-slate-500 border-slate-700' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa chiến dịch Flash Sale "${name}"?`)) return;
    try {
      await deleteFlashSaleAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa chiến dịch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Chiến Dịch Flash Sale</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý các chương trình xả kho giờ vàng, đồng hồ đếm ngược và giá sale đặc biệt
          </p>
        </div>

        <Link
          href="/admin/flash-sales/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo chiến dịch Flash Sale</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales.map((sale) => {
          const status = getStatus(sale.starts_at, sale.ends_at, sale.is_active);

          return (
            <div
              key={sale.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              {sale.banner_url ? (
                <div className="h-36 w-full overflow-hidden relative">
                  <img
                    src={sale.banner_url}
                    alt={sale.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/hero-pc.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${status.class}`}>
                    {status.label}
                  </span>
                </div>
              ) : (
                <div className="h-28 w-full bg-gradient-to-tr from-amber-600/20 via-slate-900 to-blue-600/20 p-4 flex items-start justify-between">
                  <Zap className="w-7 h-7 text-amber-400" />
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${status.class}`}>
                    {status.label}
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {sale.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bắt đầu: {new Date(sale.starts_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>Kết thúc: {new Date(sale.ends_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/admin/flash-sales/${sale.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa & Sản phẩm</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(sale.id, sale.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Xóa chiến dịch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sales.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            Chưa có chiến dịch Flash Sale nào được tạo.
          </div>
        )}
      </div>
    </div>
  );
}
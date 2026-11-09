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
    if (!active) return { label: 'Tạm tắt', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) {
      return { label: 'Sắp diễn ra', class: 'bg-blue-50 text-blue-700 border-blue-200/60' };
    } else if (now >= startTime && now <= endTime) {
      return { label: 'Đang diễn ra 🔥', class: 'bg-amber-50 text-amber-700 border-amber-200/60 font-bold animate-pulse' };
    } else {
      return { label: 'Đã kết thúc', class: 'bg-slate-100 text-slate-500 border-slate-200' };
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <span>Chiến Dịch Flash Sale</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các chương trình xả kho giờ vàng, đồng hồ đếm ngược và giá sale đặc biệt
          </p>
        </div>

        <Link
          href="/admin/flash-sales/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
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
              className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="h-40 w-full overflow-hidden relative bg-slate-100">
                <img
                  src={sale.banner_url?.trim() ? sale.banner_url : '/images/promo-wide.jpg'}
                  alt={sale.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true';
                      target.src = '/images/promo-wide.jpg';
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-xs ${status.class}`}>
                  {status.label}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {sale.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bắt đầu: {new Date(sale.starts_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>Kết thúc: {new Date(sale.ends_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/admin/flash-sales/${sale.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa & Sản phẩm</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(sale.id, sale.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
            Chưa có chiến dịch Flash Sale nào được tạo.
          </div>
        )}
      </div>
    </div>
  );
}
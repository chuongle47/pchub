'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Eye,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  PhoneCall,
  XCircle,
  Trophy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface QuoteItem {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  total: number;
  status: string;
  created_at: string;
  assigned_profile?: { full_name: string } | null;
}

interface Props {
  quotes: QuoteItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const statusBadge: Record<string, { label: string; class: string }> = {
  new: { label: 'Mới nhận', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  contacted: { label: 'Đã liên hệ', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  won: { label: 'Đã chốt đơn', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Đã hủy / Thất bại', class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export function QuoteDataTable({ quotes, totalCount, page, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const totalPages = Math.ceil(totalCount / pageSize);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (status) params.set('status', status);
    params.set('page', '1');

    startTransition(() => {
      router.push(`/admin/quotes?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Yêu Cầu Báo Giá & Build PC</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <span className="font-semibold text-amber-400">{totalCount}</span> yêu cầu báo giá cấu hình
          </p>
        </div>

        <Link
          href="/admin/quotes/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo báo giá mới</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Tìm theo mã báo giá (BG-...), tên khách, SĐT..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới nhận (Cần xử lý)</option>
            <option value="contacted">Đã liên hệ tư vấn</option>
            <option value="won">Đã chốt đơn</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <button
          onClick={applyFilters}
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
          <span>Lọc</span>
        </button>
      </div>

      {/* Quotes Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Mã báo giá</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng tiền dự kiến</th>
                <th className="p-4">Phụ trách</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quotes.length > 0 ? (
                quotes.map((q) => {
                  const sInfo = statusBadge[q.status] || { label: q.status, class: 'bg-slate-800 text-slate-400' };

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/admin/quotes/${q.id}`}
                          className="font-bold text-amber-400 hover:text-amber-300 font-mono text-xs block"
                        >
                          {q.code}
                        </Link>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(q.created_at).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">{q.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{q.phone}</div>
                      </td>

                      <td className="p-4 font-bold text-white text-xs">
                        {Number(q.total).toLocaleString('vi-VN')} ₫
                      </td>

                      <td className="p-4 text-slate-300">
                        {q.assigned_profile?.full_name || (
                          <span className="text-slate-500 italic">Chưa phân công</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${sInfo.class}`}>
                          {sInfo.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/quotes/${q.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Chưa có yêu cầu báo giá nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Trang <span className="font-bold text-white">{page}</span> / {totalPages} (Tổng số {totalCount} báo giá)
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/admin/quotes?page=${Math.max(page - 1, 1)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/quotes?page=${Math.min(page + 1, totalPages)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
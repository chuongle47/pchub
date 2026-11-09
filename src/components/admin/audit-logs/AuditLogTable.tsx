'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  Clock,
  User,
  Activity,
  FileCode,
  X,
  Calendar,
  Layers,
  ChevronRight,
  Database,
  ArrowRight,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { clearOldAuditLogsAction } from '@/lib/actions/admin-settings';

export interface AuditLogItem {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  diff: any;
  ip_address: string | null;
  created_at: string;
  actor?: {
    full_name: string | null;
    email: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null;
}

interface Props {
  initialLogs: AuditLogItem[];
}

const ACTION_COLORS: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Tạo mới', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  UPDATE: { label: 'Cập nhật', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  DELETE: { label: 'Xóa bỏ', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
  STATUS_CHANGE: { label: 'Đổi trạng thái', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  MODERATE: { label: 'Kiểm duyệt', color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
  ASSIGN_STAFF_ROLE: { label: 'Phân quyền', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
  REVOKE_STAFF_ROLE: { label: 'Thu hồi quyền', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
  UPDATE_SETTINGS: { label: 'Đổi cài đặt', color: 'bg-cyan-50 text-cyan-700 border-cyan-200/60' },
};

const ENTITY_LABELS: Record<string, string> = {
  products: 'Sản phẩm',
  categories: 'Danh mục',
  brands: 'Thương hiệu',
  orders: 'Đơn hàng',
  quotes: 'Báo giá',
  reviews: 'Đánh giá',
  contacts: 'Liên hệ',
  posts: 'Bài viết',
  settings: 'Cài đặt',
  profiles: 'Tài khoản',
  flash_sales: 'Flash Sale',
  coupons: 'Mã giảm giá',
  compat_rules: 'Quy tắc tương thích',
};

export function AuditLogTable({ initialLogs }: Props) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [clearingLogs, setClearingLogs] = useState(false);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !search ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase()) ||
        l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
        (l.actor?.full_name && l.actor.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (l.actor?.email && l.actor.email.toLowerCase().includes(search.toLowerCase())) ||
        (l.diff && JSON.stringify(l.diff).toLowerCase().includes(search.toLowerCase()));

      const matchAction =
        actionFilter === 'all' || l.action.toLowerCase().includes(actionFilter.toLowerCase());

      const matchEntity = entityFilter === 'all' || l.entity === entityFilter;

      return matchSearch && matchAction && matchEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  const handleClearOldLogs = async () => {
    if (!confirm('Bạn có chắc muốn dọn dẹp các bản ghi nhật ký kiểm toán cũ hơn 90 ngày?')) return;
    setClearingLogs(true);
    try {
      await clearOldAuditLogsAction(90);
      const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
      setLogs((prev) => prev.filter((l) => new Date(l.created_at).getTime() >= cutoff));
      alert('Đã dọn dẹp nhật ký cũ thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi dọn dẹp nhật ký');
    } finally {
      setClearingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            <span>Nhật ký kiểm toán (Audit Logs)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi vết toàn diện mọi hành vi tạo mới, chỉnh sửa, đổi trạng thái và phân quyền trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearOldLogs}
            disabled={clearingLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            {clearingLogs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-slate-400" />}
            Dọn dẹp log &gt; 90 ngày
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số hành động</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{logs.length.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trong 24 giờ qua</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {
                logs.filter(
                  (l) => Date.now() - new Date(l.created_at).getTime() <= 24 * 60 * 60 * 1000
                ).length
              }
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Người thực hiện duy nhất</div>
            <div className="text-xl font-bold text-purple-600 mt-0.5">
              {new Set(logs.map((l) => l.actor_id).filter(Boolean)).size || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo ID, hành động, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Tạo mới (CREATE)</option>
            <option value="UPDATE">Cập nhật (UPDATE)</option>
            <option value="DELETE">Xóa (DELETE)</option>
            <option value="STATUS">Đổi trạng thái</option>
            <option value="MODERATE">Kiểm duyệt</option>
            <option value="STAFF">Phân quyền</option>
            <option value="SETTINGS">Cài đặt</option>
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="products">Sản phẩm</option>
            <option value="orders">Đơn hàng</option>
            <option value="quotes">Báo giá</option>
            <option value="reviews">Đánh giá</option>
            <option value="posts">Bài viết</option>
            <option value="settings">Cài đặt</option>
            <option value="profiles">Tài khoản</option>
            <option value="flash_sales">Flash Sale</option>
            <option value="coupons">Mã giảm giá</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Thời gian</th>
                <th className="py-3.5 px-5">Người thực hiện</th>
                <th className="py-3.5 px-5">Hành động</th>
                <th className="py-3.5 px-5">Đối tượng</th>
                <th className="py-3.5 px-5">Entity ID</th>
                <th className="py-3.5 px-5 text-right">Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Không có bản ghi nhật ký nào phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const actionBadge =
                    ACTION_COLORS[log.action] || {
                      label: log.action,
                      color: 'bg-slate-100 text-slate-600 border-slate-200',
                    };
                  const entityName = ENTITY_LABELS[log.entity] || log.entity;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{new Date(log.created_at).toLocaleDateString('vi-VN')}</div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 overflow-hidden shrink-0 shadow-xs">
                            {log.actor?.avatar_url ? (
                              <img src={log.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (log.actor?.full_name || log.actor?.email || 'A').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                              {log.actor?.full_name || 'Hệ thống'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {log.actor?.email || 'System Action'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${actionBadge.color}`}>
                          {actionBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-xs font-semibold text-slate-800">
                        {entityName}
                      </td>

                      <td className="py-4 px-5 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                        {log.entity_id}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5 text-blue-600" /> Xem Diff
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" /> Chi tiết thay đổi dữ liệu (Diff Snapshot)
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedLog.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Thời gian:</span>
                  <span className="text-slate-900 font-semibold">{new Date(selectedLog.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Người thực hiện:</span>
                  <span className="text-slate-900 font-semibold">{selectedLog.actor?.full_name || selectedLog.actor?.email || 'Hệ thống'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hành động:</span>
                  <span className="text-blue-600 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Đối tượng / Entity ID:</span>
                  <span className="text-slate-700 font-mono">{selectedLog.entity} / {selectedLog.entity_id}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Payload / Thay đổi thuộc tính (JSON):
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-80 shadow-inner">
                  <pre>{JSON.stringify(selectedLog.diff, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
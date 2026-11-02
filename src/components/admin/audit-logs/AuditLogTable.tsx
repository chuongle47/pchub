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
  CREATE: { label: 'Tạo mới', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  UPDATE: { label: 'Cập nhật', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  DELETE: { label: 'Xóa bỏ', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  STATUS_CHANGE: { label: 'Đổi trạng thái', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  MODERATE: { label: 'Kiểm duyệt', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ASSIGN_STAFF_ROLE: { label: 'Phân quyền', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  REVOKE_STAFF_ROLE: { label: 'Thu hồi quyền', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  UPDATE_SETTINGS: { label: 'Đổi cài đặt', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
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
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Nhật ký kiểm toán (Audit Logs)</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Ghi vết toàn diện mọi hành vi tạo mới, chỉnh sửa, đổi trạng thái và phân quyền trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearOldLogs}
            disabled={clearingLogs}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            {clearingLogs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-slate-400" />}
            Dọn dẹp log &gt; 90 ngày
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Tổng số hành động</div>
            <div className="text-xl font-bold text-white mt-0.5">{logs.length.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Trong 24 giờ qua</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {
                logs.filter(
                  (l) => Date.now() - new Date(l.created_at).getTime() <= 24 * 60 * 60 * 1000
                ).length
              }
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Người thực hiện duy nhất</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              {new Set(logs.map((l) => l.actor_id).filter(Boolean)).size || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo ID, hành động, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase font-medium text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Hành động</th>
                <th className="py-3.5 px-4">Đối tượng</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4 text-right">Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                    Không có bản ghi nhật ký nào phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const actionBadge =
                    ACTION_COLORS[log.action] || {
                      label: log.action,
                      color: 'bg-slate-800 text-slate-300 border-slate-700',
                    };
                  const entityName = ENTITY_LABELS[log.entity] || log.entity;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        <div>{new Date(log.created_at).toLocaleDateString('vi-VN')}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 overflow-hidden shrink-0">
                            {log.actor?.avatar_url ? (
                              <img src={log.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (log.actor?.full_name || log.actor?.email || 'A').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white text-xs truncate max-w-[140px]">
                              {log.actor?.full_name || 'Hệ thống'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                              {log.actor?.email || 'System Action'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${actionBadge.color}`}>
                          {actionBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                        {entityName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 truncate max-w-[120px]">
                        {log.entity_id}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <FileCode className="w-3 h-3 text-red-400" /> Xem Diff
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-red-500" /> Chi tiết thay đổi dữ liệu (Diff Snapshot)
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedLog.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Thời gian:</span>
                  <span className="text-white font-medium">{new Date(selectedLog.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Người thực hiện:</span>
                  <span className="text-white font-medium">{selectedLog.actor?.full_name || selectedLog.actor?.email || 'Hệ thống'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hành động:</span>
                  <span className="text-red-400 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Đối tượng / Entity ID:</span>
                  <span className="text-slate-300 font-mono">{selectedLog.entity} / {selectedLog.entity_id}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Payload / Thay đổi thuộc tính (JSON):
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-80">
                  <pre>{JSON.stringify(selectedLog.diff, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
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
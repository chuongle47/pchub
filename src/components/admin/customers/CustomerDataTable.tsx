'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Users,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { updateCustomerRoleAction } from '@/lib/actions/admin-customers';

export interface CustomerWithStats {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  role: 'customer' | 'admin' | 'manager' | 'editor' | 'support';
  created_at: string;
  order_count: number;
  total_spent: number;
  recent_orders?: Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

interface Props {
  initialCustomers: CustomerWithStats[];
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  customer: { label: 'Khách hàng', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  admin: { label: 'Quản trị viên', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
  manager: { label: 'Quản lý', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  editor: { label: 'Biên tập viên', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  support: { label: 'Hỗ trợ CSKH', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
};

export function CustomerDataTable({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [newRole, setNewRole] = useState<any>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        !search ||
        (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search));

      const matchRole = roleFilter === 'all' || c.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [customers, search, roleFilter]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const staffCount = customers.filter((c) => c.role !== 'customer').length;
    const totalSpentAll = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);
    const activeBuyers = customers.filter((c) => (c.order_count || 0) > 0).length;

    return { totalCustomers, staffCount, totalSpentAll, activeBuyers };
  }, [customers]);

  const handleRoleChange = async () => {
    if (!selectedCustomer || !newRole) return;
    setChangingRole(true);
    setErrorMsg(null);
    try {
      await updateCustomerRoleAction(selectedCustomer.id, newRole);
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, role: newRole } : c))
      );
      setSelectedCustomer((prev) => (prev ? { ...prev, role: newRole } : null));
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đổi quyền');
    } finally {
      setChangingRole(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Họ tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Số đơn hàng', 'Tổng chi tiêu', 'Ngày tham gia'];
    const rows = filtered.map((c) => [
      c.id,
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      c.email || '',
      c.phone || '',
      `"${(c.address || '').replace(/"/g, '""')}"`,
      ROLE_LABELS[c.role]?.label || c.role,
      c.order_count,
      c.total_spent,
      new Date(c.created_at).toLocaleDateString('vi-VN'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_khach_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Quản lý khách hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi danh sách người dùng, phân quyền nhân sự và lịch sử mua sắm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Xuất file CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng người dùng</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalCustomers.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khách đã mua hàng</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{stats.activeBuyers.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng chi tiêu</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalSpentAll.toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nhân viên & Quản trị</div>
            <div className="text-xl font-bold text-purple-600 mt-0.5">{stats.staffCount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="manager">Quản lý (Manager)</option>
            <option value="editor">Biên tập (Editor)</option>
            <option value="support">Hỗ trợ (Support)</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Khách hàng</th>
                <th className="py-3.5 px-5">Liên hệ</th>
                <th className="py-3.5 px-5">Vai trò</th>
                <th className="py-3.5 px-5 text-center">Số đơn</th>
                <th className="py-3.5 px-5 text-right">Tổng chi tiêu</th>
                <th className="py-3.5 px-5 text-center">Ngày tham gia</th>
                <th className="py-3.5 px-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const roleBadge = ROLE_LABELS[customer.role] || ROLE_LABELS.customer;
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setNewRole(customer.role);
                      }}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 overflow-hidden shrink-0 font-bold text-xs shadow-xs">
                            {customer.avatar_url ? (
                              <img
                                src={customer.avatar_url}
                                alt={customer.full_name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (customer.full_name || customer.email || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{customer.full_name || 'Chưa đặt tên'}</div>
                            <div className="text-xs text-slate-500">{customer.email || 'Chưa có email'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-500">
                        <div className="font-medium text-slate-800">{customer.phone || 'Chưa có SĐT'}</div>
                        <div className="text-slate-400 truncate max-w-[200px]">{customer.address || '-'}</div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border font-semibold ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-center font-bold text-slate-700">
                        {customer.order_count || 0}
                      </td>

                      <td className="py-4 px-5 text-right font-bold text-slate-900">
                        {(customer.total_spent || 0).toLocaleString('vi-VN')} ₫
                      </td>

                      <td className="py-4 px-5 text-center text-xs text-slate-500">
                        {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setNewRole(customer.role);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          Chi tiết
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

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold overflow-hidden">
                  {selectedCustomer.avatar_url ? (
                    <img src={selectedCustomer.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedCustomer.full_name || selectedCustomer.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.full_name || 'Khách hàng'}</h3>
                  <p className="text-xs text-slate-500">ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                  </div>
                  <div className="text-xs text-slate-900 font-semibold">{selectedCustomer.email || 'Chưa cung cấp'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                  </div>
                  <div className="text-xs text-slate-900 font-semibold">{selectedCustomer.phone || 'Chưa cung cấp'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ
                  </div>
                  <div className="text-xs text-slate-900 font-medium">{selectedCustomer.address || 'Chưa cung cấp'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Tổng đơn hàng
                  </div>
                  <div className="text-xs text-slate-900 font-bold">{selectedCustomer.order_count || 0} đơn</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Tổng chi tiêu
                  </div>
                  <div className="text-xs text-blue-600 font-bold">
                    {(selectedCustomer.total_spent || 0).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Thay đổi quyền hạn tài khoản
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="customer">Khách hàng thông thường</option>
                    <option value="support">Nhân viên hỗ trợ (Support)</option>
                    <option value="editor">Biên tập viên (Editor)</option>
                    <option value="manager">Quản lý cửa hàng (Manager)</option>
                    <option value="admin">Quản trị viên tối cao (Admin)</option>
                  </select>
                  <button
                    onClick={handleRoleChange}
                    disabled={changingRole || newRole === selectedCustomer.role}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    {changingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Lưu quyền mới
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lịch sử đơn hàng gần đây</h4>
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(selectedCustomer.email || selectedCustomer.phone || '')}`}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Xem tất cả đơn <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {(!selectedCustomer.recent_orders || selectedCustomer.recent_orders.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    Chưa có đơn hàng nào từ khách này
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.recent_orders.map((ord) => (
                      <Link
                        key={ord.id}
                        href={`/admin/orders/${ord.id}`}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900">#{ord.order_number}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{ord.total_amount.toLocaleString('vi-VN')} ₫</div>
                          <div className="text-[11px] text-slate-500 capitalize">{ord.status}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedCustomer(null)}
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

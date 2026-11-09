'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Percent,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
} from '@/lib/actions/admin-promotions';

interface CouponItem {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  max_discount: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface Props {
  coupons: CouponItem[];
}

export function CouponManagement({ coupons }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(500000);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(200000);
  const [maxUses, setMaxUses] = useState<number | ''>(1000);
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setCode('');
    setType('percent');
    setValue(10);
    setMinOrder(500000);
    setMaxDiscount(200000);
    setMaxUses(500);
    setExpiresAt('');
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingId(c.id);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinOrder(c.min_order);
    setMaxDiscount(c.max_discount ?? '');
    setMaxUses(c.max_uses ?? '');
    setExpiresAt(c.expires_at ? c.expires_at.slice(0, 10) : '');
    setIsActive(c.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        min_order: Number(minOrder || 0),
        max_discount: maxDiscount ? Number(maxDiscount) : null,
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: isActive,
      };

      if (editingId) {
        await updateCouponAction(editingId, payload);
      } else {
        await createCouponAction(payload);
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu mã giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${couponCode}"?`)) return;
    try {
      await deleteCouponAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span>Mã Giảm Giá & Voucher</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mã coupon khuyến mãi, giảm giá % đơn hàng hoặc trừ tiền trực tiếp
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã mới</span>
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Mã Coupon</th>
              <th className="px-5 py-3.5">Loại & Mức giảm</th>
              <th className="px-5 py-3.5">Đơn tối thiểu</th>
              <th className="px-5 py-3.5">Giảm tối đa</th>
              <th className="px-5 py-3.5 text-center">Đã dùng / Giới hạn</th>
              <th className="px-5 py-3.5 text-center">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 inline-block shadow-xs">
                    {c.code}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-bold text-slate-900 text-sm">
                    {c.type === 'percent' ? `Giảm ${c.value}%` : `Giảm ${Number(c.value).toLocaleString('vi-VN')} ₫`}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500 font-medium">
                  {c.min_order > 0 ? `${Number(c.min_order).toLocaleString('vi-VN')} ₫` : 'Không giới hạn'}
                </td>
                <td className="px-5 py-4 text-slate-500 font-medium">
                  {c.max_discount ? `${Number(c.max_discount).toLocaleString('vi-VN')} ₫` : 'Không trần'}
                </td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">
                  {c.used_count} / {c.max_uses ? c.max_uses : '∞'}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      c.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {c.is_active ? 'Kích hoạt' : 'Tạm tắt'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {editingId ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Coupon * (Ví dụ: SALE10, FREESHIP)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="PCHUB10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-700 font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại giảm giá
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm số tiền (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức giảm ({type === 'percent' ? '%' : 'VNĐ'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Không trần"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượt dùng tối đa
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Không giới hạn"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">Kích hoạt mã giảm giá này</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
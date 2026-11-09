'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Percent,
  Check,
} from 'lucide-react';
import {
  createShippingZoneAction,
  updateShippingZoneAction,
  deleteShippingZoneAction,
  updateTaxSettingsAction,
} from '@/lib/actions/admin-orders';

interface ShippingZone {
  id: string;
  name: string;
  provinces: string[];
  fee: number;
  free_from: number | null;
  is_active: boolean;
}

interface Props {
  zones: ShippingZone[];
  taxPercentage: number;
}

export function ShippingManagement({ zones, taxPercentage }: Props) {
  const router = useRouter();

  // Tax state
  const [vat, setVat] = useState(taxPercentage);
  const [savingTax, setSavingTax] = useState(false);
  const [taxSaved, setTaxSaved] = useState(false);

  // Modal Zone state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [provincesInput, setProvincesInput] = useState('');
  const [fee, setFee] = useState<number>(30000);
  const [freeFrom, setFreeFrom] = useState<number | ''>(2000000);
  const [isActive, setIsActive] = useState(true);

  const [savingZone, setSavingZone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setProvincesInput('');
    setFee(30000);
    setFreeFrom(2000000);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (zone: ShippingZone) => {
    setEditingId(zone.id);
    setName(zone.name);
    setProvincesInput(zone.provinces.join(', '));
    setFee(zone.fee);
    setFreeFrom(zone.free_from ?? '');
    setIsActive(zone.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTax(true);
    try {
      await updateTaxSettingsAction(Number(vat));
      setTaxSaved(true);
      setTimeout(() => setTaxSaved(false), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu cấu hình thuế');
    } finally {
      setSavingTax(false);
    }
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingZone(true);
    setError(null);

    try {
      const provinces = provincesInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        provinces,
        fee: Number(fee),
        free_from: freeFrom ? Number(freeFrom) : null,
        is_active: isActive,
      };

      if (editingId) {
        await updateShippingZoneAction(editingId, payload);
      } else {
        await createShippingZoneAction(payload);
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu vùng vận chuyển.');
    } finally {
      setSavingZone(false);
    }
  };

  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vùng vận chuyển "${name}"?`)) return;
    try {
      await deleteShippingZoneAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa vùng.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Vận Chuyển & Thuế</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình biểu phí giao hàng theo khu vực, chính sách miễn phí ship và thuế VAT
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm vùng giao hàng</span>
        </button>
      </div>

      {/* Tax configuration card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Cấu hình thuế giá trị gia tăng (VAT)
          </h2>
        </div>

        <form onSubmit={handleSaveTax} className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tỷ lệ thuế VAT (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={vat}
              onChange={(e) => setVat(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingTax}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-sm transition-colors"
          >
            {savingTax ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : taxSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{taxSaved ? 'Đã lưu' : 'Cập nhật thuế'}</span>
          </button>
        </form>
      </div>

      {/* Shipping Zones Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Tên vùng vận chuyển</th>
              <th className="px-5 py-3.5">Tỉnh / Thành phố áp dụng</th>
              <th className="px-5 py-3.5">Phí giao hàng</th>
              <th className="px-5 py-3.5">Miễn phí từ</th>
              <th className="px-5 py-3.5 text-center">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>{z.name}</span>
                </td>
                <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                  {z.provinces && z.provinces.length > 0 ? z.provinces.join(', ') : 'Toàn Quốc'}
                </td>
                <td className="px-5 py-4 font-bold text-slate-900">
                  {Number(z.fee).toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-5 py-4 text-emerald-700 font-semibold">
                  {z.free_from ? `${Number(z.free_from).toLocaleString('vi-VN')} ₫` : 'Không áp dụng'}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      z.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {z.is_active ? 'Hoạt động' : 'Tạm tắt'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(z)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(z.id, z.name)}
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

      {/* Modal Add / Edit Shipping Zone */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {editingId ? 'Sửa Vùng Giao Hàng' : 'Thêm Vùng Giao Hàng Mới'}
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

            <form onSubmit={handleSaveZone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên vùng giao hàng *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nội thành Hà Nội & TP.HCM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh sách tỉnh/thành (phân tách bởi dấu phẩy)
                </label>
                <textarea
                  rows={2}
                  value={provincesInput}
                  onChange={(e) => setProvincesInput(e.target.value)}
                  placeholder="Hà Nội, Hồ Chí Minh, Hải Phòng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cước phí ship (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Miễn phí từ (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={freeFrom}
                    onChange={(e) => setFreeFrom(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Bỏ trống nếu không áp dụng"
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
                <span className="text-xs font-semibold text-slate-800">Kích hoạt vùng giao hàng này</span>
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
                  disabled={savingZone}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {savingZone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Lưu vùng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
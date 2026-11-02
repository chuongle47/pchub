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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vận Chuyển & Thuế</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cấu hình biểu phí giao hàng theo khu vực, chính sách miễn phí ship và thuế VAT
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm vùng giao hàng</span>
        </button>
      </div>

      {/* Tax configuration card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Cấu hình thuế giá trị gia tăng (VAT)
          </h2>
        </div>

        <form onSubmit={handleSaveTax} className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
          <div className="w-full">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tỷ lệ thuế VAT (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={vat}
              onChange={(e) => setVat(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingTax}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap"
          >
            {savingTax ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : taxSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{taxSaved ? 'Đã lưu' : 'Cập nhật thuế'}</span>
          </button>
        </form>
      </div>

      {/* Shipping Zones Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Tên vùng vận chuyển</th>
              <th className="p-4">Tỉnh / Thành phố áp dụng</th>
              <th className="p-4">Phí giao hàng</th>
              <th className="p-4">Miễn phí từ</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-semibold text-white flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>{z.name}</span>
                </td>
                <td className="p-4 text-slate-300 max-w-xs truncate">
                  {z.provinces && z.provinces.length > 0 ? z.provinces.join(', ') : 'Toàn Quốc'}
                </td>
                <td className="p-4 font-bold text-white">
                  {Number(z.fee).toLocaleString('vi-VN')} ₫
                </td>
                <td className="p-4 text-emerald-400 font-medium">
                  {z.free_from ? `${Number(z.free_from).toLocaleString('vi-VN')} ₫` : 'Không áp dụng'}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      z.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {z.is_active ? 'Hoạt động' : 'Tạm tắt'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(z)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(z.id, z.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingId ? 'Sửa Vùng Giao Hàng' : 'Thêm Vùng Giao Hàng Mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveZone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tên vùng giao hàng *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nội thành Hà Nội & TP.HCM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Danh sách tỉnh/thành (phân tách bởi dấu phẩy)
                </label>
                <textarea
                  rows={2}
                  value={provincesInput}
                  onChange={(e) => setProvincesInput(e.target.value)}
                  placeholder="Hà Nội, Hồ Chí Minh, Hải Phòng..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cước phí ship (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Miễn phí từ (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={freeFrom}
                    onChange={(e) => setFreeFrom(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Bỏ trống nếu không áp dụng"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-medium text-white">Kích hoạt vùng giao hàng này</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingZone}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-60"
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
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Zap,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  createFlashSaleAction,
  updateFlashSaleAction,
} from '@/lib/actions/admin-promotions';

interface Props {
  initialData?: any;
  initialItems?: any[];
  allProducts: { id: string; name: string; price: number; stock: number }[];
}

export function FlashSaleForm({ initialData, initialItems = [], allProducts }: Props) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || '');
  const [bannerUrl, setBannerUrl] = useState(initialData?.banner_url || '');

  // Format ISO to datetime-local
  const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [startsAt, setStartsAt] = useState(
    toLocalInput(initialData?.starts_at) || new Date().toISOString().slice(0, 16)
  );
  const [endsAt, setEndsAt] = useState(
    toLocalInput(initialData?.ends_at) ||
      new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  // Sale items: array of { product_id, sale_price, quantity_limit }
  const [items, setItems] = useState<
    { product_id: string; sale_price: number; quantity_limit: number }[]
  >(
    initialItems.map((i) => ({
      product_id: i.product_id,
      sale_price: i.sale_price,
      quantity_limit: i.quantity_limit,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemRow = () => {
    setItems([...items, { product_id: allProducts[0]?.id || '', sale_price: 0, quantity_limit: 5 }]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleProductChange = (idx: number, prodId: string) => {
    const p = allProducts.find((item) => item.id === prodId);
    const updated = [...items];
    updated[idx].product_id = prodId;
    updated[idx].sale_price = p ? Math.round(p.price * 0.85) : 0; // Default 15% off
    setItems(updated);
  };

  const handlePriceChange = (idx: number, val: number) => {
    const updated = [...items];
    updated[idx].sale_price = val;
    setItems(updated);
  };

  const handleLimitChange = (idx: number, val: number) => {
    const updated = [...items];
    updated[idx].quantity_limit = Math.max(val, 1);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const validItems = items.filter((i) => i.product_id && i.sale_price > 0);
    if (validItems.length === 0) {
      setError('Vui lòng thêm ít nhất 1 sản phẩm với giá sale lớn hơn 0.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        banner_url: bannerUrl.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        is_active: isActive,
      };

      if (isEditing) {
        await updateFlashSaleAction(initialData.id, payload, validItems);
      } else {
        await createFlashSaleAction(payload, validItems);
      }

      router.push('/admin/flash-sales');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu chiến dịch');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/flash-sales"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isEditing ? `Sửa Flash Sale: ${initialData.name}` : 'Tạo Chiến Dịch Flash Sale Mới'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Thiết lập khung giờ vàng, giá xả kho và danh sách linh kiện giảm giá sốc
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditing ? 'Lưu thay đổi' : 'Kích hoạt Flash Sale'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Campaign Details */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Cấu hình chiến dịch</span>
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tên chương trình Flash Sale *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Giờ Vàng Xả Kho Linh Kiện PC - Giảm Đến 40%"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Thời gian bắt đầu *
            </label>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Thời gian kết thúc *
            </label>
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            URL Banner chương trình (Tùy chọn)
          </label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
          />
          <div>
            <span className="text-xs font-semibold text-white block">Kích hoạt hiển thị chiến dịch</span>
            <span className="text-[10px] text-slate-400">Đồng hồ đếm ngược và giá sale sẽ tự động bật khi tới giờ</span>
          </div>
        </label>
      </div>

      {/* Sale Products Selection */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Sản phẩm tham gia Flash Sale ({items.length})
          </h2>
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const prod = allProducts.find((p) => p.id === item.product_id);
            const discountPercent = prod && item.sale_price > 0 && item.sale_price < prod.price
              ? Math.round((1 - item.sale_price / prod.price) * 100)
              : 0;

            return (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] text-slate-400 mb-1">Chọn sản phẩm</label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">-- Chọn linh kiện --</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Gốc: {Number(p.price).toLocaleString('vi-VN')} ₫)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className="block text-[10px] text-slate-400 mb-1">Giá Sale (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={item.sale_price}
                    onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold"
                  />
                  {discountPercent > 0 && (
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      Giảm {discountPercent}%
                    </span>
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <label className="block text-[10px] text-slate-400 mb-1">Giới hạn suất</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity_limit}
                    onChange={(e) => handleLimitChange(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
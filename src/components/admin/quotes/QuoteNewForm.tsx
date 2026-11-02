'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import { createQuoteAction } from '@/lib/actions/admin-quotes';

interface Props {
  categories: { id: string; name: string; slug: string }[];
  products: { id: string; name: string; price: number; category_id: string }[];
}

export function QuoteNewForm({ categories, products }: Props) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  // Selected items: array of { category_id, product_id, quantity, unit_price }
  const [items, setItems] = useState<
    { category_id: string; product_id: string; quantity: number; unit_price: number }[]
  >([
    { category_id: categories[0]?.id || '', product_id: '', quantity: 1, unit_price: 0 },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemRow = () => {
    setItems([...items, { category_id: categories[0]?.id || '', product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleCategoryChange = (idx: number, catId: string) => {
    const updated = [...items];
    updated[idx].category_id = catId;
    updated[idx].product_id = '';
    updated[idx].unit_price = 0;
    setItems(updated);
  };

  const handleProductChange = (idx: number, prodId: string) => {
    const targetProd = products.find((p) => p.id === prodId);
    const updated = [...items];
    updated[idx].product_id = prodId;
    updated[idx].unit_price = targetProd ? targetProd.price : 0;
    setItems(updated);
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    const updated = [...items];
    updated[idx].quantity = Math.max(qty, 1);
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const validItems = items.filter((i) => i.product_id && i.category_id);
    if (validItems.length === 0) {
      setError('Vui lòng chọn ít nhất 1 linh kiện hợp lệ.');
      setSaving(false);
      return;
    }

    try {
      const res = await createQuoteAction(
        {
          customer_name: customerName,
          phone,
          email,
          note,
        },
        validItems
      );

      router.push(`/admin/quotes/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo báo giá.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quotes"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Tạo Báo Giá Cấu Hình Mới</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Lựa chọn linh kiện chuẩn từ kho sản phẩm để gửi báo giá cho khách hàng
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Tạo báo giá</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Customer Info */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Thông tin khách hàng
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Họ tên khách hàng *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0988888888"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email nhận báo giá
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="khachhang@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Ghi chú nhu cầu của khách
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cần build dàn PC chơi GTA V, làm đồ họa render Premiere..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Component Selection Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Linh kiện cấu hình
          </h2>
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm dòng linh kiện</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const filteredProds = products.filter((p) => p.category_id === item.category_id);

            return (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-full sm:w-48">
                  <select
                    value={item.category_id}
                    onChange={(e) => handleCategoryChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 w-full">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">-- Chọn linh kiện trong kho --</option>
                    {filteredProds.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({Number(p.price).toLocaleString('vi-VN')} ₫)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-bold"
                  />
                </div>

                <div className="w-32 text-right font-bold text-amber-400 text-xs">
                  {Number(item.unit_price * item.quantity).toLocaleString('vi-VN')} ₫
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
          <span>Tổng tiền dự toán:</span>
          <span className="text-amber-400 text-lg font-mono">
            {Number(total).toLocaleString('vi-VN')} ₫
          </span>
        </div>
      </div>
    </form>
  );
}
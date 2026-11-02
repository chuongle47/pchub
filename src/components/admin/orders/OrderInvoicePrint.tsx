'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';

interface InvoiceProps {
  order: any;
  items: any[];
  onClose: () => void;
}

export function OrderInvoicePrint({ order, items, onClose }: InvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const address = typeof order.shipping_address === 'object'
    ? `${order.shipping_address.address || ''}, ${order.shipping_address.ward || ''}, ${order.shipping_address.district || ''}, ${order.shipping_address.province || ''}`
    : String(order.shipping_address || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <div className="text-xs font-bold uppercase tracking-wider">Xem trước Hóa đơn / Phiếu giao hàng</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>In ngay (Print)</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 space-y-8 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div>
              <div className="text-2xl font-black text-blue-600 tracking-wider">PCHUB STORE</div>
              <div className="text-xs text-slate-500 mt-1">Cửa hàng linh kiện máy tính & Build PC chuyên nghiệp</div>
              <div className="text-xs text-slate-600 mt-0.5">Địa chỉ: Tòa nhà Tech Tower, Cầu Giấy, Hà Nội</div>
              <div className="text-xs text-slate-600">Hotline: 1900 6868 | Email: support@pchub.vn</div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-900">PHIẾU GIAO HÀNG</h1>
              <div className="text-xs font-mono font-bold text-blue-600 mt-1">Mã đơn: {order.code}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px]">
                Người nhận hàng
              </div>
              <div className="font-semibold text-slate-800 text-sm">{order.customer_name}</div>
              <div className="text-slate-600 mt-1">SĐT: <strong>{order.phone}</strong></div>
              {order.email && <div className="text-slate-600">Email: {order.email}</div>}
              <div className="text-slate-700 mt-1 leading-relaxed">
                Địa chỉ: {address}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px]">
                Thanh toán & Giao dịch
              </div>
              <div className="text-slate-600">Phương thức: <strong className="uppercase">{order.payment_method}</strong></div>
              <div className="text-slate-600 mt-1">
                Trạng thái: <strong>{order.payment_status === 'paid' ? 'ĐÃ THANH TOÁN' : 'THU TIỀN KHI GIAO (COD)'}</strong>
              </div>
              {order.note && (
                <div className="text-slate-700 mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-[11px]">
                  <strong>Ghi chú:</strong> {order.note}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 border-b border-slate-200">STT</th>
                <th className="p-3 border-b border-slate-200">Tên linh kiện / Sản phẩm</th>
                <th className="p-3 border-b border-slate-200">SKU</th>
                <th className="p-3 border-b border-slate-200 text-right">Đơn giá</th>
                <th className="p-3 border-b border-slate-200 text-center">SL</th>
                <th className="p-3 border-b border-slate-200 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="p-3 text-slate-500 font-medium">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-900">{item.name_snapshot}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{item.sku_snapshot || '-'}</td>
                  <td className="p-3 text-right">{Number(item.price_snapshot).toLocaleString('vi-VN')} ₫</td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {Number(item.price_snapshot * item.quantity).toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span>{Number(order.subtotal || order.total).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span>{Number(order.shipping_fee || 0).toLocaleString('vi-VN')} ₫</span>
              </div>
              {Boolean(order.discount && order.discount > 0) && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá coupon:</span>
                  <span>-{Number(order.discount).toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>TỔNG CỘNG:</span>
                <span className="text-blue-600 text-base">{Number(order.total).toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-600">
            <div>
              <div className="font-bold text-slate-800">Người lập phiếu</div>
              <div className="text-[11px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</div>
              <div className="h-16" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Người nhận hàng</div>
              <div className="text-[11px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</div>
              <div className="h-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
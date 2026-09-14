'use client';

import React from 'react';
import { ShoppingCart, Cpu, CheckCircle2, ArrowRight, X, AlertCircle, Trash2, Layers } from 'lucide-react';

export interface CartChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildItemsCount: number;
  buildTotal: number;
  cartItemCount: number;
  cartTotal: number;
  onCheckoutBuildOnly: () => void;
  onAddToCartBuildOnly: () => void;
  onCheckoutAll: () => void;
  onAddToCartAll: () => void;
}

export default function CartChoiceModal({
  isOpen,
  onClose,
  buildItemsCount,
  buildTotal,
  cartItemCount,
  cartTotal,
  onCheckoutBuildOnly,
  onAddToCartBuildOnly,
  onCheckoutAll,
  onAddToCartAll,
}: CartChoiceModalProps) {
  if (!isOpen) return null;

  const combinedTotal = buildTotal + cartTotal;
  const combinedCount = cartItemCount + buildItemsCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">Xác Nhận Giỏ Hàng & Thanh Toán</h3>
              <p className="text-xs text-blue-100 mt-0.5">Lựa chọn phương thức thanh toán cho dàn PC vừa build</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-amber-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Giỏ hàng của bạn đang có sẵn <span className="text-amber-900 font-bold">{cartItemCount} sản phẩm</span> khác.</p>
            <p className="text-xs text-amber-700 mt-0.5">Vui lòng chọn thanh toán <strong>chỉ riêng dàn PC này</strong> hoặc <strong>gộp thanh toán toàn bộ</strong> giỏ hàng.</p>
          </div>
        </div>

        {/* Content Body / Options */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Build Only */}
          <div className="border-2 border-blue-200 hover:border-blue-500 bg-blue-50/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                  <Cpu size={14} /> Chỉ Dàn PC Vừa Build
                </span>
              </div>
              
              <h4 className="font-bold text-slate-800 text-base mb-1">Thanh Toán Theo Build PC</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Hệ thống sẽ làm sạch sản phẩm cũ trong giỏ hàng và <strong>chỉ thanh toán {buildItemsCount} linh kiện</strong> trong dàn PC này.
              </p>

              <div className="bg-white rounded-xl p-3 border border-blue-100 space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Số lượng linh kiện:</span>
                  <span className="font-semibold text-slate-800">{buildItemsCount} linh kiện</span>
                </div>
                <div className="flex justify-between items-center text-slate-800 font-bold text-sm pt-1 border-t border-slate-100">
                  <span>Tổng tiền Build PC:</span>
                  <span className="text-blue-600 text-base">{buildTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onCheckoutBuildOnly}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Thanh Toán Dàn PC Này</span>
                <ArrowRight size={16} />
              </button>
              
              <button
                onClick={onAddToCartBuildOnly}
                className="w-full bg-white hover:bg-blue-50 text-blue-700 font-semibold py-2 px-3 rounded-xl border border-blue-300 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingCart size={14} />
                <span>Chỉ thêm dàn PC vào giỏ</span>
              </button>
            </div>
          </div>

          {/* Option 2: Combine All */}
          <div className="border-2 border-purple-200 hover:border-purple-500 bg-purple-50/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                  <Layers size={14} /> Gộp Tất Cả ({combinedCount} Sản Phẩm)
                </span>
              </div>
              
              <h4 className="font-bold text-slate-800 text-base mb-1">Thanh Toán Tất Cả Sản Phẩm</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Gộp dàn PC vừa build vào giỏ hàng hiện tại ({cartItemCount} món cũ + {buildItemsCount} linh kiện PC).
              </p>

              <div className="bg-white rounded-xl p-3 border border-purple-100 space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng số lượng sản phẩm:</span>
                  <span className="font-semibold text-slate-800">{combinedCount} sản phẩm</span>
                </div>
                <div className="flex justify-between items-center text-slate-800 font-bold text-sm pt-1 border-t border-slate-100">
                  <span>Tổng tiền tất cả:</span>
                  <span className="text-purple-600 text-base">{combinedTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onCheckoutAll}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer"
              >
                <span>Thanh Toán Tất Cả ({combinedCount} Món)</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onAddToCartAll}
                className="w-full bg-white hover:bg-purple-50 text-purple-700 font-semibold py-2 px-3 rounded-xl border border-purple-300 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingCart size={14} />
                <span>Gộp tất cả vào giỏ hàng</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy / Giữ nguyên giỏ hàng
          </button>
        </div>

      </div>
    </div>
  );
}

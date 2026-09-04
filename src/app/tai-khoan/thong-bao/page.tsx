'use client';

import { Bell, Package, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Đơn hàng đang giao',
    message: 'Đơn hàng ORD-20260820-0089 đã được bàn giao cho đơn vị vận chuyển GHN và đang trên đường đến bạn.',
    time: '10 phút trước',
    unread: true,
    icon: Package,
    iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    id: 2,
    title: 'Ưu đãi mã giảm giá mới',
    message: 'Sản phẩm ASUS ROG Strix RTX 4070 Ti Super đang có ưu đãi giảm giá 5%. Áp dụng mã PCHUB10.',
    time: '2 giờ trước',
    unread: false,
    icon: Tag,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    id: 3,
    title: 'Tiếp nhận yêu cầu bảo hành',
    message: 'Yêu cầu bảo hành mã WC-2026-0809 đã được kỹ thuật viên tiếp nhận và đang tiến hành kiểm tra.',
    time: 'Hôm qua',
    unread: false,
    icon: ShieldCheck,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Thông báo của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật tin tức đơn hàng, bảo hành và khuyến mãi mới nhất</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          3 thông báo
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
        {NOTIFICATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                item.unread ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    {item.title}
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
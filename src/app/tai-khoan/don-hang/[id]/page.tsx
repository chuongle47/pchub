'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

export default function OrderDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tai-khoan/don-hang');
  }, [router]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
        <Package size={22} />
      </div>
      <p className="text-slate-600 text-xs font-semibold">Đang chuyển hướng về quản lý đơn hàng...</p>
    </div>
  );
}
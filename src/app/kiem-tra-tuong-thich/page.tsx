'use client';

import Link from 'next/link';
import { useBuilderStore } from '@/lib/store';

export default function CompatibilityPage() {
  const { slots, totalPrice, clearBuild } = useBuilderStore();
  const selected = Object.entries(slots).filter(([, product]) => product);
  return <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-[900px] mx-auto px-4"><Link href="/" className="text-sm text-gray-500">Trang chủ</Link><div className="text-center my-8"><h1 className="text-3xl font-bold">🔧 Kiểm tra tương thích linh kiện</h1><p className="text-gray-500 mt-2">Chọn linh kiện để kiểm tra cấu hình.</p></div><div className="bg-white border rounded-xl p-6"><div className="flex justify-between mb-5"><h2 className="font-bold">Cấu hình hiện tại</h2><button type="button" onClick={clearBuild} className="text-sm text-red-500">Xóa cấu hình</button></div>{selected.length ? selected.map(([slot, product]) => <div key={slot} className="flex justify-between border-b py-3 text-sm"><span className="uppercase font-semibold">{slot}</span><span>{product?.name}</span><span className="font-mono text-blue-600">{product?.price.toLocaleString('vi-VN')} ₫</span></div>) : <p className="text-gray-500 py-8 text-center">Chưa có linh kiện nào. Hãy bắt đầu từ PC Builder.</p>}<div className="flex justify-between font-bold mt-5"><span>Tổng dự kiến</span><span className="text-blue-600">{totalPrice().toLocaleString('vi-VN')} ₫</span></div></div></div></div>;
}

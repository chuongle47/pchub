import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang không tồn tại</h1>
        <p className="text-gray-500 mb-8">Trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <Home size={18} /> Trang chủ
          </Link>
          <Link href="/search" className="flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
            <Search size={18} /> Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}

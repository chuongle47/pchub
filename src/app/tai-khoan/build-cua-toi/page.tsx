'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Edit3, Plus, Share2, Trash2, SlidersHorizontal, Monitor, CheckCircle2, Heart } from 'lucide-react';

type Build = { id: string; name: string; purpose: 'Gaming' | 'Streaming'; price: number; parts: string; updated: string; image: string; status: string };

const BUILDS: Build[] = [
  { id: 'build-01', name: 'My Gaming Beast Build 2026', purpose: 'Gaming', price: 55820000, parts: 'i9-14900K · RTX 4090 · 64GB DDR5', updated: '20/08/2026', image: '/images/hero-pc.jpg', status: 'Tương thích 100%' },
  { id: 'build-02', name: 'Streaming Setup 2026', purpose: 'Streaming', price: 68990000, parts: 'Ryzen 9 7950X · RTX 4080 · 64GB DDR5', updated: '12/08/2026', image: '/images/build-neon.jpg', status: 'Tương thích 100%' },
];

export default function MyBuildsPage() {
  const [filter, setFilter] = useState<'all' | Build['purpose']>('all');
  const [builds, setBuilds] = useState(BUILDS);
  const visibleBuilds = filter === 'all' ? builds : builds.filter(build => build.purpose === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Build PC của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và tiếp tục xây dựng các cấu hình máy tính đã lưu</p>
        </div>
        <Link
          href="/build-pc"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={16} /> Tạo cấu hình mới
        </Link>
      </div>

      {/* Toolbar filters */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          {(['all', 'Gaming', 'Streaming'] as const).map(type => {
            const count = type === 'all' ? builds.length : builds.filter(b => b.purpose === type).length;
            const isSelected = filter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type === 'all' ? 'Tất cả' : type} ({count})
              </button>
            );
          })}
        </div>

        <button type="button" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
          <SlidersHorizontal size={14} /> Mới cập nhật
        </button>
      </div>

      {/* Builds List */}
      <div className="grid sm:grid-cols-2 gap-5">
        {visibleBuilds.map(build => {
          const partsArray = build.parts.split(' · ');
          return (
            <article key={build.id} className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img src={build.image} alt={build.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                  {build.purpose}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <CheckCircle2 size={12} /> {build.status}
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{build.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Cập nhật lần cuối: {build.updated}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div><span className="text-[10px] text-slate-400 font-bold block uppercase">CPU</span><strong className="text-slate-800 font-bold truncate block">{partsArray[0]}</strong></div>
                  <div><span className="text-[10px] text-slate-400 font-bold block uppercase">GPU</span><strong className="text-slate-800 font-bold truncate block">{partsArray[1]}</strong></div>
                  <div><span className="text-[10px] text-slate-400 font-bold block uppercase">RAM</span><strong className="text-slate-800 font-bold truncate block">{partsArray[2]}</strong></div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="font-extrabold text-blue-600 text-base font-mono">
                    {build.price.toLocaleString('vi-VN')} ₫
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link href="/build-pc" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors" title="Chỉnh sửa">
                      <Edit3 size={15} />
                    </Link>
                    <button type="button" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors" title="Sao chép">
                      <Copy size={15} />
                    </button>
                    <button type="button" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors" title="Chia sẻ">
                      <Share2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilds(current => current.filter(item => item.id !== build.id))}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa cấu hình"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visibleBuilds.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Monitor size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Chưa có cấu hình PC nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Tạo các cấu hình PC gaming hoặc đồ họa tùy chỉnh và lưu lại tại đây.</p>
        </div>
      )}
    </div>
  );
}

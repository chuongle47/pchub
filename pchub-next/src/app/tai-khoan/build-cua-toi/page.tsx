'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Edit3, Plus, Share2, Trash2, SlidersHorizontal } from 'lucide-react';

type Build = { id: string; name: string; purpose: 'Gaming' | 'Streaming'; price: number; parts: string; updated: string; image: string; status: string };

const BUILDS: Build[] = [
  { id: 'build-01', name: 'My Gaming Beast Build 2026', purpose: 'Gaming', price: 55820000, parts: 'i9-14900K · RTX 4090 · 64GB DDR5', updated: '20/08/2026', image: '/images/hero-pc.jpg', status: 'Tương thích' },
  { id: 'build-02', name: 'Streaming Setup 2026', purpose: 'Streaming', price: 68990000, parts: 'Ryzen 9 7950X · RTX 4080 · 64GB DDR5', updated: '12/08/2026', image: '/images/build-neon.jpg', status: 'Tương thích' },
];

export default function MyBuildsPage() {
  const [filter, setFilter] = useState<'all' | Build['purpose']>('all');
  const [builds, setBuilds] = useState(BUILDS);
  const visibleBuilds = filter === 'all' ? builds : builds.filter(build => build.purpose === filter);

  return <div className="my-builds-page">
    <div className="my-builds-heading"><div><p>Cấu hình đã lưu</p><h1>Build PC của tôi</h1><span>Quản lý và tiếp tục xây dựng các cấu hình của bạn</span></div><Link href="/build-pc" className="build-new-button"><Plus size={15} /> Tạo build mới</Link></div>
    <div className="build-toolbar"><div className="build-filters"><button type="button" className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>Tất cả ({builds.length})</button><button type="button" className={filter === 'Gaming' ? 'selected' : ''} onClick={() => setFilter('Gaming')}>Gaming ({builds.filter(build => build.purpose === 'Gaming').length})</button><button type="button" className={filter === 'Streaming' ? 'selected' : ''} onClick={() => setFilter('Streaming')}>Streaming ({builds.filter(build => build.purpose === 'Streaming').length})</button></div><button type="button" className="sort-builds"><SlidersHorizontal size={14} /> Mới cập nhật</button></div>
    <div className="build-list">{visibleBuilds.map(build => <article key={build.id} className="saved-build-card"><div className="saved-build-image"><img src={build.image} alt={build.name} /><span>{build.purpose}</span><button type="button" className="build-star" aria-label="Đánh dấu build">♡</button></div><div className="saved-build-content"><div className="saved-build-top"><div><h2>{build.name}</h2><p>Cập nhật {build.updated}</p></div><span className="build-compatible">✓ {build.status}</span></div><div className="saved-build-specs"><div><small>CPU</small><strong>{build.parts.split(' · ')[0]}</strong></div><div><small>GPU</small><strong>{build.parts.split(' · ')[1]}</strong></div><div><small>RAM</small><strong>{build.parts.split(' · ')[2]}</strong></div></div><div className="saved-build-footer"><strong>{build.price.toLocaleString('vi-VN')} ₫</strong><div><button type="button"><Edit3 size={13} /> Sửa</button><button type="button"><Copy size={13} /> Sao chép</button><button type="button"><Share2 size={13} /> Chia sẻ</button><button type="button" className="delete-build" aria-label="Xóa build" onClick={() => setBuilds(current => current.filter(item => item.id !== build.id))}><Trash2 size={14} /></button></div></div></div></article>)}</div>{visibleBuilds.length === 0 && <div className="build-empty">Chưa có cấu hình trong nhóm này.</div>}
  </div>;
}

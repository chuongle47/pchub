'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function WishlistPage() {
  const ids = useWishlistStore(state => state.ids);
  const toggle = useWishlistStore(state => state.toggle);
  const addItem = useCartStore(state => state.addItem);
  const setOpen = useCartStore(state => state.setOpen);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (!ids || ids.length === 0) {
        setProducts([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(','))}`);
        const data = await res.json();
        if (data.products) {
          const mapped = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            nameVi: p.name,
            price: Number(p.price),
            category: p.category_name || 'Linh kiện',
            brand: p.brand_name || 'Chính hãng',
            images: [p.image_url || '/images/gpu-strix.jpg']
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      }
    }
    loadWishlistProducts();
  }, [ids]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Danh sách yêu thích</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi biến động giá và lưu trữ các sản phẩm quan tâm</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          {products.length} sản phẩm
        </span>
      </div>

      {products.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(product => (
            <article key={product.id} className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative bg-slate-50 aspect-square p-6 flex items-center justify-center">
                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                  <img src={product.images[0]} alt={product.nameVi} className="max-w-full max-h-full object-contain" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-sm border border-slate-200 text-rose-500 flex items-center justify-center hover:bg-rose-50 transition-all"
                  aria-label="Bỏ yêu thích"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">{product.brand} · {product.category}</span>
                  <Link href={`/product/${product.slug}`} className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-blue-600 mt-1 leading-relaxed">
                    {product.nameVi}
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <span className="font-extrabold text-blue-600 text-base font-mono block">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      addItem({ id: product.id, name: product.nameVi, price: product.price, image: product.images[0], category: product.category, brand: product.brand, slug: product.slug });
                      setOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-200"
                  >
                    <ShoppingCart size={15} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Heart size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Chưa có sản phẩm yêu thích</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Nhấn biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại danh sách theo dõi tại đây.</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            Khám phá sản phẩm <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
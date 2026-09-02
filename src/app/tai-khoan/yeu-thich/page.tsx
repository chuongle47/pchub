'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function WishlistPage() {
  const ids = useWishlistStore(state => state.ids);
  const toggle = useWishlistStore(state => state.toggle);
  const addItem = useCartStore(state => state.addItem);
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
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Danh sách yêu thích & Theo dõi giá</h1>
        <span className="text-sm text-gray-500">{products.length} sản phẩm</span>
      </div>
      {products.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <article key={product.id} className="bg-white border rounded-xl overflow-hidden">
              <Link href={`/product/${product.slug}`} className="block bg-gray-50 aspect-square p-4">
                <img src={product.images[0]} alt={product.nameVi} className="w-full h-full object-contain" />
              </Link>
              <div className="p-4">
                <div className="flex justify-between gap-2">
                  <Link href={`/product/${product.slug}`} className="font-semibold text-sm line-clamp-2">{product.nameVi}</Link>
                  <button type="button" onClick={() => toggle(product.id)} className="text-red-500 shrink-0" aria-label="Bỏ yêu thích">
                    <Heart size={17} fill="currentColor" />
                  </button>
                </div>
                <p className="font-mono font-bold text-blue-600 mt-3">{product.price.toLocaleString('vi-VN')} ₫</p>
                <button
                  type="button"
                  onClick={() => addItem({ id: product.id, name: product.nameVi, price: product.price, image: product.images[0], category: product.category, brand: product.brand, slug: product.slug })}
                  className="w-full mt-3 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} />Thêm vào giỏ
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Heart size={42} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Bạn chưa có sản phẩm yêu thích.</p>
          <Link href="/" className="inline-block mt-4 text-blue-600">Khám phá sản phẩm</Link>
        </div>
      )}
    </div>
  );
}
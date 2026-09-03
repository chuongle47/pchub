'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

export default function ProductGrid({ products }: { products: Product[] }) {
  const addItem = useCartStore(state => state.addItem);

  if (!products.length) {
    return <div className="bg-white border rounded-xl p-12 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(product => (
        <article key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/product/${product.slug}`} className="block bg-gray-50 aspect-square p-4">
            <img src={product.images[0]} alt={product.nameVi} className="w-full h-full object-contain" />
          </Link>
          <div className="p-4">
            <p className="text-xs text-blue-600 uppercase">{product.brand} · {product.category}</p>
            <Link href={`/product/${product.slug}`} className="block mt-1 min-h-12 text-sm font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
              {product.nameVi}
            </Link>
            <div className="flex items-center justify-between gap-2 mt-3">
              <span className="font-mono font-bold text-blue-600">{product.price.toLocaleString('vi-VN')} ₫</span>
              <button
                type="button"
                aria-label={`Thêm ${product.nameVi} vào giỏ`}
                onClick={() => {
                  addItem({
                    id: product.id,
                    name: product.nameVi,
                    price: product.price,
                    image: product.images[0],
                    category: product.category,
                    brand: product.brand,
                    slug: product.slug,
                  });
                }}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

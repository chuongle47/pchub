'use client';

import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.nameVi || product.name}
          slug={product.slug}
          image={product.images?.[0]}
          images={product.images}
          price={product.price}
          originalPrice={product.originalPrice}
          category={product.category}
          brand={product.brand}
          stock={product.stock}
          specs={product.specs}
        />
      ))}
    </div>
  );
}

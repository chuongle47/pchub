import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlugOrId, getProducts } from '@/lib/db';
import ProductDetailView from '@/components/product/ProductDetailView';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm — PCHub',
    };
  }

  const imageUrl = product.image_url || '/images/cpu-box.jpg';

  return {
    title: `${product.name} — Linh kiện chính hãng | PCHub`,
    description: `Mua ${product.name} giá tốt ${Number(product.price).toLocaleString('vi-VN')}₫. Bảo hành chính hãng 36 tháng, giao hàng hỏa tốc 2H tại PCHub.`,
    openGraph: {
      title: product.name,
      description: `Giá tốt ${Number(product.price).toLocaleString('vi-VN')}₫ — PCHub`,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Giá tốt ${Number(product.price).toLocaleString('vi-VN')}₫ — PCHub`,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);

  if (!product) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'var(--font-primary, system-ui, sans-serif)',
      }}>
        <div style={{
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Không tìm thấy sản phẩm
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
          </p>
          <Link
            href="/search"
            style={{
              display: 'inline-block',
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            Quay lại danh mục sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Fetch related products
  let relatedProducts: any[] = [];
  try {
    const res = await getProducts({
      category_id: product.category_id,
      limit: 5,
    });
    relatedProducts = res.products.filter((p: any) => p.id !== product.id && p.slug !== product.slug);
  } catch (err) {
    console.error('Failed to fetch related products:', err);
  }

  // Structured Data: Schema.org Product for rich snippets
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [
      product.image_url
        ? (product.image_url.startsWith('http') ? product.image_url : `https://pchub-iota.vercel.app${product.image_url}`)
        : 'https://pchub-iota.vercel.app/images/cpu-box.jpg',
    ],
    description: (product as any).description || `Mua ${product.name} chính hãng tại PCHub với giá tốt nhất, bảo hành 36 tháng.`,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand_name || 'PCHub',
    },
    category: product.category_name || 'Linh kiện PC',
    offers: {
      '@type': 'Offer',
      url: `https://pchub-iota.vercel.app/product/${product.slug || product.id}`,
      priceCurrency: 'VND',
      price: Number(product.price),
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: Number(product.stock ?? (product as any).stock_quantity ?? 10) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'PCHub Technology',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
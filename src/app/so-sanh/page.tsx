import Link from 'next/link';
import { ArrowLeftRight, Check, ChevronRight } from 'lucide-react';
import { getProductsBySlugs } from '@/lib/db';

type Props = { searchParams: Promise<{ ids?: string }> };
const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} ₫`;

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const slugs = [...new Set((params.ids ?? '').split(',').filter(Boolean))].slice(0, 4);
  const result = slugs.length ? await getProductsBySlugs(slugs) : { products: [], specKeys: [] };
  const products = result.products.map(product => ({
    id: product.id,
    slug: product.slug,
    nameVi: product.name,
    price: Number(product.price),
    reviewCount: 0,
    stock: Number(product.stock ?? 0),
    brand: product.brand_name || 'Thương hiệu',
    category: product.category_name || 'Danh mục',
    images: [product.image_url || '/images/placeholder.png'],
    specs: product.specs || {},
    warrantyMonths: 12,
  }));
  const specKeys = [...new Set(products.flatMap(product => Object.keys(product.specs)))];
  const columns = { display: 'grid', gridTemplateColumns: `150px repeat(${Math.max(products.length, 1)}, minmax(190px, 1fr))` } as const;

  return <div style={{ background: '#f3f5f8', minHeight: '100vh', padding: '24px 0 60px' }}><div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', marginBottom: '18px' }}><Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link><ChevronRight size={13} /><span>So sánh sản phẩm</span></div>
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '22px' }}><div><div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '5px' }}>PCHub Tools</div><h1 style={{ margin: 0, color: '#0f172a', fontSize: '30px', lineHeight: 1.15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><ArrowLeftRight size={26} color="#2563eb" /> So sánh sản phẩm</h1></div><Link href="/search" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>+ Chọn thêm sản phẩm</Link></header>
    {products.length < 2 ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '70px 20px', textAlign: 'center', color: '#64748b' }}><ArrowLeftRight size={42} color="#cbd5e1" /><p>Vui lòng chọn ít nhất 2 sản phẩm để so sánh.</p><Link href="/search" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Đến trang sản phẩm</Link></div> : <div style={{ background: '#fff', border: '1px solid #dfe5ec', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
      <div style={columns}><div style={{ background: '#f8fafc', padding: '20px 16px', display: 'flex', alignItems: 'flex-end', color: '#64748b', fontSize: '12px', fontWeight: 800 }}>SẢN PHẨM</div>{products.map(product => <div key={product.id} style={{ padding: '16px', borderLeft: '1px solid #e2e8f0' }}><div style={{ height: '142px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><img src={product.images[0]} alt={product.nameVi} style={{ width: '100%', height: '100%', maxWidth: '160px', maxHeight: '130px', objectFit: 'contain' }} /></div><Link href={`/product/${product.slug}`} style={{ display: 'block', color: '#1e293b', fontSize: '13px', lineHeight: 1.4, fontWeight: 700, textDecoration: 'none', minHeight: '37px' }}>{product.nameVi}</Link><div style={{ color: '#2563eb', fontFamily: 'monospace', fontWeight: 900, fontSize: '15px', marginTop: '8px' }}>{formatPrice(product.price)}</div><div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '5px' }}>★★★★★ <span style={{ color: '#94a3b8' }}>({product.reviewCount})</span></div></div>)}</div>
      <div style={columns}><div style={{ background: '#f8fafc', padding: '14px 16px', color: '#64748b', fontSize: '12px', fontWeight: 800 }}>THÔNG TIN</div>{products.map(product => <div key={product.id} style={{ borderLeft: '1px solid #e2e8f0', padding: '14px 16px', fontSize: '13px', color: '#475569' }}><strong style={{ color: '#1e293b' }}>{product.brand}</strong><br />Còn {product.stock} sản phẩm</div>)}{specKeys.map((key, index) => <div key={key} style={{ display: 'contents' }}><div style={{ background: index % 2 ? '#fff' : '#f8fafc', borderTop: '1px solid #edf0f3', padding: '13px 16px', color: '#475569', fontSize: '12px', fontWeight: 700 }}>{key}</div>{products.map(product => <div key={product.id} style={{ background: index % 2 ? '#fff' : '#f8fafc', borderLeft: '1px solid #e2e8f0', borderTop: '1px solid #edf0f3', padding: '13px 16px', color: '#334155', fontSize: '12px' }}>{product.specs[key] ?? '—'}</div>)}</div>)}<div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '14px 16px', color: '#64748b', fontSize: '12px', fontWeight: 800 }}>BẢO HÀNH</div>{products.map(product => <div key={product.id} style={{ borderLeft: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0', padding: '14px 16px', color: '#16a34a', fontSize: '12px', fontWeight: 700 }}><Check size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />{product.warrantyMonths} tháng</div>)}</div>
    </div>}
  </div></div>;
}

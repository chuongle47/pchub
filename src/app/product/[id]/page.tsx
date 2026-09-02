'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, Star, Heart, Truck, ShieldCheck, 
  RotateCcw, Sparkles, ShoppingCart, Zap, Check, X,
  Bot, AlertCircle 
} from 'lucide-react';
import { formatProductDetail, ProductDetailData } from '@/lib/products-data';
import { useCartStore } from '@/lib/store';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'qa'>('specs');
  const [aiMatchEnabled, setAiMatchEnabled] = useState(true);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?slug=${encodeURIComponent(rawId)}&limit=1`);
        const json = await res.json();
        if (isMounted) {
          if (json.products && json.products.length > 0) {
            setProduct(formatProductDetail(json.products[0]));
          } else {
            // try fallback lookup by id
            const res2 = await fetch(`/api/products?ids=${encodeURIComponent(rawId)}`);
            const json2 = await res2.json();
            if (json2.products && json2.products.length > 0) {
              setProduct(formatProductDetail(json2.products[0]));
            } else {
              setProduct(null);
            }
          }
        }
      } catch (e) {
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [rawId]);

  if (loading) {
    return (
      <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '60vh', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Không tìm thấy sản phẩm</h1>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Mã hoặc đường dẫn này không có trong catalog.</p>
          <Link href="/search" style={{ color: '#2563eb', fontWeight: 700 }}>Xem tất cả sản phẩm</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.oldPrice,
      image: product.mainImage,
      category: product.category,
      brand: product.brand,
      slug: rawId,
    }, quantity);
    setOpen(true);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.oldPrice,
      image: product.mainImage,
      category: product.category,
      brand: product.brand,
      slug: rawId,
    }, quantity);
    router.push('/thanh-toan');
  };

  const thumbnails = product.thumbnails;

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const discountAmount = product.oldPrice - product.price;

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '20px 0 60px' }}>
      <div className="container">
        
        {/* 1. BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Trang chủ</Link>
          <ChevronRight size={13} />
          <Link href="/search?category=components" style={{ textDecoration: 'none', color: '#64748b' }}>Linh kiện PC</Link>
          <ChevronRight size={13} />
          <Link href={`/search?category=${product.categorySlug}`} style={{ textDecoration: 'none', color: '#64748b' }}>{product.category}</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* 2. TOP PRODUCT SUMMARY CARD */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: '460px 1fr',
          gap: '40px',
          marginBottom: '36px'
        }}>
          
          {/* Left: Gallery */}
          <div>
            {/* Main Preview Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <button 
                onClick={() => setIsWishlist(!isWishlist)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              >
                <Heart size={18} fill={isWishlist ? '#ef4444' : 'none'} color={isWishlist ? '#ef4444' : '#64748b'} />
              </button>

              <img 
                src={thumbnails[selectedThumb] || product.mainImage} 
                alt={product.name} 
                style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
              />
            </div>

            {/* Thumbnails Row */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedThumb(idx)}
                  style={{
                    width: '68px',
                    height: '68px',
                    border: '2px solid',
                    borderColor: selectedThumb === idx ? '#2563eb' : '#e2e8f0',
                    borderRadius: '8px',
                    background: '#fff',
                    overflow: 'hidden',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <img src={thumb} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info & Purchase */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {product.badges.map((b, i) => (
                <span key={i} style={{
                  background: i === 0 ? '#eff6ff' : i === 1 ? '#ef4444' : '#ea580c',
                  color: i === 0 ? '#2563eb' : '#fff',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: i === 0 ? '1px solid #bfdbfe' : 'none'
                }}>
                  {b}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: '1.35',
              marginBottom: '10px'
            }}>
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: '#64748b', marginBottom: '18px' }}>
              <span>SKU: {product.sku}</span>
              <span>• Tồn kho: {product.stockCount}</span>
            </div>

            {/* Price Area */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#2563eb' }}>
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {discountAmount > 0 && (
                  <span style={{
                    background: '#fee2e2',
                    color: '#ef4444',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Tiết kiệm {formatPrice(discountAmount)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                Còn hàng ({product.stockCount} sản phẩm)
              </div>
            </div>

            {/* AI Smart Match Box */}
            <div style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 800, fontSize: '13px' }}>
                  <Sparkles size={15} />
                  AI Smart Match
                </div>
                {/* Toggle switch */}
                <div 
                  onClick={() => setAiMatchEnabled(!aiMatchEnabled)}
                  style={{
                    width: '36px',
                    height: '20px',
                    background: aiMatchEnabled ? '#2563eb' : '#cbd5e1',
                    borderRadius: '9999px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: aiMatchEnabled ? '18px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
              <p style={{ fontSize: '12.5px', color: '#1e3a8a', lineHeight: '1.5' }}>
                {product.aiMatchText}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
              {/* Quantity selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                background: '#fff',
                overflow: 'hidden'
              }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '36px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#475569' }}
                >-</button>
                <span style={{ width: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '36px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#475569' }}
                >+</button>
              </div>

              {/* Add to cart */}
              <button 
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  border: '1.5px solid #2563eb',
                  background: '#fff',
                  color: '#2563eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <ShoppingCart size={16} />
                Thêm vào giỏ
              </button>

              {/* Buy now */}
              <button 
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                <Zap size={16} />
                Mua ngay
              </button>
            </div>

            {/* Commitments Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#2563eb" />
                <span>Miễn phí giao hàng toàn quốc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#2563eb" />
                <span>Bảo hành chính hãng 36 tháng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={16} color="#2563eb" />
                <span>Đổi trả miễn phí trong 7 ngày</span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. TABS HEADER */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '28px' }}>
          {[
            { id: 'specs', label: 'Thông số kỹ thuật' },
            { id: 'desc', label: 'Mô tả sản phẩm' },
            { id: 'reviews', label: `Đánh giá (${product.reviewCount})` },
            { id: 'qa', label: 'Hỏi đáp (Q&A)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 4px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. DETAILS SPECIFICATION & AI REVIEW SUMMARY */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.7fr',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          
          {/* Left Table: Detailed Specifications */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
              Thông số kỹ thuật chi tiết
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {product.specs.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, width: '220px' }}>{row.label}</td>
                    <td style={{ padding: '12px 16px', color: row.isHighlight ? '#2563eb' : '#0f172a', fontWeight: row.isHighlight ? 700 : 500 }}>
                      {row.val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Card: AI Review Summary */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 15px rgba(37,99,235,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '15px', marginBottom: '20px' }}>
              <Bot size={20} />
              AI Tổng hợp đánh giá
            </div>

            {/* Radar / Polygon visual */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="180" height="150" viewBox="0 0 200 160">
                {/* Background grid */}
                <polygon points="100,20 180,60 150,140 50,140 20,60" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points="100,45 155,75 135,125 65,125 45,75" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                {/* Value polygon */}
                <polygon points="100,25 170,65 140,135 60,135 30,65" fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth="2" />
                {/* Labels */}
                <text x="100" y="14" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Hiệu năng</text>
                <text x="190" y="65" textAnchor="start" fontSize="10" fill="#64748b" fontWeight="600">Đa nhiệm</text>
                <text x="145" y="155" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Nhiệt độ</text>
                <text x="45" y="155" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Điện năng</text>
                <text x="10" y="65" textAnchor="end" fontSize="10" fill="#64748b" fontWeight="600">Giá trị</text>
              </svg>
            </div>

            {/* Pros */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                <Check size={16} />
                Ưu điểm (Từ {product.reviewCount}+ đánh giá)
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {product.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                <AlertCircle size={16} />
                Nhược điểm
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {product.cons.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

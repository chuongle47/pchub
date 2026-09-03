'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Cpu, 
  Zap, 
  Sparkles,
  Star,
  Wrench,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useCartStore, useWishlistStore, useBuilderStore, useUIStore } from '@/lib/store';

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category_id?: string;
    category_name?: string;
    category_slug?: string;
    brand_id?: string;
    brand_name?: string;
    sku?: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    specs?: Record<string, any>;
    image_url?: string;
    image?: string;
    description?: string;
  };
  relatedProducts?: any[];
}

export default function ProductDetailView({ product, relatedProducts = [] }: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('specs');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const addItem = useCartStore(s => s.addItem);
  const setCartOpen = useCartStore(s => s.setOpen);
  const toggleWishlist = useWishlistStore(s => s.toggleWishlist);
  const isWishlisted = useWishlistStore(s => s.ids.includes(product.id));
  const setSlot = useBuilderStore(s => s.setSlot);

  const imageUrl = product.image_url || product.image || '/images/cpu-box.jpg';
  const categoryName = product.category_name || 'Linh kiện PC';
  const brandName = product.brand_name || 'Chính hãng';
  const stockCount = product.stock ?? 15;
  const isOutOfStock = stockCount <= 0;
  const originalPrice = product.originalPrice || Math.round(product.price * 1.15);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice,
      image: imageUrl,
      category: categoryName,
      brand: brandName,
      slug: product.slug,
      quantity,
    });
    setCartOpen(true);
    setAddedNotice('Đã thêm sản phẩm vào giỏ hàng!');
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice,
      image: imageUrl,
      category: categoryName,
      brand: brandName,
      slug: product.slug,
      quantity,
    });
    router.push('/thanh-toan');
  };

  const handleAddToBuilder = () => {
    // Map category to builder slot
    let slot = 'cpu';
    const catLower = categoryName.toLowerCase();
    if (catLower.includes('gpu') || catLower.includes('vga') || catLower.includes('card')) slot = 'gpu';
    else if (catLower.includes('main') || catLower.includes('bo mạch')) slot = 'mainboard';
    else if (catLower.includes('ram')) slot = 'ram';
    else if (catLower.includes('ssd') || catLower.includes('hdd') || catLower.includes('ổ đĩa')) slot = 'storage';
    else if (catLower.includes('psu') || catLower.includes('nguồn')) slot = 'psu';
    else if (catLower.includes('case') || catLower.includes('vỏ')) slot = 'case';

    setSlot(slot, {
      id: product.id,
      name: product.name,
      price: product.price,
      category: categoryName,
      image: imageUrl,
      slug: product.slug
    });

    setAddedNotice(`Đã thêm vào cấu hình PC Builder (Mục ${slot.toUpperCase()})!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  // Convert specs object to entries
  const specsEntries = product.specs && typeof product.specs === 'object'
    ? Object.entries(product.specs)
    : [];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
        
        {/* Breadcrumb Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href={`/search?category=${product.category_slug || ''}`} style={{ color: '#64748b', textDecoration: 'none' }}>
            {categoryName}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </nav>

        {/* Notice Alert */}
        {addedNotice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          }}>
            <CheckCircle2 size={20} color="#10b981" />
            {addedNotice}
          </div>
        )}

        {/* Main Product Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 460px) 1fr',
          gap: '40px',
          marginBottom: '32px',
        }}>
          
          {/* LEFT: Image Gallery & Quality Guarantees */}
          <div>
            <div style={{
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #f1f5f9',
              padding: '24px',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '20px',
            }}>
              <img
                src={imageUrl}
                alt={product.name}
                style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
                onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
              />

              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#ef4444',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
              }}>
                CHÍNH HÃNG 100%
              </div>
            </div>

            {/* Quality Commitment Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <ShieldCheck size={22} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Bảo hành 36 tháng</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Đổi mới trong 30 ngày</div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Truck size={22} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Giao hàng hỏa tốc</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Nhận hàng trong 2H</div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <RotateCcw size={22} color="#d97706" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Đổi trả 7 ngày</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Thủ tục nhanh chóng</div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <CheckCircle2 size={22} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Kiểm tra hàng</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Thanh toán khi nhận</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Info, Pricing, Add to Cart & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Brand Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}>
                  {categoryName}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Thương hiệu: <strong style={{ color: '#0f172a' }}>{brandName}</strong>
                </span>
                {product.sku && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: '1.35',
                marginBottom: '16px',
              }}>
                {product.name}
              </h1>

              {/* Ratings Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308' }}>
                  <Star size={16} fill="#eab308" />
                  <Star size={16} fill="#eab308" />
                  <Star size={16} fill="#eab308" />
                  <Star size={16} fill="#eab308" />
                  <Star size={16} fill="#eab308" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>5.0</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>|</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Đã bán: 128+</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>|</span>
                <span style={{
                  fontSize: '12px',
                  color: isOutOfStock ? '#ef4444' : '#16a34a',
                  fontWeight: 700,
                }}>
                  {isOutOfStock ? '● Hết hàng' : `● Còn hàng (${stockCount} sản phẩm)`}
                </span>
              </div>

              {/* Pricing Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#ef4444',
                    letterSpacing: '-0.5px',
                  }}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>

                  {originalPrice > product.price && (
                    <span style={{
                      fontSize: '18px',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}>
                      {originalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#2563eb',
                  fontWeight: 600,
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>⚡ Giá đã bao gồm VAT & Bảo hành chính hãng</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Số lượng:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#fff',
                }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '36px', height: '36px', border: 'none', background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(stockCount, q + 1))}
                    style={{
                      width: '36px', height: '36px', border: 'none', background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1.5px solid #2563eb',
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      opacity: isOutOfStock ? 0.6 : 1,
                    }}
                  >
                    <ShoppingCart size={18} />
                    Thêm vào giỏ hàng
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.2s ease',
                      opacity: isOutOfStock ? 0.6 : 1,
                    }}
                  >
                    Mua ngay (Giao ngay)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: '12px' }}>
                  <button
                    onClick={handleAddToBuilder}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Wrench size={16} />
                    Đổi linh kiện trong PC Builder
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Thêm vào danh sách yêu thích"
                    style={{
                      background: isWishlisted ? '#fef2f2' : '#f8fafc',
                      color: isWishlisted ? '#ef4444' : '#64748b',
                      border: `1px solid ${isWishlisted ? '#fecdd3' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* AI Advisor Performance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              ✨
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Đánh giá tương thích AI Advisor</span>
                <span style={{ background: '#16a34a', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>9.8/10 Điểm</span>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                Sản phẩm đạt chuẩn tương thích cao nhất với các bo mạch chủ LGA1700 / PCIe Gen 4. Khuyến nghị sử dụng Nguồn PSU từ 750W.
              </p>
            </div>
          </div>

          <Link
            href="/kiem-tra-tuong-thich"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            Kiểm tra tương thích cấu hình <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tabbed Content: Specs, Description, Reviews */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '40px',
        }}>
          
          {/* Tab Headers */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f1f5f9',
            marginBottom: '24px',
            gap: '8px',
          }}>
            <button
              onClick={() => setActiveTab('specs')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'specs' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeTab === 'specs' ? '#2563eb' : '#64748b',
                fontWeight: 800,
                fontSize: '15px',
                padding: '12px 20px',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              📋 Thông số kỹ thuật
            </button>

            <button
              onClick={() => setActiveTab('desc')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'desc' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeTab === 'desc' ? '#2563eb' : '#64748b',
                fontWeight: 800,
                fontSize: '15px',
                padding: '12px 20px',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              📝 Mô tả chi tiết
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'reviews' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeTab === 'reviews' ? '#2563eb' : '#64748b',
                fontWeight: 800,
                fontSize: '15px',
                padding: '12px 20px',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              ⭐ Đánh giá từ khách hàng
            </button>
          </div>

          {/* Tab 1: Specs Table */}
          {activeTab === 'specs' && (
            <div>
              {specsEntries.length > 0 ? (
                <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', width: '30%' }}>Danh mục</td>
                        <td style={{ padding: '14px 20px', color: '#334155' }}>{categoryName}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>Thương hiệu</td>
                        <td style={{ padding: '14px 20px', color: '#334155' }}>{brandName}</td>
                      </tr>
                      {specsEntries.map(([key, val], idx) => (
                        <tr key={key} style={{
                          background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#334155' }}>
                            {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
              )}
            </div>
          )}

          {/* Tab 2: Description */}
          {activeTab === 'desc' && (
            <div style={{ color: '#334155', lineHeight: '1.7', fontSize: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                Tổng quan về sản phẩm {product.name}
              </h3>
              <p style={{ marginBottom: '16px' }}>
                {product.description || `${product.name} là dòng sản phẩm linh kiện cao cấp từ thương hiệu ${brandName}, mang lại hiệu năng mạnh mẽ, độ ổn định tuyệt đối và khả năng tương thích cao với các cấu hình PC Gaming & Đồ họa chuyên nghiệp.`}
              </p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '20px 0 10px' }}>
                Đặc điểm nổi bật:
              </h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Hiệu năng đỉnh cao đáp ứng mượt mà các tác vụ nặng & Gaming 4K Ultra.</li>
                <li>Thiết kế tối ưu nhiệt độ, chạy êm ái 24/7.</li>
                <li>Hỗ trợ công nghệ mới nhất từ {brandName}.</li>
                <li>Bảo hành chính hãng 36 tháng 1 đổi 1 trong 30 ngày đầu.</li>
              </ul>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '24px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', lineHeight: '1' }}>5.0</div>
                  <div style={{ display: 'flex', gap: '2px', color: '#eab308', margin: '6px 0' }}>
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Dựa trên 18 đánh giá</div>
                </div>

                <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <span>5 sao</span>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: '#eab308' }} />
                    </div>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Sample Review Card */}
              <div style={{ borderBottom: '1px solid #f1f5f9', padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Nguyễn Văn Anh</strong>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Đã mua hàng</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '6px' }}>
                  <Star size={14} fill="#eab308" />
                  <Star size={14} fill="#eab308" />
                  <Star size={14} fill="#eab308" />
                  <Star size={14} fill="#eab308" />
                  <Star size={14} fill="#eab308" />
                </div>
                <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
                  Sản phẩm chính hãng đóng gói rất chắc chắn, giao hàng hỏa tốc trong 2H tại TP.HCM. Chạy mượt và cực kỳ mát!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
              Sản phẩm tương tự
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}>
              {relatedProducts.slice(0, 4).map(p => (
                <Link key={p.id} href={`/product/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}>
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      height: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      marginBottom: '12px',
                    }}>
                      <img
                        src={p.image_url || p.image || '/images/cpu-box.jpg'}
                        alt={p.name}
                        style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                      />
                    </div>
                    <h3 style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: '1.4',
                      height: '36px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginBottom: '8px',
                    }}>
                      {p.name}
                    </h3>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#ef4444' }}>
                      {Number(p.price).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

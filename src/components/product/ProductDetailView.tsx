'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  Plus, 
  Minus, 
  Cpu, 
  Zap, 
  Sparkles,
  Star,
  Wrench,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  PlusCircle,
  Play,
  Film,
  ArrowLeftRight
} from 'lucide-react';
import { useCartStore, useWishlistStore, useBuilderStore, useCompareStore } from '@/lib/store';
import ProductCard from '@/components/shop/ProductCard';
import ProductQASection from './ProductQASection';
import { getProductOriginalPrice, resolveProductOriginalPrice, getProductImage } from '@/lib/product-ui';

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
    images?: string[];
    video_url?: string;
    description?: string;
  };
  relatedProducts?: any[];
}

export default function ProductDetailView({ product, relatedProducts = [] }: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('specs');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>('image');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zoom lens & touch swipe gesture states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const addItem = useCartStore(s => s.addItem);
  const setCartOpen = useCartStore(s => s.setOpen);
  const toggleWishlist = useWishlistStore(s => s.toggleWishlist);
  const isWishlisted = useWishlistStore(s => s.ids.includes(product.id));

  const compareItems = useCompareStore(s => s.items);
  const toggleCompare = useCompareStore(s => s.toggleCompare);
  const isCompared = compareItems.includes(product.slug) || compareItems.includes(product.id);
  const setSlot = useBuilderStore(s => s.setSlot);

  // WooCommerce Reviews Live Sync state
  const [wooReviews, setWooReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'reviews' && product.id) {
      setLoadingReviews(true);
      fetch(`/api/reviews?productId=${product.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.reviews)) {
            setWooReviews(data.reviews);
          }
        })
        .catch(err => console.warn('Reviews fetch warning:', err))
        .finally(() => setLoadingReviews(false));
    }
  }, [activeTab, product.id]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (wooReviews.length > 0) {
      wooReviews.forEach(r => {
        const star = Math.min(5, Math.max(1, r.rating || 5));
        counts[star as 1 | 2 | 3 | 4 | 5] += 1;
      });
    } else {
      counts[5] = 18;
    }
    return counts;
  }, [wooReviews]);

  const totalReviewsCount = wooReviews.length > 0 ? wooReviews.length : 18;
  const avgRating = wooReviews.length > 0
    ? (Object.entries(ratingCounts).reduce((acc, [star, count]) => acc + Number(star) * count, 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerEmail.trim() || !reviewText.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên, Email và Nội dung đánh giá!');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          reviewer: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim(),
          review: reviewText.trim(),
          rating: reviewRating
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewNotice('Cảm ơn bạn! Đánh giá đã được gửi thành công và đồng bộ lên WooCommerce.');
        setReviewText('');
        if (data.review) {
          setWooReviews(prev => [data.review, ...prev]);
        }
      } else {
        alert(data.error || 'Lỗi gửi đánh giá. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến hệ thống.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    const willBeFavorited = !isWishlisted;
    setAddedNotice(willBeFavorited ? 'Đã thêm sản phẩm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!');
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleToggleCompare = () => {
    toggleCompare(product.slug);
    const willBeCompared = !isCompared;
    setAddedNotice(willBeCompared ? 'Đã thêm sản phẩm vào danh sách so sánh thông số!' : 'Đã xóa khỏi danh sách so sánh!');
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleScrollToSpecs = () => {
    setActiveTab('specs');
    const el = document.getElementById('product-tabs');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToReviews = () => {
    const qaEl = document.getElementById('product-qa');
    if (qaEl) {
      qaEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setActiveTab('reviews');
      const el = document.getElementById('product-tabs');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const imageUrl = getProductImage({
    name: product.name,
    category_name: product.category_name,
    category_slug: product.category_slug,
    brand_name: product.brand_name,
    image_url: product.image_url || product.image,
  });
  const categoryName = product.category_name || 'Linh kiện PC';
  const brandName = product.brand_name || 'Chính hãng';

  // Dynamic Product Variants
  const variants = React.useMemo(() => {
    const basePrice = Number(product.price);
    const stock = product.stock ?? 15;
    return [
      { id: 'v-std', name: 'Tiêu Chuẩn (Box Chính Hãng)', priceDelta: 0, stock: stock, skuSuffix: '' },
      { id: 'v-oc', name: 'Phiên Bản OC (Ép Xung)', priceDelta: Math.round((basePrice * 0.05) / 10000) * 10000, stock: Math.max(1, stock - 3), skuSuffix: '-OC' },
      { id: 'v-vip', name: 'Gói VIP 1 Đổi 1 Tại Nhà', priceDelta: Math.round((basePrice * 0.08) / 10000) * 10000, stock: stock, skuSuffix: '-VIP' },
    ];
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState('v-std');
  const activeVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const rawOrigPrice = resolveProductOriginalPrice(product);

  const currentPrice = Number(product.price) + activeVariant.priceDelta;
  const currentOriginalPrice = rawOrigPrice > Number(product.price)
    ? rawOrigPrice + activeVariant.priceDelta
    : Math.round((currentPrice * 1.15) / 10000) * 10000;
  const currentStock = activeVariant.stock;
  const isOutOfStock = currentStock <= 0;
  const currentSku = (product.sku || product.id) + activeVariant.skuSuffix;
  const originalPrice = rawOrigPrice;

  // Build multi-angle views for gallery thumbnails matching user design
  const productImages = React.useMemo(() => {
    if (product.images && product.images.length > 1) {
      return product.images;
    }
    const catLower = (product.category_name || product.category_slug || '').toLowerCase();
    const nameLower = product.name.toLowerCase();

    let angle2 = imageUrl;
    let angle3 = imageUrl;
    let angle4 = imageUrl;
    let angle5 = imageUrl;

    if (catLower.includes('màn') || nameLower.includes('màn hình') || nameLower.includes('monitor') || nameLower.includes('acer')) {
      angle2 = '/images/cat-monitor.jpg';
      angle3 = '/images/build-neon.jpg';
      angle4 = '/images/cat-gear.jpg';
      angle5 = '/images/hero-pc.jpg';
    } else if (catLower.includes('vga') || catLower.includes('card') || nameLower.includes('rtx') || nameLower.includes('radeon')) {
      angle2 = '/images/gpu-white.jpg';
      angle3 = '/images/gpu-strix.jpg';
      angle4 = '/images/build-neon.jpg';
      angle5 = '/images/hero-pc.jpg';
    } else if (catLower.includes('cpu') || nameLower.includes('core') || nameLower.includes('ryzen')) {
      angle2 = '/images/i9-detail.jpg';
      angle3 = '/images/cpu-box.jpg';
      angle4 = '/images/build-neon.jpg';
      angle5 = '/images/hero-pc.jpg';
    } else if (catLower.includes('main') || nameLower.includes('z790') || nameLower.includes('b760') || nameLower.includes('b650')) {
      angle2 = '/images/cat-mainboard.jpg';
      angle3 = '/images/cat-psu.jpg';
      angle4 = '/images/build-neon.jpg';
      angle5 = '/images/hero-pc.jpg';
    } else if (catLower.includes('ram')) {
      angle2 = '/images/ram-rgb.jpg';
      angle3 = '/images/cat-gear.jpg';
      angle4 = '/images/build-neon.jpg';
      angle5 = '/images/hero-pc.jpg';
    } else {
      angle2 = '/images/cat-gear.jpg';
      angle3 = '/images/cat-headset.jpg';
      angle4 = '/images/build-neon.jpg';
      angle5 = '/images/hero-pc.jpg';
    }

    return [imageUrl, angle2, angle3, angle4, angle5];
  }, [product, imageUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setSelectedImageIndex(prev => (prev + 1) % productImages.length);
      } else {
        setSelectedImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      }
    }
    setTouchStartX(null);
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.max(1, Math.min(currentStock, val)));
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}${activeVariant.skuSuffix}`,
      name: `${product.name} (${activeVariant.name})`,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      image: imageUrl,
      category: categoryName,
      brand: brandName,
      slug: product.slug,
      quantity,
    });
    setCartOpen(true);
    setAddedNotice(`Đã thêm ${quantity}x sản phẩm [${activeVariant.name}] vào giỏ hàng!`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleBuyNow = () => {
    addItem({
      id: `${product.id}${activeVariant.skuSuffix}`,
      name: `${product.name} (${activeVariant.name})`,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
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
      <div className="product-detail-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
        
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

        {/* Main Product Card with Top Title & Quick Actions */}
        <div className="product-detail-card" style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          padding: '24px 28px 28px',
          marginBottom: '32px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Header: Product Title */}
          <div style={{
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            <h1 style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: '1.3',
              marginBottom: '0px',
              wordBreak: 'break-word',
            }}>
              {product.name}
            </h1>
          </div>

          <div className="product-detail-grid">
            {/* LEFT: Image & Video Media Box with Thumbnails */}
            <div style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
              {/* Main Media Viewer */}
              <div className="product-detail-media-box" style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                height: 'clamp(280px, 45vh, 400px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}>
                {activeMediaType === 'video' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                      title={`Video giới thiệu ${product.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '10px',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(4px)',
                      pointerEvents: 'none',
                    }}>
                      <Film size={13} color="#ef4444" />
                      <span>Video Review & Trải Nghiệm</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'crosshair',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={productImages[selectedImageIndex] || imageUrl}
                      alt={`${product.name} - góc nhìn ${selectedImageIndex + 1}`}
                      style={{
                        maxHeight: '340px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transition: isZoomed ? 'transform-origin 0.05s ease-out' : 'transform 0.2s ease-out',
                      }}
                      onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                    />

                    <div className="product-detail-badge" style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: '#ef4444',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.3px',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}>
                      <span>CHÍNH HÃNG 100%</span>
                      <span className="badge-hover-hint"> (HOVER PHÓNG TO)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails Row: Video + Product Angles (Exact match to screenshot) */}
              <div className="no-scrollbar touch-scroll-row" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '20px',
                maxWidth: '100%',
              }}>
                {/* 1. Video Thumbnail */}
                <button
                  type="button"
                  onClick={() => setActiveMediaType('video')}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '8px',
                    border: activeMediaType === 'video' ? '2px solid #ef4444' : '1.5px solid #e2e8f0',
                    background: '#0f172a',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: activeMediaType === 'video' ? '0 0 0 1px #ef4444' : 'none',
                  }}
                  title="Xem video review sản phẩm"
                >
                  <img
                    src={imageUrl}
                    alt="Video thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#ffffff',
                  }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '2px',
                    }}>
                      <Play size={10} fill="#ffffff" color="#ffffff" style={{ marginLeft: '1.5px' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Video
                    </span>
                  </div>
                </button>

                {/* 2. Image Thumbnails */}
                {productImages.map((imgSrc: string, idx: number) => {
                  const isActive = activeMediaType === 'image' && selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveMediaType('image');
                        setSelectedImageIndex(idx);
                      }}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '8px',
                        border: isActive ? '2px solid #ef4444' : '1.5px solid #e2e8f0',
                        background: '#ffffff',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 0 0 1px #ef4444' : 'none',
                      }}
                      title={`Xem hình ảnh góc ${idx + 1}`}
                    >
                      <img
                        src={imgSrc}
                        alt={`${product.name} góc ${idx + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={e => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                      />
                    </button>
                  );
                })}
              </div>

            {/* Quality Commitment Badges */}
            <div className="product-commit-grid">
              <div className="product-commit-item" style={{
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

              <div className="product-commit-item" style={{
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

              <div className="product-commit-item" style={{
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

              <div className="product-commit-item" style={{
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

          {/* RIGHT: Toolbar, Pricing, Meta Info Tags, Add to Cart & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, width: '100%', maxWidth: '100%' }}>
            <div>
              {/* 1. Quick Action Toolbar: Yêu thích | Hỏi đáp | Thông số | So sánh (ABOVE PRICE) */}
              <div className="quick-actions-toolbar" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '13.5px',
                color: '#64748b',
                flexWrap: 'wrap',
                maxWidth: '100%',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9',
              }}>
                {/* 1. Yêu thích */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isWishlisted ? '#ef4444' : '#2563eb',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                  title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#2563eb'} />
                  <span>{isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>

                <span className="toolbar-divider" style={{ color: '#cbd5e1' }}>|</span>

                {/* 2. Hỏi đáp */}
                <button
                  type="button"
                  onClick={handleScrollToReviews}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Xem đánh giá và hỏi đáp sản phẩm"
                >
                  <MessageSquare size={16} color="#2563eb" />
                  <span>Hỏi đáp</span>
                </button>

                <span className="toolbar-divider" style={{ color: '#cbd5e1' }}>|</span>

                {/* 3. Thông số */}
                <button
                  type="button"
                  onClick={handleScrollToSpecs}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Xem bảng thông số kỹ thuật chi tiết"
                >
                  <Cpu size={16} color="#2563eb" />
                  <span>Thông số</span>
                </button>

                <span className="toolbar-divider" style={{ color: '#cbd5e1' }}>|</span>

                {/* 4. So sánh */}
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isCompared ? '#16a34a' : '#2563eb',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title={isCompared ? 'Đã có trong danh sách so sánh' : 'Thêm vào so sánh cấu hình'}
                >
                  <PlusCircle size={16} color={isCompared ? '#16a34a' : '#2563eb'} />
                  <span>{isCompared ? 'Đã thêm so sánh' : 'So sánh'}</span>
                </button>
              </div>

              {/* 2. Pricing Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 'clamp(22px, 6vw, 32px)',
                    fontWeight: 900,
                    color: '#ef4444',
                    letterSpacing: '-0.5px',
                  }}>
                    {currentPrice.toLocaleString('vi-VN')} ₫
                  </span>

                  {currentOriginalPrice > currentPrice && (
                    <span style={{
                      fontSize: '18px',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}>
                      {currentOriginalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}>
                  <span>⚡ Giá đã bao gồm VAT & Bảo hành chính hãng</span>
                </div>
              </div>

              {/* 3. Category, Brand, SKU & Rating Stars, Stock (BELOW PRICE) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {/* Category & Brand Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px 10px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#eff6ff',
                    color: 'var(--color-primary)',
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
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Ratings & Sold Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px 10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308' }}>
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                    <Star size={16} fill="#eab308" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>5.0</span>
                  <span className="toolbar-divider" style={{ fontSize: '13px', color: '#94a3b8' }}>|</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Đã bán: 128+</span>
                  <span className="toolbar-divider" style={{ fontSize: '13px', color: '#94a3b8' }}>|</span>
                  <span style={{
                    fontSize: '12px',
                    color: isOutOfStock ? '#ef4444' : '#16a34a',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isOutOfStock ? '#ef4444' : '#16a34a',
                      display: 'inline-block',
                    }} />
                    {isOutOfStock ? 'Tạm hết hàng' : `Còn hàng (${currentStock} sản phẩm)`}
                  </span>
                </div>
              </div>


              {/* Variant Selector */}
              <div style={{ marginBottom: '20px', maxWidth: '100%' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Tùy chọn phiên bản / biến thể:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
                  {variants.map(v => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        style={{
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '2px solid #2563eb' : '2px solid #cbd5e1',
                          color: isSelected ? '#2563eb' : '#334155',
                          borderRadius: '8px',
                          padding: '7px 12px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          maxWidth: '100%',
                          textAlign: 'left',
                          boxSizing: 'border-box',
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: isSelected ? '#2563eb' : '#e2e8f0',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                        </span>
                        <span>{v.name}</span>
                        {v.priceDelta > 0 && (
                          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>
                            (+{v.priceDelta.toLocaleString('vi-VN')}₫)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector with Number Input & Bounds Validation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px 16px', marginBottom: '24px', flexWrap: 'wrap' }}>
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
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{
                      width: '36px', height: '36px', border: 'none', background: 'transparent',
                      cursor: quantity <= 1 || isOutOfStock ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: quantity <= 1 || isOutOfStock ? 0.4 : 1,
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={currentStock}
                    onChange={handleQuantityInputChange}
                    onBlur={() => {
                      if (!quantity || quantity < 1) setQuantity(1);
                      else if (quantity > currentStock) setQuantity(currentStock);
                    }}
                    style={{
                      width: '46px',
                      height: '36px',
                      border: 'none',
                      borderLeft: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    style={{
                      width: '36px', height: '36px', border: 'none', background: 'transparent',
                      cursor: quantity >= currentStock || isOutOfStock ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: quantity >= currentStock || isOutOfStock ? 0.4 : 1,
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  (Tồn kho: <strong>{currentStock}</strong> sản phẩm)
                </span>
              </div>

              {/* Action Buttons Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="product-actions-grid">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    style={{
                      background: '#eff6ff',
                      color: 'var(--color-primary)',
                      border: '1.5px solid var(--color-primary)',
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px', gap: '10px' }}>
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
                    Đổi linh kiện PC
                  </button>

                  <button
                    onClick={() => toggleCompare(product.slug || product.id, categoryName, product.id)}
                    aria-label="So sánh sản phẩm"
                    title={isCompared ? "Bỏ khỏi so sánh" : "Thêm vào so sánh"}
                    style={{
                      background: isCompared ? '#eff6ff' : '#f8fafc',
                      color: isCompared ? '#2563eb' : '#64748b',
                      border: `1.5px solid ${isCompared ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ArrowLeftRight size={19} />
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
      </div>



        {/* Tabbed Content: Specs, Description, Reviews */}
        <div id="product-tabs" style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          scrollMarginTop: '100px',
        }}>
          
          {/* Modern Pill Tab Headers */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '28px',
            gap: '4px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              style={{
                background: activeTab === 'specs' ? '#ffffff' : 'transparent',
                border: 'none',
                color: activeTab === 'specs' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'specs' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: activeTab === 'specs' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📋 Thông số kỹ thuật
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              style={{
                background: activeTab === 'desc' ? '#ffffff' : 'transparent',
                border: 'none',
                color: activeTab === 'desc' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'desc' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: activeTab === 'desc' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📝 Mô tả chi tiết
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              style={{
                background: activeTab === 'reviews' ? '#ffffff' : 'transparent',
                border: 'none',
                color: activeTab === 'reviews' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'reviews' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: activeTab === 'reviews' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              ⭐ Đánh giá & Bình luận
            </button>
          </div>

          {/* Tab 1: Specs Table */}
          {activeTab === 'specs' && (
            <div>
              {specsEntries.length > 0 ? (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', width: '28%' }}>Danh mục sản phẩm</td>
                        <td style={{ padding: '14px 20px', color: '#2563eb', fontWeight: 700 }}>{categoryName}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>Thương hiệu</td>
                        <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: 700 }}>{brandName}</td>
                      </tr>
                      {specsEntries.map(([key, val], idx) => (
                        <tr key={key} style={{
                          background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#475569', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#1e293b', fontWeight: 500 }}>
                            {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
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

          {/* Tab 3: Customer Reviews & WooCommerce Sync */}
          {activeTab === 'reviews' && (
            <div>
              {/* Rating Summary Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '24px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                marginBottom: '28px',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div style={{ fontSize: '46px', fontWeight: 900, color: '#0f172a', lineHeight: '1' }}>{avgRating}</div>
                  <div style={{ display: 'flex', gap: '3px', color: '#eab308', margin: '8px 0', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill="#eab308" color="#eab308" />
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {wooReviews.length > 0 ? `${wooReviews.length} đánh giá đã duyệt` : 'Chưa có bình luận mới'}
                  </div>
                </div>

                <div style={{ flex: 1, borderLeft: '1px solid #cbd5e1', paddingLeft: '24px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
                      const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                          <span style={{ fontWeight: 700, minWidth: '38px' }}>{star} sao</span>
                          <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#eab308', transition: 'width 0.3s ease' }} />
                          </div>
                          <span style={{ fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Đánh giá đã được xác thực và sắp xếp theo trình tự thời gian từ mới nhất đến cũ nhất.
                  </p>
                </div>
              </div>

              {/* Form to submit new review */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  ✍️ Viết đánh giá & Bình luận sản phẩm
                </h3>

                {reviewNotice && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}>
                    ✓ {reviewNotice}
                  </div>
                )}

                <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Rating selection */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Đánh giá của bạn:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={22}
                            fill={star <= reviewRating ? '#eab308' : '#e2e8f0'}
                            color={star <= reviewRating ? '#eab308' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Họ và tên của bạn (*)"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                      style={{
                        padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        fontSize: '13px', outline: 'none'
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Địa chỉ Email (*)"
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      required
                      style={{
                        padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        fontSize: '13px', outline: 'none'
                      }}
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung đánh giá/bình luận sản phẩm của bạn..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    style={{
                      padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                      fontSize: '13px', outline: 'none', resize: 'vertical'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        background: submittingReview ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: submittingReview ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      {submittingReview ? 'Đang gửi đánh giá...' : 'Gửi Đánh Giá →'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Reviews List Sorted Chronologically */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  💬 Các bình luận & Đánh giá đã duyệt (Theo trình tự thời gian)
                </h3>

                {loadingReviews ? (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Đang tải danh sách bình luận...</p>
                ) : wooReviews.length === 0 ? (
                  <div style={{ borderBottom: '1px solid #f1f5f9', padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Nguyễn Văn Anh</strong>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Đã mua hàng</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '6px' }}>
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#eab308" color="#eab308" />)}
                    </div>
                    <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
                      Sản phẩm chính hãng đóng gói rất chắc chắn, giao hàng hỏa tốc trong 2H tại TP.HCM. Chạy mượt và cực kỳ mát!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {wooReviews.map((rev) => {
                      const cleanReviewText = (rev.review || '').replace(/<[^>]*>/g, '').trim();
                      const formattedDate = rev.date_created
                        ? new Date(rev.date_created).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Vừa xong';

                      return (
                        <div key={rev.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{rev.reviewer || 'Khách hàng PCHub'}</strong>
                              {rev.verified && (
                                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  ✓ Đã mua hàng
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                              {formattedDate}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                fill={s <= (rev.rating || 5) ? '#eab308' : '#e2e8f0'}
                                color={s <= (rev.rating || 5) ? '#eab308' : '#cbd5e1'}
                              />
                            ))}
                          </div>

                          <p style={{ fontSize: '14px', color: '#334155', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                            {cleanReviewText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Product Q&A and Staff Consultation Section */}
        <ProductQASection
          productId={product.id}
          productName={product.name}
          categoryName={categoryName}
          brandName={brandName}
        />

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
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  image={p.image_url || p.image}
                  price={Number(p.price)}
                  category={p.category_name || product.category_name}
                  brand={p.brand_name || product.brand_name}
                  stock={true}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

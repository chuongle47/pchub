'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, ArrowLeftRight, Check, Zap } from 'lucide-react';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/store';
import { getProductOriginalPrice, getProductImage } from '@/lib/product-ui';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  category?: string;
  brand?: string;
  brandName?: string;
  stock?: boolean | number;
  discount?: number;
  voucher?: string;
  badge?: string;
  badgeColor?: 'red' | 'blue' | 'green' | 'amber';
  specs?: string | Record<string, any>;
  onAddToCart?: (e: React.MouseEvent, product: any) => void;
  onCompare?: (slug: string) => void;
  isCompared?: boolean;
  showCompare?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProductCard({
  id,
  name,
  slug,
  image,
  images,
  price,
  originalPrice,
  oldPrice,
  category,
  brand,
  brandName,
  stock,
  discount,
  badge,
  badgeColor,
  specs,
  onAddToCart,
  onCompare,
  isCompared: externalIsCompared,
  showCompare = false,
  className = '',
  style = {},
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  // Global Stores
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setOpen);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const compareItems = useCompareStore((state) => state.items);
  const toggleGlobalCompare = useCompareStore((state) => state.toggleCompare);

  // Derived state
  const isWishlisted = wishlistIds.includes(id) || wishlistIds.includes(slug);
  const isCompared =
    externalIsCompared !== undefined
      ? externalIsCompared
      : (compareItems.includes(slug) || (id ? compareItems.includes(id) : false));

  const displayBrand = brand || brandName || category || 'PCHub';
  const displayImage = imgError
    ? getProductImage({ name, category, brand })
    : getProductImage({ name, category, brand, image_url: image || images?.[0] });

  const effectiveOldPrice =
    originalPrice && originalPrice > price
      ? originalPrice
      : oldPrice && oldPrice > price
      ? oldPrice
      : discount && discount > 0
      ? Math.round((price / (1 - discount / 100)) / 10000) * 10000
      : getProductOriginalPrice(price, slug);

  const effectiveDiscount =
    discount && discount > 0
      ? discount
      : effectiveOldPrice
      ? Math.round(((effectiveOldPrice - price) / effectiveOldPrice) * 100)
      : 0;

  // Specs text formatting
  const specsText =
    typeof specs === 'string'
      ? specs
      : typeof specs === 'object' && specs !== null
      ? Object.values(specs).filter(Boolean).slice(0, 4).join(' · ')
      : null;

  // Handle Add To Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(e, {
        id,
        name,
        slug,
        image: displayImage,
        price,
        originalPrice: effectiveOldPrice,
        category,
        brand: displayBrand,
      });
    } else {
      addItem({
        id,
        name,
        price,
        originalPrice: effectiveOldPrice,
        image: displayImage,
        category: category || 'Linh kiện',
        brand: displayBrand,
        slug,
      });
      setCartOpen(true);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Handle Buy Now (Direct Checkout)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id,
      name,
      price,
      originalPrice: effectiveOldPrice,
      image: displayImage,
      category: category || 'Linh kiện',
      brand: displayBrand,
      slug,
    });
    router.push('/thanh-toan');
  };

  // Handle Wishlist Toggle
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id || slug);
  };

  // Handle Compare Toggle
  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCompare) {
      onCompare(slug || id);
    } else {
      toggleGlobalCompare(slug || id, category || brandName || brand, id);
    }
  };

  return (
    <div
      className={`pchub-product-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        padding: '14px',
        boxShadow: isHovered
          ? '0 10px 25px rgba(0,0,0,0.07)'
          : '0 2px 8px rgba(0,0,0,0.03)',
        borderColor: isHovered ? '#e2e8f0' : '#f1f5f9',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Top Left Badge */}
      {effectiveDiscount > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 2,
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            borderRadius: '6px',
            padding: '3px 8px',
            boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
        >
          SALE -{effectiveDiscount}%
        </div>
      ) : badge ? (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 2,
            background:
              badgeColor === 'red' || badge === 'HOT'
                ? '#ef4444'
                : badgeColor === 'amber'
                ? '#f59e0b'
                : badgeColor === 'green'
                ? '#16a34a'
                : '#2563eb',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            borderRadius: '6px',
            padding: '3px 8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </div>
      ) : null}

      {/* Top Right: Wishlist Heart Icon Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        title={isWishlisted ? 'Đã lưu trong yêu thích' : 'Thêm vào yêu thích'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWishlisted ? '#ef4444' : '#94a3b8',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'transform 0.15s ease, background 0.15s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Heart size={15} fill={isWishlisted ? '#ef4444' : 'none'} />
      </button>

      {/* Top Section: Image, Brand, Title */}
      <div>
        {/* Product Image */}
        <Link
          href={`/product/${slug}`}
          style={{
            aspectRatio: '4 / 3',
            width: '100%',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px',
            display: 'block',
            textDecoration: 'none',
            background: '#f8fafc',
            position: 'relative',
          }}
        >
          <img
            src={displayImage}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        </Link>

        {/* Brand / Category */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#2563eb',
            textTransform: 'uppercase',
            marginBottom: '4px',
            letterSpacing: '0.4px',
          }}
        >
          {displayBrand}
        </div>

        {/* Product Title */}
        <Link
          href={`/product/${slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isHovered ? '#2563eb' : '#0f172a',
              lineHeight: '1.35',
              height: '35px',
              overflow: 'hidden',
              marginBottom: specsText ? '4px' : '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.15s ease',
            }}
            title={name}
          >
            {name}
          </h3>
        </Link>

        {/* Optional Specs line */}
        {specsText && (
          <div
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              marginBottom: '8px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={specsText}
          >
            {specsText}
          </div>
        )}
      </div>

      {/* Bottom Section: Price & Action Buttons */}
      <div style={{ marginTop: 'auto' }}>
        {/* Price & Compare Section (Cùng hàng với giá) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', marginBottom: '10px' }}>
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 900,
                color: '#ef4444',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              {price.toLocaleString('vi-VN')} ₫
            </div>
            {effectiveOldPrice && effectiveOldPrice > price && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: '2px',
                  fontWeight: 500,
                }}
              >
                {effectiveOldPrice.toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          {showCompare && (
            <button
              type="button"
              onClick={handleToggleCompare}
              title={isCompared ? 'Bỏ khỏi so sánh' : 'Thêm vào danh sách so sánh'}
              style={{
                padding: '5px 9px',
                borderRadius: '8px',
                border: `1.5px solid ${
                  isCompared ? '#2563eb' : '#cbd5e1'
                }`,
                background: isCompared ? '#eff6ff' : '#ffffff',
                color: isCompared ? '#2563eb' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              <ArrowLeftRight size={12} />
              <span>{isCompared ? 'Đã so sánh' : '+ So sánh'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons: 2 hàng riêng biệt full width */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Row 1: Thêm vào giỏ hàng */}
          <button
            type="button"
            onClick={handleAddToCart}
            title="Thêm sản phẩm vào giỏ hàng"
            style={{
              width: '100%',
              padding: '8.5px 10px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              background: isAdded ? '#16a34a' : '#eff6ff',
              color: isAdded ? '#ffffff' : '#2563eb',
              border: `1px solid ${isAdded ? '#16a34a' : '#bfdbfe'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
          >
            {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
            {isAdded ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
          </button>

          {/* Row 2: Mua ngay */}
          <button
            type="button"
            onClick={handleBuyNow}
            title="Mua ngay và thanh toán"
            style={{
              width: '100%',
              padding: '8.5px 10px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
          >
            <Zap size={14} />
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}

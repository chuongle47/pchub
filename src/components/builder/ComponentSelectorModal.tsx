import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, Filter, ArrowUpDown, Tag, Sparkles } from 'lucide-react';

export interface ComponentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotKey: string;
  categoryTitle: string;
  onSelectProduct: (product: any) => void;
  currentSelectedId?: string;
  currentBuildState?: Array<{
    key: string;
    category: string;
    selected: {
      id: string;
      name: string;
      price: number;
      tdp: number;
      specs: string;
      image: string;
      slug?: string;
    } | null;
  }>;
}

export function getProductAiCompatibilityInfo(
  product: any,
  slotKey: string,
  currentBuildState?: Array<{ key: string; selected: { name: string; specs: string; tdp: number } | null }>
) {
  if (!currentBuildState || currentBuildState.length === 0) return { isCompatible: true, label: null };

  const cpuSelected = currentBuildState.find(s => s.key === 'cpu')?.selected;
  const mbSelected = currentBuildState.find(s => s.key === 'mainboard')?.selected;
  const ramSelected = currentBuildState.find(s => s.key === 'ram')?.selected;

  const combinedCpuText = cpuSelected ? `${cpuSelected.name} ${cpuSelected.specs}`.toUpperCase() : '';
  const combinedMbText = mbSelected ? `${mbSelected.name} ${mbSelected.specs}`.toUpperCase() : '';
  const prodText = `${product.name || ''} ${JSON.stringify(product.specs || '')}`.toUpperCase();

  // Socket detection
  let targetSocket = '';
  if (combinedCpuText.includes('LGA1700') || combinedCpuText.includes('14700') || combinedCpuText.includes('14900') || combinedCpuText.includes('13700') || combinedCpuText.includes('13600') || combinedCpuText.includes('12700') || combinedCpuText.includes('12400')) targetSocket = 'LGA1700';
  else if (combinedCpuText.includes('AM5') || combinedCpuText.includes('7800X3D') || combinedCpuText.includes('7900') || combinedCpuText.includes('7600') || combinedCpuText.includes('9700') || combinedCpuText.includes('9800X3D') || combinedCpuText.includes('9950') || combinedCpuText.includes('B650') || combinedCpuText.includes('X670')) targetSocket = 'AM5';
  else if (combinedCpuText.includes('AM4') || combinedCpuText.includes('5600') || combinedCpuText.includes('5700') || combinedCpuText.includes('5800X3D') || combinedCpuText.includes('B550') || combinedCpuText.includes('A520')) targetSocket = 'AM4';
  else if (combinedCpuText.includes('LGA1851') || combinedCpuText.includes('245K') || combinedCpuText.includes('265K') || combinedCpuText.includes('285K')) targetSocket = 'LGA1851';

  if (!targetSocket && combinedMbText) {
    if (combinedMbText.includes('LGA1700') || combinedMbText.includes('Z790') || combinedMbText.includes('B760') || combinedMbText.includes('H610')) targetSocket = 'LGA1700';
    else if (combinedMbText.includes('AM5') || combinedMbText.includes('B650') || combinedMbText.includes('X670') || combinedMbText.includes('B850')) targetSocket = 'AM5';
    else if (combinedMbText.includes('AM4') || combinedMbText.includes('B550') || combinedMbText.includes('A520') || combinedMbText.includes('X570')) targetSocket = 'AM4';
  }

  // RAM Gen detection
  let targetRam = '';
  if (combinedMbText.includes('DDR5') || combinedCpuText.includes('AM5') || combinedMbText.includes('Z790') || combinedMbText.includes('B650') || combinedMbText.includes('X670')) targetRam = 'DDR5';
  else if (combinedMbText.includes('DDR4') || combinedMbText.includes('B550') || combinedMbText.includes('A520')) targetRam = 'DDR4';

  const normalizedSlot = slotKey.toLowerCase();

  // 1. Mainboard slot
  if (normalizedSlot === 'mainboard' || normalizedSlot === 'mb') {
    if (targetSocket) {
      if (prodText.includes(targetSocket) || (targetSocket === 'LGA1700' && (prodText.includes('Z790') || prodText.includes('B760') || prodText.includes('H610'))) || (targetSocket === 'AM5' && (prodText.includes('B650') || prodText.includes('X670') || prodText.includes('B850')))) {
        return { isCompatible: true, label: `✓ AI Tương Thích (${targetSocket})` };
      } else {
        return { isCompatible: false, label: `⚠️ Khác Socket (${targetSocket})` };
      }
    }
  }

  // 2. CPU slot
  if (normalizedSlot === 'cpu') {
    if (targetSocket) {
      if (prodText.includes(targetSocket) || (targetSocket === 'LGA1700' && (prodText.includes('14700') || prodText.includes('14900') || prodText.includes('13700') || prodText.includes('13600') || prodText.includes('12400'))) || (targetSocket === 'AM5' && (prodText.includes('7800X3D') || prodText.includes('7600') || prodText.includes('9700X')))) {
        return { isCompatible: true, label: `✓ AI Tương Thích (${targetSocket})` };
      } else {
        return { isCompatible: false, label: `⚠️ Khác Socket (${targetSocket})` };
      }
    }
  }

  // 3. RAM slot
  if (normalizedSlot === 'ram' || normalizedSlot === 'memory') {
    if (targetRam) {
      if (prodText.includes(targetRam)) {
        return { isCompatible: true, label: `✓ AI Tương Thích (${targetRam})` };
      } else {
        return { isCompatible: false, label: `⚠️ Khác chuẩn RAM (${targetRam})` };
      }
    }
  }

  // 4. PSU slot
  if (normalizedSlot === 'psu' || normalizedSlot === 'power') {
    const totalTdp = currentBuildState.reduce((sum, s) => sum + (s.selected?.tdp || 0), 0);
    const minWatt = Math.max(650, Math.ceil((totalTdp + 150) / 50) * 50);
    const psuWattMatch = prodText.match(/(\d{3,4})\s*W/i);
    const psuWatt = psuWattMatch ? parseInt(psuWattMatch[1], 10) : 0;
    if (psuWatt >= minWatt) {
      return { isCompatible: true, label: `✓ AI Tương Thích (>= ${minWatt}W)` };
    } else if (psuWatt > 0 && psuWatt < minWatt) {
      return { isCompatible: false, label: `⚠️ Dưới ${minWatt}W đề xuất` };
    }
  }

  // 5. Cooling slot
  if (normalizedSlot === 'cooling' || normalizedSlot === 'cooler') {
    if (combinedCpuText.includes('14700') || combinedCpuText.includes('14900') || combinedCpuText.includes('13900') || combinedCpuText.includes('7950X')) {
      if (prodText.includes('360') || prodText.includes('AIO') || prodText.includes('NƯỚC')) {
        return { isCompatible: true, label: '✓ AI Khuyên Dùng (AIO 360mm)' };
      }
    }
  }

  return { isCompatible: true, label: null };
}

export default function ComponentSelectorModal({
  isOpen,
  onClose,
  slotKey,
  categoryTitle,
  onSelectProduct,
  currentSelectedId,
  currentBuildState,
}: ComponentSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'UNDER_5M' | '5M_15M' | 'OVER_15M'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC'>('DEFAULT');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(64);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Category fallback images
  const CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
    cpu: '/images/cpu-box.jpg',
    mainboard: '/images/cat-mainboard.jpg',
    motherboard: '/images/cat-mainboard.jpg',
    mb: '/images/cat-mainboard.jpg',
    ram: '/images/ram-rgb.jpg',
    memory: '/images/ram-rgb.jpg',
    gpu: '/images/gpu-strix.jpg',
    vga: '/images/gpu-strix.jpg',
    card: '/images/gpu-strix.jpg',
    storage: '/images/ssd-nvme.jpg',
    storage_2: '/images/ssd-nvme.jpg',
    ssd: '/images/ssd-nvme.jpg',
    hdd: '/images/ssd-nvme.jpg',
    psu: '/images/cat-psu.jpg',
    power: '/images/cat-psu.jpg',
    nguon: '/images/cat-psu.jpg',
    case: '/images/hero-pc.jpg',
    vo: '/images/hero-pc.jpg',
    cooling: '/images/hero-pc.jpg',
    cooler: '/images/hero-pc.jpg',
    tan: '/images/hero-pc.jpg',
    tannhiet: '/images/hero-pc.jpg',
    monitor: '/images/cat-monitor.jpg',
    gear: '/images/cat-gear.jpg',
    headset: '/images/cat-headset.jpg',
  };

  // Category slug normalization for all build slots
  const CATEGORY_SLUG_MAP: Record<string, string> = {
    cpu: 'cpu',
    mainboard: 'mainboard',
    motherboard: 'mainboard',
    mb: 'mainboard',
    ram: 'ram',
    memory: 'ram',
    gpu: 'gpu',
    vga: 'gpu',
    card: 'gpu',
    storage: 'storage',
    storage_2: 'storage',
    ssd: 'storage',
    hdd: 'storage',
    psu: 'psu',
    power: 'psu',
    nguon: 'psu',
    case: 'case',
    vo: 'case',
    cooling: 'cooling',
    cooler: 'cooling',
    tan: 'cooling',
    tannhiet: 'cooling',
    monitor: 'monitor',
    gear: 'gear',
    headset: 'headset',
  };

  const defaultCategoryImg = CATEGORY_DEFAULT_IMAGE[slotKey.toLowerCase()] || '/images/cpu-box.jpg';

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedBrand('ALL');
    setPriceRange('ALL');
    setSortBy('DEFAULT');
    setDisplayCount(64);
    setShowAllBrands(false);

    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        const catSlug = CATEGORY_SLUG_MAP[slotKey.toLowerCase()] || slotKey.toLowerCase();
        // Fetch up to 1000 items to retrieve all products in this category from Supabase
        const res = await fetch(`/api/products?limit=1000&category=${encodeURIComponent(catSlug)}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        let allProducts = data.products || [];

        // In case category has more than 1000 products, fetch remaining pages
        if (data.pagination && data.pagination.totalPages > 1) {
          const totalPages = data.pagination.totalPages;
          const pagePromises = [];
          for (let p = 2; p <= Math.min(totalPages, 5); p++) {
            pagePromises.push(
              fetch(`/api/products?limit=1000&page=${p}&category=${encodeURIComponent(catSlug)}`, { cache: 'no-store' })
                .then(r => r.json())
                .then(d => d.products || [])
                .catch(() => [])
            );
          }
          const extraPages = await Promise.all(pagePromises);
          for (const pageItems of extraPages) {
            allProducts = allProducts.concat(pageItems);
          }
        }

        setProducts(allProducts);
      } catch (err) {
        console.error('Failed to fetch modal products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [isOpen, slotKey]);

  // Extract unique brands with count dynamically
  const brandStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const bName = (p.brand_name || p.brand || (p.name?.split(' ')[0]) || '').trim().toUpperCase();
      if (bName && bName.length > 1) {
        counts[bName] = (counts[bName] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const availableBrands = useMemo(() => {
    return Object.keys(brandStats).sort((a, b) => (brandStats[b] || 0) - (brandStats[a] || 0));
  }, [brandStats]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(48);
  }, [searchTerm, selectedBrand, priceRange, sortBy]);

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // 1. Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesSku = p.sku && p.sku.toLowerCase().includes(q);
        const matchesSlug = p.slug && p.slug.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesSlug) return false;
      }

      // 2. Brand filter
      if (selectedBrand !== 'ALL') {
        const bName = (p.brand_name || p.brand || p.name?.split(' ')[0] || '').toUpperCase();
        if (!bName.includes(selectedBrand)) return false;
      }

      // 3. Price range filter
      const price = Number(p.price);
      if (priceRange === 'UNDER_5M' && price >= 5000000) return false;
      if (priceRange === '5M_15M' && (price < 5000000 || price > 15000000)) return false;
      if (priceRange === 'OVER_15M' && price <= 15000000) return false;

      return true;
    });

    // 4. AI Compatibility Sorting (prioritize compatible products at the top)
    if (currentBuildState && currentBuildState.length > 0 && sortBy === 'DEFAULT') {
      result.sort((a, b) => {
        const compatA = getProductAiCompatibilityInfo(a, slotKey, currentBuildState).isCompatible ? 1 : 0;
        const compatB = getProductAiCompatibilityInfo(b, slotKey, currentBuildState).isCompatible ? 1 : 0;
        return compatB - compatA;
      });
    }

    // 5. Price Sorting
    if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, searchTerm, selectedBrand, priceRange, sortBy, currentBuildState, slotKey]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal Card — Extra Wide Layout (1200px) */}
      <div 
        className="modal-responsive"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1100px, 94vw)',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}>
        
        {/* Header Bar */}
        <div 
          className="modal-header-responsive"
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-accent-cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              BỘ LỌC TÌM KIẾM LINH KIỆN TỪ SUPABASE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                Chọn {categoryTitle}
              </h3>
              {!loading && products.length > 0 && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'rgba(37, 99, 235, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#93c5fd',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {filteredProducts.length === products.length 
                    ? `${products.length} sản phẩm có sẵn`
                    : `Hiển thị ${filteredProducts.length} / ${products.length} sản phẩm`}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-Filter Action Bar */}
        <div 
          className="modal-body-responsive"
          style={{
            padding: '16px 28px',
            background: 'var(--color-bg-page)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
          {/* Row 1: Search & Sorting */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={`Tìm kiếm theo tên, mã SKU, hãng sản xuất (${filteredProducts.length} sản phẩm)...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 44px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#ffffff',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }} />
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="#64748b" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="DEFAULT">Sắp xếp: Mặc định</option>
                <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Row 2: Brand Filters & Price Ranges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            
            {/* Brand Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={13} /> Thương hiệu:
              </span>

              <button
                onClick={() => setSelectedBrand('ALL')}
                style={{
                  background: selectedBrand === 'ALL' ? '#2563eb' : '#ffffff',
                  color: selectedBrand === 'ALL' ? '#ffffff' : '#475569',
                  border: `1px solid ${selectedBrand === 'ALL' ? '#2563eb' : '#cbd5e1'}`,
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Tất cả ({products.length})
              </button>

              {(showAllBrands ? availableBrands : availableBrands.slice(0, 8)).map(brand => {
                const isActive = selectedBrand === brand;
                const count = brandStats[brand] || 0;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    style={{
                      background: isActive ? '#2563eb' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      border: `1px solid ${isActive ? '#2563eb' : '#cbd5e1'}`,
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{brand}</span>
                    <span style={{
                      fontSize: '10px',
                      opacity: isActive ? 0.9 : 0.6,
                      fontWeight: 600,
                    }}>
                      ({count})
                    </span>
                  </button>
                );
              })}

              {availableBrands.length > 8 && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  style={{
                    background: 'transparent',
                    color: '#2563eb',
                    border: '1px dashed #93c5fd',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showAllBrands ? 'Thu gọn' : `+${availableBrands.length - 8} hãng khác`}
                </button>
              )}
            </div>

            {/* Price Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[
                { label: 'Tất cả giá', value: 'ALL' },
                { label: '< 5 Tr', value: 'UNDER_5M' },
                { label: '5Tr – 15Tr', value: '5M_15M' },
                { label: '> 15 Tr', value: 'OVER_15M' },
              ].map(p => {
                const isActive = priceRange === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPriceRange(p.value as any)}
                    style={{
                      background: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#64748b',
                      border: `1px solid ${isActive ? '#0f172a' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Products Grid — 4 Columns Layout */}
        <div 
          style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}
          onScroll={e => {
            const target = e.currentTarget;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < 300) {
              if (displayCount < filteredProducts.length) {
                setDisplayCount(prev => Math.min(prev + 48, filteredProducts.length));
              }
            }
          }}
        >
          {/* AI Auto-Match Notification Banner */}
          {currentBuildState && currentBuildState.some(s => s.selected !== null) && (
            <div style={{
              padding: '12px 18px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#2563eb', color: '#fff', padding: '5px', borderRadius: '8px', display: 'flex' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    🤖 AI Auto-Match Đang Kích Hoạt
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Tự động ưu tiên xếp sản phẩm 100% tương thích Socket & Chuẩn RAM lên trên cùng với nhãn xanh <span style={{ color: '#16a34a', fontWeight: 800 }}>✓ AI Tương Thích</span>
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#dcfce7', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                ĐÃ LỌC TỰ ĐỘNG
              </span>
            </div>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontWeight: 700, fontSize: '15px' }}>Đang tải danh sách đầy đủ {categoryTitle} từ Supabase...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Không tìm thấy linh kiện phù hợp với bộ lọc.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Vui lòng thử xóa từ khóa tìm kiếm hoặc chọn lại thương hiệu khác.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('ALL');
                  setPriceRange('ALL');
                }}
                style={{
                  marginTop: '16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
              gap: '18px',
            }}>
              {filteredProducts.slice(0, displayCount).map(p => {
                const isSelected = p.id === currentSelectedId;
                const price = Number(p.price);
                const brand = p.brand_name || p.brand || (p.name.split(' ')[0]);

                // Extract key specs for pills
                const specsList: string[] = [];
                if (p.specs?.socket) specsList.push(p.specs.socket);
                if (p.specs?.chipset) specsList.push(p.specs.chipset);
                if (p.specs?.cores || p.specs?.core_count) {
                  const c = p.specs.cores || p.specs.core_count;
                  const t = p.specs.threads || p.specs.thread_count || c;
                  specsList.push(`${c}C/${t}T`);
                }
                if (p.specs?.clock_ghz || p.specs?.boost_clock_ghz) {
                  specsList.push(`${p.specs.boost_clock_ghz || p.specs.clock_ghz}GHz`);
                }
                if (p.specs?.capacity || p.specs?.capacity_gb) {
                  specsList.push(`${p.specs.capacity || `${p.specs.capacity_gb}GB`}`);
                }
                if (p.specs?.bus_mhz || p.specs?.speed) {
                  specsList.push(`${p.specs.bus_mhz || p.specs.speed}MHz`);
                }
                if (p.specs?.vram_gb) {
                  specsList.push(`${p.specs.vram_gb}GB ${p.specs.memory_type || ''}`.trim());
                }
                if (p.specs?.tdp_watt) {
                  specsList.push(`${p.specs.tdp_watt}W`);
                } else if (p.specs?.wattage) {
                  specsList.push(`${p.specs.wattage}W`);
                }

                const aiInfo = getProductAiCompatibilityInfo(p, slotKey, currentBuildState);

                return (
                  <div
                    key={p.id}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#2563eb' : (aiInfo.label && aiInfo.isCompatible ? '#86efac' : '#e2e8f0')}`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 6px 16px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '12px',
                        position: 'relative',
                      }}>
                        <img
                          src={p.image_url || p.image || defaultCategoryImg}
                          alt={p.name}
                          style={{ maxHeight: '115px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={e => { e.currentTarget.src = defaultCategoryImg; }}
                        />

                        {brand && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            letterSpacing: '0.4px',
                          }}>
                            {brand.toUpperCase()}
                          </span>
                        )}

                        {aiInfo.label && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: aiInfo.isCompatible ? '#16a34a' : '#ea580c',
                            color: '#ffffff',
                            fontSize: '9.5px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}>
                            <Sparkles size={10} />
                            {aiInfo.label}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: '1.45',
                        marginBottom: '6px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '38px',
                      }}>
                        {p.name}
                      </h4>

                      {/* Key Specs Pills */}
                      {specsList.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {specsList.slice(0, 3).map((item, idx) => (
                            <span key={idx} style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stock & SKU status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                        <span>Sẵn hàng ({p.stock || 50}+)</span>
                        {p.sku && <span style={{ color: '#94a3b8', marginLeft: 'auto', fontWeight: 500, fontSize: '10px' }}>{p.sku}</span>}
                      </div>
                    </div>

                    <div>
                      {/* Price Tag */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0 10px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '17px',
                          fontWeight: 900,
                          color: '#ef4444',
                          letterSpacing: '-0.3px',
                        }}>
                          {price.toLocaleString('vi-VN')} ₫
                        </span>
                        {p.original_price && Number(p.original_price) > price && (
                          <span style={{ fontSize: '11.5px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {Number(p.original_price).toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>

                      {/* CTA Select Button */}
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        style={{
                          width: '100%',
                          background: isSelected ? '#16a34a' : '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? 'none' : '0 2px 8px rgba(37,99,235,0.25)',
                          transition: 'background 0.2s',
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={16} /> Đã chọn
                          </>
                        ) : (
                          'Chọn linh kiện này'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button if there are more products to display */}
              {displayCount < filteredProducts.length && (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '20px 0 10px',
                }}>
                  <button
                    onClick={() => setDisplayCount(prev => Math.min(prev + 48, filteredProducts.length))}
                    style={{
                      background: '#ffffff',
                      color: '#2563eb',
                      border: '1.5px solid #2563eb',
                      borderRadius: '12px',
                      padding: '12px 28px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#2563eb';
                    }}
                  >
                    Xem thêm {Math.min(48, filteredProducts.length - displayCount)} linh kiện khác (Đang hiển thị {displayCount} / {filteredProducts.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

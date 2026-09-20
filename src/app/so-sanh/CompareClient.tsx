'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftRight, Check, ChevronRight, X, Trash2, Plus, ShoppingCart, Search, Sparkles } from 'lucide-react';
import { useCompareStore, useCartStore, getCompareCategoryKey } from '@/lib/store';
import { formatVnd, getProductImage } from '@/lib/product-ui';

// Bảng dịch tên thông số kỹ thuật sang tiếng Việt
const SPEC_KEY_VI: Record<string, string> = {
  // CPU
  socket: 'Socket / Cổng cắm',
  cores: 'Số nhân',
  threads: 'Số luồng',
  clock_ghz: 'Tốc độ xung nhịp',
  boost_ghz: 'Xung nhịp Boost tối đa',
  base_ghz: 'Xung nhịp cơ bản',
  tdp_watt: 'Mức tiêu thụ điện (TDP)',
  integrated_gpu: 'Card đồ họa tích hợp',
  cache_mb: 'Bộ nhớ đệm (Cache)',
  ram_support: 'RAM hỗ trợ',
  generation: 'Thế hệ',
  architecture: 'Kiến trúc vi xử lý',
  // GPU
  vram_gb: 'VRAM (Bộ nhớ đồ họa)',
  memory_type: 'Loại bộ nhớ',
  memory_bus: 'Bus bộ nhớ',
  cuda_cores: 'Số nhân CUDA',
  boost_mhz: 'Xung nhịp Boost (MHz)',
  base_mhz: 'Xung nhịp cơ bản (MHz)',
  power_connector: 'Đầu cắm nguồn',
  dp_outputs: 'Số cổng DisplayPort',
  hdmi_outputs: 'Số cổng HDMI',
  length_mm: 'Chiều dài card (mm)',
  // RAM
  capacity_gb: 'Dung lượng (GB)',
  speed_mhz: 'Tốc độ (MHz)',
  type: 'Loại RAM',
  latency: 'Độ trễ (CL)',
  voltage: 'Điện áp',
  rgb: 'Đèn RGB',
  ecc: 'Hỗ trợ ECC',
  form_factor: 'Chuẩn kích thước',
  // Mainboard
  chipset: 'Chipset',
  memory_slots: 'Số khe RAM',
  max_memory_gb: 'RAM tối đa hỗ trợ (GB)',
  pcie_slots: 'Số khe PCIe',
  m2_slots: 'Số khe M.2',
  sata_ports: 'Số cổng SATA',
  usb_ports: 'Cổng USB',
  wifi: 'Wi-Fi tích hợp',
  bluetooth: 'Bluetooth',
  atx_form: 'Chuẩn bo mạch (ATX)',
  // Storage
  capacity: 'Dung lượng',
  interface: 'Chuẩn giao tiếp',
  read_speed: 'Tốc độ đọc',
  write_speed: 'Tốc độ ghi',
  nand_type: 'Loại NAND',
  tbw: 'Tuổi thọ ghi (TBW)',
  // PSU
  wattage: 'Công suất (Watt)',
  efficiency: 'Hiệu suất',
  certification: 'Chứng nhận hiệu suất',
  modular: 'Kiểu module hóa',
  fan_size_mm: 'Kích thước quạt (mm)',
  pfc: 'Hệ số công suất (PFC)',
  protection: 'Bảo vệ mạch',
  rails: 'Đường 12V',
  // Case
  case_type: 'Loại thùng máy',
  max_gpu_length_mm: 'Độ dài GPU tối đa (mm)',
  max_cooler_height_mm: 'Chiều cao tản nhiệt tối đa (mm)',
  fan_slots_total: 'Tổng số khe quạt',
  usb_c_front: 'USB-C mặt trước',
  included_fans: 'Số quạt đi kèm',
  tempered_glass: 'Tấm kính cường lực',
  radiator_support_mm: 'Hỗ trợ radiator (mm)',
  supported_mainboard: 'Chuẩn mainboard hỗ trợ',
  drive_bays: 'Số khe ổ đĩa',
  // Cooling
  tdp_support: 'TDP tản nhiệt hỗ trợ (W)',
  fan_count: 'Số quạt',
  fan_size: 'Kích thước quạt',
  noise_db: 'Độ ồn (dB)',
  heat_pipes: 'Số ống dẫn nhiệt',
  tower_type: 'Kiểu tản nhiệt',
  // Monitor
  resolution: 'Độ phân giải',
  panel_type: 'Loại tấm nền',
  refresh_rate: 'Tần số quét (Hz)',
  response_time: 'Thời gian phản hồi (ms)',
  hdr: 'Hỗ trợ HDR',
  gsync: 'G-Sync / FreeSync',
  freesync: 'AMD FreeSync',
  size_inch: 'Kích thước màn hình (inch)',
  brightness_nits: 'Độ sáng (nit)',
  // Gear
  switch_type: 'Loại switch (bàn phím)',
  dpi: 'DPI chuột',
  wireless: 'Không dây',
  backlighting: 'Đèn nền',
  polling_rate: 'Tốc độ polling (Hz)',
  weight_g: 'Trọng lượng (g)',
};

/** Dịch key thông số sang tiếng Việt */
function translateSpecKey(key: string): string {
  const lower = key.toLowerCase();
  if (SPEC_KEY_VI[lower]) return SPEC_KEY_VI[lower];
  // Thử khớp từng phần
  for (const [k, v] of Object.entries(SPEC_KEY_VI)) {
    if (lower.includes(k) || k.includes(lower)) return v;
  }
  // Fallback: thay _ bằng khoảng trắng, viết hoa chữ đầu
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format giá trị thông số sang tiếng Việt */
function formatSpecValue(key: string, val: any): string {
  if (val === null || val === undefined || val === '') return '—';
  if (Array.isArray(val)) return val.join(', ');
  
  const s = String(val);
  const lower = key.toLowerCase();
  
  // Boolean → Có/Không
  if (s === 'true') return '✓ Có';
  if (s === 'false') return '✗ Không';
  
  // Số kèm đơn vị
  if (!isNaN(Number(val))) {
    const n = Number(val);
    if (lower.includes('watt') || lower.includes('wattage') || lower === 'tdp_watt') return `${n.toLocaleString('vi-VN')} W`;
    if (lower.includes('_gb') || lower.includes('memory_gb') || lower.includes('vram')) return `${n} GB`;
    if (lower.includes('_mhz') || lower.includes('speed_mhz')) return `${n.toLocaleString('vi-VN')} MHz`;
    if (lower.includes('_ghz') || lower === 'clock_ghz' || lower === 'boost_ghz') return `${n} GHz`;
    if (lower.includes('_mm') || lower.includes('_length_mm') || lower.includes('_height_mm') || lower.includes('_support_mm')) return `${n} mm`;
    if (lower.includes('_inch') || lower.includes('size_inch')) return `${n} inch`;
    if (lower.includes('cores')) return `${n} nhân`;
    if (lower.includes('threads')) return `${n} luồng`;
    if (lower.includes('slots') || lower.includes('slot')) return `${n} khe`;
    if (lower.includes('fan') && lower.includes('count')) return `${n} quạt`;
    if (lower.includes('fan_slots')) return `${n} khe quạt`;
    if (lower.includes('included_fans')) return `${n} quạt`;
    if (lower.includes('_db')) return `${n} dB`;
    if (lower.includes('_ports') || lower.includes('_outputs')) return `${n} cổng`;
    if (lower.includes('refresh_rate')) return `${n} Hz`;
    if (lower.includes('response_time')) return `${n} ms`;
    if (lower.includes('weight')) return `${n} g`;
    if (lower.includes('polling')) return `${n} Hz`;
  }
  
  return s;
}

interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  categorySlug?: string;
  image: string;
  specs: Record<string, any>;
  warrantyMonths: number;
}

export default function CompareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIdsParam = searchParams.get('ids');

  const { items, activeCategory, addCompare, removeCompare, clearCompare } = useCompareStore();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [onlyDiffs, setOnlyDiffs] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CompareProduct[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Sync compare items from URL or Store
  useEffect(() => {
    let slugsToFetch: string[] = [];

    if (urlIdsParam) {
      slugsToFetch = urlIdsParam.split(',').filter(Boolean);
    } else if (items && items.length > 0) {
      slugsToFetch = items;
      router.replace(`/so-sanh?ids=${encodeURIComponent(items.join(','))}`);
    }

    if (slugsToFetch.length === 0) {
      setProducts([]);
      setSpecKeys([]);
      setLoading(false);
      return;
    }

    async function fetchCompareData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/compare?ids=${encodeURIComponent(slugsToFetch.join(','))}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const mapped: CompareProduct[] = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            stock: Number(p.stock ?? 15),
            brand: p.brand_name || 'Thương hiệu',
            category: p.category_name || 'Danh mục',
            categorySlug: p.category_slug || p.category_id,
            image: getProductImage({ name: p.name, categoryName: p.category_name, image_url: p.image_url }),
            specs: p.specs || {},
            warrantyMonths: 36,
          }));

          // Filtering: Enforce same-category comparison only!
          if (mapped.length > 0) {
            const firstCategoryKey = getCompareCategoryKey(mapped[0].category);
            const sameCatMapped = mapped.filter(
              (p) => getCompareCategoryKey(p.category) === firstCategoryKey
            );

            setProducts(sameCatMapped);
            setSpecKeys(data.specKeys || [...new Set(sameCatMapped.flatMap((m) => Object.keys(m.specs)))]);

            if (sameCatMapped.length < mapped.length) {
              const cleanSlugs = sameCatMapped.map((p) => p.slug || p.id);
              router.replace(`/so-sanh?ids=${encodeURIComponent(cleanSlugs.join(','))}`);
            }
          } else {
            setProducts([]);
            setSpecKeys([]);
          }
        }
      } catch (err) {
        console.error('Failed to load compare products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompareData();
  }, [urlIdsParam, items, router]);

  const currentCategoryName = activeCategory || products[0]?.category || null;
  const currentCategoryParam = products[0]?.categorySlug || currentCategoryName || '';
  const currentCategoryKey = products[0] ? getCompareCategoryKey(products[0].category) : null;

  useEffect(() => {
    if (isSelectorOpen && currentCategoryKey) {
      setModalCategory(currentCategoryKey);
    }
  }, [isSelectorOpen, currentCategoryKey]);

  // Fetch suggestions in selector modal (supports live search & category filter)
  useEffect(() => {
    const catToUse = modalCategory || currentCategoryParam || currentCategoryKey || activeCategory || '';
    const timer = setTimeout(async () => {
      setModalLoading(true);
      try {
        let endpoint = `/api/products?limit=50`;
        if (modalSearch.trim()) {
          endpoint += `&search=${encodeURIComponent(modalSearch.trim())}`;
        }
        if (catToUse) {
          endpoint += `&category=${encodeURIComponent(catToUse)}`;
        }
        let res = await fetch(endpoint);
        let data = await res.json();

        // Fallback: if category filter returned no items, fetch broader list and filter by category key
        if ((!data.products || data.products.length === 0) && catToUse) {
          const fallbackEndpoint = `/api/products?limit=60${modalSearch.trim() ? `&search=${encodeURIComponent(modalSearch.trim())}` : ''}`;
          res = await fetch(fallbackEndpoint);
          data = await res.json();
        }

        if (data.products && Array.isArray(data.products)) {
          const currentSlugs = new Set(products.map((p) => p.slug || p.id));
          let mapped: CompareProduct[] = data.products
            .filter((p: any) => !currentSlugs.has(p.slug) && !currentSlugs.has(p.id))
            .map((p: any) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: Number(p.price),
              stock: Number(p.stock ?? 15),
              brand: p.brand_name || 'Thương hiệu',
              category: p.category_name || 'Danh mục',
              categorySlug: p.category_slug || p.category_id,
              image: getProductImage({ name: p.name, categoryName: p.category_name, image_url: p.image_url }),
              specs: p.specs || {},
              warrantyMonths: 36,
            }));

          // Lock suggestions to target category key if comparing existing products
          const targetKey = currentCategoryKey || getCompareCategoryKey(modalCategory);
          if (targetKey) {
            mapped = mapped.filter((p) => {
              const pKey = getCompareCategoryKey(p.category) || getCompareCategoryKey(p.categorySlug) || getCompareCategoryKey(p.name);
              return pKey === targetKey;
            });
          }
          setSuggestions(mapped);
        }
      } catch (err) {
        console.error('Failed to load compare suggestions:', err);
      } finally {
        setModalLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [modalSearch, modalCategory, products, activeCategory, currentCategoryParam, currentCategoryKey, isSelectorOpen]);

  const handleAddProductToCompare = (slug: string, categoryName?: string, alternateId?: string) => {
    const res = addCompare(slug, categoryName, alternateId);
    if (res && !res.success && res.categoryMismatch) {
      alert(`Chỉ được so sánh các sản phẩm trong cùng danh mục (${res.activeCategory})!`);
      return;
    }
    const existingSlugs = products.map((p) => p.slug || p.id);
    if (!existingSlugs.includes(slug)) {
      const newSlugs = [...existingSlugs, slug];
      router.replace(`/so-sanh?ids=${encodeURIComponent(newSlugs.join(','))}`);
    }
    setIsSelectorOpen(false);
  };

  const handleRemoveProduct = (product: CompareProduct) => {
    removeCompare(product.slug, product.id);
    const newProducts = products.filter((p) => p.slug !== product.slug && p.id !== product.id);
    setProducts(newProducts);
    const remainingSlugs = newProducts.map((p) => p.slug || p.id);
    if (remainingSlugs.length > 0) {
      router.replace(`/so-sanh?ids=${encodeURIComponent(remainingSlugs.join(','))}`);
    } else {
      clearCompare();
      router.replace('/so-sanh');
    }
  };

  const handleClearAll = () => {
    clearCompare();
    setProducts([]);
    router.replace('/so-sanh');
  };

  const handleAddToCart = (product: CompareProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
      slug: product.slug,
    });
    setCartOpen(true);
  };



  const cheapestProduct = React.useMemo(() => {
    if (products.length < 2) return null;
    return [...products].sort((a, b) => a.price - b.price)[0];
  }, [products]);

  const mostExpensiveProduct = React.useMemo(() => {
    if (products.length < 2) return null;
    return [...products].sort((a, b) => b.price - a.price)[0];
  }, [products]);

  const priceSavings = React.useMemo(() => {
    if (!cheapestProduct || !mostExpensiveProduct) return 0;
    return mostExpensiveProduct.price - cheapestProduct.price;
  }, [cheapestProduct, mostExpensiveProduct]);

  // Filter spec keys when "onlyDiffs" toggle is active
  const activeSpecKeys = React.useMemo(() => {
    if (!onlyDiffs || products.length < 2) return specKeys;
    return specKeys.filter((key) => {
      const values = products.map((p) => {
        const val = p.specs[key];
        return Array.isArray(val)
          ? val.join(', ').toLowerCase().trim()
          : val !== undefined && val !== null
          ? String(val).toLowerCase().trim()
          : '';
      });
      const first = values[0];
      return values.some((v) => v !== first);
    });
  }, [specKeys, products, onlyDiffs]);

  const displayProductCount = Math.max(products.length, 1);
  const showAddSlot = products.length < 3;
  const totalColumnsCount = products.length + (showAddSlot ? 1 : 0);

  const tableMinWidth = `${160 + totalColumnsCount * 220}px`;
  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: `160px repeat(${totalColumnsCount}, minmax(200px, 1fr))`,
  } as const;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>So sánh sản phẩm</span>
        </div>

        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
              PCHUB COMPARE TOOL — SO SÁNH CÙNG DANH MỤC
            </div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', lineHeight: 1.2, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowLeftRight size={28} color="#2563eb" /> So sánh chi tiết thông số
            </h1>
            {currentCategoryName && (
              <div style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '13px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '8px',
              }}>
                🏷️ Đang so sánh sản phẩm trong danh mục: <strong>{currentCategoryName}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {products.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} />
                <span>Xóa tất cả</span>
              </button>
            )}

            {products.length < 3 && (
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Plus size={15} />
                <span>{currentCategoryName ? `Thêm sản phẩm ${currentCategoryName}` : 'Thêm sản phẩm so sánh'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Notice Banner when only 1 product is selected */}
        {products.length === 1 && (
          <div style={{
            background: '#fffbebf',
            border: '1px solid #fde68a',
            color: '#92400e',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '13.5px',
            fontWeight: 600,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡 Bạn đã chọn <strong>{products[0].name}</strong>. Chọn thêm sản phẩm thứ 2 bên dưới hoặc nhấp <strong>"+ Chọn sản phẩm"</strong> để bắt đầu đối chiếu!</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              style={{
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Chọn sản phẩm thứ 2
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Đang tải dữ liệu so sánh...</div>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '64px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#eff6ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ArrowLeftRight size={32} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Chưa có sản phẩm nào trong danh sách so sánh
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              Bạn có thể nhấn vào nút <strong>"Thêm sản phẩm so sánh"</strong> hoặc nhấp vào biểu tượng <strong>So sánh (⇄)</strong> ở Trang chủ / Trang Tìm kiếm để bắt đầu đối chiếu.
            </p>
            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>Chọn sản phẩm để so sánh ngay</span>
            </button>
          </div>
        ) : (
          <React.Fragment>
            {/* Smart AI Recommendation Summary (When 2+ products compared) */}
            {products.length >= 2 && cheapestProduct && (
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '16px',
                padding: '18px 22px',
                marginBottom: '24px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ĐÁNH GIÁ & KHUYÊN DÙNG NHANH
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    🏆 Lựa chọn giá tốt nhất: <span style={{ color: '#16a34a' }}>{cheapestProduct.name}</span> ({formatVnd(cheapestProduct.price)})
                  </div>
                  {priceSavings > 0 && (
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                      ⚡ Tiết kiệm tới <strong style={{ color: '#ef4444' }}>{formatVnd(priceSavings)}</strong> so với {mostExpensiveProduct?.name}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOnlyDiffs(!onlyDiffs)}
                  style={{
                    background: onlyDiffs ? '#2563eb' : '#ffffff',
                    color: onlyDiffs ? '#ffffff' : '#1e40af',
                    border: '1.5px solid #2563eb',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: onlyDiffs ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowLeftRight size={15} />
                  <span>{onlyDiffs ? '✓ Đang bật: Chỉ xem điểm khác biệt' : '🔍 Chỉ xem điểm khác biệt thông số'}</span>
                </button>
              </div>
            )}

            {/* Comparison Table */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                marginBottom: '40px',
              }}
            >
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: tableMinWidth }}>
                  
                  {/* Header Row: Products */}
                  <div style={columnsStyle}>
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '20px 16px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 800,
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      SẢN PHẨM ({products.length})
                    </div>

                  {products.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        padding: '16px',
                        borderLeft: '1px solid #e2e8f0',
                        borderBottom: '2px solid #e2e8f0',
                        position: 'relative',
                        background: '#ffffff',
                      }}
                    >
                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        title="Bỏ khỏi so sánh"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#f1f5f9',
                          border: 'none',
                          color: '#64748b',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        <X size={14} />
                      </button>

                      {/* Image */}
                      <div
                        style={{
                          aspectRatio: '4 / 3',
                          width: '100%',
                          background: '#ffffff',
                          border: '1px solid #f1f5f9',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '12px',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Category Badge */}
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {product.category}
                      </div>

                      {/* Product Name */}
                      <Link
                        href={`/product/${product.slug}`}
                        style={{
                          display: 'block',
                          color: '#0f172a',
                          fontSize: '13.5px',
                          lineHeight: '1.4',
                          fontWeight: 700,
                          textDecoration: 'none',
                          minHeight: '38px',
                          marginBottom: '8px',
                        }}
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      {/* Price */}
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>
                        {formatVnd(product.price)}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShoppingCart size={14} />
                        <span>Thêm vào giỏ hàng</span>
                      </button>
                    </div>
                  ))}

                  {/* Empty Slot for Adding New Compare Product */}
                  {showAddSlot && (
                    <div
                      style={{
                        padding: '24px 16px',
                        borderLeft: '1px solid #e2e8f0',
                        borderBottom: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsSelectorOpen(true)}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          border: '2px dashed #3b82f6',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginBottom: '12px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Plus size={24} />
                      </button>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        Thêm sản phẩm thứ {products.length + 1}
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 12px 0' }}>
                        {currentCategoryName ? `Chọn sản phẩm trong ${currentCategoryName}` : 'Chọn linh kiện để đối chiếu'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSelectorOpen(true)}
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Chọn sản phẩm
                      </button>
                    </div>
                  )}
                </div>

                {/* Info & Specs Table Rows */}
                <div style={columnsStyle}>
                  {/* Brand Row */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', color: '#475569', fontSize: '12px', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                    THƯƠNG HIỆU
                  </div>
                  {products.map((p) => (
                    <div key={p.id} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>
                      {p.brand}
                    </div>
                  ))}
                  {showAddSlot && <div style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }} />}


                  {/* Warranty Row */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', color: '#475569', fontSize: '12px', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                    BẢO HÀNH
                  </div>
                  {products.map((p) => (
                    <div key={p.id} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} />
                      <span>{p.warrantyMonths} tháng</span>
                    </div>
                  ))}
                  {showAddSlot && <div style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }} />}

                  {/* Hàng thông số kỹ thuật chi tiết */}
                  {activeSpecKeys.length === 0 ? (
                    <div style={{ gridColumn: `1 / -1`, padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#ffffff' }}>
                      Các sản phẩm đã chọn có thông số kỹ thuật tương đồng hoàn toàn!
                    </div>
                  ) : (
                    activeSpecKeys.map((key, idx) => (
                    <React.Fragment key={key}>
                      <div
                        style={{
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          padding: '12px 16px',
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {translateSpecKey(key)}
                      </div>
                      {products.map((p) => {
                        const val = p.specs[key];
                        const displayVal = formatSpecValue(key, val);
                        const isBool = String(val) === 'true' || String(val) === 'false';
                        return (
                          <div
                            key={p.id}
                            style={{
                              background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                              borderLeft: '1px solid #e2e8f0',
                              borderBottom: '1px solid #e2e8f0',
                              padding: '12px 16px',
                              fontSize: '12.5px',
                              color: isBool
                                ? (String(val) === 'true' ? '#16a34a' : '#94a3b8')
                                : '#0f172a',
                              fontWeight: isBool ? 700 : 500,
                            }}
                          >
                            {displayVal}
                          </div>
                        );
                      })}
                      {showAddSlot && <div style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }} />}
                    </React.Fragment>
                  )))}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

        {/* Category Suggestions Section */}
        {suggestions.length > 0 && (
          <div style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#2563eb" /> Gợi ý sản phẩm cùng danh mục để so sánh
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Các linh kiện thuộc danh mục <strong>{currentCategoryName || 'nổi bật'}</strong> sẵn sàng đối chiếu
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {suggestions.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                >
                  <div>
                    <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                      {item.brand}
                    </span>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px', height: '34px', overflow: 'hidden', lineHeight: '1.3' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', marginBottom: '12px' }}>
                      {formatVnd(item.price)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProductToCompare(item.slug || item.id, item.category, item.id)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.color = '#2563eb';
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Thêm so sánh</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* QUICK PRODUCT SELECTOR MODAL */}
      {isSelectorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsSelectorOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Chọn sản phẩm so sánh
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  {currentCategoryName ? `Danh mục: ${currentCategoryName}` : 'Tất cả linh kiện'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Tìm bất kỳ sản phẩm nào theo tên, thương hiệu..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>

              {/* Category Quick Filter Pills */}
              <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { label: 'Tất cả', slug: '' },
                  { label: 'CPU', slug: 'cpu' },
                  { label: 'VGA / GPU', slug: 'vga' },
                  { label: 'RAM', slug: 'ram' },
                  { label: 'Mainboard', slug: 'mainboard' },
                  { label: 'SSD / Storage', slug: 'storage' },
                  { label: 'PSU / Nguồn', slug: 'psu' },
                  { label: 'Vỏ Case', slug: 'case' },
                  { label: 'Tản nhiệt', slug: 'cooling' },
                ].map((cat) => {
                  const isActive = modalCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setModalCategory(cat.slug)}
                      style={{
                        background: isActive ? '#2563eb' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                        border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        borderRadius: '9999px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Products List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {modalLoading ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  Đang tìm kiếm sản phẩm...
                </div>
              ) : suggestions.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Không tìm thấy sản phẩm phù hợp. Thử từ khóa khác!
                </div>
              ) : (
                suggestions.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
                      <div>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                          {p.brand} · {p.category}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: '1.3' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#ef4444' }}>
                          {formatVnd(p.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProductToCompare(p.slug || p.id, p.category, p.id)}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Chọn so sánh
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

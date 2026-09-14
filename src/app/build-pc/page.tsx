'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Cpu, Layers, Sliders, HardDrive, Zap, Box, 
  Fan, Sparkles, Check, Trash2, Plus, ShoppingCart, 
  Download, RotateCcw, ChevronRight, Bot, RefreshCw, AlertCircle,
  Printer, FileSpreadsheet, FileText, ChevronDown, Tv, Headphones,
  Save, FolderOpen, Minus, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import ComponentSelectorModal, { getProductAiCompatibilityInfo } from '@/components/builder/ComponentSelectorModal';
import CompatibilityReportModal from '@/components/builder/CompatibilityReportModal';
import CartChoiceModal from '@/components/builder/CartChoiceModal';
import { CompatibilityReport } from '@/lib/gemini';
import seed from '@/lib/seed.json';

const CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
  cpu: '/images/cpu-box.jpg',
  mainboard: '/images/cat-mainboard.jpg',
  ram: '/images/ram-rgb.jpg',
  gpu: '/images/gpu-strix.jpg',
  storage: '/images/ssd-nvme.jpg',
  storage_2: '/images/ssd-nvme.jpg',
  psu: '/images/cat-psu.jpg',
  case: '/images/hero-pc.jpg',
  cooling: '/images/hero-pc.jpg',
  monitor: '/images/cat-monitor.jpg',
  gear: '/images/cat-gear.jpg',
  headset: '/images/cat-headset.jpg',
};

interface SelectedComponent {
  id: string;
  name: string;
  price: number;
  tdp: number;
  specs: string;
  image: string;
  slug?: string;
  sku?: string;
  stock?: number;
  brand?: string;
}

interface ComponentSlot {
  key: string;
  category: string;
  icon: any;
  required: boolean;
  quantity: number;
  selected: SelectedComponent | null;
}

interface SavedBuild {
  id: string;
  title: string;
  createdAt: string;
  totalPrice: number;
  slots: { key: string; selected: SelectedComponent | null; quantity: number }[];
}

export default function BuildPcPage() {
  const [components, setComponents] = useState<ComponentSlot[]>([
    {
      key: 'cpu',
      category: 'CPU - Bộ Vi Xử Lý',
      icon: Cpu,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'mainboard',
      category: 'Mainboard - Bo Mạch Chủ',
      icon: Layers,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'ram',
      category: 'RAM - Bộ Nhớ Trong',
      icon: Sliders,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'gpu',
      category: 'VGA - Card Màn Hình',
      icon: Layers,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'storage',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      icon: HardDrive,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'psu',
      category: 'PSU - Nguồn Máy Tính',
      icon: Zap,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'case',
      category: 'Case - Vỏ Máy Tính',
      icon: Box,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'cooling',
      category: 'Tản Nhiệt (Cooling)',
      icon: Fan,
      required: true,
      quantity: 1,
      selected: null,
    },
    {
      key: 'monitor',
      category: 'Màn Hình Gaming',
      icon: Tv,
      required: false,
      quantity: 1,
      selected: null,
    },
    {
      key: 'gear',
      category: 'Bàn Phím & Chuột',
      icon: Sliders,
      required: false,
      quantity: 1,
      selected: null,
    },
    {
      key: 'headset',
      category: 'Tai Nghe & Audio',
      icon: Headphones,
      required: false,
      quantity: 1,
      selected: null,
    },
  ]);

  const [activeModalSlotKey, setActiveModalSlotKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [aiReport, setAiReport] = useState<CompatibilityReport | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  // Save / Load Build Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [buildTitleInput, setBuildTitleInput] = useState('');
  const [savedBuildsList, setSavedBuildsList] = useState<SavedBuild[]>([]);

  const router = useRouter();
  const addMultipleItems = useCartStore(s => s.addMultipleItems);
  const clearCart = useCartStore(s => s.clearCart);
  const setCartOpen = useCartStore(s => s.setOpen);
  const cartItems = useCartStore(s => s.items);

  const [showCartChoiceModal, setShowCartChoiceModal] = useState(false);

  // Read saved builds & pending AI presets from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pchub_saved_builds');
      if (raw) {
        setSavedBuildsList(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Error reading saved builds:', e);
    }
  }, []);

  // Listen for AI Preset application (from AI Advisor Chat)
  useEffect(() => {
    const applyAiPreset = (preset: any) => {
      if (!preset || !preset.components) return;
      setComponents(prev => prev.map(slot => {
        const item = preset.components[slot.key];
        if (item) {
          return {
            ...slot,
            selected: {
              id: item.id,
              name: item.name,
              price: item.price,
              tdp: item.tdp,
              specs: item.specs,
              image: item.image,
              slug: item.slug,
            },
            quantity: 1,
          };
        }
        return slot;
      }));

      setNotice(`🎉 Đã áp dụng thành công ${preset.title} (${preset.budgetLabel}) vào PC Builder!`);
      setTimeout(() => setNotice(null), 5000);
    };

    try {
      const pendingRaw = localStorage.getItem('pchub_pending_ai_preset');
      if (pendingRaw) {
        localStorage.removeItem('pchub_pending_ai_preset');
        const parsed = JSON.parse(pendingRaw);
        applyAiPreset(parsed);
      }
    } catch (e) {
      console.error('Error parsing pending AI preset:', e);
    }

    const handleEvent = (e: any) => {
      if (e.detail) applyAiPreset(e.detail);
    };
    window.addEventListener('pchub_apply_ai_preset', handleEvent);
    return () => window.removeEventListener('pchub_apply_ai_preset', handleEvent);
  }, []);

  const totalPrice = components.reduce((acc, slot) => acc + (slot.selected ? slot.selected.price * slot.quantity : 0), 0);
  const totalTdp = components.reduce((acc, slot) => acc + (slot.selected ? slot.selected.tdp * slot.quantity : 0), 0);
  const recommendedPsuWatts = totalTdp > 0 ? Math.max(550, Math.ceil((totalTdp + 150) / 50) * 50) : 0;

  const handleQtyChange = (key: string, delta: number) => {
    setComponents(prev => prev.map(s => {
      if (s.key === key) {
        const newQty = Math.max(1, Math.min(10, s.quantity + delta));
        return { ...s, quantity: newQty };
      }
      return s;
    }));
  };

  const handleRunAiAnalysis = async () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Vui lòng chọn ít nhất 1 linh kiện để phân tích!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    setIsAiAnalyzing(true);
    try {
      const payload = {
        components: selectedItems.map(s => ({
          key: s.key,
          name: s.selected!.name,
          category: s.category,
          specs: s.selected!.specs,
          price: s.selected!.price,
          tdp: s.selected!.tdp,
          quantity: s.quantity,
        })),
      };

      const res = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiReport(json.data);
      } else {
        setNotice('Không thể tải phân tích AI lúc này, vui lòng thử lại sau.');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setNotice('Lỗi kết nối phân tích AI.');
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleRemove = (key: string) => {
    setComponents(prev => prev.map(slot => slot.key === key ? { ...slot, selected: null, quantity: 1 } : slot));
  };

  const CATEGORY_ID_MAP: Record<string, string> = {
    cpu: 'c1000000-0000-0000-0000-000000000001',
    mainboard: 'c1000000-0000-0000-0000-000000000002',
    ram: 'c1000000-0000-0000-0000-000000000003',
    gpu: 'c1000000-0000-0000-0000-000000000004',
    storage: 'c1000000-0000-0000-0000-000000000005',
    psu: 'c1000000-0000-0000-0000-000000000006',
    case: 'c1000000-0000-0000-0000-000000000007',
    cooling: 'c1000000-0000-0000-0000-000000000008',
    monitor: 'c1000000-0000-0000-0000-000000000009',
    gear: 'c1000000-0000-0000-0000-000000000010',
  };

  function formatComponentSpecs(slotKey: string, product: any): string {
    if (!product) return 'Chính hãng | Bảo hành 36 tháng';
    const specs = product.specs || {};
    const slot = (slotKey || '').toLowerCase();

    if (typeof specs === 'string' && specs.trim().length > 0) {
      return specs;
    }

    const parts: string[] = [];

    if (slot === 'ram' || slot === 'memory') {
      if (specs.ram_type || specs.type) parts.push(String(specs.ram_type || specs.type));
      if (specs.kit) parts.push(String(specs.kit));
      else if (specs.capacity_gb || specs.capacity) parts.push(`${specs.capacity_gb || specs.capacity}GB`);
      if (specs.bus_speed_mhz || specs.bus_mhz || specs.speed) parts.push(`${specs.bus_speed_mhz || specs.bus_mhz || specs.speed}MHz`);
      if (specs.cas_latency || specs.timing) parts.push(String(specs.cas_latency || specs.timing));
    } else if (slot === 'cpu') {
      if (specs.socket) parts.push(`Socket ${specs.socket}`);
      if (specs.core_count || specs.cores) parts.push(`${specs.core_count || specs.cores} Nhân ${specs.thread_count || specs.threads || ''} Luồng`.trim());
      if (specs.cache || specs.cache_mb) parts.push(`${specs.cache || `${specs.cache_mb}MB`} Cache`);
      if (specs.tdp_watt || specs.tdp) parts.push(`${specs.tdp_watt || specs.tdp}W TDP`);
    } else if (slot === 'mainboard' || slot === 'mb') {
      if (specs.socket) parts.push(`Socket ${specs.socket}`);
      if (specs.ram_type) parts.push(`RAM ${specs.ram_type}`);
      if (specs.chipset) parts.push(`Chipset ${specs.chipset}`);
      if (specs.form_factor) parts.push(String(specs.form_factor));
    } else if (slot === 'gpu' || slot === 'vga') {
      if (specs.vram_gb || specs.vram) parts.push(`${specs.vram_gb || specs.vram}GB ${specs.memory_type || 'GDDR6'}`);
      if (specs.bus_width || specs.bus) parts.push(`${specs.bus_width || specs.bus}`);
      if (specs.cooling) parts.push(String(specs.cooling));
    } else if (slot === 'storage' || slot === 'ssd' || slot === 'hdd') {
      if (specs.capacity || specs.capacity_gb) parts.push(`${specs.capacity || `${specs.capacity_gb}GB`}`);
      if (specs.read_speed_mbps) parts.push(`Đọc ${specs.read_speed_mbps}MB/s`);
      if (specs.write_speed_mbps) parts.push(`Ghi ${specs.write_speed_mbps}MB/s`);
    } else if (slot === 'psu' || slot === 'power') {
      if (specs.wattage || specs.watt) parts.push(`${specs.wattage || specs.watt}W`);
      if (specs.efficiency || specs.rating) parts.push(String(specs.efficiency || specs.rating));
      if (specs.modular) parts.push(String(specs.modular));
    } else if (slot === 'cooling' || slot === 'cooler') {
      if (specs.cooler_type || specs.type) parts.push(String(specs.cooler_type || specs.type));
      if (specs.radiator_size_mm) parts.push(`${specs.radiator_size_mm}mm`);
      if (specs.fan_size_mm) parts.push(`Fan ${specs.fan_size_mm}mm`);
    }

    if (parts.length === 0 && typeof specs === 'object') {
      Object.entries(specs)
        .filter(([k]) => !['tdp', 'tdp_watt', 'integrated_gpu', 'id'].includes(k))
        .slice(0, 3)
        .forEach(([k, v]) => parts.push(`${k.replace(/_/g, ' ').toUpperCase()}: ${Array.isArray(v) ? v.join('/') : v}`));
    }

    return parts.length > 0 ? parts.join(' | ') : 'Chính hãng | Bảo hành 36 tháng';
  }

  const handleSelectProductForSlot = (product: any) => {
    if (!activeModalSlotKey) return;

    let tdp = 20;
    if (product.specs?.tdp_watt) tdp = Number(product.specs.tdp_watt);
    else if (product.specs?.tdp) tdp = Number(product.specs.tdp);
    else if (activeModalSlotKey === 'gpu') tdp = 250;
    else if (activeModalSlotKey === 'cpu') tdp = 125;

    const specsStr = formatComponentSpecs(activeModalSlotKey, product);
    const fallbackImg = CATEGORY_DEFAULT_IMAGE[activeModalSlotKey] || '/images/cpu-box.jpg';
    const newComponent: SelectedComponent = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      tdp,
      specs: specsStr,
      image: product.image_url || product.image || fallbackImg,
      slug: product.slug,
      sku: product.sku,
      stock: product.stock,
      brand: product.brand_name || product.brand,
    };

    setComponents(prev => prev.map(s => s.key === activeModalSlotKey ? { ...s, selected: newComponent, quantity: 1 } : s));

    const slotTitle = components.find(s => s.key === activeModalSlotKey)?.category || 'linh kiện';
    setNotice(`Đã chọn ${slotTitle}: ${product.name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAiAutoSelectProduct = (targetSlotKey: string) => {
    const slotLower = targetSlotKey.toLowerCase();
    const targetCatId = CATEGORY_ID_MAP[slotLower];
    
    // Find products from seed matching category/slot strictly
    const matchingProducts = seed.products.filter(p => {
      const catId = (p.category_id || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (targetCatId && catId === targetCatId) || slug.includes(slotLower) || name.includes(slotLower);
    });

    const candidates = matchingProducts.length > 0 
      ? matchingProducts 
      : seed.products.filter(p => (targetCatId ? p.category_id === targetCatId : true));

    // Sort by AI compatibility score (highest compatible product first)
    const sortedCompat = [...candidates].sort((a, b) => {
      const compatA = getProductAiCompatibilityInfo(a, targetSlotKey, components).isCompatible ? 1 : 0;
      const compatB = getProductAiCompatibilityInfo(b, targetSlotKey, components).isCompatible ? 1 : 0;
      return compatB - compatA;
    });

    const selectedProduct = sortedCompat[0];
    if (selectedProduct) {
      const prodAny = selectedProduct as any;
      const specsAny = selectedProduct.specs as any;

      let tdp = 20;
      if (specsAny?.tdp_watt) tdp = Number(specsAny.tdp_watt);
      else if (specsAny?.tdp) tdp = Number(specsAny.tdp);
      else if (slotLower === 'gpu') tdp = 250;
      else if (slotLower === 'cpu') tdp = 125;

      const specsStr = formatComponentSpecs(targetSlotKey, selectedProduct);
      const fallbackImg = CATEGORY_DEFAULT_IMAGE[targetSlotKey] || '/images/cpu-box.jpg';
      const newComponent: SelectedComponent = {
        id: prodAny.id,
        name: prodAny.name,
        price: Number(prodAny.price),
        tdp,
        specs: specsStr,
        image: prodAny.image_url || prodAny.image || fallbackImg,
        slug: prodAny.slug,
        sku: prodAny.sku,
        stock: prodAny.stock,
        brand: prodAny.brand_name || prodAny.brand,
      };

      setComponents(prev => prev.map(s => s.key === targetSlotKey ? { ...s, selected: newComponent, quantity: 1 } : s));

      const slotTitle = components.find(s => s.key === targetSlotKey)?.category || 'linh kiện';
      setNotice(`🤖 AI Auto-Match: Đã chọn ${selectedProduct.name} cho ô ${slotTitle}`);
      setTimeout(() => setNotice(null), 3500);
    } else {
      setActiveModalSlotKey(targetSlotKey);
    }
  };

  const getSelectedBuildItems = () => {
    return components
      .filter(s => s.selected !== null)
      .map(s => ({
        id: s.selected!.id,
        name: s.selected!.name,
        price: s.selected!.price,
        image: s.selected!.image,
        category: s.category,
        slug: s.selected!.slug || s.selected!.id,
        quantity: s.quantity,
      }));
  };

  const handleAddAllToCart = () => {
    const itemsToAdd = getSelectedBuildItems();
    if (itemsToAdd.length === 0) {
      setNotice('Vui lòng chọn ít nhất 1 linh kiện!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const currentCart = useCartStore.getState().items;
    if (currentCart.length > 0) {
      setShowCartChoiceModal(true);
    } else {
      clearCart();
      addMultipleItems(itemsToAdd);
      setCartOpen(true);
      setNotice(`Đã thêm ${itemsToAdd.length} linh kiện vào giỏ hàng thành công!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleDirectCheckout = () => {
    const itemsToAdd = getSelectedBuildItems();
    if (itemsToAdd.length === 0) {
      setNotice('Vui lòng chọn ít nhất 1 linh kiện!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const currentCart = useCartStore.getState().items;
    if (currentCart.length > 0) {
      setShowCartChoiceModal(true);
    } else {
      clearCart();
      addMultipleItems(itemsToAdd);
      router.push('/thanh-toan');
    }
  };

  const handleCheckoutBuildOnly = () => {
    const itemsToAdd = getSelectedBuildItems();
    clearCart();
    addMultipleItems(itemsToAdd);
    setShowCartChoiceModal(false);
    router.push('/thanh-toan');
  };

  const handleAddToCartBuildOnly = () => {
    const itemsToAdd = getSelectedBuildItems();
    clearCart();
    addMultipleItems(itemsToAdd);
    setShowCartChoiceModal(false);
    setCartOpen(true);
    setNotice(`Đã cập nhật giỏ hàng: Chỉ giữ ${itemsToAdd.length} linh kiện PC vừa build!`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleCheckoutAll = () => {
    const itemsToAdd = getSelectedBuildItems();
    addMultipleItems(itemsToAdd);
    setShowCartChoiceModal(false);
    router.push('/thanh-toan');
  };

  const handleAddToCartAll = () => {
    const itemsToAdd = getSelectedBuildItems();
    addMultipleItems(itemsToAdd);
    setShowCartChoiceModal(false);
    setCartOpen(true);
    setNotice(`Đã gộp ${itemsToAdd.length} linh kiện PC vào giỏ hàng thành công!`);
    setTimeout(() => setNotice(null), 3500);
  };

  // Save Build logic
  const handleConfirmSaveBuild = () => {
    const title = buildTitleInput.trim() || `Cấu hình PC ${new Date().toLocaleDateString('vi-VN')}`;
    const selectedCount = components.filter(s => s.selected !== null).length;
    if (selectedCount === 0) {
      setNotice('Vui lòng chọn linh kiện trước khi lưu!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const newBuild: SavedBuild = {
      id: `build-${Date.now()}`,
      title,
      createdAt: new Date().toLocaleString('vi-VN'),
      totalPrice,
      slots: components.map(s => ({ key: s.key, selected: s.selected, quantity: s.quantity })),
    };

    const updated = [newBuild, ...savedBuildsList];
    setSavedBuildsList(updated);
    try {
      localStorage.setItem('pchub_saved_builds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setShowSaveModal(false);
    setBuildTitleInput('');
    setNotice(`Đã lưu cấu hình "${title}" thành công!`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Load Build logic
  const handleLoadBuildItem = (saved: SavedBuild) => {
    setComponents(prev => prev.map(s => {
      const found = saved.slots.find(x => x.key === s.key);
      if (found) {
        return { ...s, selected: found.selected, quantity: found.quantity || 1 };
      }
      return { ...s, selected: null, quantity: 1 };
    }));

    setShowLoadModal(false);
    setAiReport(null);
    setNotice(`Đã tải cấu hình "${saved.title}"!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteBuildItem = (id: string) => {
    const updated = savedBuildsList.filter(b => b.id !== id);
    setSavedBuildsList(updated);
    try {
      localStorage.setItem('pchub_saved_builds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintPdf = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Chưa có linh kiện nào để xuất cấu hình!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }
    const total = selectedItems.reduce((sum, s) => sum + (s.selected ? s.selected.price * s.quantity : 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép trình duyệt mở pop-up để xem bản in cấu hình PDF!');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>Bảng Báo Giá Cấu Hình PC — PCHub</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 2px solid #0055d4; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { color: #0055d4; margin: 0 0 6px 0; font-size: 24px; font-weight: 900; }
          .meta { font-size: 13px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; }
          .total-row { background: #eff6ff; font-weight: bold; font-size: 16px; color: #1d4ed8; }
          .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PCHub — BẢNG BÁO GIÁ CẤU HÌNH PC</h1>
            <div class="meta">Hệ thống phân phối linh kiện & máy tính chính hãng · Hotline: 1900-6789</div>
          </div>
          <div style="text-align: right;" class="meta">
            <div>Ngày lập: ${new Date().toLocaleDateString('vi-VN')}</div>
            <div>Trang web: pchub-iota.vercel.app</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">STT</th>
              <th style="width: 140px;">Danh mục</th>
              <th>Tên linh kiện</th>
              <th style="width: 70px; text-align: center;">Số lượng</th>
              <th style="width: 130px; text-align: right;">Đơn giá</th>
              <th style="width: 130px; text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems.map((s, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><b>${s.category}</b></td>
                <td><b>${s.selected?.name}</b><br><span style="color: #64748b; font-size: 11px;">${s.selected?.specs || ''}</span></td>
                <td style="text-align: center;">${s.quantity}</td>
                <td style="text-align: right;">${s.selected?.price.toLocaleString('vi-VN')} ₫</td>
                <td style="text-align: right; font-weight: bold; color: #2563eb;">${((s.selected?.price || 0) * s.quantity).toLocaleString('vi-VN')} ₫</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5" style="text-align: right; padding: 14px 12px;">TỔNG CHI PHÍ TẠM TÍNH:</td>
              <td style="text-align: right; padding: 14px 12px; color: #2563eb; font-size: 18px;">${total.toLocaleString('vi-VN')} ₫</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Cam kết 100% linh kiện chính hãng · Bảo hành 36 tháng · Đổi mới 7 ngày đầu nếu có lỗi nhà sản xuất.</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Chưa có linh kiện nào để xuất cấu hình!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }
    const total = selectedItems.reduce((sum, s) => sum + (s.selected ? s.selected.price * s.quantity : 0), 0);

    let csv = '\uFEFFSTT,Danh mục,Tên linh kiện,Số lượng,Đơn giá (VNĐ),Thành tiền (VNĐ)\n';
    selectedItems.forEach((s, idx) => {
      const name = `"${(s.selected?.name || '').replace(/"/g, '""')}"`;
      const price = s.selected?.price || 0;
      const subtotal = price * s.quantity;
      csv += `${idx + 1},"${s.category}",${name},${s.quantity},${price},${subtotal}\n`;
    });
    csv += `,,,,TỔNG CỘNG,${total}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCHub_CauHinh_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setNotice('Đã xuất file bảng tính Excel (CSV) thành công!');
    setTimeout(() => setNotice(null), 3000);
  };

  const applyPresetEmpty = () => {
    setComponents(prev => prev.map(s => ({ ...s, selected: null, quantity: 1 })));
    setAiReport(null);
    setNotice('Đã làm trống toàn bộ cấu hình. Hãy bắt đầu chọn từng linh kiện theo ý bạn!');
    setTimeout(() => setNotice(null), 3000);
  };

  const coreComponents = components.filter(s => s.required);
  const peripheralComponents = components.filter(s => !s.required);

  const activeSlotCategory = components.find(s => s.key === activeModalSlotKey)?.category || 'Linh kiện';
  const activeSlotSelectedId = components.find(s => s.key === activeModalSlotKey)?.selected?.id;

  // AI Heuristic Diagnosis
  const cpuSelected = components.find(s => s.key === 'cpu')?.selected;
  const mainboardSelected = components.find(s => s.key === 'mainboard')?.selected;
  const ramSelected = components.find(s => s.key === 'ram')?.selected;
  const gpuSelected = components.find(s => s.key === 'gpu')?.selected;
  const psuSelected = components.find(s => s.key === 'psu')?.selected;

  const isIntel = cpuSelected?.name.toLowerCase().includes('intel') || cpuSelected?.name.toLowerCase().includes('core');
  const isAmd = cpuSelected?.name.toLowerCase().includes('amd') || cpuSelected?.name.toLowerCase().includes('ryzen');
  const isLga1700Cpu = cpuSelected?.specs?.includes('LGA1700') || cpuSelected?.name?.includes('14') || cpuSelected?.name?.includes('13') || cpuSelected?.name?.includes('12');
  const isAm5Cpu = cpuSelected?.specs?.includes('AM5') || cpuSelected?.name?.includes('7000') || cpuSelected?.name?.includes('9000');
  
  const isLga1700Mb = mainboardSelected?.specs?.includes('LGA1700') || mainboardSelected?.name?.includes('Z790') || mainboardSelected?.name?.includes('B760') || mainboardSelected?.name?.includes('Z690');
  const isAm5Mb = mainboardSelected?.specs?.includes('AM5') || mainboardSelected?.name?.includes('X670') || mainboardSelected?.name?.includes('B650');

  let isSocketCompatible = true;
  let socketMessage = 'Socket CPU & Bo mạch chủ tương thích 100%';
  if (cpuSelected && mainboardSelected) {
    if (isLga1700Cpu && isAm5Mb) {
      isSocketCompatible = false;
      socketMessage = '⚠️ Không tương thích: CPU Intel LGA1700 không gắn được trên Mainboard AMD AM5!';
    } else if (isAm5Cpu && isLga1700Mb) {
      isSocketCompatible = false;
      socketMessage = '⚠️ Không tương thích: CPU AMD AM5 không gắn được trên Mainboard Intel LGA1700!';
    } else if (isIntel && isAm5Mb) {
      isSocketCompatible = false;
      socketMessage = '⚠️ Không tương thích: CPU Intel không hỗ trợ Mainboard socket AMD!';
    } else if (isAmd && isLga1700Mb) {
      isSocketCompatible = false;
      socketMessage = '⚠️ Không tương thích: CPU AMD không hỗ trợ Mainboard socket Intel!';
    }
  }

  const isDdr5Mb = mainboardSelected?.name?.includes('DDR5') || mainboardSelected?.specs?.includes('DDR5');
  const isDdr4Mb = mainboardSelected?.name?.includes('DDR4') || mainboardSelected?.specs?.includes('DDR4');
  const isDdr5Ram = ramSelected?.name?.includes('DDR5') || ramSelected?.specs?.includes('DDR5');
  const isDdr4Ram = ramSelected?.name?.includes('DDR4') || ramSelected?.specs?.includes('DDR4');

  let isRamCompatible = true;
  let ramMessage = 'Bo mạch chủ hỗ trợ chuẩn bus RAM tốc độ cao mượt mà';
  if (mainboardSelected && ramSelected) {
    if (isDdr5Mb && isDdr4Ram) {
      isRamCompatible = false;
      ramMessage = '⚠️ Không tương thích: Mainboard dùng DDR5, không gắn được RAM DDR4!';
    } else if (isDdr4Mb && isDdr5Ram) {
      isRamCompatible = false;
      ramMessage = '⚠️ Không tương thích: Mainboard dùng DDR4, không gắn được RAM DDR5!';
    }
  }

  let psuWatts = 0;
  if (psuSelected) {
    const match = psuSelected.name.match(/(\d{3,4})\s*W/i) || psuSelected.specs.match(/(\d{3,4})\s*W/i);
    psuWatts = match ? parseInt(match[1], 10) : 750;
  }
  const isPsuAdequate = !psuSelected || (psuWatts >= recommendedPsuWatts - 50);

  // Compute Rich AI Category Recommendations (No Step Numbers, Full Technical Explanations, Images & Multi-Product Comparisons)
  const aiCategoryRecommendations = useMemo(() => {
    const list: Array<{
      categoryKey: string;
      categoryTitle: string;
      badge: string;
      explanation: string;
      products: Array<{
        id: string;
        name: string;
        price: number;
        tdp: number;
        specs: string;
        image: string;
        slug: string;
        rawProduct: any;
      }>;
    }> = [];

    const cpu = cpuSelected;
    const mb = mainboardSelected;
    const ram = ramSelected;
    const gpu = gpuSelected;
    const storage = components.find(s => s.key === 'storage')?.selected;
    const psu = psuSelected;
    const pcCase = components.find(s => s.key === 'case')?.selected;
    const cooling = components.find(s => s.key === 'cooling')?.selected;

    const cpuText = cpu ? `${cpu.name} ${cpu.specs}`.toUpperCase() : '';
    const mbText = mb ? `${mb.name} ${mb.specs}`.toUpperCase() : '';

    let socket = 'LGA1700';
    let isIntel = true;
    if (cpuText.includes('AM5') || cpuText.includes('7800X3D') || cpuText.includes('7900') || cpuText.includes('7600') || cpuText.includes('9700') || cpuText.includes('9800X3D')) {
      socket = 'AM5';
      isIntel = false;
    } else if (cpuText.includes('AM4') || cpuText.includes('ATHLON') || cpuText.includes('3000G') || cpuText.includes('5600') || cpuText.includes('5700') || cpuText.includes('5800X3D') || cpuText.includes('3600') || cpuText.includes('3200G') || cpuText.includes('3400G') || cpuText.includes('5500')) {
      socket = 'AM4';
      isIntel = false;
    }

    const isDdr5 = mbText.includes('DDR5') || cpuText.includes('AM5') || mbText.includes('Z790') || mbText.includes('B650') || (!mb && (cpuText.includes('14700') || cpuText.includes('14900') || cpuText.includes('AM5')));
    const ramGen = isDdr5 ? 'DDR5' : 'DDR4';
    const recWatts = Math.max(750, Math.ceil((totalTdp + 150) / 50) * 50);

    const getCandidateProducts = (slotKey: string, limit = 3) => {
      const targetCatId = CATEGORY_ID_MAP[slotKey];
      const items = seed.products.filter(p => {
        const catId = (p.category_id || '').toLowerCase();
        const slug = (p.slug || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (targetCatId && catId === targetCatId) || slug.includes(slotKey) || name.includes(slotKey);
      });

      const compatibleItems = items.filter(p => getProductAiCompatibilityInfo(p, slotKey, components).isCompatible);
      const candidates = compatibleItems.length > 0
        ? compatibleItems
        : items.length > 0
        ? items
        : seed.products.filter(p => (targetCatId ? p.category_id === targetCatId : true));

      return candidates.slice(0, limit).map(p => {
        const specsStr = formatComponentSpecs(slotKey, p);
        const fallbackImg = CATEGORY_DEFAULT_IMAGE[slotKey] || '/images/cpu-box.jpg';
        return {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          tdp: Number((p.specs as any)?.tdp_watt || (p.specs as any)?.tdp || (slotKey === 'gpu' ? 250 : slotKey === 'cpu' ? 125 : 20)),
          specs: specsStr,
          image: p.image_url || (p as any).image || fallbackImg,
          slug: p.slug,
          rawProduct: p,
        };
      });
    };

    // Step 1: CPU (if not selected)
    if (!cpu) {
      list.push({
        categoryKey: 'cpu',
        categoryTitle: 'BƯỚC 1: CHỌN CPU - BỘ VI XỬ LÝ',
        badge: 'Khuyên Dùng Hàng Đầu',
        explanation: 'Vi xử lý đóng vai trò hạt nhân điều khiển toàn bộ dàn PC. AI gợi ý 3 dòng CPU có số nhân/luồng cao và xung nhịp Turbo ấn tượng. Hãy chọn CPU đầu tiên để bắt đầu build theo thứ tự từ trên xuống dưới!',
        products: getCandidateProducts('cpu', 3),
      });
      return list;
    }

    // Step 2: Mainboard (if not selected)
    if (!mb) {
      list.push({
        categoryKey: 'mainboard',
        categoryTitle: 'BƯỚC 2: CHỌN MAINBOARD - BO MẠCH CHỦ',
        badge: `Chuẩn Socket ${socket}`,
        explanation: `Dựa trên CPU ${cpu.name}, Bo mạch chủ cần trang bị chuẩn Socket ${socket} và hệ thống cấp điện VRM cao cấp để khai thác 100% công suất CPU. Chọn Bo mạch chủ để mở bước tiếp theo!`,
        products: getCandidateProducts('mainboard', 3),
      });
      return list;
    }

    // Step 3: RAM (if not selected)
    if (!ram) {
      list.push({
        categoryKey: 'ram',
        categoryTitle: 'BƯỚC 3: CHỌN RAM - BỘ NHỚ TRONG',
        badge: `RAM ${ramGen} Dual-Channel`,
        explanation: `Phù hợp với Bo mạch chủ ${mb.name}, khuyên dùng Kit RAM ${ramGen} Kênh Đôi (Dual-Channel 2x16GB) để nhân đôi băng thông truyền tải dữ liệu giữa CPU và RAM.`,
        products: getCandidateProducts('ram', 3),
      });
      return list;
    }

    // Step 4: GPU (if not selected)
    if (!gpu) {
      list.push({
        categoryKey: 'gpu',
        categoryTitle: 'BƯỚC 4: CHỌN VGA - CARD MÀN HÌNH',
        badge: 'Đồ Họa & Game 4K/2K',
        explanation: 'Card màn hình đảm nhận xử lý hình ảnh 3D và thuật toán Ray Tracing. AI đề xuất các mẫu Card đồ họa hiệu năng cao để bạn chọn lựa theo mức ngân sách.',
        products: getCandidateProducts('gpu', 3),
      });
      return list;
    }

    // Step 5: Storage (if not selected)
    if (!storage) {
      list.push({
        categoryKey: 'storage',
        categoryTitle: 'BƯỚC 5: CHỌN SSD - Ổ ĐĨA CỨNG NVME',
        badge: 'PCIe Gen 4.0 SuperSpeed',
        explanation: 'Ổ cứng SSD NVMe PCIe 4.0 cung cấp tốc độ đọc ghi vượt trội (lên tới 7000MB/s), giúp khởi động hệ điều hành Windows trong vài giây và tải game nhanh chóng.',
        products: getCandidateProducts('storage', 3),
      });
      return list;
    }

    // Step 6: PSU (if not selected)
    if (!psu) {
      list.push({
        categoryKey: 'psu',
        categoryTitle: 'BƯỚC 6: CHỌN PSU - NGUỒN MÁY TÍNH',
        badge: `Đề Xuất ≥ ${recWatts}W Gold`,
        explanation: `Dựa trên tổng công suất tiêu thụ ước tính của CPU ${cpu.name} & Card đồ họa ${gpu ? gpu.name : ''} (~${totalTdp}W TDP), AI khuyến nghị bộ nguồn công suất thực từ ${recWatts}W đạt chuẩn 80 Plus Gold.`,
        products: getCandidateProducts('psu', 3),
      });
      return list;
    }

    // Step 7: Case (if not selected)
    if (!pcCase) {
      list.push({
        categoryKey: 'case',
        categoryTitle: 'BƯỚC 7: CHỌN CASE - VỎ MÁY TÍNH',
        badge: 'Mid-Tower & Airflow Đỉnh Cao',
        explanation: 'Vỏ máy tính (Case) bảo vệ toàn bộ phần cứng và điều hòa luồng khí. AI gợi ý các dòng Case chuẩn Mid-Tower/ATX rộng rãi, hỗ trợ lắp tản AIO 360mm ở nóc và vừa vặn các dòng Card màn hình lớn.',
        products: getCandidateProducts('case', 3),
      });
      return list;
    }

    // Step 8: Cooling (if not selected)
    if (!cooling) {
      const cpuTdpEst = cpu ? (cpu.tdp || 253) : 200;
      list.push({
        categoryKey: 'cooling',
        categoryTitle: 'BƯỚC 8: CHỌN TẢN NHIỆT (COOLING)',
        badge: cpuTdpEst >= 200 ? 'Tản AIO 360mm Khuyên Dùng' : 'Tản Nhiệt Khí Đôi',
        explanation: `CPU ${cpu.name} tỏa nhiệt lượng khoảng ~${cpuTdpEst}W TDP khi xử lý tác vụ nặng. AI đề xuất sử dụng Tản Nhiệt Nước AIO 360mm hoặc Tản Khí 6 Ống Đồng để giữ nhiệt độ luôn dưới 68°C.`,
        products: getCandidateProducts('cooling', 3),
      });
      return list;
    }

    return list;
  }, [cpuSelected, mainboardSelected, ramSelected, gpuSelected, psuSelected, components, totalTdp]);

  const renderSlotRow = (slot: ComponentSlot) => {
    const Icon = slot.icon;
    const isSelected = slot.selected !== null;
    const slotAiSuggestion = aiCategoryRecommendations.find(cat => cat.categoryKey === slot.key);

    return (
      <div key={slot.key} className="builder-slot-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            padding: isSelected ? '2px' : '0',
          }}>
            {isSelected ? (
              <img
                src={slot.selected!.image}
                alt={slot.selected!.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div style={{ color: '#2563eb' }}>
                <Icon size={22} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {slot.category} {slot.required && <span style={{ color: '#ef4444' }}>*</span>}
            </div>
            {isSelected ? (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '3px 0 4px', lineHeight: '1.4' }}>
                  {slot.selected!.name}
                </h4>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {slot.selected!.specs}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                  Vui lòng chọn linh kiện
                </div>
                {slotAiSuggestion && (
                  <div style={{
                    marginTop: '5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}>
                    <Sparkles size={12} color="#2563eb" />
                    AI gợi ý: {slotAiSuggestion.badge}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions & Quantity Adjuster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isSelected ? (
            <>
              {/* Quantity Control Buttons [- Qty +] */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#f8fafc',
                overflow: 'hidden',
              }}>
                <button
                  type="button"
                  onClick={() => handleQtyChange(slot.key, -1)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  <Minus size={13} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 800, padding: '0 8px', color: '#0f172a' }}>
                  {slot.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(slot.key, 1)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', minWidth: '100px', textAlign: 'right' }}>
                {((slot.selected?.price || 0) * slot.quantity).toLocaleString('vi-VN')} ₫
              </div>

              <button
                onClick={() => setActiveModalSlotKey(slot.key)}
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <RefreshCw size={13} />
                Đổi
              </button>

              <button
                onClick={() => handleRemove(slot.key)}
                style={{
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '7px',
                  cursor: 'pointer'
                }}
                title="Xóa linh kiện"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setActiveModalSlotKey(slot.key)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
              }}
            >
              <Plus size={14} />
              Chọn linh kiện
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Xây dựng Cấu hình PC (Build PC)</span>
        </div>

        {/* Notice Bar */}
        {notice && (
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
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          }}>
            <Check size={18} color="#10b981" />
            {notice}
          </div>
        )}

        {/* Top Header Banner & Action Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={24} color="#38bdf8" />
              Xây Dựng Cấu Hình PC Tự Chọn
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Lựa chọn linh kiện chuẩn xác, tự động kiểm tra tương thích Socket & công suất nguồn với Gemini AI
            </p>
          </div>

          {/* Toolbar Action Buttons (Save Build, Load Build, Reset) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Save size={15} color="#38bdf8" />
              Lưu cấu hình
            </button>

            <button
              type="button"
              onClick={() => setShowLoadModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <FolderOpen size={15} color="#fbbf24" />
              Tải cấu hình ({savedBuildsList.length})
            </button>

            <button
              type="button"
              onClick={applyPresetEmpty}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={15} />
              Làm mới
            </button>
          </div>
        </div>

        {/* 2-Columns Main Layout */}
        <div className="builder-layout-grid" style={{ alignItems: 'flex-start' }}>
          
          {/* Left Column: Component Slots List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* AI Smart Suggestion Banner & Multi-Product Recommendations */}
            {!cpuSelected ? (
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                border: '1.5px dashed #bfdbfe',
                borderRadius: '16px',
                padding: '18px 24px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 2px 10px rgba(37,99,235,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#2563eb', color: '#fff', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      🤖 AI Smart Advisor — Vui Lòng Chọn CPU Đầu Tiên
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: '3px 0 0 0' }}>
                      Hãy chọn <b>CPU (Bộ Vi Xử Lý)</b> đầu tiên để AI tự động lọc và gợi ý Mainboard chuẩn Socket, Tản nhiệt đủ công suất TDP, RAM Dual-Channel và Nguồn tối ưu nhất!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalSlotKey('cpu')}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
                >
                  <Plus size={14} />
                  Chọn CPU Ngay →
                </button>
              </div>
            ) : (
              aiCategoryRecommendations.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#2563eb', color: '#fff', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center' }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          🤖 AI Smart Advisor — Linh Kiện Tương Thích Với {cpuSelected.name}
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: '2px 0 0 0' }}>
                          Dựa trên CPU đã chọn, AI tự động phân tích thông số kỹ thuật và gợi ý các linh kiện chuẩn Socket, TDP & băng thông tối ưu nhất:
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#16a34a',
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      padding: '4px 12px',
                      borderRadius: '20px',
                    }}>
                      AI SMART RECOMMEND
                    </span>
                  </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {aiCategoryRecommendations.map(cat => (
                    <div
                      key={cat.categoryKey}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '14px',
                        padding: '16px 18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      {/* Header category info & technical explanation */}
                      <div style={{ marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.3px' }}>
                            {cat.categoryTitle}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 10px', borderRadius: '12px' }}>
                            {cat.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#334155', margin: 0, lineHeight: '1.5', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
                          <span style={{ fontWeight: 700, color: '#1d4ed8' }}>💡 Giải thích chuyên sâu: </span>
                          {cat.explanation}
                        </p>
                      </div>

                      {/* Side-by-side Multi-Product Comparison Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                        {cat.products.map(prod => {
                          const isCurrentlySelected = components.find(s => s.key === cat.categoryKey)?.selected?.id === prod.id;

                          return (
                            <div
                              key={prod.id}
                              style={{
                                background: isCurrentlySelected ? '#f0fdf4' : '#ffffff',
                                border: `1.5px solid ${isCurrentlySelected ? '#22c55e' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                              }}
                              onMouseEnter={e => {
                                if (!isCurrentlySelected) {
                                  e.currentTarget.style.borderColor = '#2563eb';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isCurrentlySelected) {
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {/* Product Thumbnail & Details */}
                              <div>
                                <div style={{
                                  width: '100%',
                                  height: '110px',
                                  borderRadius: '8px',
                                  background: '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: '10px',
                                  overflow: 'hidden',
                                  padding: '6px',
                                }}>
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={e => { (e.target as any).src = CATEGORY_DEFAULT_IMAGE[cat.categoryKey] || '/images/cpu-box.jpg'; }}
                                  />
                                </div>

                                <h4 style={{
                                  fontSize: '12.5px',
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  margin: '0 0 6px 0',
                                  lineHeight: '1.35',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  height: '34px',
                                }} title={prod.name}>
                                  {prod.name}
                                </h4>

                                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prod.specs || `${prod.tdp}W TDP`}
                                </p>
                              </div>

                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', marginBottom: '8px' }}>
                                  {prod.price.toLocaleString('vi-VN')} ₫
                                </div>

                                {isCurrentlySelected ? (
                                  <div style={{
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    color: '#15803d',
                                    background: '#dcfce7',
                                    border: '1px solid #86efac',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                  }}>
                                    <Check size={13} />
                                    Đã chọn linh kiện này
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAiAutoSelectProduct(cat.categoryKey)}
                                    style={{
                                      width: '100%',
                                      fontSize: '11.5px',
                                      fontWeight: 800,
                                      color: '#ffffff',
                                      background: '#2563eb',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '7px 8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
                                  >
                                    <Plus size={13} />
                                    Chọn linh kiện này
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Core Components Section */}
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Cpu size={16} color="#2563eb" />
                Linh Kiện Bắt Buộc (Core Hardware)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {coreComponents.map(slot => renderSlotRow(slot))}
              </div>
            </div>

            {/* Peripherals Section */}
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '8px 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Tv size={16} color="#9333ea" />
                Thiết Bị Ngoại Vi & Phụ Kiện (Optional Peripherals)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {peripheralComponents.map(slot => renderSlotRow(slot))}
              </div>
            </div>

          </div>

          {/* Right Column: Build Summary & AI Diagnostic */}
          <aside style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            position: 'sticky',
            top: '90px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Tóm Tắt Cấu Hình PC
            </h3>

            {/* Total Price */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Tổng chi phí tạm tính:</span>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                {totalPrice.toLocaleString('vi-VN')} ₫
              </div>
            </div>

            {/* TDP Estimate */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Công suất ước tính (TDP):</span>
                <span style={{ color: '#ea580c', fontWeight: 800 }}>{totalTdp} W</span>
              </div>
              
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${Math.min(100, (totalTdp / 1000) * 100)}%`, height: '100%', background: '#22c55e' }} />
              </div>
              {totalTdp > 0 && recommendedPsuWatts > 0 && (
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                  ✓ Đề xuất nguồn: {recommendedPsuWatts}W 80 Plus Gold
                </div>
              )}
            </div>

            {/* AI Diagnostics Box with Gemini Integration */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <Bot size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      AI Phân Tích Tương Thích
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Powered by Google Gemini</span>
                  </div>
                </div>

                {aiReport && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    background: aiReport.compatibilityScore >= 90 ? '#dcfce7' : aiReport.compatibilityScore >= 75 ? '#fef3c7' : '#fee2e2',
                    color: aiReport.compatibilityScore >= 90 ? '#15803d' : aiReport.compatibilityScore >= 75 ? '#b45309' : '#b91c1c',
                  }}>
                    <Sparkles size={11} />
                    <span>{aiReport.compatibilityScore}/100</span>
                  </div>
                )}
              </div>

              {aiReport ? (
                <div>
                  <p style={{
                    fontSize: '11.5px',
                    color: '#334155',
                    lineHeight: '1.45',
                    margin: '0 0 10px 0',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${aiReport.compatibilityScore >= 90 ? '#10b981' : '#f59e0b'}`,
                  }}>
                    {aiReport.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setShowFullReportModal(true)}
                      style={{
                        flex: 1,
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={13} />
                      Xem phân tích chi tiết
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {(cpuSelected || mainboardSelected || ramSelected || psuSelected) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '12px', color: '#1e3a8a', marginBottom: '12px' }}>
                      {cpuSelected && mainboardSelected && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {isSocketCompatible ? (
                            <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                          ) : (
                            <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          )}
                          <span>{socketMessage}</span>
                        </div>
                      )}

                      {mainboardSelected && ramSelected && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {isRamCompatible ? (
                            <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                          ) : (
                            <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          )}
                          <span>{ramMessage}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0 14px', color: '#94a3b8', fontSize: '12px' }}>
                      <Cpu size={24} color="#cbd5e1" style={{ marginBottom: '6px' }} />
                      <div>Chọn linh kiện để AI phân tích tương thích</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={isAiAnalyzing}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: isAiAnalyzing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {isAiAnalyzing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Gemini đang phân tích...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Hỏi AI Phân Tích Chuyên Sâu</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
              <button
                type="button"
                onClick={handleDirectCheckout}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Zap size={16} />
                Thanh Toán Ngay Dàn PC ➔
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                style={{
                  background: '#f8fafc',
                  color: '#2563eb',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ShoppingCart size={16} />
                Thêm tất cả vào giỏ hàng
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(v => !v)}
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} />
                  Xuất file cấu hình (PDF / Excel)
                  <ChevronDown size={14} />
                </button>

                {showExportMenu && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    padding: '6px',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={15} color="#2563eb" />
                      In / Lưu PDF Báo Giá A4
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <FileSpreadsheet size={15} color="#16a34a" />
                      Tải bảng tính Excel (.CSV)
                    </button>
                  </div>
                )}
              </div>
            </div>

          </aside>

        </div>

      </div>



      {/* Save Build Modal */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '420px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Lưu cấu hình PC này</h3>
              <button onClick={() => setShowSaveModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Đặt tên cho cấu hình để dễ dàng tải lại hoặc chia sẻ sau này:
            </p>
            <input
              type="text"
              placeholder="Ví dụ: Dàn PC Gaming 30 Triệu..."
              value={buildTitleInput}
              onChange={(e) => setBuildTitleInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', marginBottom: '20px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Hủy
              </button>
              <button onClick={handleConfirmSaveBuild} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Build Modal */}
      {showLoadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '520px', maxWidth: '92vw', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cấu hình đã lưu ({savedBuildsList.length})</h3>
              <button onClick={() => setShowLoadModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedBuildsList.length > 0 ? (
                savedBuildsList.map(b => (
                  <div key={b.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Lưu ngày: {b.createdAt} · <span style={{ color: '#2563eb', fontWeight: 700 }}>{b.totalPrice.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleLoadBuildItem(b)} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Tải
                      </button>
                      <button onClick={() => handleDeleteBuildItem(b.id)} style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecdd3', borderRadius: '7px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>
                  Chưa có cấu hình nào được lưu. Hãy bấm "Lưu cấu hình" để lưu lại bộ PC của bạn!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Component Selection Modal */}
      {activeModalSlotKey && (
        <ComponentSelectorModal
          isOpen={!!activeModalSlotKey}
          onClose={() => setActiveModalSlotKey(null)}
          slotKey={activeModalSlotKey}
          categoryTitle={activeSlotCategory}
          onSelectProduct={handleSelectProductForSlot}
          currentSelectedId={activeSlotSelectedId}
          currentBuildState={components}
        />
      )}

      {/* Comprehensive Gemini AI Compatibility Modal */}
      {showFullReportModal && (
        <CompatibilityReportModal
          isOpen={showFullReportModal}
          onClose={() => setShowFullReportModal(false)}
          report={aiReport}
          onReanalyze={handleRunAiAnalysis}
          isAnalyzing={isAiAnalyzing}
        />
      )}

      {/* Modal Hỏi Lựa Chọn Thanh Toán */}
      <CartChoiceModal
        isOpen={showCartChoiceModal}
        onClose={() => setShowCartChoiceModal(false)}
        buildItemsCount={getSelectedBuildItems().length}
        buildTotal={totalPrice}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onCheckoutBuildOnly={handleCheckoutBuildOnly}
        onAddToCartBuildOnly={handleAddToCartBuildOnly}
        onCheckoutAll={handleCheckoutAll}
        onAddToCartAll={handleAddToCartAll}
      />

    </div>
  );
}

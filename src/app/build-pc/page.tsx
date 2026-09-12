'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, Layers, Sliders, HardDrive, Zap, Box, 
  Fan, Sparkles, Check, Trash2, Plus, ShoppingCart, 
  Download, RotateCcw, ChevronRight, Bot, RefreshCw, AlertCircle,
  Printer, FileSpreadsheet, FileText, ChevronDown, Tv, Headphones
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ComponentSelectorModal from '@/components/builder/ComponentSelectorModal';
import CompatibilityReportModal from '@/components/builder/CompatibilityReportModal';
import { CompatibilityReport } from '@/lib/gemini';

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
  selected: SelectedComponent | null;
}

export default function BuildPcPage() {
  const [components, setComponents] = useState<ComponentSlot[]>([
    {
      key: 'cpu',
      category: 'CPU - Bộ Vi Xử Lý',
      icon: Cpu,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000001',
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 13990000,
        tdp: 253,
        specs: 'LGA1700 | 36MB Cache | 125W-253W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i9-14900k'
      }
    },
    {
      key: 'mainboard',
      category: 'Mainboard - Bo Mạch Chủ',
      icon: Layers,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000003',
        name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
        price: 11490000,
        tdp: 50,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-z790-e'
      }
    },
    {
      key: 'ram',
      category: 'RAM - Bộ Nhớ Trong',
      icon: Sliders,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000005',
        name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz',
        price: 6290000,
        tdp: 15,
        specs: '2x32GB | DDR5 | 6000MHz | CL30',
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-ddr5'
      }
    },
    {
      key: 'gpu',
      category: 'VGA - Card Màn Hình',
      icon: Layers,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000002',
        name: 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X',
        price: 31490000,
        tdp: 320,
        specs: '16GB GDDR6X | 256-bit | Triple Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-rog-strix-rtx-4080-super'
      }
    },
    {
      key: 'storage',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      icon: HardDrive,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000004',
        name: 'Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2',
        price: 4890000,
        tdp: 10,
        specs: '2TB | Đọc 7450MB/s - Ghi 6900MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-2tb'
      }
    },
    {
      key: 'psu',
      category: 'PSU - Nguồn Máy Tính',
      icon: Zap,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000006',
        name: 'Corsair RM1000x 1000W 80 Plus Gold Full Modular',
        price: 4390000,
        tdp: 0,
        specs: '1000W | 80 Plus Gold | Full Modular',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-rm1000x'
      }
    },
    {
      key: 'case',
      category: 'Case - Vỏ Máy Tính',
      icon: Box,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000007',
        name: 'NZXT H9 Flow RGB Dual-Chamber Mid-Tower Black',
        price: 4290000,
        tdp: 0,
        specs: 'Hỗ trợ GPU 435mm | Tản nước 360mm',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-h9-flow-black'
      }
    },
    {
      key: 'cooling',
      category: 'Tản Nhiệt (Cooling)',
      icon: Fan,
      selected: {
        id: 'd1000000-0000-0000-0000-000000000008',
        name: 'NZXT Kraken Elite 360 RGB Black Liquid Cooler',
        price: 6890000,
        tdp: 25,
        specs: 'AIO 360mm | 3x 120mm RGB Fan | Màn hình LCD',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-kraken-elite-360'
      }
    },
    {
      key: 'monitor',
      category: 'Màn Hình Gaming',
      icon: Tv,
      selected: null
    },
    {
      key: 'gear',
      category: 'Bàn Phím & Chuột',
      icon: Sliders,
      selected: null
    },
    {
      key: 'headset',
      category: 'Tai Nghe & Audio',
      icon: Headphones,
      selected: null
    }
  ]);

  const [activeModalSlotKey, setActiveModalSlotKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [aiReport, setAiReport] = useState<CompatibilityReport | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  const addItem = useCartStore(s => s.addItem);
  const addMultipleItems = useCartStore(s => s.addMultipleItems);
  const setCartOpen = useCartStore(s => s.setOpen);

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
    setComponents(prev => prev.map(slot => slot.key === key ? { ...slot, selected: null } : slot));
  };

  const handleSelectProductForSlot = (product: any) => {
    if (!activeModalSlotKey) return;

    // Estimate specs & tdp string
    let tdp = 20;
    if (product.specs?.tdp_watt) tdp = Number(product.specs.tdp_watt);
    else if (product.specs?.tdp) tdp = Number(product.specs.tdp);
    else if (activeModalSlotKey === 'gpu') tdp = 250;
    else if (activeModalSlotKey === 'cpu') tdp = 125;

    let specsStr = 'Chính hãng | Bảo hành 36 tháng';
    if (product.specs && typeof product.specs === 'object') {
      const parts: string[] = [];
      if (product.specs.socket) parts.push(`Socket ${product.specs.socket}`);
      if (product.specs.chipset) parts.push(`Chipset ${product.specs.chipset}`);
      if (product.specs.cores || product.specs.core_count) {
        const c = product.specs.cores || product.specs.core_count;
        const t = product.specs.threads || product.specs.thread_count || c;
        parts.push(`${c} Nhân ${t} Luồng`);
      }
      if (product.specs.clock_ghz || product.specs.boost_clock_ghz) {
        parts.push(`Xung ${product.specs.boost_clock_ghz || product.specs.clock_ghz}GHz`);
      }
      if (product.specs.capacity || product.specs.capacity_gb) {
        parts.push(`Dung lượng: ${product.specs.capacity || `${product.specs.capacity_gb}GB`}`);
      }
      if (product.specs.bus_mhz || product.specs.speed) {
        parts.push(`Bus: ${product.specs.bus_mhz || product.specs.speed}MHz`);
      }
      if (product.specs.vram_gb) {
        parts.push(`VRAM: ${product.specs.vram_gb}GB ${product.specs.memory_type || ''}`.trim());
      }
      if (product.specs.wattage) parts.push(`Công suất: ${product.specs.wattage}W`);
      if (product.specs.efficiency) parts.push(`Chuẩn: ${product.specs.efficiency}`);

      if (parts.length === 0) {
        Object.entries(product.specs)
          .filter(([k]) => k !== 'tdp' && k !== 'tdp_watt' && k !== 'integrated_gpu')
          .slice(0, 3)
          .forEach(([k, v]) => parts.push(`${k.toUpperCase()}: ${Array.isArray(v) ? v.join('/') : v}`));
      }
      if (parts.length > 0) specsStr = parts.join(' | ');
    }

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

    setComponents(prev => prev.map(s => s.key === activeModalSlotKey ? { ...s, selected: newComponent } : s));

    const slotTitle = components.find(s => s.key === activeModalSlotKey)?.category || 'linh kiện';
    setNotice(`Đã cập nhật ${slotTitle}: ${product.name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddAllToCart = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Vui lòng chọn ít nhất 1 linh kiện!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const itemsToAdd = selectedItems.map(s => ({
      id: s.selected!.id,
      name: s.selected!.name,
      price: s.selected!.price,
      image: s.selected!.image,
      category: s.category,
      slug: s.selected!.slug || s.selected!.id,
      quantity: 1,
    }));

    addMultipleItems(itemsToAdd);
    setCartOpen(true);
    setNotice(`Đã thêm ${itemsToAdd.length} linh kiện vào giỏ hàng thành công!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePrintPdf = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Chưa có linh kiện nào để xuất cấu hình!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }
    const total = selectedItems.reduce((sum, s) => sum + (s.selected?.price || 0), 0);

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
              <th>Thông số kỹ thuật</th>
              <th style="width: 140px; text-align: right;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems.map((s, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><b>${s.category}</b></td>
                <td><b>${s.selected?.name}</b></td>
                <td style="color: #475569; font-size: 12px;">${s.selected?.specs || ''}</td>
                <td style="text-align: right; font-weight: bold; color: #2563eb;">${s.selected?.price.toLocaleString('vi-VN')} ₫</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right; padding: 14px 12px;">TỔNG CHI PHÍ TẠM TÍNH:</td>
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
    const total = selectedItems.reduce((sum, s) => sum + (s.selected?.price || 0), 0);

    let csv = '\uFEFFSTT,Danh mục,Tên linh kiện,Thông số,Đơn giá (VNĐ)\n';
    selectedItems.forEach((s, idx) => {
      const name = `"${(s.selected?.name || '').replace(/"/g, '""')}"`;
      const specs = `"${(s.selected?.specs || '').replace(/"/g, '""')}"`;
      csv += `${idx + 1},"${s.category}",${name},${specs},${s.selected?.price || 0}\n`;
    });
    csv += `,,,TỔNG CỘNG,${total}\n`;

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

  const handleExportTxt = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) {
      setNotice('Chưa có linh kiện nào để xuất cấu hình!');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    let text = `=======================================\n`;
    text += `   PCHUB - BẢNG CẤU HÌNH PC XÂY DỰNG   \n`;
    text += `   Website: https://pchub-iota.vercel.app\n`;
    text += `=======================================\n\n`;

    selectedItems.forEach((s, idx) => {
      text += `${idx + 1}. [${s.category}]\n`;
      text += `   Tên: ${s.selected?.name}\n`;
      text += `   Giá: ${s.selected?.price.toLocaleString('vi-VN')} VNĐ\n`;
      text += `   Thông số: ${s.selected?.specs}\n\n`;
    });

    const total = selectedItems.reduce((sum, s) => sum + (s.selected?.price || 0), 0);
    text += `---------------------------------------\n`;
    text += `TỔNG CHI PHÍ TẠM TÍNH: ${total.toLocaleString('vi-VN')} VNĐ\n`;
    text += `=======================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCHub_Config_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setNotice('Đã tải xuống file cấu hình Text (.txt)!');
    setTimeout(() => setNotice(null), 3000);
  };

  const applyPresetEmpty = () => {
    setComponents(prev => prev.map(s => ({ ...s, selected: null })));
    setAiReport(null);
    setNotice('Đã làm trống toàn bộ cấu hình. Hãy bắt đầu chọn từng linh kiện theo ý bạn!');
    setTimeout(() => setNotice(null), 3000);
  };

  const applyPresetGaming = () => {
    setComponents([
      {
        key: 'cpu',
        category: 'CPU - Bộ Vi Xử Lý',
        icon: Cpu,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000001',
          name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
          price: 13990000,
          tdp: 253,
          specs: 'LGA1700 | 36MB Cache | 125W-253W',
          image: '/images/cpu-box.jpg',
          slug: 'intel-core-i9-14900k'
        }
      },
      {
        key: 'mainboard',
        category: 'Mainboard - Bo Mạch Chủ',
        icon: Layers,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000003',
          name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
          price: 11490000,
          tdp: 50,
          specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | ATX',
          image: '/images/gpu-white.jpg',
          slug: 'asus-rog-strix-z790-e'
        }
      },
      {
        key: 'ram',
        category: 'RAM - Bộ Nhớ Trong',
        icon: Sliders,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000005',
          name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz',
          price: 6290000,
          tdp: 15,
          specs: '2x32GB | DDR5 | 6000MHz | CL30',
          image: '/images/ram-rgb.jpg',
          slug: 'gskill-trident-z5-ddr5'
        }
      },
      {
        key: 'gpu',
        category: 'VGA - Card Màn Hình',
        icon: Layers,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000002',
          name: 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X',
          price: 31490000,
          tdp: 320,
          specs: '16GB GDDR6X | 256-bit | Triple Fan',
          image: '/images/gpu-strix.jpg',
          slug: 'asus-rog-strix-rtx-4080-super'
        }
      },
      {
        key: 'storage',
        category: 'SSD / HDD - Ổ Đĩa Cứng',
        icon: HardDrive,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000004',
          name: 'Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2',
          price: 4890000,
          tdp: 10,
          specs: '2TB | Đọc 7450MB/s - Ghi 6900MB/s',
          image: '/images/ssd-nvme.jpg',
          slug: 'samsung-990-pro-2tb'
        }
      },
      {
        key: 'psu',
        category: 'PSU - Nguồn Máy Tính',
        icon: Zap,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000006',
          name: 'Corsair RM1000x 1000W 80 Plus Gold Full Modular',
          price: 4390000,
          tdp: 0,
          specs: '1000W | 80 Plus Gold | Full Modular',
          image: '/images/gpu-white.jpg',
          slug: 'corsair-rm1000x'
        }
      },
      {
        key: 'case',
        category: 'Case - Vỏ Máy Tính',
        icon: Box,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000007',
          name: 'NZXT H9 Flow RGB Dual-Chamber Mid-Tower Black',
          price: 4290000,
          tdp: 0,
          specs: 'Hỗ trợ GPU 435mm | Tản nước 360mm',
          image: '/images/hero-pc.jpg',
          slug: 'nzxt-h9-flow-black'
        }
      },
      {
        key: 'cooling',
        category: 'Tản Nhiệt (Cooling)',
        icon: Fan,
        selected: {
          id: 'd1000000-0000-0000-0000-000000000008',
          name: 'NZXT Kraken Elite 360 RGB Black Liquid Cooler',
          price: 6890000,
          tdp: 25,
          specs: 'AIO 360mm | 3x 120mm RGB Fan | Màn hình LCD',
          image: '/images/hero-pc.jpg',
          slug: 'nzxt-kraken-elite-360'
        }
      },
      {
        key: 'monitor',
        category: 'Màn Hình Gaming',
        icon: Tv,
        selected: null
      },
      {
        key: 'gear',
        category: 'Bàn Phím & Chuột',
        icon: Sliders,
        selected: null
      },
      {
        key: 'headset',
        category: 'Tai Nghe & Audio',
        icon: Headphones,
        selected: null
      }
    ]);
    setNotice('Đã nạp cấu hình mẫu Gaming Ultra High-End!');
    setTimeout(() => setNotice(null), 3000);
  };

  const totalPrice = components.reduce((acc, slot) => acc + (slot.selected?.price || 0), 0);
  const totalTdp = components.reduce((acc, slot) => acc + (slot.selected?.tdp || 0), 0);
  const recommendedPsuWatts = Math.max(650, Math.ceil((totalTdp + 150) / 50) * 50);

  const activeSlotCategory = components.find(s => s.key === activeModalSlotKey)?.category || 'Linh kiện';
  const activeSlotSelectedId = components.find(s => s.key === activeModalSlotKey)?.selected?.id;

  // AI Diagnostic Logic
  const cpuSelected = components.find(s => s.key === 'cpu')?.selected;
  const mainboardSelected = components.find(s => s.key === 'mainboard')?.selected;
  const ramSelected = components.find(s => s.key === 'ram')?.selected;
  const gpuSelected = components.find(s => s.key === 'gpu')?.selected;
  const psuSelected = components.find(s => s.key === 'psu')?.selected;

  // 1. Socket compatibility
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

  // 2. RAM vs Mainboard DDR4/DDR5
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

  // 3. PSU Wattage Check
  let psuWatts = 0;
  if (psuSelected) {
    const match = psuSelected.name.match(/(\d{3,4})\s*W/i) || psuSelected.specs.match(/(\d{3,4})\s*W/i);
    psuWatts = match ? parseInt(match[1], 10) : 750;
  }
  const isPsuAdequate = !psuSelected || (psuWatts >= recommendedPsuWatts - 50);
  let psuMessage = psuSelected
    ? (isPsuAdequate 
        ? `Nguồn ${psuWatts}W đáp ứng hoàn hảo công suất tải tối đa (${recommendedPsuWatts}W)`
        : `⚠️ Cảnh báo: Nguồn ${psuWatts}W thấp hơn công suất đề xuất (${recommendedPsuWatts}W)`)
    : `Đề xuất trang bị bộ nguồn tối thiểu ${recommendedPsuWatts}W`;

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

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#2563eb" />
            Xây dựng Cấu hình PC & Tối ưu AI
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Hệ thống AI tự động kiểm tra tương thích chân cắm Socket, kích thước linh kiện và ước tính công suất nguồn thời gian thực.
          </p>
        </div>

        {/* 2-Columns Layout */}
        <div className="builder-layout-grid" style={{ alignItems: 'flex-start' }}>
          
          {/* Left: Component List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Quick Template Preset Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                <span>⚡ Cấu hình mẫu:</span>
                <button
                  type="button"
                  onClick={applyPresetGaming}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Gaming Ultra High-End
                </button>
              </div>

              <button
                type="button"
                onClick={applyPresetEmpty}
                style={{
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecdd3',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={13} />
                Làm trống để tự build từ đầu
              </button>
            </div>
            {components.map(slot => {
              const Icon = slot.icon;
              return (
                <div key={slot.key} className="builder-slot-card">
                  <div className="builder-slot-card-header" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Category Icon or Component Thumbnail */}
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
                      padding: slot.selected?.image ? '2px' : '0',
                    }}>
                      {slot.selected?.image ? (
                        <img
                          src={slot.selected.image}
                          alt={slot.selected.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ color: '#2563eb' }}>
                          <Icon size={22} />
                        </div>
                      )}
                    </div>

                    {/* Component Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {slot.category}
                      </div>
                      {slot.selected ? (
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '3px 0 4px',
                            lineHeight: '1.4',
                          }}>
                            {slot.selected.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                            <span>{slot.selected.specs}</span>
                            {slot.selected.tdp > 0 && (
                              <span style={{ color: '#ea580c', fontWeight: 600 }}>TDP: {slot.selected.tdp}W</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                          Chưa chọn linh kiện
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="builder-slot-card-actions" style={{ flexShrink: 0 }}>
                    {slot.selected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                          {slot.selected.price.toLocaleString('vi-VN')} ₫
                        </div>

                        {/* Replace Button */}
                        <button
                          onClick={() => setActiveModalSlotKey(slot.key)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1.5px solid #bfdbfe',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#2563eb';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                          title="Đổi sang linh kiện khác"
                        >
                          <RefreshCw size={14} />
                          Đổi linh kiện
                        </button>

                        {/* Trash Remove Button */}
                        <button
                          onClick={() => handleRemove(slot.key)}
                          style={{
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecdd3',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer'
                          }}
                          title="Xóa linh kiện"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveModalSlotKey(slot.key)}
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 18px',
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
            })}
          </div>

          {/* Right: Build Summary & AI Diagnostic */}
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
              Chi tiết cấu hình
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
              
              {/* Progress bar */}
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${Math.min(100, (totalTdp / 1000) * 100)}%`, height: '100%', background: '#22c55e' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                ✓ Đề xuất nguồn: {recommendedPsuWatts}W 80 Plus Gold
              </div>
            </div>

            {/* AI Diagnostics Box with Gemini Integration */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
              position: 'relative',
            }}>
              {/* Header */}
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
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>AI Phân Tích Tương Thích</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Powered by Google Gemini</span>
                  </div>
                </div>

                {/* Score badge if available */}
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

              {/* Summary if AI Report is available */}
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

                  {/* Checklist summary items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {aiReport.checklist.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '11.5px', color: '#1e293b' }}>
                        {item.status === 'PASS' ? (
                          <Check size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : item.status === 'WARN' ? (
                          <AlertCircle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span style={{ lineHeight: '1.35' }}>
                          <strong style={{ color: '#0f172a' }}>{item.category}:</strong> {item.detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Button to view full report modal */}
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
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Sparkles size={13} />
                      Xem phân tích chi tiết
                    </button>

                    <button
                      type="button"
                      onClick={handleRunAiAnalysis}
                      disabled={isAiAnalyzing}
                      title="Chạy lại phân tích Gemini"
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        cursor: isAiAnalyzing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RefreshCw size={13} className={isAiAnalyzing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Only show heuristic items when relevant components are selected */}
                  {(cpuSelected || mainboardSelected || ramSelected || psuSelected) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '12px', color: '#1e3a8a', marginBottom: '12px' }}>
                      {/* Socket check — only when CPU and Mainboard are both chosen */}
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

                      {/* RAM check — only when RAM and Mainboard are both chosen */}
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

                      {/* PSU check — only when PSU is chosen */}
                      {psuSelected && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {isPsuAdequate ? (
                            <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                          ) : (
                            <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          )}
                          <span>{psuMessage}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty state: guide user to pick components first */
                    <div style={{ textAlign: 'center', padding: '10px 0 14px', color: '#94a3b8', fontSize: '12px' }}>
                      <Cpu size={24} color="#cbd5e1" style={{ marginBottom: '6px' }} />
                      <div>Chọn linh kiện để AI phân tích tương thích</div>
                    </div>
                  )}

                  {/* Primary AI CTA Button */}
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
                      transition: 'all 0.2s ease',
                      opacity: isAiAnalyzing ? 0.75 : 1
                    }}
                  >
                    {isAiAnalyzing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Gemini đang phân tích cấu hình...</span>
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
                onClick={handleAddAllToCart}
                style={{
                  background: '#2563eb',
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
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <ShoppingCart size={16} />
                Thêm tất cả vào giỏ hàng
              </button>

              {/* Export Config Dropdown Container */}
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
                    transition: 'all 0.2s ease',
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
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FileSpreadsheet size={15} color="#16a34a" />
                      Tải bảng tính Excel (.CSV)
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTxt}
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
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FileText size={15} color="#64748b" />
                      Tải file văn bản (.TXT)
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={applyPresetEmpty}
                style={{
                  background: 'none',
                  color: '#64748b',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '6px',
                  marginTop: '4px',
                }}
              >
                <RotateCcw size={12} />
                Làm mới cấu hình
              </button>
            </div>

          </aside>

        </div>

      </div>

      {/* Interactive Component Selection Modal */}
      {activeModalSlotKey && (
        <ComponentSelectorModal
          isOpen={!!activeModalSlotKey}
          onClose={() => setActiveModalSlotKey(null)}
          slotKey={activeModalSlotKey}
          categoryTitle={activeSlotCategory}
          onSelectProduct={handleSelectProductForSlot}
          currentSelectedId={activeSlotSelectedId}
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

    </div>
  );
}

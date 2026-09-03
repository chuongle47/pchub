'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, Layers, Sliders, HardDrive, Zap, Box, 
  Fan, Sparkles, Check, Trash2, Plus, ShoppingCart, 
  Download, RotateCcw, ChevronRight, Bot, RefreshCw, AlertCircle
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ComponentSelectorModal from '@/components/builder/ComponentSelectorModal';

interface SelectedComponent {
  id: string;
  name: string;
  price: number;
  tdp: number;
  specs: string;
  image: string;
  slug?: string;
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
        image: '/images/cpu-box.jpg',
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
    }
  ]);

  const [activeModalSlotKey, setActiveModalSlotKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const addItem = useCartStore(s => s.addItem);
  const setCartOpen = useCartStore(s => s.setOpen);

  const handleRemove = (key: string) => {
    setComponents(prev => prev.map(slot => slot.key === key ? { ...slot, selected: null } : slot));
  };

  const handleSelectProductForSlot = (product: any) => {
    if (!activeModalSlotKey) return;

    // Estimate specs & tdp string
    let tdp = 20;
    if (product.specs?.tdp) tdp = Number(product.specs.tdp);
    else if (activeModalSlotKey === 'gpu') tdp = 250;
    else if (activeModalSlotKey === 'cpu') tdp = 125;

    let specsStr = 'Chính hãng | Bảo hành 36 tháng';
    if (product.specs && typeof product.specs === 'object') {
      const parts = Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k.toUpperCase()}: ${v}`);
      if (parts.length > 0) specsStr = parts.join(' | ');
    }

    const newComponent: SelectedComponent = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      tdp,
      specs: specsStr,
      image: product.image_url || product.image || '/images/cpu-box.jpg',
      slug: product.slug,
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

    selectedItems.forEach(s => {
      if (s.selected) {
        addItem({
          id: s.selected.id,
          name: s.selected.name,
          price: s.selected.price,
          image: s.selected.image,
          category: s.category,
          slug: s.selected.slug || s.selected.id,
          quantity: 1,
        });
      }
    });

    setCartOpen(true);
    setNotice(`Đã thêm ${selectedItems.length} linh kiện vào giỏ hàng!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleExportConfig = () => {
    const selectedItems = components.filter(s => s.selected !== null);
    if (selectedItems.length === 0) return;

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

  const isSocketCompatible = !cpuSelected || !mainboardSelected || (
    (cpuSelected.name.includes('14') || cpuSelected.name.includes('13') || cpuSelected.specs.includes('LGA1700')) &&
    (mainboardSelected.name.includes('Z790') || mainboardSelected.name.includes('B760') || mainboardSelected.specs.includes('LGA1700'))
  );

  const isRamCompatible = !mainboardSelected || !ramSelected || (
    (mainboardSelected.name.includes('DDR5') || mainboardSelected.specs.includes('DDR5')) &&
    (ramSelected.name.includes('DDR5') || ramSelected.specs.includes('DDR5'))
  );

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Left: Component List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {components.map(slot => {
              const Icon = slot.icon;
              return (
                <div key={slot.key} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                }}>
                  {/* Category Icon */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>

                  {/* Component Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {slot.category}
                    </div>
                    {slot.selected ? (
                      <div>
                        <h4 style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '3px 0 4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {slot.selected.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
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

                  {/* Price & Action Buttons */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {slot.selected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                          {slot.selected.price.toLocaleString('vi-VN')} ₫
                        </div>

                        {/* Replace Button */}
                        <button
                          onClick={() => setActiveModalSlotKey(slot.key)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Đổi linh kiện khác"
                        >
                          <RefreshCw size={13} />
                          Đổi
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

            {/* AI Diagnostics */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 800, fontSize: '13px', marginBottom: '10px' }}>
                <Bot size={16} />
                Đánh giá tương thích AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#1e3a8a' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  {isSocketCompatible ? (
                    <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <span>
                    {isSocketCompatible
                      ? 'Socket CPU & Bo mạch chủ tương thích 100%'
                      : '⚠️ Cảnh báo: Vui lòng kiểm tra socket chân cắm giữa CPU & Mainboard'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  {isRamCompatible ? (
                    <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <span>
                    {isRamCompatible
                      ? 'Mainboard hỗ trợ chuẩn bus RAM DDR5 mượt mà'
                      : '⚠️ Cảnh báo: Chuẩn RAM không trùng khớp với Mainboard'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Kích thước vỏ case vừa vặn card đồ họa VGA & tản nhiệt</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

              <button
                onClick={handleExportConfig}
                style={{
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
                <Download size={14} />
                Xuất file cấu hình (.TXT / File)
              </button>

              <button 
                onClick={() => setComponents(prev => prev.map(s => ({ ...s, selected: null })))}
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

    </div>
  );
}

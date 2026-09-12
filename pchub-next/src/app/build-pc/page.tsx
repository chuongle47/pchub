'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, Layers, Sliders, HardDrive, Zap, Box, 
  Fan, Sparkles, Check, Trash2, Plus, ShoppingCart, 
  Download, RotateCcw, ChevronRight, Bot 
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  category: string;
  icon: any;
  selected: {
    name: string;
    price: number;
    tdp: number;
    specs: string;
    image: string;
  } | null;
}

export default function BuildPcPage() {
  const [components, setComponents] = useState<ComponentSlot[]>([
    {
      key: 'cpu',
      category: 'CPU - Bộ Vi Xử Lý',
      icon: Cpu,
      selected: {
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 13990000,
        tdp: 253,
        specs: 'LGA1700 | 36MB Cache | 125W-253W',
        image: '/images/cpu-box.jpg'
      }
    },
    {
      key: 'mainboard',
      category: 'Mainboard - Bo Mạch Chủ',
      icon: Layers,
      selected: {
        name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
        price: 11490000,
        tdp: 50,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | ATX',
        image: '/images/gpu-white.jpg'
      }
    },
    {
      key: 'ram',
      category: 'RAM - Bộ Nhớ Trong',
      icon: Sliders,
      selected: {
        name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz',
        price: 6290000,
        tdp: 15,
        specs: '2x32GB | DDR5 | 6000MHz | CL30',
        image: '/images/ram-rgb.jpg'
      }
    },
    {
      key: 'gpu',
      category: 'VGA - Card Màn Hình',
      icon: Layers,
      selected: {
        name: 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X',
        price: 31490000,
        tdp: 320,
        specs: '16GB GDDR6X | 256-bit | Triple Fan',
        image: '/images/gpu-strix.jpg'
      }
    },
    {
      key: 'storage',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      icon: HardDrive,
      selected: {
        name: 'Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2',
        price: 4890000,
        tdp: 10,
        specs: '2TB | Đọc 7450MB/s - Ghi 6900MB/s',
        image: '/images/cpu-box.jpg'
      }
    },
    {
      key: 'psu',
      category: 'PSU - Nguồn Máy Tính',
      icon: Zap,
      selected: {
        name: 'Corsair RM1000x 1000W 80 Plus Gold Full Modular',
        price: 4390000,
        tdp: 0,
        specs: '1000W | 80 Plus Gold | Full Modular',
        image: '/images/gpu-white.jpg'
      }
    },
    {
      key: 'case',
      category: 'Case - Vỏ Máy Tính',
      icon: Box,
      selected: {
        name: 'NZXT H9 Flow RGB Dual-Chamber Mid-Tower Black',
        price: 4290000,
        tdp: 0,
        specs: 'Hỗ trợ GPU 435mm | Tản nước 360mm',
        image: '/images/hero-pc.jpg'
      }
    },
    {
      key: 'cooling',
      category: 'Tản Nhiệt (Cooling)',
      icon: Fan,
      selected: {
        name: 'NZXT Kraken Elite 360 RGB Black Liquid Cooler',
        price: 6890000,
        tdp: 25,
        specs: 'AIO 360mm | 3x 120mm RGB Fan | Màn hình LCD',
        image: '/images/hero-pc.jpg'
      }
    }
  ]);

  const handleRemove = (key: string) => {
    setComponents(prev => prev.map(slot => slot.key === key ? { ...slot, selected: null } : slot));
  };

  const totalPrice = components.reduce((acc, slot) => acc + (slot.selected?.price || 0), 0);
  const totalTdp = components.reduce((acc, slot) => acc + (slot.selected?.tdp || 0), 0);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Trang chủ</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Xây dựng Cấu hình PC (Build PC)</span>
        </div>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Left: Component List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {components.map(slot => {
              const Icon = slot.icon;
              return (
                <div key={slot.key} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  {/* Category icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
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
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {slot.category}
                    </div>
                    {slot.selected ? (
                      <div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: '2px 0 4px' }}>
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

                  {/* Price & Actions */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {slot.selected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                          {formatPrice(slot.selected.price)}
                        </div>
                        <button
                          onClick={() => handleRemove(slot.key)}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer'
                          }}
                          title="Xóa linh kiện"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <Link 
                        href={`/search?category=${slot.key}`}
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <Plus size={14} />
                        Chọn linh kiện
                      </Link>
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
            top: '90px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Chi tiết cấu hình
            </h3>

            {/* Total Price */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Tổng chi phí tạm tính:</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                {formatPrice(totalPrice)}
              </div>
            </div>

            {/* TDP Estimate */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Công suất ước tính:</span>
                <span style={{ color: '#ea580c', fontWeight: 800 }}>{totalTdp} W</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ width: `${Math.min(100, (totalTdp / 1000) * 100)}%`, height: '100%', background: '#22c55e' }} />
              </div>
              <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>
                ✓ Đề xuất nguồn: 850W - 1000W Gold
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
                  <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Socket LGA1700 tương thích 100% giữa CPU i9 & Z790</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Mainboard hỗ trợ chuẩn DDR5 6000MHz mượt mà</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Kích thước vỏ case 435mm vừa vặn GPU 357mm</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <ShoppingCart size={16} />
                Thêm tất cả vào giỏ hàng
              </button>

              <button style={{
                background: '#fff',
                color: '#334155',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}>
                <Download size={14} />
                Xuất file cấu hình (PDF/Excel)
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
                  padding: '6px'
                }}
              >
                <RotateCcw size={12} />
                Làm mới cấu hình
              </button>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBuilderStore } from '@/lib/store';
import { Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CompatibilityPage() {
  const { slots, totalPrice, clearBuild, setSlot } = useBuilderStore();
  const selected = Object.entries(slots).filter(([, product]) => product);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slotNames = {
    cpu: 'CPU - Bộ vi xử lý',
    mainboard: 'Mainboard - Bo mạch chủ',
    ram: 'RAM - Bộ nhớ trong',
    gpu: 'GPU - Card màn hình',
    storage: 'Ổ cứng SSD/HDD',
    psu: 'Nguồn - PSU',
    case: 'Case - Vỏ máy'
  };

  const handleAddProduct = (slot: string) => {
    setSelectedSlot(slot);
    setShowAddModal(true);
  };

  const handleRemoveProduct = (slot: string) => {
    setSlot(slot, null);
  };

  const checkCompatibility = () => {
    // Basic compatibility checks
    const issues = [];
    
    const cpu = slots.cpu;
    const mainboard = slots.mainboard;
    const ram = slots.ram;
    const psu = slots.psu;

    if (cpu && mainboard) {
      // Check socket compatibility (simplified)
      if (cpu.socket !== mainboard.socket) {
        issues.push('CPU và Mainboard không cùng socket');
      }
    }

    if (ram && mainboard) {
      if (ram.ramType && mainboard.ramType && ram.ramType !== mainboard.ramType) {
        issues.push('RAM và Mainboard không cùng loại DDR');
      }
    }

    const estimatedPower = Object.values(slots).reduce((sum, product) => sum + (product?.power || 0), 0);
    if (psu && estimatedPower > (psu.power || 0)) {
      issues.push('Nguồn không đủ công suất cho cấu hình');
    }

    return issues;
  };

  const totalPower = selected.reduce((sum, [, product]) => sum + (product?.power || 0), 0);
  const compatibilityIssues = checkCompatibility();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '20px', textDecoration: 'none' }}>
          ← Trang chủ
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
            🔧 Kiểm tra tương thích linh kiện
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Chọn linh kiện để kiểm tra cấu hình hoặc thêm linh kiện mới
          </p>
        </div>

        {/* Compatibility Status */}
        {selected.length > 0 && (
          <div style={{
            background: compatibilityIssues.length === 0 ? '#d4edda' : '#fff3cd',
            border: `1px solid ${compatibilityIssues.length === 0 ? '#c3e6cb' : '#ffc107'}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {compatibilityIssues.length === 0 ? (
                <CheckCircle size={24} style={{ color: '#28a745' }} />
              ) : (
                <AlertCircle size={24} style={{ color: '#ffc107' }} />
              )}
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                {compatibilityIssues.length === 0 ? 'Cấu hình tương thích' : 'Có vấn đề tương thích'}
              </h3>
            </div>
            
            {compatibilityIssues.length > 0 && (
              <ul style={{ marginLeft: '36px', marginBottom: '12px' }}>
                {compatibilityIssues.map((issue, index) => (
                  <li key={index} style={{ color: '#856404', marginBottom: '4px' }}>
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Components List */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
              Cấu hình hiện tại
            </h2>
            {selected.length > 0 && (
              <button 
                onClick={clearBuild}
                style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Xóa cấu hình
              </button>
            )}
          </div>

          {selected.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <AlertCircle size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px' }}>
                Chưa có linh kiện nào. Hãy thêm linh kiện để kiểm tra tương thích.
              </p>
              <Link 
                href="/build-pc"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#0055d4',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Đến PC Builder
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selected.map(([slot, product]) => (
                <div 
                  key={slot}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {slotNames[slot as keyof typeof slotNames] || slot}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                      {product?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0055d4' }}>
                      {product?.price?.toLocaleString('vi-VN')} ₫
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(slot)}
                      style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Component Buttons */}
          {Object.keys(slotNames).map(slot => {
            const hasProduct = Boolean(slots[slot as keyof typeof slots]);
            return (
              <button
                key={slot}
                onClick={() => handleAddProduct(slot)}
                disabled={hasProduct}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  marginTop: '12px',
                  background: hasProduct ? '#e2e8f0' : '#f0f9ff',
                  border: '1px dashed #3b82f6',
                  borderRadius: '8px',
                  cursor: hasProduct ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: hasProduct ? '#94a3b8' : '#3b82f6'
                }}
              >
                <Plus size={16} />
                {hasProduct ? `Đã chọn ${slotNames[slot as keyof typeof slotNames]}` : `Thêm ${slotNames[slot as keyof typeof slotNames]}`}
              </button>
            );
          })}
        </div>

        {/* Total Price */}
        {selected.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                Tổng dự kiến
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#0055d4' }}>
                {totalPrice().toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
              <div>• Tổng công suất: {totalPower}W</div>
              <div>• Số linh kiện: {selected.length}</div>
            </div>
            <Link
              href="/build-pc"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '20px',
                padding: '14px',
                background: '#0055d4',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              Chuyển sang PC Builder để chỉnh sửa
            </Link>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
              Thêm {selectedSlot && slotNames[selectedSlot as keyof typeof slotNames]}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Chức năng này sẽ tích hợp với trang tìm kiếm sản phẩm. Hiện tại hãy sử dụng PC Builder để chọn linh kiện.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ padding: '10px 20px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Đóng
              </button>
              <Link
                href="/build-pc"
                style={{ padding: '10px 20px', background: '#0055d4', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 600 }}
              >
                Đến PC Builder
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

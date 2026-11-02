'use client';

import React from 'react';
import { Plus, Trash2, Cpu, Sparkles } from 'lucide-react';

interface SpecsFormProps {
  categorySlug?: string | null;
  specs: Record<string, any>;
  onChange: (specs: Record<string, any>) => void;
}

export function ProductSpecsForm({ categorySlug, specs, onChange }: SpecsFormProps) {
  const updateField = (key: string, value: any) => {
    onChange({ ...specs, [key]: value });
  };

  const removeField = (key: string) => {
    const next = { ...specs };
    delete next[key];
    onChange(next);
  };

  const renderPresetFields = () => {
    const slug = (categorySlug || '').toLowerCase();

    // 1. CPU
    if (slug.includes('cpu')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Socket</label>
            <select
              value={specs.socket || ''}
              onChange={(e) => updateField('socket', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">-- Chọn Socket --</option>
              <option value="LGA1700">Intel LGA1700 (Gen 12/13/14)</option>
              <option value="LGA1851">Intel LGA1851 (Core Ultra 200)</option>
              <option value="AM5">AMD AM5 (Ryzen 7000/9000)</option>
              <option value="AM4">AMD AM4 (Ryzen 5000/3000)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Số nhân (Cores)</label>
            <input
              type="number"
              value={specs.cores || ''}
              onChange={(e) => updateField('cores', Number(e.target.value))}
              placeholder="Ví dụ: 8, 16, 20"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Số luồng (Threads)</label>
            <input
              type="number"
              value={specs.threads || ''}
              onChange={(e) => updateField('threads', Number(e.target.value))}
              placeholder="Ví dụ: 16, 28, 32"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Xung nhịp tối đa (Boost Clock)</label>
            <input
              type="text"
              value={specs.boost_clock || ''}
              onChange={(e) => updateField('boost_clock', e.target.value)}
              placeholder="Ví dụ: 5.6 GHz"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Bộ nhớ đệm (Cache)</label>
            <input
              type="text"
              value={specs.cache || ''}
              onChange={(e) => updateField('cache', e.target.value)}
              placeholder="Ví dụ: 33MB hoặc 96MB 3D V-Cache"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">TDP / Công suất cơ bản (Watt)</label>
            <input
              type="number"
              value={specs.tdp || ''}
              onChange={(e) => updateField('tdp', Number(e.target.value))}
              placeholder="Ví dụ: 65, 125"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chuẩn RAM hỗ trợ</label>
            <select
              value={Array.isArray(specs.ram_support) ? specs.ram_support.join(',') : specs.ram_support || ''}
              onChange={(e) => updateField('ram_support', e.target.value.split(','))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="DDR4,DDR5">DDR4 & DDR5</option>
              <option value="DDR5">Chỉ DDR5</option>
              <option value="DDR4">Chỉ DDR4</option>
            </select>
          </div>
        </div>
      );
    }

    // 2. MAINBOARD
    if (slug.includes('mainboard') || slug.includes('bo-mach-chu')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chipset</label>
            <input
              type="text"
              value={specs.chipset || ''}
              onChange={(e) => updateField('chipset', e.target.value)}
              placeholder="Z790, B760, X670E, B650..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Socket</label>
            <select
              value={specs.socket || ''}
              onChange={(e) => updateField('socket', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">-- Chọn Socket --</option>
              <option value="LGA1700">Intel LGA1700</option>
              <option value="LGA1851">Intel LGA1851</option>
              <option value="AM5">AMD AM5</option>
              <option value="AM4">AMD AM4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chuẩn RAM hỗ trợ</label>
            <select
              value={specs.ram_type || ''}
              onChange={(e) => updateField('ram_type', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">-- Chọn chuẩn RAM --</option>
              <option value="DDR5">DDR5</option>
              <option value="DDR4">DDR4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kích thước (Form Factor)</label>
            <select
              value={specs.form_factor || ''}
              onChange={(e) => updateField('form_factor', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="ATX">ATX</option>
              <option value="Micro-ATX">Micro-ATX (M-ATX)</option>
              <option value="Mini-ITX">Mini-ITX (ITX)</option>
              <option value="E-ATX">E-ATX</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Số khe RAM</label>
            <input
              type="number"
              value={specs.ram_slots || 4}
              onChange={(e) => updateField('ram_slots', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Số khe M.2 NVMe</label>
            <input
              type="number"
              value={specs.m2_slots || ''}
              onChange={(e) => updateField('m2_slots', Number(e.target.value))}
              placeholder="Ví dụ: 3, 4"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      );
    }

    // 3. GPU / VGA
    if (slug.includes('gpu') || slug.includes('vga') || slug.includes('card-man-hinh')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dung lượng VRAM</label>
            <input
              type="text"
              value={specs.vram || ''}
              onChange={(e) => updateField('vram', e.target.value)}
              placeholder="12 GB GDDR6X, 16 GB GDDR6..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chiều dài Card (mm) - Cho Case</label>
            <input
              type="number"
              value={specs.length_mm || ''}
              onChange={(e) => updateField('length_mm', Number(e.target.value))}
              placeholder="Ví dụ: 305, 336"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nguồn khuyến nghị (PSU Watt)</label>
            <input
              type="number"
              value={specs.recommended_psu || ''}
              onChange={(e) => updateField('recommended_psu', Number(e.target.value))}
              placeholder="Ví dụ: 650, 750, 850, 1000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Điện năng tiêu thụ (TDP Watt)</label>
            <input
              type="number"
              value={specs.tdp || ''}
              onChange={(e) => updateField('tdp', Number(e.target.value))}
              placeholder="Ví dụ: 220, 285"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cổng cấp nguồn</label>
            <input
              type="text"
              value={specs.power_connectors || ''}
              onChange={(e) => updateField('power_connectors', e.target.value)}
              placeholder="1x 16-pin 12VHPWR hoặc 2x 8-pin"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      );
    }

    // 4. RAM
    if (slug.includes('ram')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chuẩn RAM</label>
            <select
              value={specs.ram_type || ''}
              onChange={(e) => updateField('ram_type', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">-- Chọn chuẩn --</option>
              <option value="DDR5">DDR5</option>
              <option value="DDR4">DDR4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dung lượng Kit</label>
            <input
              type="text"
              value={specs.capacity || ''}
              onChange={(e) => updateField('capacity', e.target.value)}
              placeholder="16GB (1x16GB) hoặc 32GB (2x16GB)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tốc độ Bus (MHz)</label>
            <input
              type="text"
              value={specs.speed || ''}
              onChange={(e) => updateField('speed', e.target.value)}
              placeholder="3200MHz, 5600MHz, 6000MHz"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Độ trễ CAS (Latency)</label>
            <input
              type="text"
              value={specs.latency || ''}
              onChange={(e) => updateField('latency', e.target.value)}
              placeholder="CL16, CL30, CL36"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      );
    }

    // 5. PSU / NGUỒN
    if (slug.includes('psu') || slug.includes('nguon')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Công suất thực (Watt)</label>
            <input
              type="number"
              value={specs.wattage || ''}
              onChange={(e) => updateField('wattage', Number(e.target.value))}
              placeholder="650, 750, 850, 1000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chứng nhận hiệu suất</label>
            <select
              value={specs.efficiency || ''}
              onChange={(e) => updateField('efficiency', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="80 Plus Gold">80 Plus Gold</option>
              <option value="80 Plus Bronze">80 Plus Bronze</option>
              <option value="80 Plus Platinum">80 Plus Platinum</option>
              <option value="80 Plus White">80 Plus White</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kiểu dây cáp</label>
            <select
              value={specs.modular || ''}
              onChange={(e) => updateField('modular', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Full Modular">Full Modular (Rời hoàn toàn)</option>
              <option value="Semi-Modular">Semi-Modular (Rời một phần)</option>
              <option value="Non-Modular">Non-Modular (Dây liền)</option>
            </select>
          </div>
        </div>
      );
    }

    // Default generic preset
    return (
      <div className="text-xs text-slate-400 italic">
        Chọn danh mục cụ thể (CPU, Mainboard, RAM, GPU, PSU...) ở trên để hiển thị các thông số tương thích tự động.
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Thông số kỹ thuật chuẩn Build PC
          </h3>
        </div>
      </div>

      {/* Category-specific pre-configured fields */}
      {renderPresetFields()}

      {/* Custom Key-Value specs */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">
            Thông số bổ sung khác (Key - Value)
          </span>
          <button
            type="button"
            onClick={() => updateField(`spec_${Date.now()}`, '')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thông số</span>
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(specs).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                readOnly
                className="w-1/3 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
              />
              <input
                type="text"
                value={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                onChange={(e) => updateField(key, e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => removeField(key)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
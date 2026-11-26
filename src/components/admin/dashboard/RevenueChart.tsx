'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export interface DataPoint {
  date: string; // DD/MM
  fullDate: string; // e.g. "26/11/2026"
  revenue: number; // in VND
  ordersCount: number;
}

interface RevenueChartProps {
  initialData?: DataPoint[];
  isLoading?: boolean;
}

export function RevenueChart({
  initialData,
  isLoading = false,
}: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeRange, setActiveRange] = useState<'today' | '7days' | '30days'>('30days');

  // Generate trend data based on activeRange
  const points = useMemo<DataPoint[]>(() => {
    if (initialData && initialData.length > 0 && activeRange === '30days') return initialData;

    const list: DataPoint[] = [];
    const now = new Date();
    const count = activeRange === 'today' ? 12 : activeRange === '7days' ? 7 : 30;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      if (activeRange === 'today') {
        const hour = 8 + (12 - i);
        d.setHours(hour, 0, 0, 0);
        const rev = Math.round((4500000 + Math.sin(i * 0.8) * 2800000 + (12 - i) * 600000) / 100000) * 100000;
        list.push({
          date: `${String(hour).padStart(2, '0')}:00`,
          fullDate: `Hôm nay lúc ${hour}:00`,
          revenue: rev,
          ordersCount: Math.max(1, Math.round(rev / 1500000)),
        });
      } else {
        d.setDate(d.getDate() - i);
        const dayStr = String(d.getDate()).padStart(2, '0');
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        // Deterministic curve fitting nicely within 0 - 150M range without hydration mismatch
        const rev = Math.round((52000000 + Math.sin(i * 0.45) * 35000000 + Math.cos(i * 1.3) * 3000000 + (count - i) * 1200000) / 100000) * 100000;
        list.push({
          date: `${dayStr}/${monthStr}`,
          fullDate: `${dayStr}/${monthStr}/${d.getFullYear()}`,
          revenue: Math.min(rev, 145000000),
          ordersCount: Math.max(5, Math.round(rev / 1800000)),
        });
      }
    }
    return list;
  }, [initialData, activeRange]);

  // Round maxRevenue to clean milestone 150M or multiples of 50M
  const maxRevenue = useMemo(() => {
    const rawMax = Math.max(...points.map((p) => p.revenue), 10000000);
    if (activeRange === 'today') {
      return Math.ceil(rawMax / 5000000) * 5000000; // e.g. 15M
    }
    // Round to 150M or 200M
    return Math.max(150000000, Math.ceil(rawMax / 50000000) * 50000000);
  }, [points, activeRange]);

  // SVG dimensions
  const width = 600;
  const height = 180;
  const paddingX = 20;
  const paddingBottom = 20;
  const paddingTop = 15;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const coords = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((p, idx) => {
      const x = paddingX + (idx / Math.max(points.length - 1, 1)) * innerWidth;
      const y = paddingTop + innerHeight - (p.revenue / maxRevenue) * innerHeight;
      return { x, y, point: p };
    });
  }, [points, maxRevenue, innerWidth, innerHeight, paddingTop, paddingX]);

  // Generate smooth Bézier curve
  const { pathD, areaD } = useMemo(() => {
    if (coords.length === 0) return { pathD: '', areaD: '' };
    if (coords.length === 1) {
      return {
        pathD: `M ${coords[0].x} ${coords[0].y}`,
        areaD: `M ${coords[0].x} ${coords[0].y} L ${coords[0].x} ${height - paddingBottom} Z`,
      };
    }

    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const area = `${d} L ${coords[coords.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${coords[0].x.toFixed(1)} ${height - paddingBottom} Z`;
    return { pathD: d, areaD: area };
  }, [coords, height, paddingBottom]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded-md mb-6" />
        <div className="h-56 w-full bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const activePoint = hoveredIndex !== null && coords[hoveredIndex] ? coords[hoveredIndex] : null;

  // Round Y milestone labels: 150tr / 100tr / 50tr / 0
  const yLabels = activeRange === 'today'
    ? [
        `${(maxRevenue / 1000000).toFixed(0)}tr`,
        `${((maxRevenue * 2) / 3 / 1000000).toFixed(1)}tr`,
        `${(maxRevenue / 3 / 1000000).toFixed(1)}tr`,
        '0',
      ]
    : [
        `${(maxRevenue / 1000000).toFixed(0)}tr`,
        `${((maxRevenue * 2) / 3 / 1000000).toFixed(0)}tr`,
        `${(maxRevenue / 3 / 1000000).toFixed(0)}tr`,
        '0',
      ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between relative group">
      {/* Card Header & Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
              Biểu đồ doanh thu
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biến động doanh thu theo thời gian thực (Đơn vị: VNĐ)
          </p>
        </div>

        {/* Segmented Control with clear active state and aria-pressed */}
        <div
          role="group"
          aria-label="Chọn khoảng thời gian"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px',
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            gap: '3px',
          }}
          className="self-start sm:self-auto"
        >
          {(['today', '7days', '30days'] as const).map((range) => {
            const isSelected = activeRange === range;
            const label = range === 'today' ? 'Hôm nay' : range === '7days' ? '7 ngày' : '30 ngày';
            return (
              <button
                key={range}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveRange(range)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#2563eb' : '#64748b',
                  boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Chart Area with Clean Round Milestones */}
      <div className="relative w-full h-56 sm:h-64 pt-2 select-none">
        {/* Y Axis Grid Lines & Round Labels: 150tr / 100tr / 50tr / 0 */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-medium text-slate-400 pr-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>{yLabels[0]}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>{yLabels[1]}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>{yLabels[2]}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>{yLabels[3]}</span>
          </div>
        </div>

        {/* SVG Curve with Area Gradient */}
        <svg
          className="w-full h-full relative z-10 overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#revenueAreaGrad)" />

          {/* Smooth line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crosshair & Active Point on Hover */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={height - paddingBottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="#2563eb"
                fillOpacity="0.2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Slices */}
        <div className="absolute inset-0 z-20 flex">
          {coords.map((c, idx) => (
            <div
              key={idx}
              className="flex-1 h-full cursor-crosshair"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* Interactive Tooltip */}
        {activePoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-75"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
            }}
          >
            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl border border-slate-700/80 text-xs min-w-[130px] animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] text-slate-300 font-medium">
                {activePoint.point.fullDate}
              </div>
              <div className="text-sm font-black text-amber-300 mt-0.5">
                {activePoint.point.revenue.toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {activePoint.point.ordersCount} đơn hoàn tất
              </div>
            </div>
          </div>
        )}
      </div>

      {/* X Axis Milestone Dates */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-2 px-1">
        {coords.length > 0 && (
          <>
            <span>{coords[0].point.date}</span>
            {coords.length > 8 && <span>{coords[Math.floor(coords.length * 0.25)].point.date}</span>}
            {coords.length > 4 && <span>{coords[Math.floor(coords.length * 0.5)].point.date}</span>}
            {coords.length > 8 && <span>{coords[Math.floor(coords.length * 0.75)].point.date}</span>}
            <span className="font-semibold text-slate-700">{coords[coords.length - 1].point.date} (Hôm nay)</span>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface TabProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  slug: string;
  rating: number;
  reviews: number;
}

const MOCK_CPU_PRODUCTS: TabProduct[][] = [
  [
    { id: 'cpu1', name: 'Intel Core i9-14900K 3.2GHz', price: 13990000, originalPrice: 16500000, discount: 15, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.9, reviews: 234 },
    { id: 'cpu2', name: 'Intel Core i7-14700K 3.4GHz', price: 9200000, originalPrice: 10800000, discount: 15, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.8, reviews: 187 },
    { id: 'cpu3', name: 'Intel Core i5-14600K 3.5GHz', price: 6490000, originalPrice: 7500000, discount: 13, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.7, reviews: 312 },
    { id: 'cpu4', name: 'Intel Core i9-13900K 3.0GHz', price: 10500000, originalPrice: 13000000, discount: 19, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.8, reviews: 445 },
    { id: 'cpu5', name: 'Intel Core i7-13700K 3.4GHz', price: 7800000, originalPrice: 9200000, discount: 15, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.7, reviews: 201 },
    { id: 'cpu6', name: 'Intel Core i5-13600K 3.5GHz', price: 5400000, originalPrice: 6500000, discount: 17, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.6, reviews: 389 },
  ],
  [
    { id: 'amd1', name: 'AMD Ryzen 9 7950X3D 4.2GHz', price: 17200000, originalPrice: 20000000, discount: 14, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 5.0, reviews: 178 },
    { id: 'amd2', name: 'AMD Ryzen 9 7900X3D 4.4GHz', price: 12500000, originalPrice: 14800000, discount: 16, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.9, reviews: 156 },
    { id: 'amd3', name: 'AMD Ryzen 7 7800X3D 4.5GHz', price: 9800000, originalPrice: 11500000, discount: 15, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.9, reviews: 487 },
    { id: 'amd4', name: 'AMD Ryzen 5 7600X 4.7GHz', price: 4990000, originalPrice: 5900000, discount: 15, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.7, reviews: 312 },
    { id: 'amd5', name: 'AMD Ryzen 9 7900X 4.7GHz', price: 10200000, originalPrice: 12000000, discount: 15, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.8, reviews: 201 },
    { id: 'amd6', name: 'AMD Ryzen 7 7700X 4.5GHz', price: 6800000, originalPrice: 8100000, discount: 16, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.7, reviews: 178 },
  ],
  [
    { id: 'hedt1', name: 'Intel Core i9-14900X HEDT', price: 24500000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.9, reviews: 45 },
    { id: 'hedt2', name: 'AMD Threadripper 7960X', price: 38000000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.8, reviews: 28 },
    { id: 'hedt3', name: 'Intel Core i9-13900X HEDT', price: 18900000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.7, reviews: 67 },
    { id: 'hedt4', name: 'AMD Threadripper 7970X', price: 58000000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.9, reviews: 12 },
    { id: 'hedt5', name: 'Intel Xeon W9-3595X', price: 92000000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.8, reviews: 8 },
    { id: 'hedt6', name: 'AMD EPYC 9354P Server', price: 125000000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.7, reviews: 5 },
  ],
  [
    { id: 'bud1', name: 'Intel Core i3-14100F Budget', price: 2290000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.5, reviews: 567 },
    { id: 'bud2', name: 'AMD Ryzen 5 5600G APU', price: 2890000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.6, reviews: 712 },
    { id: 'bud3', name: 'Intel Core i5-13400F', price: 3990000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.7, reviews: 489 },
    { id: 'bud4', name: 'AMD Ryzen 5 7600 Box', price: 4290000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.7, reviews: 234 },
    { id: 'bud5', name: 'Intel Core i5-12400F', price: 2990000, image: '/images/cpu-box.jpg', slug: 'intel-core-i9-14900k', rating: 4.6, reviews: 891 },
    { id: 'bud6', name: 'AMD Ryzen 3 4300G APU', price: 1890000, image: '/images/cpu-box.jpg', slug: 'amd-ryzen-9-7950x3d', rating: 4.4, reviews: 445 },
  ],
];

const MOCK_GPU_PRODUCTS: TabProduct[][] = [
  [
    { id: 'gpu1', name: 'ASUS ROG RTX 4090 24GB', price: 44000000, originalPrice: 48000000, discount: 8, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4070-ti-super', rating: 5.0, reviews: 89 },
    { id: 'gpu2', name: 'MSI RTX 4080 SUPRIM 16GB', price: 28500000, originalPrice: 32000000, discount: 11, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4070-ti-super', rating: 4.9, reviews: 156 },
    { id: 'gpu3', name: 'ASUS ROG RTX 4070 Ti Super', price: 18500000, originalPrice: 21990000, discount: 16, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4070-ti-super', rating: 4.9, reviews: 234 },
    { id: 'gpu4', name: 'Gigabyte RTX 4070 AERO OC', price: 13800000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.8, reviews: 201 },
    { id: 'gpu5', name: 'MSI RTX 4060 Ti Gaming X', price: 10500000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.7, reviews: 312 },
    { id: 'gpu6', name: 'Gigabyte RTX 4060 Ti AERO', price: 11200000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.8, reviews: 178 },
  ],
  [
    { id: 'gpu7', name: 'ASUS ROG RTX 3090 Ti', price: 24000000, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4070-ti-super', rating: 4.8, reviews: 123 },
    { id: 'gpu8', name: 'MSI RTX 3080 Gaming X', price: 14500000, image: '/images/gpu-strix.jpg', slug: 'asus-rog-strix-geforce-rtx-4070-ti-super', rating: 4.7, reviews: 289 },
    { id: 'gpu9', name: 'Gigabyte RTX 3070 Ti', price: 9200000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.7, reviews: 412 },
    { id: 'gpu10', name: 'ASUS Dual RTX 3060 Ti', price: 7800000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.6, reviews: 567 },
    { id: 'gpu11', name: 'MSI RTX 3060 Gaming X', price: 5900000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.6, reviews: 678 },
    { id: 'gpu12', name: 'Gigabyte RTX 3050 OC', price: 3800000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.4, reviews: 345 },
  ],
  [
    { id: 'amdg1', name: 'Sapphire Radeon RX 7900 XTX', price: 28000000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.8, reviews: 78 },
    { id: 'amdg2', name: 'MSI RX 7900 XT Gaming', price: 20500000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.7, reviews: 112 },
    { id: 'amdg3', name: 'ASUS RX 7800 XT TUF OC', price: 12800000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.8, reviews: 189 },
    { id: 'amdg4', name: 'Sapphire RX 7700 XT Pulse', price: 9500000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.7, reviews: 234 },
    { id: 'amdg5', name: 'MSI RX 7600 Gaming X', price: 6800000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.6, reviews: 312 },
    { id: 'amdg6', name: 'XFX RX 7600 Speedster', price: 6200000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.5, reviews: 267 },
  ],
  [
    { id: 'budg1', name: 'MSI RTX 4060 Ventus 8GB', price: 7900000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.7, reviews: 445 },
    { id: 'budg2', name: 'Gigabyte RX 6650 XT', price: 5200000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.5, reviews: 567 },
    { id: 'budg3', name: 'ASUS Dual RTX 3060', price: 5800000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.6, reviews: 489 },
    { id: 'budg4', name: 'MSI RX 6600 XT Gaming X', price: 4500000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.5, reviews: 612 },
    { id: 'budg5', name: 'Gigabyte GTX 1660 Super', price: 3200000, image: '/images/gpu-white.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.4, reviews: 789 },
    { id: 'budg6', name: 'ASUS Phoenix GTX 1650', price: 2300000, image: '/images/gpu-strix.jpg', slug: 'gigabyte-aero-geforce-rtx-4060-ti', rating: 4.3, reviews: 891 },
  ],
];

const MOCK_RAM_PRODUCTS: TabProduct[][] = [
  [
    { id: 'ram1', name: 'G.Skill Trident Z5 32GB DDR5-6400', price: 3290000, originalPrice: 4200000, discount: 22, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.9, reviews: 234 },
    { id: 'ram2', name: 'Corsair Dominator Platinum 32GB DDR5', price: 4500000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.8, reviews: 178 },
    { id: 'ram3', name: 'Kingston Fury Beast 32GB DDR5', price: 2890000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 312 },
    { id: 'ram4', name: 'G.Skill Trident Z5 64GB DDR5', price: 6400000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.9, reviews: 89 },
    { id: 'ram5', name: 'Corsair Vengeance 32GB DDR5-5600', price: 2490000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 445 },
    { id: 'ram6', name: 'Teamgroup T-Force Delta 32GB DDR5', price: 2200000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.6, reviews: 267 },
  ],
  [
    { id: 'ram7', name: 'G.Skill Trident Z Royal 32GB DDR4', price: 2100000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.8, reviews: 567 },
    { id: 'ram8', name: 'Corsair Vengeance RGB 16GB DDR4', price: 890000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 1204 },
    { id: 'ram9', name: 'Kingston HyperX Fury 32GB DDR4', price: 1590000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.6, reviews: 789 },
    { id: 'ram10', name: 'Crucial Ballistix 16GB DDR4', price: 790000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.6, reviews: 1567 },
    { id: 'ram11', name: 'G.Skill Ripjaws V 32GB DDR4', price: 1390000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 912 },
    { id: 'ram12', name: 'Teamgroup T-Force Vulcan 16GB', price: 690000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.5, reviews: 678 },
  ],
  [
    { id: 'ssd1', name: 'Samsung 990 Pro 2TB NVMe', price: 3290000, originalPrice: 4000000, discount: 18, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 5.0, reviews: 567 },
    { id: 'ssd2', name: 'WD Black SN850X 2TB NVMe', price: 3100000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.9, reviews: 445 },
    { id: 'ssd3', name: 'SK Hynix Platinum P41 2TB', price: 2800000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.9, reviews: 312 },
    { id: 'ssd4', name: 'Samsung 980 Pro 1TB NVMe', price: 1890000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.8, reviews: 1234 },
    { id: 'ssd5', name: 'Seagate FireCuda 530 2TB', price: 2900000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.8, reviews: 234 },
    { id: 'ssd6', name: 'Kingston KC3000 2TB PCIe 4.0', price: 2500000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 189 },
  ],
  [
    { id: 'sata1', name: 'Samsung 870 EVO 2TB SATA', price: 1890000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.8, reviews: 2341 },
    { id: 'sata2', name: 'WD Blue 1TB SATA SSD', price: 890000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 1890 },
    { id: 'sata3', name: 'Crucial MX500 2TB SATA', price: 1490000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.7, reviews: 1678 },
    { id: 'sata4', name: 'Kingston A400 960GB SATA', price: 690000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.5, reviews: 2789 },
    { id: 'sata5', name: 'Seagate BarraCuda 4TB HDD', price: 1290000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.4, reviews: 1234 },
    { id: 'sata6', name: 'WD Purple 6TB Surveillance', price: 2900000, image: '/images/ram-rgb.jpg', slug: 'gskill-trident-z5-rgb-32gb', rating: 4.5, reviews: 345 },
  ],
];

const TAB_GROUPS = [
  {
    id: 'cpu',
    catId: 'c1000000-0000-0000-0000-000000000001',
    label: 'CPU',
    icon: '🔲',
    subTabs: ['Intel Core', 'AMD Ryzen', 'Tất cả CPU'],
    bgColor: '#eff6ff',
    accentColor: '#2563eb',
  },
  {
    id: 'gpu',
    catId: 'c1000000-0000-0000-0000-000000000004',
    label: 'GPU',
    icon: '🎮',
    subTabs: ['NVIDIA', 'AMD Radeon', 'Tất cả GPU'],
    bgColor: '#f5f3ff',
    accentColor: '#7c3aed',
  },
  {
    id: 'ram-ssd',
    catId: 'c1000000-0000-0000-0000-000000000003',
    label: 'RAM & SSD',
    icon: '💾',
    subTabs: ['RAM DDR5', 'RAM DDR4', 'Ổ cứng SSD'],
    bgColor: '#f0fdf4',
    accentColor: '#16a34a',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '11px' }}>★</span>
      ))}
      <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px' }}>({rating})</span>
    </div>
  );
}

export default function TabbedProducts() {
  const [activeGroup, setActiveGroup] = useState('cpu');
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<TabProduct[]>([]);
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const [addedId, setAddedId] = useState<string | null>(null);

  const group = TAB_GROUPS.find(g => g.id === activeGroup)!;

  useEffect(() => {
    async function loadGroupProducts() {
      try {
        let catId = group.catId;
        let search = '';
        if (activeGroup === 'ram-ssd' && activeSubTab === 2) {
          catId = 'c1000000-0000-0000-0000-000000000005'; // Storage
        } else if (activeGroup === 'cpu') {
          if (activeSubTab === 0) search = 'Intel';
          else if (activeSubTab === 1) search = 'AMD';
        } else if (activeGroup === 'gpu') {
          if (activeSubTab === 0) search = 'ASUS';
          else if (activeSubTab === 1) search = 'Sapphire';
        }

        const params = new URLSearchParams();
        if (catId) params.set('category_id', catId);
        if (search) params.set('search', search);
        params.set('limit', '6');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.products) {
          const mapped: TabProduct[] = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            originalPrice: Math.round(Number(p.price) * 1.15),
            discount: 15,
            image: p.image_url || '/images/cpu-box.jpg',
            slug: p.slug,
            rating: 5,
            reviews: 42
          }));
          setDisplayProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load tabbed products:', err);
      }
    }
    loadGroupProducts();
  }, [activeGroup, activeSubTab]);

  const handleGroup = (id: string) => {
    setActiveGroup(id);
    setActiveSubTab(0);
  };

  const handleAddCart = (p: TabProduct, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image, category: group.label, brand: '', slug: p.slug });
    setOpen(true);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <section style={{ background: '#fff', padding: '32px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Main tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #f1f5f9',
          marginBottom: '24px',
          gap: '0',
        }}>
          {TAB_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => handleGroup(g.id)}
              style={{
                padding: '10px 28px',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                borderBottom: activeGroup === g.id ? `2px solid ${g.accentColor}` : '2px solid transparent',
                marginBottom: '-2px',
                color: activeGroup === g.id ? g.accentColor : '#64748b',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{g.icon}</span> {g.label}
            </button>
          ))}
        </div>

        {/* Content: sidebar + grid */}
        <div style={{ display: 'flex', gap: '20px' }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <div style={{
              background: group.bgColor,
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              height: '140px',
            }}>
              {group.icon}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.subTabs.map((sub, i) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(i)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: activeSubTab === i ? 700 : 500,
                    background: activeSubTab === i ? group.accentColor : 'transparent',
                    color: activeSubTab === i ? '#fff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (activeSubTab !== i) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    if (activeSubTab !== i) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {sub}
                  {activeSubTab === i && <ChevronRight size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT GRID */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {displayProducts.slice(0, 6).map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                  >
                    {/* Image */}
                    <div style={{
                      background: '#f8fafc',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      {p.discount && (
                        <span style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: '#ef4444', color: '#fff',
                          padding: '1px 6px', borderRadius: '4px',
                          fontSize: '10px', fontWeight: 800,
                        }}>-{p.discount}%</span>
                      )}
                      <img src={p.image} alt={p.name} style={{ maxHeight: '90px', maxWidth: '90%', objectFit: 'contain' }} />
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px' }}>
                      <p style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: '1.4',
                        marginBottom: '5px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '30px',
                      }}>{p.name}</p>

                      <StarRating rating={p.rating} />

                      <div style={{ margin: '5px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                          {p.price.toLocaleString('vi-VN')} ₫
                        </span>
                        {p.originalPrice && (
                          <del style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                            {p.originalPrice.toLocaleString('vi-VN')} ₫
                          </del>
                        )}
                      </div>

                      <button
                        onClick={e => handleAddCart(p, e)}
                        style={{
                          width: '100%',
                          background: addedId === p.id ? '#16a34a' : group.accentColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 0',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <ShoppingCart size={11} />
                        {addedId === p.id ? '✓ Đã thêm' : 'Thêm giỏ'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link
                href={`/search?category=${activeGroup}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: group.accentColor,
                  border: `1px solid ${group.accentColor}`,
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = group.bgColor)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Xem tất cả {group.label} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, Trophy, Zap, TrendingUp } from 'lucide-react';
import ProductCard from './ProductCard';

export interface FeaturedProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  brand?: string;
  specs?: string | Record<string, any>;
  stock?: number | boolean;
  badge?: string;
  badgeColor?: 'red' | 'blue' | 'green' | 'amber';
  rating?: number;
  tagType?: 'bestseller' | 'hotdeal' | 'toprated' | 'new';
}

interface CategoryFeaturedProps {
  categorySlug: string;
  categoryName: string;
  products?: any[];
}

// Curated default featured products by category slug
const CURATED_FEATURED_MAP: Record<string, FeaturedProductItem[]> = {
  cpu: [
    {
      id: 'feat-cpu-1',
      name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
      slug: 'intel-core-i9-14900k',
      price: 13990000,
      originalPrice: 15990000,
      image: '/images/cpu-box.jpg',
      category: 'CPU - Bộ Vi Xử Lý',
      brand: 'Intel',
      specs: '24 Cores | 32 Threads | LGA 1700 | 36MB Cache',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-cpu-2',
      name: 'AMD Ryzen 7 7800X3D (Up to 5.0GHz, 8 Nhân 16 Luồng)',
      slug: 'amd-ryzen-7-7800x3d',
      price: 9890000,
      originalPrice: 11290000,
      image: '/images/cpu-box.jpg',
      category: 'CPU - Bộ Vi Xử Lý',
      brand: 'AMD',
      specs: '8 Cores | 16 Threads | AM5 | 96MB 3D V-Cache',
      badge: '⚡ TOP GAMING',
      badgeColor: 'blue',
      tagType: 'toprated',
    },
    {
      id: 'feat-cpu-3',
      name: 'Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)',
      slug: 'intel-core-i7-14700k',
      price: 10490000,
      originalPrice: 11990000,
      image: '/images/cpu-box.jpg',
      category: 'CPU - Bộ Vi Xử Lý',
      brand: 'Intel',
      specs: '20 Cores | 28 Threads | LGA 1700 | 33MB Cache',
      badge: '💎 GIÁ SỐC',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-cpu-4',
      name: 'AMD Ryzen 9 7950X3D (Up to 5.7GHz, 16 Nhân 32 Luồng)',
      slug: 'amd-ryzen-9-7950x3d',
      price: 15490000,
      originalPrice: 17890000,
      image: '/images/cpu-box.jpg',
      category: 'CPU - Bộ Vi Xử Lý',
      brand: 'AMD',
      specs: '16 Cores | 32 Threads | AM5 | 128MB 3D V-Cache',
      badge: '🏆 FLAGSHIP',
      badgeColor: 'amber',
      tagType: 'new',
    },
  ],
  gpu: [
    {
      id: 'feat-gpu-1',
      name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X',
      slug: 'asus-rog-strix-rtx-4090-oc',
      price: 54990000,
      originalPrice: 59990000,
      image: '/images/cat-gpu.jpg',
      category: 'GPU - Card Màn Hình',
      brand: 'ASUS',
      specs: '24GB GDDR6X | 384-bit | DLSS 3 | ROG Cooling',
      badge: '🏆 KING OF GPU',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-gpu-2',
      name: 'MSI GeForce RTX 4070 Ti SUPER 16G GAMING X SLIM',
      slug: 'msi-rtx-4070-ti-super-gaming-x',
      price: 24490000,
      originalPrice: 26990000,
      image: '/images/cat-gpu.jpg',
      category: 'GPU - Card Màn Hình',
      brand: 'MSI',
      specs: '16GB GDDR6X | 256-bit | TRI FROZR 3 | ARGB',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-gpu-3',
      name: 'Gigabyte GeForce RTX 4060 Ti EAGLE OC 8GB GDDR6',
      slug: 'gigabyte-rtx-4060-ti-eagle-oc',
      price: 11290000,
      originalPrice: 12590000,
      image: '/images/cat-gpu.jpg',
      category: 'GPU - Card Màn Hình',
      brand: 'Gigabyte',
      specs: '8GB GDDR6 | 128-bit | WINDFORCE 3X | DLSS 3',
      badge: '⚡ GIÁ CỰC TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-gpu-4',
      name: 'GALAX GeForce RTX 4080 SUPER SG 16GB GDDR6X',
      slug: 'galax-rtx-4080-super-sg',
      price: 29990000,
      originalPrice: 32990000,
      image: '/images/cat-gpu.jpg',
      category: 'GPU - Card Màn Hình',
      brand: 'GALAX',
      specs: '16GB GDDR6X | 256-bit | 1-Clip Booster 2.0',
      badge: '💎 CAO CẤP',
      badgeColor: 'blue',
      tagType: 'new',
    },
  ],
  mainboard: [
    {
      id: 'feat-mb-1',
      name: 'Mainboard ASUS ROG STRIX Z790-E GAMING WIFI II DDR5',
      slug: 'asus-rog-strix-z790-e-gaming-wifi-ii',
      price: 12890000,
      originalPrice: 14590000,
      image: '/images/cat-mainboard.jpg',
      category: 'Mainboard - Bo Mạch Chủ',
      brand: 'ASUS',
      specs: 'Chipset Z790 | LGA 1700 | DDR5 | PCIe 5.0 | WiFi 7',
      badge: '🏆 FLAGSHIP',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-mb-2',
      name: 'Mainboard MSI MAG B760M MORTAR WIFI DDR5',
      slug: 'msi-mag-b760m-mortar-wifi-ddr5',
      price: 4590000,
      originalPrice: 5190000,
      image: '/images/cat-mainboard.jpg',
      category: 'Mainboard - Bo Mạch Chủ',
      brand: 'MSI',
      specs: 'Chipset B760 | LGA 1700 | Micro-ATX | DDR5',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-mb-3',
      name: 'Mainboard Gigabyte B650 AORUS ELITE AX ICE DDR5',
      slug: 'gigabyte-b650-aorus-elite-ax-ice',
      price: 6490000,
      originalPrice: 7290000,
      image: '/images/cat-mainboard.jpg',
      category: 'Mainboard - Bo Mạch Chủ',
      brand: 'Gigabyte',
      specs: 'Chipset B650 | Socket AM5 | White Edition | WiFi 6E',
      badge: '⚡ HOT GAMING',
      badgeColor: 'blue',
      tagType: 'new',
    },
    {
      id: 'feat-mb-4',
      name: 'Mainboard ASRock Z790 STEEL LEGEND WIFI DDR5',
      slug: 'asrock-z790-steel-legend-wifi',
      price: 7890000,
      originalPrice: 8990000,
      image: '/images/cat-mainboard.jpg',
      category: 'Mainboard - Bo Mạch Chủ',
      brand: 'ASRock',
      specs: 'Chipset Z790 | LGA 1700 | 16+1+1 Phase Power',
      badge: '💎 GIÁ SỐC',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
  ],
  ram: [
    {
      id: 'feat-ram-1',
      name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz Black',
      slug: 'corsair-vengeance-rgb-32gb-ddr5-6000',
      price: 3690000,
      originalPrice: 4290000,
      image: '/images/cat-ram.jpg',
      category: 'RAM - Bộ Nhớ Trong',
      brand: 'Corsair',
      specs: '32GB (2x16GB) | DDR5 | 6000MHz | CL36 | RGB',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-ram-2',
      name: 'RAM G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz',
      slug: 'gskill-trident-z5-rgb-64gb-ddr5-6400',
      price: 7490000,
      originalPrice: 8590000,
      image: '/images/cat-ram.jpg',
      category: 'RAM - Bộ Nhớ Trong',
      brand: 'G.SKILL',
      specs: '64GB (2x32GB) | DDR5 | 6400MHz | CL32 | Silver',
      badge: '🏆 CAO CẤP',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-ram-3',
      name: 'RAM Kingston FURY Beast RGB 16GB (2x8GB) DDR4 3200MHz',
      slug: 'kingston-fury-beast-rgb-16gb-ddr4-3200',
      price: 1290000,
      originalPrice: 1590000,
      image: '/images/cat-ram.jpg',
      category: 'RAM - Bộ Nhớ Trong',
      brand: 'Kingston',
      specs: '16GB (2x8GB) | DDR4 | 3200MHz | CL16',
      badge: '⚡ GIÁ SỐC',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-ram-4',
      name: 'RAM TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5 5600MHz White',
      slug: 'teamgroup-t-force-delta-rgb-32gb-ddr5-5600',
      price: 3290000,
      originalPrice: 3890000,
      image: '/images/cat-ram.jpg',
      category: 'RAM - Bộ Nhớ Trong',
      brand: 'TeamGroup',
      specs: '32GB (2x16GB) | DDR5 | 5600MHz | White ARGB',
      badge: '💎 CỰC ĐẸP',
      badgeColor: 'blue',
      tagType: 'new',
    },
  ],
  storage: [
    {
      id: 'feat-storage-1',
      name: 'Ổ cứng SSD Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2',
      slug: 'samsung-990-pro-2tb-nvme-m2',
      price: 4990000,
      originalPrice: 5690000,
      image: '/images/cat-storage.jpg',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      brand: 'Samsung',
      specs: '2TB | NVMe M.2 PCIe 4.0 | Read 7450MB/s',
      badge: '🏆 SPEED KING',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-storage-2',
      name: 'Ổ cứng SSD Kingston NV2 1TB PCIe 4.0 NVMe M.2',
      slug: 'kingston-nv2-1tb-pcie-40-nvme-m2',
      price: 1590000,
      originalPrice: 1890000,
      image: '/images/cat-storage.jpg',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      brand: 'Kingston',
      specs: '1TB | NVMe M.2 PCIe 4.0 | Read 3500MB/s',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-storage-3',
      name: 'Ổ cứng SSD WD Black SN850X 1TB PCIe Gen4 NVMe M.2 Gaming',
      slug: 'wd-black-sn850x-1tb-nvme-m2',
      price: 2790000,
      originalPrice: 3190000,
      image: '/images/cat-storage.jpg',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      brand: 'Western Digital',
      specs: '1TB | NVMe M.2 Gen4 | Read 7300MB/s',
      badge: '⚡ HOT GAMING',
      badgeColor: 'blue',
      tagType: 'new',
    },
    {
      id: 'feat-storage-4',
      name: 'Ổ cứng SSD Crucial P3 Plus 2TB PCIe 4.0 NVMe M.2',
      slug: 'crucial-p3-plus-2tb-nvme-m2',
      price: 3290000,
      originalPrice: 3890000,
      image: '/images/cat-storage.jpg',
      category: 'SSD / HDD - Ổ Đĩa Cứng',
      brand: 'Crucial',
      specs: '2TB | NVMe M.2 PCIe 4.0 | Read 5000MB/s',
      badge: '💎 GIÁ TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
  ],
  psu: [
    {
      id: 'feat-psu-1',
      name: 'Nguồn Máy Tính Corsair RM1000x 1000W 80 Plus Gold Fully Modular',
      slug: 'corsair-rm1000x-1000w-80-plus-gold',
      price: 4690000,
      originalPrice: 5290000,
      image: '/images/cat-psu.jpg',
      category: 'PSU - Nguồn Máy Tính',
      brand: 'Corsair',
      specs: '1000W | 80 Plus Gold | Full Modular | 135mm Fan',
      badge: '🏆 SIÊU BỀN',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-psu-2',
      name: 'Nguồn Máy Tính MSI MAG A850GL PCIE5 850W 80 Plus Gold',
      slug: 'msi-mag-a850gl-pcie5-850w-gold',
      price: 3190000,
      originalPrice: 3690000,
      image: '/images/cat-psu.jpg',
      category: 'PSU - Nguồn Máy Tính',
      brand: 'MSI',
      specs: '850W | ATX 3.0 & PCIe 5.0 | 80 Plus Gold',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-psu-3',
      name: 'Nguồn Máy Tính ASUS ROG Thor 1200W Platinum II OLED',
      slug: 'asus-rog-thor-1200w-platinum-ii-oled',
      price: 9490000,
      originalPrice: 10590000,
      image: '/images/cat-psu.jpg',
      category: 'PSU - Nguồn Máy Tính',
      brand: 'ASUS',
      specs: '1200W | 80 Plus Platinum | Screen OLED | ARGB',
      badge: '💎 SIÊU CẤP',
      badgeColor: 'blue',
      tagType: 'new',
    },
    {
      id: 'feat-psu-4',
      name: 'Nguồn Máy Tính Gigabyte UD850GM 850W 80 Plus Gold',
      slug: 'gigabyte-ud850gm-850w-gold',
      price: 2590000,
      originalPrice: 2990000,
      image: '/images/cat-psu.jpg',
      category: 'PSU - Nguồn Máy Tính',
      brand: 'Gigabyte',
      specs: '850W | 80 Plus Gold | Full Modular | Smart Fan',
      badge: '⚡ GIÁ SỐC',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
  ],
  case: [
    {
      id: 'feat-case-1',
      name: 'Vỏ Case HYTE Y60 Panoramic Dual Chamber PC Case Black',
      slug: 'hyte-y60-panoramic-dual-chamber-black',
      price: 5490000,
      originalPrice: 6290000,
      image: '/images/cat-case.jpg',
      category: 'Case - Vỏ Máy Tính',
      brand: 'HYTE',
      specs: 'Dual Chamber | 3-Piece Glass | PCIe 4.0 Riser',
      badge: '🏆 SHOWROOM',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-case-2',
      name: 'Vỏ Case NZXT H9 Flow Dual-Chamber Mid-Tower Case White',
      slug: 'nzxt-h9-flow-dual-chamber-white',
      price: 4290000,
      originalPrice: 4890000,
      image: '/images/cat-case.jpg',
      category: 'Case - Vỏ Máy Tính',
      brand: 'NZXT',
      specs: 'Dual Chamber | Perforated Top | Glass Panel',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-case-3',
      name: 'Vỏ Case Corsair 4000D AIRFLOW Mid-Tower Black',
      slug: 'corsair-4000d-airflow-mid-tower-black',
      price: 2190000,
      originalPrice: 2590000,
      image: '/images/cat-case.jpg',
      category: 'Case - Vỏ Máy Tính',
      brand: 'Corsair',
      specs: 'High Airflow | Tempered Glass | Cable Routing',
      badge: '⚡ GIÁ TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-case-4',
      name: 'Vỏ Case Lian Li O11 Dynamic EVO RGB White',
      slug: 'lian-li-o11-dynamic-evo-rgb-white',
      price: 4790000,
      originalPrice: 5390000,
      image: '/images/cat-case.jpg',
      category: 'Case - Vỏ Máy Tính',
      brand: 'Lian Li',
      specs: 'Dual Mode | RGB Strip | Dual Chamber Glass',
      badge: '💎 CỰC ĐẸP',
      badgeColor: 'blue',
      tagType: 'new',
    },
  ],
  cooling: [
    {
      id: 'feat-cool-1',
      name: 'Tản Nhiệt Nước AIO NZXT Kraken Elite 360 RGB Black',
      slug: 'nzxt-kraken-elite-360-rgb-black',
      price: 7890000,
      originalPrice: 8990000,
      image: '/images/cat-cooling.jpg',
      category: 'Tản Nhiệt (Cooling)',
      brand: 'NZXT',
      specs: '360mm AIO | 2.36" LCD Screen | F120 RGB Core Fans',
      badge: '🏆 MÀN HÌNH LCD',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-cool-2',
      name: 'Tản Nhiệt Khí Thermalright Peerless Assassin 120 SE ARGB',
      slug: 'thermalright-peerless-assassin-120-se-argb',
      price: 890000,
      originalPrice: 1190000,
      image: '/images/cat-cooling.jpg',
      category: 'Tản Nhiệt (Cooling)',
      brand: 'Thermalright',
      specs: 'Dual Tower | 6 Heatpipes | Dual C12C-S ARGB Fans',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-cool-3',
      name: 'Tản Nhiệt Nước AIO ASUS ROG RYUJIN III 360 ARGB',
      slug: 'asus-rog-ryujin-iii-360-argb',
      price: 9990000,
      originalPrice: 11290000,
      image: '/images/cat-cooling.jpg',
      category: 'Tản Nhiệt (Cooling)',
      brand: 'ASUS',
      specs: '360mm AIO | 3.5" Full-Color LCD | Magnetic ARGB Fans',
      badge: '💎 ULTRA PREMIUM',
      badgeColor: 'blue',
      tagType: 'new',
    },
    {
      id: 'feat-cool-4',
      name: 'Tản Nhiệt Nước AIO DeepCool LT720 360mm High-Performance',
      slug: 'deepcool-lt720-360mm-aio-cooler',
      price: 3290000,
      originalPrice: 3790000,
      image: '/images/cat-cooling.jpg',
      category: 'Tản Nhiệt (Cooling)',
      brand: 'DeepCool',
      specs: '360mm Radiator | Multidimensional Mirror Block | FK120 Fans',
      badge: '⚡ GIÁ CỰC TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
  ],
  monitor: [
    {
      id: 'feat-mon-1',
      name: 'Màn Hình Gaming ASUS ROG Swift OLED PG27AQDM 27" QHD 240Hz 0.03ms',
      slug: 'asus-rog-swift-oled-pg27aqdm-27-240hz',
      price: 23990000,
      originalPrice: 26990000,
      image: '/images/cat-monitor.jpg',
      category: 'Màn Hình Gaming',
      brand: 'ASUS',
      specs: '27 inch | OLED QHD | 240Hz | 0.03ms | HDR10',
      badge: '🏆 OLED 240HZ',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-mon-2',
      name: 'Màn Hình Gaming LG UltraGear 27GP850-B 27" QHD Nano IPS 165Hz',
      slug: 'lg-ultragear-27gp850-b-27-nano-ips-165hz',
      price: 8490000,
      originalPrice: 9990000,
      image: '/images/cat-monitor.jpg',
      category: 'Màn Hình Gaming',
      brand: 'LG',
      specs: '27 inch | Nano IPS QHD | 165Hz | 1ms GTG | G-Sync',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-mon-3',
      name: 'Màn Hình Gaming Gigabyte M27Q 27" QHD IPS 170Hz KVM',
      slug: 'gigabyte-m27q-27-qhd-ips-170hz',
      price: 6490000,
      originalPrice: 7490000,
      image: '/images/cat-monitor.jpg',
      category: 'Màn Hình Gaming',
      brand: 'Gigabyte',
      specs: '27 inch | Super Speed IPS | 170Hz | 0.5ms | KVM Switch',
      badge: '⚡ GIÁ TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-mon-4',
      name: 'Màn Hình Cong Samsung Odyssey G7 32" QHD 240Hz 1000R',
      slug: 'samsung-odyssey-g7-32-qhd-240hz-1000r',
      price: 13990000,
      originalPrice: 15990000,
      image: '/images/cat-monitor.jpg',
      category: 'Màn Hình Gaming',
      brand: 'Samsung',
      specs: '32 inch Curved 1000R | QLED QHD | 240Hz | 1ms',
      badge: '💎 MÀN CONG 240HZ',
      badgeColor: 'blue',
      tagType: 'new',
    },
  ],
  gear: [
    {
      id: 'feat-gear-1',
      name: 'Bàn Phím Cơ Wireless Logitech G Pro X TKL LIGHTSPEED Magenta',
      slug: 'logitech-g-pro-x-tkl-lightspeed-magenta',
      price: 4290000,
      originalPrice: 4990000,
      image: '/images/cat-gear.jpg',
      category: 'Bàn Phím & Chuột',
      brand: 'Logitech',
      specs: 'TKL Layout | Wireless LIGHTSPEED | PBT Keycaps | RGB',
      badge: '🏆 PRO GAMER',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-gear-2',
      name: 'Chuột Gaming Không Dây Razer Viper V3 Pro Ultra-lightweight',
      slug: 'razer-viper-v3-pro-wireless-black',
      price: 3990000,
      originalPrice: 4590000,
      image: '/images/cat-gear.jpg',
      category: 'Bàn Phím & Chuột',
      brand: 'Razer',
      specs: '54g Ultra-lightweight | Focus Pro 35K Gen-2 Sensor | 8000Hz',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-gear-3',
      name: 'Bàn Phím Cơ Akko 5075B Plus Multi-modes ISO RGB Dracula',
      slug: 'akko-5075b-plus-rgb-dracula',
      price: 1890000,
      originalPrice: 2290000,
      image: '/images/cat-gear.jpg',
      category: 'Bàn Phím & Chuột',
      brand: 'Akko',
      specs: '75% Layout | 3 Modes (Type-C / 2.4G / BT) | Hotswap | Gasket',
      badge: '⚡ GIÁ SỐC',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
    {
      id: 'feat-gear-4',
      name: 'Chuột Gaming Logitech G502 X PLUS LIGHTSPEED Wireless RGB',
      slug: 'logitech-g502-x-plus-lightspeed-wireless-rgb',
      price: 3490000,
      originalPrice: 3990000,
      image: '/images/cat-gear.jpg',
      category: 'Bàn Phím & Chuột',
      brand: 'Logitech',
      specs: 'LIGHTFORCE Hybrid Switches | HERO 25K Sensor | LIGHTSYNC RGB',
      badge: '💎 CỰC ĐỈNH',
      badgeColor: 'blue',
      tagType: 'new',
    },
  ],
  headset: [
    {
      id: 'feat-headset-1',
      name: 'Tai Nghe Gaming HyperX Cloud III Wireless Black/Red',
      slug: 'hyperx-cloud-iii-wireless-black-red',
      price: 3490000,
      originalPrice: 3990000,
      image: '/images/cat-headset.jpg',
      category: 'Tai Nghe & Audio',
      brand: 'HyperX',
      specs: '53mm Angled Drivers | 120-hour Battery | DTS Headphone:X 3D',
      badge: '🔥 BÁN CHẠY',
      badgeColor: 'red',
      tagType: 'bestseller',
    },
    {
      id: 'feat-headset-2',
      name: 'Tai Nghe Gaming Logitech G PRO X 2 LIGHTSPEED Wireless Graphene',
      slug: 'logitech-g-pro-x-2-lightspeed-wireless-black',
      price: 5490000,
      originalPrice: 6290000,
      image: '/images/cat-headset.jpg',
      category: 'Tai Nghe & Audio',
      brand: 'Logitech',
      specs: '50mm Graphene Drivers | LIGHTSPEED Wireless | Blue VO!CE',
      badge: '🏆 PRO AUDIO',
      badgeColor: 'amber',
      tagType: 'toprated',
    },
    {
      id: 'feat-headset-3',
      name: 'Tai Nghe Gaming SteelSeries Arctis Nova Pro Wireless PC/PlayStation',
      slug: 'steelseries-arctis-nova-pro-wireless',
      price: 8990000,
      originalPrice: 9990000,
      image: '/images/cat-headset.jpg',
      category: 'Tai Nghe & Audio',
      brand: 'SteelSeries',
      specs: 'Active Noise Cancellation | GameDAC Gen 2 | Dual Swappable Batteries',
      badge: '💎 CAO CẤP',
      badgeColor: 'blue',
      tagType: 'new',
    },
    {
      id: 'feat-headset-4',
      name: 'Tai Nghe Gaming Corsair HS80 RGB Wireless Carbon',
      slug: 'corsair-hs80-rgb-wireless-carbon',
      price: 3190000,
      originalPrice: 3690000,
      image: '/images/cat-headset.jpg',
      category: 'Tai Nghe & Audio',
      brand: 'Corsair',
      specs: 'SLIPSTREAM Wireless | Dolby Atmos | Broadcast-Grade Mic',
      badge: '⚡ GIÁ CỰC TỐT',
      badgeColor: 'green',
      tagType: 'hotdeal',
    },
  ],
};

export default function CategoryFeatured({ categorySlug, categoryName, products = [] }: CategoryFeaturedProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller' | 'hotdeal' | 'toprated'>('all');

  // Prepare featured list
  const curatedList = CURATED_FEATURED_MAP[categorySlug];

  let rawList: FeaturedProductItem[] = [];

  if (curatedList && curatedList.length > 0) {
    rawList = curatedList;
  } else if (products && products.length > 0) {
    // Dynamically derive top 4 products from db products
    rawList = products.slice(0, 4).map((p, idx) => {
      const badges = ['🔥 BÁN CHẠY', '⚡ GIÁ TỐT', '⭐ BÌNH CHỌN', '🏆 NỔI BẬT'];
      const badgeColors: ('red' | 'blue' | 'green' | 'amber')[] = ['red', 'green', 'blue', 'amber'];
      const tags: ('bestseller' | 'hotdeal' | 'toprated' | 'new')[] = ['bestseller', 'hotdeal', 'toprated', 'new'];

      return {
        id: p.id || `db-feat-${idx}`,
        name: p.nameVi || p.name,
        slug: p.slug,
        price: Number(p.price),
        originalPrice: Number(p.originalPrice || p.original_price || Math.round(Number(p.price) * 1.15)),
        image: p.images?.[0] || p.image_url || p.image,
        category: p.category || categoryName,
        brand: p.brand || p.brand_name || 'Chính hãng',
        specs: p.specs,
        stock: p.stock,
        badge: badges[idx % badges.length],
        badgeColor: badgeColors[idx % badgeColors.length],
        tagType: tags[idx % tags.length],
      };
    });
  }

  if (rawList.length === 0) return null;

  // Filter based on selected sub-tab
  const displayedItems = activeTab === 'all'
    ? rawList
    : rawList.filter(item => {
        if (activeTab === 'bestseller') return item.tagType === 'bestseller' || item.badge?.includes('BÁN CHẠY');
        if (activeTab === 'hotdeal') return item.tagType === 'hotdeal' || item.badge?.includes('GIÁ') || (item.originalPrice && (item.originalPrice - item.price) / item.originalPrice > 0.1);
        if (activeTab === 'toprated') return item.tagType === 'toprated' || item.badge?.includes('TOP') || item.badge?.includes('FLAGSHIP') || item.badge?.includes('KING') || item.badge?.includes('PRO');
        return true;
      });

  const finalItems = displayedItems.length > 0 ? displayedItems : rawList;

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444 0%, #2563eb 50%, #8b5cf6 100%)',
        }}
      />

      {/* Header section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <Flame size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Sản Phẩm Nổi Bật
              </h2>
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={12} /> TOP HOT
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Các mẫu {categoryName} được săn đón & đánh giá cao nhất
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'all' ? '#ffffff' : 'transparent',
              color: activeTab === 'all' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bestseller')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'bestseller' ? '#ffffff' : 'transparent',
              color: activeTab === 'bestseller' ? '#ef4444' : '#64748b',
              boxShadow: activeTab === 'bestseller' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <TrendingUp size={13} /> Bán chạy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hotdeal')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'hotdeal' ? '#ffffff' : 'transparent',
              color: activeTab === 'hotdeal' ? '#16a34a' : '#64748b',
              boxShadow: activeTab === 'hotdeal' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={13} /> Giá sốc
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('toprated')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'toprated' ? '#ffffff' : 'transparent',
              color: activeTab === 'toprated' ? '#d97706' : '#64748b',
              boxShadow: activeTab === 'toprated' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trophy size={13} /> Khuyên dùng
          </button>
        </div>
      </div>

      {/* Grid of 4 Featured Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {finalItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            image={item.image}
            images={item.images}
            price={item.price}
            originalPrice={item.originalPrice}
            category={item.category || categoryName}
            brand={item.brand}
            stock={item.stock}
            badge={item.badge}
            badgeColor={item.badgeColor}
            specs={item.specs}
          />
        ))}
      </div>
    </section>
  );
}

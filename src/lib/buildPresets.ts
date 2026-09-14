export interface BuildPresetComponent {
  key: string;
  id: string;
  name: string;
  price: number;
  tdp: number;
  specs: string;
  image: string;
  slug: string;
}

export interface BuildPreset {
  id: string;
  title: string;
  budgetLabel: string;
  totalPrice: number;
  components: Record<string, BuildPresetComponent>;
}

export const AI_BUILD_PRESETS: Record<string, BuildPreset> = {
  '15m': {
    id: 'preset-15m',
    title: 'PC Gaming & Học Tập - 15 Triệu',
    budgetLabel: '15.000.000đ',
    totalPrice: 15130000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-5600',
        name: 'CPU AMD Ryzen 5 5600 (3.5GHz - 4.4GHz, 6 Nhân 12 Luồng)',
        price: 2990000,
        tdp: 65,
        specs: 'Socket AM4 | 35MB Cache | 65W TDP',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-5600',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b550',
        name: 'Mainboard ASUS TUF GAMING B550M-PLUS',
        price: 2890000,
        tdp: 35,
        specs: 'Socket AM4 | 4x DDR4 | PCIe 4.0 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b550m-plus',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-16g',
        name: 'RAM Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        price: 1190000,
        tdp: 10,
        specs: '2x8GB | DDR4 | 3200MHz | CL16',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-16gb',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-3060',
        name: 'VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC',
        price: 7490000,
        tdp: 170,
        specs: '12GB GDDR6 | 192-bit | Dual Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'msi-rtx-3060-ventus-2x',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-500g',
        name: 'SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2',
        price: 990000,
        tdp: 5,
        specs: '500GB | Đọc 3500MB/s - Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-500gb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-650w',
        name: 'Nguồn MSI MAG A650BN 650W 80 Plus Bronze',
        price: 1290000,
        tdp: 0,
        specs: '650W | 80 Plus Bronze | Non-Modular',
        image: '/images/cat-psu.jpg',
        slug: 'msi-mag-a650bn',
      },
      case: {
        key: 'case',
        id: 'p-case-xigmatek',
        name: 'Vỏ Case Xigmatek Gaming X 3FX Black (Kèm 3 Fan RGB)',
        price: 790000,
        tdp: 0,
        specs: 'Mid Tower | Hỗ trợ main M-ATX/ATX',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-gaming-x',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-ta',
        name: 'Tản Nhiệt Khí Thermalright Assassin X 120 Refined SE ARGB',
        price: 490000,
        tdp: 10,
        specs: 'Tản tháp đơn | 4 Ống đồng | Fan 120mm ARGB',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-assassin-x120',
      },
    },
  },
  '25m': {
    id: 'preset-25m',
    title: 'PC Gaming 2K & Đồ Họa - 25 Triệu',
    budgetLabel: '25.000.000đ',
    totalPrice: 24730000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-13400f',
        name: 'CPU Intel Core i5-13400F (Up to 4.6GHz, 10 Nhân 16 Luồng)',
        price: 4890000,
        tdp: 148,
        specs: 'LGA1700 | 20MB Cache | 65W-148W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i5-13400f',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b760m',
        name: 'Mainboard ASUS TUF GAMING B760M-PLUS WIFI DDR5',
        price: 4290000,
        tdp: 40,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | Wi-Fi 6',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b760m-plus-d5',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-32g-d5',
        name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
        price: 2890000,
        tdp: 15,
        specs: '2x16GB | DDR5 | 6000MHz | CL36',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-32gb-d5',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-4060ti',
        name: 'VGA ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB GDDR6',
        price: 10990000,
        tdp: 160,
        specs: '8GB GDDR6 | DLSS 3 | Dual Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-dual-rtx-4060-ti',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-1tb',
        name: 'SSD Samsung 980 1TB PCIe NVMe M.2 2280',
        price: 1890000,
        tdp: 5,
        specs: '1TB | Đọc 3500MB/s - Ghi 3000MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-980-1tb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-750w',
        name: 'Nguồn Corsair CV750 750W 80 Plus Bronze',
        price: 1690000,
        tdp: 0,
        specs: '750W | 80 Plus Bronze | Single Rail +12V',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-cv750',
      },
      case: {
        key: 'case',
        id: 'p-case-montech',
        name: 'Vỏ Case Montech AIR 903 MAX Black (4 Fan ARGB 140mm)',
        price: 1390000,
        tdp: 0,
        specs: 'Mid Tower | Hỗ trợ main E-ATX | Kính cường lực',
        image: '/images/hero-pc.jpg',
        slug: 'montech-air-903-max',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-ak400',
        name: 'Tản Nhiệt Khí DeepCool AK400 Digital Display Black',
        price: 990000,
        tdp: 15,
        specs: 'Màn hình hiển thị nhiệt độ | 4 Ống đồng',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-ak400-digital',
      },
    },
  },
  '35m': {
    id: 'preset-35m',
    title: 'PC Gaming 2K High FPS & Render 3D - 35 Triệu',
    budgetLabel: '35.000.000đ',
    totalPrice: 35040000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-14700k',
        name: 'CPU Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)',
        price: 10490000,
        tdp: 253,
        specs: 'LGA1700 | 33MB Cache | 125W-253W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i7-14700k',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-z790-tomahawk',
        name: 'Mainboard MSI MAG Z790 TOMAHAWK WIFI DDR5',
        price: 7890000,
        tdp: 50,
        specs: 'LGA1700 | 16+1+1 Phase VRM | Wi-Fi 6E',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-z790-tomahawk',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-32g-z5',
        name: 'RAM G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz CL30',
        price: 3490000,
        tdp: 15,
        specs: '2x16GB | DDR5 | 6000MHz | CL30-38-38-96',
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-32gb',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-4070s',
        name: 'VGA GIGABYTE GeForce RTX 4070 SUPER WINDFORCE OC 12G',
        price: 16990000,
        tdp: 220,
        specs: '12GB GDDR6X | 192-bit | Triple Fan Windforce',
        image: '/images/gpu-strix.jpg',
        slug: 'gigabyte-rtx-4070-super-windforce',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-990pro-1t',
        name: 'SSD Samsung 990 Pro 1TB PCIe Gen 4.0 x4 NVMe M.2',
        price: 2890000,
        tdp: 10,
        specs: '1TB | Đọc 7450MB/s - Ghi 6900MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-1tb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-850w',
        name: 'Nguồn Corsair RM850x 850W 80 Plus Gold Full Modular',
        price: 3290000,
        tdp: 0,
        specs: '850W | 80 Plus Gold | Cybenetics Gold',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-rm850x',
      },
      case: {
        key: 'case',
        id: 'p-case-h6flow',
        name: 'Vỏ Case NZXT H6 Flow RGB Black Dual-Chamber',
        price: 3190000,
        tdp: 0,
        specs: 'Bể cá Kính góc nghiêng | Kèm 3 Fan ARGB',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-h6-flow-rgb',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-pa120',
        name: 'Tản Nhiệt Nước AIO Thermalright Frozen Note 360 ARGB Black',
        price: 1890000,
        tdp: 25,
        specs: 'AIO 360mm | Bơm tốc độ cao 5300 RPM',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-frozen-note-360',
      },
    },
  },
  '50m': {
    id: 'preset-50m',
    title: 'PC Gaming 4K & Workstation Đỉnh Cao - 50+ Triệu',
    budgetLabel: '50.000.000đ+',
    totalPrice: 83730000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'd1000000-0000-0000-0000-000000000001',
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 13990000,
        tdp: 253,
        specs: 'LGA1700 | 36MB Cache | 125W-253W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i9-14900k',
      },
      mainboard: {
        key: 'mainboard',
        id: 'd1000000-0000-0000-0000-000000000003',
        name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
        price: 11490000,
        tdp: 50,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-z790-e',
      },
      ram: {
        key: 'ram',
        id: 'd1000000-0000-0000-0000-000000000005',
        name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz',
        price: 6290000,
        tdp: 15,
        specs: '2x32GB | DDR5 | 6000MHz | CL30',
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-ddr5',
      },
      gpu: {
        key: 'gpu',
        id: 'd1000000-0000-0000-0000-000000000002',
        name: 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X',
        price: 31490000,
        tdp: 320,
        specs: '16GB GDDR6X | 256-bit | Triple Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-rog-strix-rtx-4080-super',
      },
      storage: {
        key: 'storage',
        id: 'd1000000-0000-0000-0000-000000000004',
        name: 'Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2',
        price: 4890000,
        tdp: 10,
        specs: '2TB | Đọc 7450MB/s - Ghi 6900MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-2tb',
      },
      psu: {
        key: 'psu',
        id: 'd1000000-0000-0000-0000-000000000006',
        name: 'Corsair RM1000x 1000W 80 Plus Gold Full Modular',
        price: 4390000,
        tdp: 0,
        specs: '1000W | 80 Plus Gold | Full Modular',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-rm1000x',
      },
      case: {
        key: 'case',
        id: 'd1000000-0000-0000-0000-000000000007',
        name: 'NZXT H9 Flow RGB Dual-Chamber Mid-Tower Black',
        price: 4290000,
        tdp: 0,
        specs: 'Hỗ trợ GPU 435mm | Tản nước 360mm',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-h9-flow-black',
      },
      cooling: {
        key: 'cooling',
        id: 'd1000000-0000-0000-0000-000000000008',
        name: 'NZXT Kraken Elite 360 RGB Black Liquid Cooler',
        price: 6890000,
        tdp: 25,
        specs: 'AIO 360mm | 3x 120mm RGB Fan | Màn hình LCD',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-kraken-elite-360',
      },
    },
  },
};

export function matchPresetKeyFromText(text: string): string {
  const lower = text.toLowerCase();
  
  // Extract explicit budget numbers if present (e.g. 15, 20, 25, 30, 35, 50, 100)
  const budgetMatch = lower.match(/(\d+)\s*(triệu|tr|m)/);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1], 10);
    if (val < 20) return '15m';
    if (val >= 20 && val < 30) return '25m';
    if (val >= 30 && val < 45) return '35m';
    return '50m';
  }

  if (lower.includes('15tr') || lower.includes('15 triệu') || lower.includes('10tr') || lower.includes('12tr')) return '15m';
  if (lower.includes('20tr') || lower.includes('25tr') || lower.includes('20 triệu') || lower.includes('25 triệu')) return '25m';
  if (lower.includes('30tr') || lower.includes('35tr') || lower.includes('40tr') || lower.includes('30 triệu')) return '35m';
  if (lower.includes('50tr') || lower.includes('100tr') || lower.includes('khủng') || lower.includes('cao cấp')) return '50m';

  return '25m'; // default fallback
}

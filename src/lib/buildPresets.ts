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
  '10m': {
    id: 'preset-10m',
    title: 'PC Văn Phòng & Học Tập - 10 Triệu',
    budgetLabel: '10.000.000đ',
    totalPrice: 9840000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-12100',
        name: 'CPU Intel Core i3-12100 (3.3GHz - 4.3GHz, 4 Nhân 8 Luồng, Đồ Họa UHD 730)',
        price: 2490000,
        tdp: 60,
        specs: 'LGA1700 | 12MB Cache | Intel UHD Graphics 730',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i3-12100',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-h610m',
        name: 'Mainboard ASUS PRIME H610M-K D4',
        price: 1890000,
        tdp: 30,
        specs: 'LGA1700 | 2x DDR4 | M.2 NVMe | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-prime-h610m-k-d4',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-16g-d4',
        name: 'RAM Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        price: 1090000,
        tdp: 10,
        specs: '2x8GB | DDR4 | 3200MHz | Dual-Channel',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-16gb',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-gtx1650',
        name: 'VGA ASUS Dual GeForce GTX 1650 OC 4GB GDDR6',
        price: 3390000,
        tdp: 75,
        specs: '4GB GDDR6 | 128-bit | Compact Dual Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-dual-gtx-1650-oc',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-500g-nv2',
        name: 'SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2',
        price: 890000,
        tdp: 5,
        specs: '500GB | Đọc 3500MB/s - Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-500gb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-550w',
        name: 'Nguồn Deepcool PF550 550W 80 Plus Standard',
        price: 890000,
        tdp: 0,
        specs: '550W | 80 Plus | Active PFC',
        image: '/images/cat-psu.jpg',
        slug: 'deepcool-pf550',
      },
      case: {
        key: 'case',
        id: 'p-case-xigmatek-nyx',
        name: 'Vỏ Case Xigmatek NYX Air 3F (Kèm 3 Fan RGB)',
        price: 690000,
        tdp: 0,
        specs: 'Mini Tower | Kính cường lực | Mặt lưới thoáng khí',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-nyx-air-3f',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-stock',
        name: 'Tản Nhiệt Khí Intel Laminar RM1 Socket LGA1700',
        price: 0,
        tdp: 0,
        specs: 'Tản nhiệt chính hãng kèm CPU | Lõi đồng êm ái',
        image: '/images/hero-pc.jpg',
        slug: 'intel-laminar-rm1',
      },
    },
  },
  '30m': {
    id: 'preset-30m',
    title: 'PC Gaming Cao Cấp & Streamer - 30 Triệu',
    budgetLabel: '30.000.000đ',
    totalPrice: 29930000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-14600kf',
        name: 'CPU Intel Core i5-14600KF (Up to 5.3GHz, 14 Nhân 20 Luồng)',
        price: 6290000,
        tdp: 181,
        specs: 'LGA1700 | 24MB Cache | 125W-181W Max Turbo',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i5-14600kf',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b760-plus-d5',
        name: 'Mainboard ASUS TUF GAMING B760-PLUS WIFI DDR5',
        price: 4590000,
        tdp: 45,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | Wi-Fi 6E | ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b760-plus-d5',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-32g-corsair-d5',
        name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
        price: 2890000,
        tdp: 15,
        specs: '2x16GB | DDR5 | 6000MHz | Intel XMP 3.0',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-32gb-d5',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-rtx4070-12g',
        name: 'VGA GIGABYTE GeForce RTX 4070 WINDFORCE OC 12G GDDR6X',
        price: 15490000,
        tdp: 200,
        specs: '12GB GDDR6X | 192-bit | DLSS 3 | Triple Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'gigabyte-rtx-4070-windforce-oc',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-kc3000-1tb',
        name: 'SSD Kingston KC3000 1TB PCIe 4.0 NVMe M.2 (7000MB/s)',
        price: 2290000,
        tdp: 8,
        specs: '1TB | Đọc 7000MB/s - Ghi 6000MB/s | 3D TLC',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-kc3000-1tb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-msi-a750gl',
        name: 'Nguồn MSI MAG A750GL PCIE5 750W 80 Plus Gold Full Modular',
        price: 2490000,
        tdp: 0,
        specs: '750W | 80 Plus Gold | Chuẩn ATX 3.0 PCIe 5.0',
        image: '/images/cat-psu.jpg',
        slug: 'msi-mag-a750gl-pcie5',
      },
      case: {
        key: 'case',
        id: 'p-case-montech-903',
        name: 'Vỏ Case Montech AIR 903 MAX Black (4 Fan ARGB 140mm)',
        price: 1390000,
        tdp: 0,
        specs: 'Mid Tower | Hỗ trợ main E-ATX | Kính cường lực',
        image: '/images/hero-pc.jpg',
        slug: 'montech-air-903-max',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-deepcool-lt520',
        name: 'Tản Nhiệt Nước DeepCool LT520 240mm ARGB AIO Liquid Cooler',
        price: 1790000,
        tdp: 20,
        specs: 'Radiator 240mm | Bơm đa chiều thế hệ 4 | Fan FK120',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-lt520-240mm',
      },
    },
  },
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
  '50m_amd': {
    id: 'preset-50m-amd',
    title: 'PC Gaming 4K & Workstation Đỉnh Cao AMD - 50+ Triệu',
    budgetLabel: '50.000.000đ+',
    totalPrice: 86930000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-7950x3d',
        name: 'CPU AMD Ryzen 9 7950X3D (4.2GHz - 5.7GHz, 16 Nhân 32 Luồng, 144MB V-Cache)',
        price: 15490000,
        tdp: 120,
        specs: 'Socket AM5 | 144MB V-Cache | 120W TDP | Vua Gaming & Render',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-9-7950x3d',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-x670e-e',
        name: 'Mainboard ASUS ROG STRIX X670E-E GAMING WIFI',
        price: 12990000,
        tdp: 50,
        specs: 'Socket AM5 | 4x DDR5 | PCIe 5.0 | Wi-Fi 6E | ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-x670e-e',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-64g-d5-neo',
        name: 'RAM G.Skill Trident Z5 Neo RGB 64GB (2x32GB) DDR5 6000MHz AMD EXPO',
        price: 6490000,
        tdp: 15,
        specs: '2x32GB | DDR5 | 6000MHz | AMD EXPO Chuyên dụng',
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-neo-64gb',
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
        specs: 'AIO 360mm | Socket AM5 / LGA1700 | Màn hình LCD',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-kraken-elite-360',
      },
    },
  },
  '30m_amd': {
    id: 'preset-30m-amd',
    title: 'PC Gaming & Đồ Họa AMD Ryzen 7 - 30 Triệu',
    budgetLabel: '30.000.000đ',
    totalPrice: 30730000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-7700x',
        name: 'CPU AMD Ryzen 7 7700X (Up to 5.4GHz, 8 Nhân 16 Luồng, 32MB Cache)',
        price: 7490000,
        tdp: 105,
        specs: 'Socket AM5 | 8C/16T | 5.4GHz Max Boost | PCIe 5.0',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-7-7700x',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b650-tomahawk',
        name: 'Mainboard MSI MAG B650 TOMAHAWK WIFI DDR5',
        price: 5290000,
        tdp: 45,
        specs: 'Socket AM5 | 4x DDR5 | PCIe 5.0 M.2 | Wi-Fi 6E',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-b650-tomahawk-wifi',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-32g-expo',
        name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz AMD EXPO',
        price: 2990000,
        tdp: 15,
        specs: '2x16GB | DDR5 | 6000MHz | AMD EXPO Tối ưu',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-32gb-expo',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-rtx4070-12g',
        name: 'VGA GIGABYTE GeForce RTX 4070 WINDFORCE OC 12G GDDR6X',
        price: 15490000,
        tdp: 200,
        specs: '12GB GDDR6X | 192-bit | DLSS 3 | Triple Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'gigabyte-rtx-4070-windforce-oc',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-kc3000-1tb',
        name: 'SSD Kingston KC3000 1TB PCIe 4.0 NVMe M.2 (7000MB/s)',
        price: 2290000,
        tdp: 8,
        specs: '1TB | Đọc 7000MB/s - Ghi 6000MB/s | 3D TLC',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-kc3000-1tb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-msi-a750gl',
        name: 'Nguồn MSI MAG A750GL PCIE5 750W 80 Plus Gold Full Modular',
        price: 2490000,
        tdp: 0,
        specs: '750W | 80 Plus Gold | Chuẩn ATX 3.0 PCIe 5.0',
        image: '/images/cat-psu.jpg',
        slug: 'msi-mag-a750gl-pcie5',
      },
      case: {
        key: 'case',
        id: 'p-case-montech-903',
        name: 'Vỏ Case Montech AIR 903 MAX Black (4 Fan ARGB 140mm)',
        price: 1390000,
        tdp: 0,
        specs: 'Mid Tower | Hỗ trợ main E-ATX | Kính cường lực',
        image: '/images/hero-pc.jpg',
        slug: 'montech-air-903-max',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-deepcool-lt520',
        name: 'Tản Nhiệt Nước DeepCool LT520 240mm ARGB AIO Liquid Cooler',
        price: 1790000,
        tdp: 20,
        specs: 'Radiator 240mm | Socket AM5 / LGA1700 | Fan FK120',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-lt520-240mm',
      },
    },
  },
  '25m_amd': {
    id: 'preset-25m-amd',
    title: 'PC Gaming 2K AMD Ryzen 5 - 25 Triệu',
    budgetLabel: '25.000.000đ',
    totalPrice: 24830000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-7600',
        name: 'CPU AMD Ryzen 5 7600 (Up to 5.1GHz, 6 Nhân 12 Luồng, 32MB Cache)',
        price: 4990000,
        tdp: 65,
        specs: 'Socket AM5 | 6C/12T | 5.1GHz Max Boost | PCIe 5.0',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-7600',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b650m-plus',
        name: 'Mainboard ASUS TUF GAMING B650M-PLUS WIFI DDR5',
        price: 4190000,
        tdp: 40,
        specs: 'Socket AM5 | 4x DDR5 | PCIe 5.0 M.2 | Wi-Fi 6',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b650m-plus',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-32g-corsair-d5',
        name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
        price: 2890000,
        tdp: 15,
        specs: '2x16GB | DDR5 | 6000MHz',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-32gb-d5',
      },
      gpu: {
        key: 'gpu',
        id: 'd1000000-0000-0000-0000-000000000010',
        name: 'VGA ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB GDDR6',
        price: 10990000,
        tdp: 160,
        specs: '8GB GDDR6 | DLSS 3 | Dual Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-dual-rtx-4060-ti-8gb',
      },
      storage: {
        key: 'storage',
        id: 'd1000000-0000-0000-0000-000000000012',
        name: 'Kingston NV2 1TB PCIe 4.0 NVMe M.2',
        price: 1590000,
        tdp: 5,
        specs: '1TB | Đọc 3500MB/s - Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-1tb',
      },
      psu: {
        key: 'psu',
        id: 'd1000000-0000-0000-0000-000000000013',
        name: 'Deepcool PK650D 650W 80 Plus Bronze',
        price: 1290000,
        tdp: 0,
        specs: '650W | 80 Plus Bronze | Active PFC',
        image: '/images/cat-psu.jpg',
        slug: 'deepcool-pk650d',
      },
      case: {
        key: 'case',
        id: 'd1000000-0000-0000-0000-000000000014',
        name: 'Xigmatek Aqua M (Kính cường lực / Mặt lưới thoáng khí)',
        price: 890000,
        tdp: 0,
        specs: 'Mini Tower | Mặt kính view bể cá | Hỗ trợ tản 240mm',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-aqua-m',
      },
      cooling: {
        key: 'cooling',
        id: 'd1000000-0000-0000-0000-000000000015',
        name: 'DeepCool AG400 ARGB Single-Tower CPU Cooler',
        price: 490000,
        tdp: 15,
        specs: 'Tản tháp 4 ống đồng | Socket AM5 / LGA1700 | Fan 120mm RGB',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-ag400-argb',
      },
    },
  },
  '15m_amd': {
    id: 'preset-15m-amd',
    title: 'PC Gaming AMD Ryzen 5 - 15 Triệu',
    budgetLabel: '15.000.000đ',
    totalPrice: 13940000,
    components: {
      cpu: {
        key: 'cpu',
        id: 'p-cpu-5600',
        name: 'CPU AMD Ryzen 5 5600 (3.5GHz - 4.4GHz, 6 Nhân 12 Luồng, 32MB Cache)',
        price: 2890000,
        tdp: 65,
        specs: 'Socket AM4 | 6C/12T | 32MB Cache | Kèm tản Wraith Stealth',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-5600',
      },
      mainboard: {
        key: 'mainboard',
        id: 'p-mb-b550m-a',
        name: 'Mainboard ASUS PRIME B550M-A WIFI II',
        price: 2490000,
        tdp: 35,
        specs: 'Socket AM4 | 4x DDR4 | PCIe 4.0 | Wi-Fi 6 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-prime-b550m-a-wifi',
      },
      ram: {
        key: 'ram',
        id: 'p-ram-16g-d4',
        name: 'RAM Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        price: 1090000,
        tdp: 10,
        specs: '2x8GB | DDR4 | 3200MHz | Dual-Channel',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-16gb',
      },
      gpu: {
        key: 'gpu',
        id: 'p-gpu-gtx1650',
        name: 'VGA ASUS Dual GeForce RTX 3050 6GB GDDR6',
        price: 4990000,
        tdp: 70,
        specs: '6GB GDDR6 | Ray Tracing | DLSS | Dual Fan',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-dual-rtx-3050-6gb',
      },
      storage: {
        key: 'storage',
        id: 'p-ssd-500g-nv2',
        name: 'SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2',
        price: 890000,
        tdp: 5,
        specs: '500GB | Đọc 3500MB/s - Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-500gb',
      },
      psu: {
        key: 'psu',
        id: 'p-psu-550w',
        name: 'Nguồn Deepcool PF550 550W 80 Plus Standard',
        price: 890000,
        tdp: 0,
        specs: '550W | 80 Plus | Active PFC',
        image: '/images/cat-psu.jpg',
        slug: 'deepcool-pf550',
      },
      case: {
        key: 'case',
        id: 'p-case-xigmatek-nyx',
        name: 'Vỏ Case Xigmatek NYX Air 3F (Kèm 3 Fan RGB)',
        price: 690000,
        tdp: 0,
        specs: 'Mini Tower | Kính cường lực | Mặt lưới thoáng khí',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-nyx-air-3f',
      },
      cooling: {
        key: 'cooling',
        id: 'p-cooling-wraith',
        name: 'Tản Nhiệt Khí AMD Wraith Stealth Socket AM4',
        price: 0,
        tdp: 0,
        specs: 'Tản nhiệt chính hãng kèm CPU AMD',
        image: '/images/hero-pc.jpg',
        slug: 'amd-wraith-stealth',
      },
    },
  },
};

export function matchPresetKeyFromText(text: string, pastPresetKey?: string): string {
  const lower = text.toLowerCase();
  
  const wantsAmd = lower.includes('amd') || lower.includes('ryzen');
  const wantsIntel = lower.includes('intel') || lower.includes('core i');

  let baseKey = '25m';

  // Extract explicit budget numbers if present (e.g. 10, 15, 20, 25, 30, 35, 50, 100)
  const budgetMatch = lower.match(/(\d+)\s*(triệu|tr|m|củ)/);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1], 10);
    if (val < 13) baseKey = '10m';
    else if (val >= 13 && val < 20) baseKey = '15m';
    else if (val >= 20 && val < 28) baseKey = '25m';
    else if (val >= 28 && val < 33) baseKey = '30m';
    else if (val >= 33 && val < 45) baseKey = '35m';
    else baseKey = '50m';
  } else if (
    lower.includes('cao nhất') ||
    lower.includes('mạnh nhất') ||
    lower.includes('khủng nhất') ||
    lower.includes('đỉnh nhất') ||
    lower.includes('tốt nhất') ||
    lower.includes('max setting') ||
    lower.includes('max cấu hình') ||
    lower.includes('cấu hình max') ||
    lower.includes('flagship') ||
    lower.includes('top tier') ||
    lower.includes('vô địch') ||
    lower.includes('không giới hạn') ||
    lower.includes('hết nấc') ||
    lower.includes('kịch kim') ||
    lower.includes('50tr') ||
    lower.includes('100tr') ||
    lower.includes('khủng') ||
    lower.includes('cao cấp')
  ) {
    baseKey = '50m';
  } else if (
    lower.includes('rẻ nhất') ||
    lower.includes('thấp nhất') ||
    lower.includes('tiết kiệm nhất') ||
    lower.includes('10tr') ||
    lower.includes('10 triệu') ||
    lower.includes('8tr') ||
    lower.includes('văn phòng') ||
    lower.includes('học tập')
  ) {
    baseKey = '10m';
  } else if (lower.includes('15tr') || lower.includes('15 triệu') || lower.includes('12tr')) {
    baseKey = '15m';
  } else if (lower.includes('20tr') || lower.includes('25tr') || lower.includes('20 triệu') || lower.includes('25 triệu')) {
    baseKey = '25m';
  } else if (lower.includes('30tr') || lower.includes('30 triệu')) {
    baseKey = '30m';
  } else if (lower.includes('35tr') || lower.includes('40tr') || lower.includes('35 triệu') || lower.includes('40 triệu') || lower.includes('đồ họa')) {
    baseKey = '35m';
  } else if (pastPresetKey) {
    // Inherit past preset base key if no budget was specified in the current turn
    baseKey = pastPresetKey.replace('_amd', '');
  }

  // Determine if AMD variant should be used
  if (wantsAmd) {
    const amdKey = `${baseKey}_amd`;
    if (AI_BUILD_PRESETS[amdKey]) return amdKey;
    if (AI_BUILD_PRESETS['50m_amd'] && baseKey === '50m') return '50m_amd';
    return baseKey;
  }

  if (wantsIntel) {
    return baseKey.replace('_amd', '');
  }

  // If past was AMD and user didn't request Intel, preserve AMD platform
  if (pastPresetKey && pastPresetKey.includes('_amd') && !wantsIntel) {
    const amdKey = `${baseKey}_amd`;
    if (AI_BUILD_PRESETS[amdKey]) return amdKey;
  }

  return baseKey;
}

export type HardwarePlatform = 'INTEL_LGA1851' | 'INTEL_LGA1700' | 'INTEL_LGA1200' | 'INTEL_LGA1151' | 'AMD_AM5' | 'AMD_AM4' | 'UNKNOWN';

export function detectCpuPlatform(cpuNameOrSpecs: string): HardwarePlatform {
  const str = (cpuNameOrSpecs || '').toLowerCase();
  
  // 1. LGA1851 (Intel Core Ultra Series 2 / Arrow Lake)
  if (
    str.includes('lga1851') || str.includes('lga 1851') || str.includes('ultra 9') || 
    str.includes('ultra 7') || str.includes('ultra 5') || str.includes('285k') || 
    str.includes('265k') || str.includes('245k')
  ) {
    return 'INTEL_LGA1851';
  }

  // 2. LGA1200 (Intel Gen 10 & 11: 10100, 10400, 10700, 10900, 11400, 11700, 11900)
  if (
    str.includes('lga1200') || str.includes('lga 1200') || str.includes('10100') || 
    str.includes('10400') || str.includes('10500') || str.includes('10600') || 
    str.includes('10700') || str.includes('10900') || str.includes('11400') || 
    str.includes('11500') || str.includes('11600') || str.includes('11700') || 
    str.includes('11900')
  ) {
    return 'INTEL_LGA1200';
  }

  // 3. LGA1151 (Intel Gen 8 & 9: 8100, 8400, 8700, 9100, 9400, 9700, 9900)
  if (
    str.includes('lga1151') || str.includes('lga 1151') || str.includes('8100') || 
    str.includes('8400') || str.includes('8700') || str.includes('9100') || 
    str.includes('9400') || str.includes('9600') || str.includes('9700') || 
    str.includes('9900')
  ) {
    return 'INTEL_LGA1151';
  }

  // 4. LGA1700 (Intel Gen 12, 13 & 14: 12100, 12400, 12600, 12700, 12900, 13100, 13400, 13500, 13600, 13700, 13900, 14100, 14400, 14500, 14600, 14700, 14900)
  if (
    str.includes('lga1700') || str.includes('lga 1700') || str.includes('12100') || 
    str.includes('12400') || str.includes('12600') || str.includes('12700') || 
    str.includes('12900') || str.includes('13100') || str.includes('13400') || 
    str.includes('13500') || str.includes('13600') || str.includes('13700') || 
    str.includes('13900') || str.includes('14100') || str.includes('14400') || 
    str.includes('14500') || str.includes('14600') || str.includes('14700') || 
    str.includes('14900')
  ) {
    return 'INTEL_LGA1700';
  }

  // 5. AMD AM5 (Ryzen 7000, 8000, 9000, 7800X3D, Zen 4, Zen 5)
  if (
    str.includes('am5') || str.includes('7600') || str.includes('7700') || 
    str.includes('7800') || str.includes('7900') || str.includes('7950') || 
    str.includes('9600') || str.includes('9700') || str.includes('9800') || 
    str.includes('9900') || str.includes('7800x3d')
  ) {
    return 'AMD_AM5';
  }

  // 6. AMD AM4 (Ryzen 1000-5000: 5600, 5700, 5800, 5900, 5950, 3600, 5500, 2600, 1600)
  if (
    str.includes('am4') || str.includes('5600') || str.includes('5700') || 
    str.includes('5800') || str.includes('5900') || str.includes('5500') || 
    str.includes('3600') || str.includes('3200g') || str.includes('3400g')
  ) {
    return 'AMD_AM4';
  }

  // Generic Intel fallback
  if (str.includes('intel') || str.includes('i3') || str.includes('i5') || str.includes('i7') || str.includes('i9')) {
    return 'INTEL_LGA1700';
  }

  return 'UNKNOWN';
}

export function detectMainboardPlatform(mbNameOrSpecs: string): HardwarePlatform {
  const str = (mbNameOrSpecs || '').toLowerCase();
  if (str.includes('z890') || str.includes('b860') || str.includes('lga1851') || str.includes('lga 1851')) {
    return 'INTEL_LGA1851';
  }
  if (
    str.includes('b760') || str.includes('z790') || str.includes('h610') || 
    str.includes('b660') || str.includes('z690') || str.includes('lga1700') || str.includes('lga 1700')
  ) {
    return 'INTEL_LGA1700';
  }
  if (
    str.includes('h510') || str.includes('b560') || str.includes('z590') || 
    str.includes('h410') || str.includes('b460') || str.includes('z490') || str.includes('lga1200') || str.includes('lga 1200')
  ) {
    return 'INTEL_LGA1200';
  }
  if (
    str.includes('h310') || str.includes('b360') || str.includes('b365') || 
    str.includes('z370') || str.includes('z390') || str.includes('lga1151') || str.includes('lga 1151')
  ) {
    return 'INTEL_LGA1151';
  }
  if (
    str.includes('b650') || str.includes('x670') || str.includes('a620') || 
    str.includes('b850') || str.includes('x870') || str.includes('am5')
  ) {
    return 'AMD_AM5';
  }
  if (
    str.includes('b550') || str.includes('b450') || str.includes('a520') || 
    str.includes('x570') || str.includes('am4')
  ) {
    return 'AMD_AM4';
  }
  return 'UNKNOWN';
}

/**
 * Ensures 100% hardware compatibility for CPU Socket, Mainboard Socket, RAM DDR generation, and PSU capacity.
 * Selects real products from Sbuy API / database catalog where available.
 */
export function reconcileBuildComponents(
  componentsMap: Record<string, any>,
  catalogProducts?: any[]
): Record<string, any> {
  const result: Record<string, any> = { ...componentsMap };

  const cpu = result.cpu;
  const mb = result.mainboard;

  const cpuStr = cpu ? `${cpu.name} ${cpu.specs || ''}` : '';
  const mbStr = mb ? `${mb.name} ${mb.specs || ''}` : '';

  const cpuPlatform = detectCpuPlatform(cpuStr);
  const mbPlatform = detectMainboardPlatform(mbStr);

  // Helper to find real product from catalog
  const findRealProduct = (categoryKeywords: string[], filterFn?: (p: any) => boolean) => {
    if (!catalogProducts || catalogProducts.length === 0) return null;
    return catalogProducts.find((p: any) => {
      const pName = (p.name || '').toLowerCase();
      const pCat = (p.category_name || p.category_slug || '').toLowerCase();
      const matchesCat = categoryKeywords.some(kw => pCat.includes(kw) || pName.includes(kw));
      if (!matchesCat) return false;
      if (filterFn) return filterFn(p);
      return true;
    });
  };

  // 1. CPU & Mainboard Socket Reconciliation
  if (cpuPlatform !== 'UNKNOWN' && (mbPlatform === 'UNKNOWN' || cpuPlatform !== mbPlatform)) {
    if (cpuPlatform === 'INTEL_LGA1700') {
      const realMb = findRealProduct(['mainboard', 'bo mạch'], p => {
        const pStr = `${p.name} ${JSON.stringify(p.specs || {})}`.toLowerCase();
        return pStr.includes('b760') || pStr.includes('z790') || pStr.includes('h610') || pStr.includes('lga1700');
      });

      result.mainboard = realMb ? {
        key: 'mainboard',
        id: realMb.id,
        name: realMb.name,
        price: Number(realMb.price) || 4290000,
        tdp: 40,
        specs: realMb.specs?.socket ? `Socket ${realMb.specs.socket} | ${realMb.specs.ram_type || 'DDR5'}` : 'LGA1700 | 4x DDR5 | PCIe 5.0 | Wi-Fi 6',
        image: realMb.image_url || '/images/cat-mainboard.jpg',
        slug: realMb.slug,
      } : {
        key: 'mainboard',
        id: 'p-mb-b760m-rec',
        name: 'Mainboard ASUS TUF GAMING B760M-PLUS WIFI DDR5',
        price: 4290000,
        tdp: 40,
        specs: 'LGA1700 | 4x DDR5 | PCIe 5.0 | Wi-Fi 6',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b760m-plus-d5',
      };
    } else if (cpuPlatform === 'INTEL_LGA1200') {
      const realMb = findRealProduct(['mainboard', 'bo mạch'], p => {
        const pStr = `${p.name} ${JSON.stringify(p.specs || {})}`.toLowerCase();
        return pStr.includes('h510') || pStr.includes('b560') || pStr.includes('z590') || pStr.includes('h410') || pStr.includes('b460') || pStr.includes('lga1200');
      });

      result.mainboard = realMb ? {
        key: 'mainboard',
        id: realMb.id,
        name: realMb.name,
        price: Number(realMb.price) || 1690000,
        tdp: 35,
        specs: realMb.specs?.socket ? `Socket ${realMb.specs.socket} | ${realMb.specs.ram_type || 'DDR4'}` : 'Socket LGA1200 | 2x DDR4 | Micro-ATX',
        image: realMb.image_url || '/images/cat-mainboard.jpg',
        slug: realMb.slug,
      } : {
        key: 'mainboard',
        id: 'p-mb-h510m-rec',
        name: 'Mainboard ASUS PRIME H510M-K DDR4',
        price: 1590000,
        tdp: 35,
        specs: 'Socket LGA1200 | 2x DDR4 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-prime-h510m-k',
      };
    } else if (cpuPlatform === 'AMD_AM5') {
      const realMb = findRealProduct(['mainboard', 'bo mạch'], p => {
        const pStr = `${p.name} ${JSON.stringify(p.specs || {})}`.toLowerCase();
        return pStr.includes('b650') || pStr.includes('x670') || pStr.includes('a620') || pStr.includes('am5');
      });

      result.mainboard = realMb ? {
        key: 'mainboard',
        id: realMb.id,
        name: realMb.name,
        price: Number(realMb.price) || 3890000,
        tdp: 40,
        specs: realMb.specs?.socket ? `Socket ${realMb.specs.socket} | ${realMb.specs.ram_type || 'DDR5'}` : 'Socket AM5 | 4x DDR5 | PCIe 4.0 | Micro-ATX',
        image: realMb.image_url || '/images/cat-mainboard.jpg',
        slug: realMb.slug,
      } : {
        key: 'mainboard',
        id: 'p-mb-b650m-rec',
        name: 'Mainboard MSI PRO B650M-A WIFI DDR5',
        price: 3890000,
        tdp: 40,
        specs: 'Socket AM5 | 4x DDR5 | PCIe 4.0 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-pro-b650m-a-wifi',
      };
    } else if (cpuPlatform === 'AMD_AM4') {
      const realMb = findRealProduct(['mainboard', 'bo mạch'], p => {
        const pStr = `${p.name} ${JSON.stringify(p.specs || {})}`.toLowerCase();
        return pStr.includes('b550') || pStr.includes('b450') || pStr.includes('a520') || pStr.includes('am4');
      });

      result.mainboard = realMb ? {
        key: 'mainboard',
        id: realMb.id,
        name: realMb.name,
        price: Number(realMb.price) || 2890000,
        tdp: 35,
        specs: realMb.specs?.socket ? `Socket ${realMb.specs.socket} | ${realMb.specs.ram_type || 'DDR4'}` : 'Socket AM4 | 4x DDR4 | PCIe 4.0 | Micro-ATX',
        image: realMb.image_url || '/images/cat-mainboard.jpg',
        slug: realMb.slug,
      } : {
        key: 'mainboard',
        id: 'p-mb-b550m-rec',
        name: 'Mainboard ASUS TUF GAMING B550M-PLUS',
        price: 2890000,
        tdp: 35,
        specs: 'Socket AM4 | 4x DDR4 | PCIe 4.0 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b550m-plus',
      };
    }
  } else if (cpuPlatform === 'UNKNOWN' && mbPlatform !== 'UNKNOWN') {
    if (mbPlatform === 'INTEL_LGA1700') {
      result.cpu = {
        key: 'cpu',
        id: 'p-cpu-13400f',
        name: 'CPU Intel Core i5-13400F (Up to 4.6GHz, 10 Nhân 16 Luồng)',
        price: 4890000,
        tdp: 148,
        specs: 'LGA1700 | 20MB Cache | 65W-148W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i5-13400f',
      };
    } else if (mbPlatform === 'INTEL_LGA1200') {
      result.cpu = {
        key: 'cpu',
        id: 'p-cpu-10400f',
        name: 'CPU Intel Core i5-10400F (Up to 4.3GHz, 6 Nhân 12 Luồng)',
        price: 2690000,
        tdp: 65,
        specs: 'Socket LGA1200 | 12MB Cache | 65W TDP',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i5-10400f',
      };
    } else if (mbPlatform === 'AMD_AM5') {
      result.cpu = {
        key: 'cpu',
        id: 'p-cpu-7600',
        name: 'CPU AMD Ryzen 5 7600 (3.8GHz - 5.1GHz, 6 Nhân 12 Luồng)',
        price: 5290000,
        tdp: 65,
        specs: 'Socket AM5 | 38MB Cache | 65W TDP',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-7600',
      };
    } else if (mbPlatform === 'AMD_AM4') {
      result.cpu = {
        key: 'cpu',
        id: 'p-cpu-5600',
        name: 'CPU AMD Ryzen 5 5600 (3.5GHz - 4.4GHz, 6 Nhân 12 Luồng)',
        price: 2990000,
        tdp: 65,
        specs: 'Socket AM4 | 35MB Cache | 65W TDP',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-5600',
      };
    }
  }

  // 2. RAM DDR Generation Reconciliation (DDR4 vs DDR5)
  const activeMb = result.mainboard;
  const activeRam = result.ram;

  const activeMbStr = activeMb ? `${activeMb.name} ${activeMb.specs || ''}`.toLowerCase() : '';
  const activeRamStr = activeRam ? `${activeRam.name} ${activeRam.specs || ''}`.toLowerCase() : '';

  const mbIsDdr5 = activeMbStr.includes('ddr5') || activeMbStr.includes('d5') || activeMbStr.includes('b650') || activeMbStr.includes('x670') || activeMbStr.includes('am5');
  const ramIsDdr5 = activeRamStr.includes('ddr5');

  if (mbIsDdr5 && !ramIsDdr5) {
    const realDdr5Ram = findRealProduct(['ram'], p => (p.name || '').toLowerCase().includes('ddr5'));
    result.ram = realDdr5Ram ? {
      key: 'ram',
      id: realDdr5Ram.id,
      name: realDdr5Ram.name,
      price: Number(realDdr5Ram.price) || 2890000,
      tdp: 15,
      specs: 'DDR5 | High Speed RGB Kit',
      image: realDdr5Ram.image_url || '/images/ram-rgb.jpg',
      slug: realDdr5Ram.slug,
    } : {
      key: 'ram',
      id: 'p-ram-32g-d5',
      name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
      price: 2890000,
      tdp: 15,
      specs: '2x16GB | DDR5 | 6000MHz | CL36',
      image: '/images/ram-rgb.jpg',
      slug: 'corsair-vengeance-32gb-d5',
    };
  } else if (!mbIsDdr5 && ramIsDdr5) {
    const realDdr4Ram = findRealProduct(['ram'], p => (p.name || '').toLowerCase().includes('ddr4'));
    result.ram = realDdr4Ram ? {
      key: 'ram',
      id: realDdr4Ram.id,
      name: realDdr4Ram.name,
      price: Number(realDdr4Ram.price) || 1190000,
      tdp: 10,
      specs: 'DDR4 | Dual Channel Kit',
      image: realDdr4Ram.image_url || '/images/ram-rgb.jpg',
      slug: realDdr4Ram.slug,
    } : {
      key: 'ram',
      id: 'p-ram-16g-d4',
      name: 'RAM Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
      price: 1190000,
      tdp: 10,
      specs: '2x8GB | DDR4 | 3200MHz | CL16',
      image: '/images/ram-rgb.jpg',
      slug: 'kingston-fury-beast-16gb',
    };
  }

  // 3. PSU Capacity Reconciliation
  const cpuTdp = result.cpu?.tdp || 65;
  const gpuTdp = result.gpu?.tdp || 150;
  const totalTdp = cpuTdp + gpuTdp + 100;

  if (totalTdp > 450 && (!result.psu || (result.psu.name && result.psu.name.includes('550W')))) {
    const realPsu = findRealProduct(['psu', 'nguồn'], p => {
      const pStr = (p.name || '').toLowerCase();
      return pStr.includes('750w') || pStr.includes('850w') || pStr.includes('700w');
    });

    result.psu = realPsu ? {
      key: 'psu',
      id: realPsu.id,
      name: realPsu.name,
      price: Number(realPsu.price) || 1690000,
      tdp: 0,
      specs: '750W | 80 Plus Bronze',
      image: realPsu.image_url || '/images/cat-psu.jpg',
      slug: realPsu.slug,
    } : {
      key: 'psu',
      id: 'p-psu-750w',
      name: 'Nguồn Corsair CV750 750W 80 Plus Bronze',
      price: 1690000,
      tdp: 0,
      specs: '750W | 80 Plus Bronze | Single Rail +12V',
      image: '/images/cat-psu.jpg',
      slug: 'corsair-cv750',
    };
  }

  return result;
}

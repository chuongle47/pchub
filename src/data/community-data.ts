export type CommunityCategory = 'Gaming' | 'Workstation' | 'Streaming' | 'Budget';

export interface PartDetail {
  name: string;
  price: number;
  specs?: string;
  brand?: string;
  image?: string;
  slug?: string;
}

export interface FpsBenchmark {
  game: string;
  res1080p: number;
  res1440p: number;
  res4k: number;
  settings: string;
}

export interface PowerConsumption {
  idleWatt: number;
  loadWatt: number;
  recommendedPsuWatt: number;
}

export interface AiCompatibilityDetail {
  status: 'compatible' | 'warning';
  score: number; // e.g. 100
  socketMatch: boolean;
  socketInfo: string;
  psuAdequate: boolean;
  psuInfo: string;
  clearanceOk: boolean;
  clearanceInfo: string;
  coolerOk: boolean;
  coolerInfo: string;
  summary: string;
}

export interface CommunityBuild {
  id: string;
  slug: string;
  title: string;
  category: CommunityCategory;
  image: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  parts: {
    cpu: PartDetail;
    gpu: PartDetail;
    ram: PartDetail;
    mainboard: PartDetail;
    ssd: PartDetail;
    psu: PartDetail;
    case: PartDetail;
    cooler: PartDetail;
  };
  price: number;
  performanceNote: string;
  fpsBenchmarks: FpsBenchmark[];
  powerConsumption: PowerConsumption;
  aiCompatibility: AiCompatibilityDetail;
  aiVerified: boolean;
  likes: number;
  commentsCount: number;
  createdAt: string;
  status: 'approved' | 'pending';
  description: string;
  tags: string[];
}

export interface CommunityComment {
  id: string;
  buildId: string;
  user: {
    name: string;
    avatar: string;
    email?: string;
  };
  content: string;
  parentId?: string;
  createdAt: string;
  likes?: number;
}

export type NewsCategory = 'Hướng dẫn build PC' | 'Tin công nghệ' | 'Đánh giá linh kiện' | 'Mẹo & thủ thuật';

export interface CommunityPost {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  cover: string;
  excerpt: string;
  content: string; // Markdown or HTML text
  readingMinutes: number;
  publishedAt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
}

export const INITIAL_COMMUNITY_BUILDS: CommunityBuild[] = [
  {
    id: 'b1',
    slug: 'project-neon-4k-gaming-monster',
    title: 'Project Neon: 4K Gaming Monster',
    category: 'Gaming',
    image: '/images/build-neon.jpg',
    author: {
      name: 'Alex Hải',
      avatar: 'A',
      role: 'Enthusiast Builder',
    },
    parts: {
      cpu: {
        name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 15490000,
        specs: 'LGA 1700 | 36MB Cache | TDP 125W-253W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i9-14900k',
      },
      gpu: {
        name: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC',
        price: 52990000,
        specs: '24GB GDDR6X | 384-bit | 2640 MHz Boost',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-rog-strix-rtx-4090-24gb',
      },
      ram: {
        name: 'Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6000MHz',
        price: 6490000,
        specs: '64GB (2x32GB) | DDR5 6000MHz CL30',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-dominator-titanium-64gb-ddr5',
      },
      mainboard: {
        name: 'ASUS ROG MAXIMUS Z790 HERO',
        price: 15890000,
        specs: 'LGA 1700 | PCIe 5.0 | Wi-Fi 6E | DDR5',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-maximus-z790-hero',
      },
      ssd: {
        name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2',
        price: 4590000,
        specs: 'Đọc 7450MB/s | Ghi 6900MB/s | DRAM Cache',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-2tb',
      },
      psu: {
        name: 'Corsair RM1000x Shift 1000W 80 Plus Gold ATX 3.0',
        price: 4990000,
        specs: '1000W | PCIe 5.0 12VHPWR | Full Modular',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-rm1000x-shift-1000w',
      },
      case: {
        name: 'Lian Li O11 Dynamic EVO RGB Black',
        price: 3890000,
        specs: 'Dual Chamber | Kính cường lực 2 mặt | Hỗ trợ E-ATX',
        image: '/images/hero-pc.jpg',
        slug: 'lian-li-o11-dynamic-evo-rgb',
      },
      cooler: {
        name: 'Tản nhiệt nước NZXT Kraken Elite 360 RGB LCD',
        price: 6890000,
        specs: 'Rad 360mm | Màn hình LCD 2.36 inch hiển thị thông số',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-kraken-elite-360-rgb',
      },
    },
    price: 86250000,
    performanceNote: '🔥 Cân mượt 100% game AAA ở độ phân giải 4K Max Settings (120+ FPS). Tối ưu cực đỉnh cho Ray Tracing, VR & Livestream 4K không trễ nải.',
    fpsBenchmarks: [
      { game: 'Cyberpunk 2077 (Path Tracing DLSS 3.5)', res1080p: 185, res1440p: 142, res4k: 95, settings: 'Ray Tracing Overdrive' },
      { game: 'Black Myth: Wukong (Cinematic Setting)', res1080p: 190, res1440p: 148, res4k: 92, settings: 'Very High + Frame Gen' },
      { game: 'Counter-Strike 2', res1080p: 580, res1440p: 490, res4k: 360, settings: 'Very High' },
      { game: 'Valorant', res1080p: 720, res1440p: 650, res4k: 510, settings: 'Max Settings' },
      { game: 'Forza Horizon 5', res1080p: 240, res1440p: 195, res4k: 138, settings: 'Extreme' },
    ],
    powerConsumption: {
      idleWatt: 85,
      loadWatt: 680,
      recommendedPsuWatt: 1000,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'CPU i9-14900K tương thích hoàn hảo socket LGA1700 trên Z790 HERO.',
      psuAdequate: true,
      psuInfo: 'Nguồn 1000W ATX 3.0 dư sức tải đỉnh 680W của i9 + RTX 4090 kèm cáp native 12VHPWR.',
      clearanceOk: true,
      clearanceInfo: 'Case Lian Li O11 EVO hỗ trợ VGA dài đến 455mm (Strix 4090 dài 357.6mm).',
      coolerOk: true,
      coolerInfo: 'Tản AIO 360mm gắn nóc case vừa vặn, làm mát cực tốt cho i9-14900K.',
      summary: 'Hệ thống đạt chuẩn tương thích 100%. Không có hiện tượng nghẽn cổ chai phần cứng.',
    },
    aiVerified: true,
    likes: 154,
    commentsCount: 18,
    createdAt: '2026-09-15',
    status: 'approved',
    description: 'Dàn máy mơ ước dành cho game thủ hardcore và streamer chuyên nghiệp. Thiết kế theo tông màu đen RGB đồng bộ, luồng gió intake từ đáy và hông, exhaust qua nóc AIO 360mm giúp máy duy trì nhiệt độ GPU dưới 65°C khi chơi game 4K nhiều giờ liên tục.',
    tags: ['4K Gaming', 'RTX 4090', 'i9-14900K', 'High-end', 'RGB Custom'],
  },
  {
    id: 'b2',
    slug: 'silent-render-node-3d-video-edit',
    title: 'Silent Render Node - 3D/Video Edit',
    category: 'Workstation',
    image: '/images/hero-pc.jpg',
    author: {
      name: 'StudioPro VN',
      avatar: 'S',
      role: 'VFX Lead',
    },
    parts: {
      cpu: {
        name: 'AMD Ryzen 9 7950X (Up to 5.7GHz, 16 Nhân 32 Luồng)',
        price: 14290000,
        specs: 'Socket AM5 | 80MB Cache | TDP 170W',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-9-7950x',
      },
      gpu: {
        name: 'MSI GeForce RTX 4080 Super 16GB GAMING X SLIM',
        price: 29990000,
        specs: '16GB GDDR6X | 256-bit | Studio Driver Ready',
        image: '/images/gpu-white.jpg',
        slug: 'msi-rtx-4080-super-16gb',
      },
      ram: {
        name: 'Kingston FURY Beast Black 128GB (4x32GB) DDR5 5600MHz',
        price: 11990000,
        specs: '128GB Quad-Kit | DDR5 5600MHz | ECC On-Die',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-128gb-ddr5',
      },
      mainboard: {
        name: 'MSI MAG X670E TOMAHAWK WIFI',
        price: 8490000,
        specs: 'Socket AM5 | PCIe 5.0 | 4x M.2 | Wi-Fi 6E',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-x670e-tomahawk-wifi',
      },
      ssd: {
        name: 'Kingston KC3000 2TB PCIe 4.0 NVMe M.2 (2 ổ RAID)',
        price: 6980000,
        specs: '2x 2TB | Tốc độ 7000MB/s | Bền bỉ 1600 TBW',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-kc3000-2tb',
      },
      psu: {
        name: 'MSI MAG A850GL PCIE5 850W 80 Plus Gold',
        price: 3290000,
        specs: '850W | Chuẩn ATX 3.0 | Native 12V-2x6',
        image: '/images/cat-psu.jpg',
        slug: 'msi-mag-a850gl-850w',
      },
      case: {
        name: 'Fractal Design North Charcoal Black (Mặt gỗ cao cấp)',
        price: 3790000,
        specs: 'Chống ồn cách âm | Thiết kế Bắc Âu | Lưới thoáng khí',
        image: '/images/hero-pc.jpg',
        slug: 'fractal-design-north-black',
      },
      cooler: {
        name: 'Tản nhiệt khí Noctua NH-D15 chromax.black Dual Tower',
        price: 2990000,
        specs: '2 tháp tản nhiệt | 2 quạt NF-A15 140mm siêu êm',
        image: '/images/hero-pc.jpg',
        slug: 'noctua-nh-d15-chromax-black',
      },
    },
    price: 72250000,
    performanceNote: '⚡ Trạm làm việc Render 3D & dựng phim 8K siêu tốc, vận hành siêu êm 24/7. Tối ưu hoàn hảo cho Blender, Unreal Engine, Premiere & Maya.',
    fpsBenchmarks: [
      { game: 'Blender 4.2 BMW Render Time', res1080p: 4.8, res1440p: 4.8, res4k: 4.8, settings: 'GPU OptiX (4.8 giây)' },
      { game: 'Premiere Pro 4K Export H.264', res1080p: 62, res1440p: 62, res4k: 62, settings: 'NVENC Hardware Accel' },
      { game: 'Unreal Engine 5.4 Editor Viewport', res1080p: 160, res1440p: 120, res4k: 78, settings: 'Epic Quality + Lumen' },
      { game: 'Cyberpunk 2077 Benchmark', res1080p: 165, res1440p: 125, res4k: 76, settings: 'Ultra Ray Tracing DLSS Quality' },
    ],
    powerConsumption: {
      idleWatt: 65,
      loadWatt: 520,
      recommendedPsuWatt: 850,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'AMD Ryzen 9 7950X gắn tương thích socket AM5 trên mainboard X670E.',
      psuAdequate: true,
      psuInfo: 'Nguồn 850W Gold cung cấp dư dả 40% công suất dự phòng khi Render full load.',
      clearanceOk: true,
      clearanceInfo: 'Case Fractal North chứa thoải mái tản khí cao 170mm và VGA 355mm.',
      coolerOk: true,
      coolerInfo: 'Noctua NH-D15 chromax.black giữ CPU AMD mát mẻ 75-80°C khi Render liên tục.',
      summary: 'Cấu hình Workstation tiêu chuẩn cao cấp, tối ưu độ ồn và độ bền bỉ linh kiện.',
    },
    aiVerified: true,
    likes: 112,
    commentsCount: 14,
    createdAt: '2026-09-18',
    status: 'approved',
    description: 'Cấu hình xây dựng chuyên dụng cho Studio đồ họa, kiến trúc và dựng phim. Toàn bộ hệ thống được lựa chọn với tiêu chí "Silent & Stable" (êm ái và ổn định tuyệt đối), vỏ case gỗ sang trọng phù hợp không gian làm việc sáng tạo.',
    tags: ['Workstation', 'Ryzen 9', 'Blender', 'Premiere 8K', 'Silent PC'],
  },
  {
    id: 'b3',
    slug: '1080p-sweet-spot-build',
    title: '1080p Sweet Spot - Quốc Dân 2026',
    category: 'Budget',
    image: '/images/gpu-white.jpg',
    author: {
      name: 'Tom Cường',
      avatar: 'T',
      role: 'Budget Master',
    },
    parts: {
      cpu: {
        name: 'Intel Core i5-13400F (Up to 4.6GHz, 10 Nhân 16 Luồng)',
        price: 4690000,
        specs: 'LGA 1700 | 20MB Cache | TDP 65W-148W',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i5-13400f',
      },
      gpu: {
        name: 'Gigabyte GeForce RTX 4060 EAGLE OC 8GB',
        price: 8490000,
        specs: '8GB GDDR6 | 128-bit | 3 Fan tản nhiệt',
        image: '/images/gpu-strix.jpg',
        slug: 'gigabyte-rtx-4060-eagle-oc-8gb',
      },
      ram: {
        name: 'Kingston FURY Beast 32GB (2x16GB) DDR5 5200MHz',
        price: 2490000,
        specs: '32GB Kit | DDR5 5200MHz CL40',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-32gb-ddr5',
      },
      mainboard: {
        name: 'ASUS PRIME B760M-A WIFI DDR5',
        price: 3690000,
        specs: 'LGA 1700 | 4x DDR5 | Wi-Fi 6 | Micro-ATX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-prime-b760m-a-wifi',
      },
      ssd: {
        name: 'Kingston NV2 1TB PCIe 4.0 NVMe M.2',
        price: 1590000,
        specs: 'Đọc 3500MB/s | Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-1tb',
      },
      psu: {
        name: 'Deepcool PK650D 650W 80 Plus Bronze',
        price: 1290000,
        specs: '650W | 80 Plus Bronze | Chuẩn Flat Cable',
        image: '/images/cat-psu.jpg',
        slug: 'deepcool-pk650d-650w',
      },
      case: {
        name: 'Xigmatek Gaming X 3FX Black (Kèm 3 Fan RGB)',
        price: 790000,
        specs: 'Mid Tower | Kính cường lực | Mặt lưới trước',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-gaming-x-3fx',
      },
      cooler: {
        name: 'Thermalright Assassin X 120 Refined SE ARGB',
        price: 490000,
        specs: '4 Ống đồng mạ niken | Quạt 120mm ARGB PWM',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-assassin-x-120-se',
      },
    },
    price: 21250000,
    performanceNote: '🎮 Cấu hình quốc dân tối ưu ngân sách, chiến tốt toàn bộ game eSports & AAA ở độ phân giải Full HD High/Ultra Settings (60 - 144+ FPS).',
    fpsBenchmarks: [
      { game: 'Valorant', res1080p: 420, res1440p: 280, res4k: 160, settings: 'High' },
      { game: 'Counter-Strike 2', res1080p: 240, res1440p: 160, res4k: 95, settings: 'Competitive High' },
      { game: 'Grand Theft Auto V', res1080p: 165, res1440p: 110, res4k: 65, settings: 'Very High' },
      { game: 'Cyberpunk 2077 (DLSS 3 Frame Gen)', res1080p: 105, res1440p: 72, res4k: 42, settings: 'Ultra' },
      { game: 'Black Myth: Wukong', res1080p: 85, res1440p: 58, res4k: 32, settings: 'High + FG' },
    ],
    powerConsumption: {
      idleWatt: 45,
      loadWatt: 280,
      recommendedPsuWatt: 650,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Intel i5-13400F kết hợp hoàn hảo bo mạch B760M.',
      psuAdequate: true,
      psuInfo: 'Nguồn 650W chuẩn Bronze dư tải êm ái cho hệ thống 280W load.',
      clearanceOk: true,
      clearanceInfo: 'Card RTX 4060 Eagle 3 Fan vừa vặn trong case Xigmatek 3FX.',
      coolerOk: true,
      coolerInfo: 'Tản tháp Assassin X 120 giữ i5 mát rượi dưới 60°C khi chơi game.',
      summary: 'Cấu hình hoàn hảo cho học sinh, sinh viên và game thủ phổ thông.',
    },
    aiVerified: true,
    likes: 245,
    commentsCount: 32,
    createdAt: '2026-09-22',
    status: 'approved',
    description: 'Bộ PC phân khúc 20 triệu bán chạy nhất tại PCHub. Sở hữu công nghệ DLSS 3 Frame Generation từ RTX 4060 giúp nhân đôi khung hình trong các tựa game đồ họa nặng mà vẫn tiết kiệm điện năng đáng kinh ngạc.',
    tags: ['Budget Gaming', 'RTX 4060', 'i5-13400F', 'eSports 144Hz', 'Giá tốt'],
  },
  {
    id: 'b4',
    slug: 'streamer-pro-dual-screen-setup',
    title: 'Streamer Pro Live Station (Dual Monitor Ready)',
    category: 'Streaming',
    image: '/images/cat-monitor.jpg',
    author: {
      name: 'Minh Trang',
      avatar: 'M',
      role: 'Content Creator',
    },
    parts: {
      cpu: {
        name: 'AMD Ryzen 7 7800X3D (Vua Gaming & Streaming)',
        price: 10890000,
        specs: 'AM5 | 8 Nhân 16 Luồng | 104MB 3D V-Cache',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-7-7800x3d',
      },
      gpu: {
        name: 'ASUS TUF Gaming GeForce RTX 4070 Ti Super 16GB',
        price: 24890000,
        specs: '16GB GDDR6X | Dual NVENC Encoder | Cân 2 màn hình 2K',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-tuf-rtx-4070-ti-super',
      },
      ram: {
        name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz',
        price: 5490000,
        specs: '64GB | DDR5 6000MHz CL30 | AMD EXPO Ready',
        image: '/images/ram-rgb.jpg',
        slug: 'gskill-trident-z5-64gb',
      },
      mainboard: {
        name: 'ASUS TUF GAMING B650-PLUS WIFI',
        price: 5890000,
        specs: 'AM5 | PCIe 5.0 M.2 | 2.5Gb LAN | Wi-Fi 6',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-tuf-b650-plus-wifi',
      },
      ssd: {
        name: 'Kingston KC3000 2TB PCIe 4.0 NVMe M.2',
        price: 3490000,
        specs: 'Đọc 7000MB/s | Ghi 7000MB/s | Lưu trữ video stream',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-kc3000-2tb',
      },
      psu: {
        name: 'Corsair RM850e 850W 80 Plus Gold ATX 3.0',
        price: 3390000,
        specs: '850W Gold | 12VHPWR Ready | Siêu êm ái',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-rm850e-850w',
      },
      case: {
        name: 'NZXT H6 Flow RGB White (Kính cong panorama)',
        price: 3290000,
        specs: 'Dual-Chamber | 3 Fan RGB góc nghiêng | Thoáng khí',
        image: '/images/hero-pc.jpg',
        slug: 'nzxt-h6-flow-rgb-white',
      },
      cooler: {
        name: 'Deepcool LT720 WH 360mm AIO RGB White',
        price: 2990000,
        specs: 'Rad 360mm | Pump vô cực Infinity Mirror',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-lt720-wh-360mm',
      },
    },
    price: 55420000,
    performanceNote: '🎙️ Vừa chơi game 2K 165Hz Max Settings vừa phát luồng OBS 1080p60fps với AV1/NVENC kép không drop khung hình.',
    fpsBenchmarks: [
      { game: 'Apex Legends (Stream 1080p60 On)', res1080p: 280, res1440p: 210, res4k: 120, settings: 'High' },
      { game: 'PUBG: Battlegrounds (OBS Live)', res1080p: 240, res1440p: 185, res4k: 105, settings: 'Ultra' },
      { game: 'League of Legends + VTuber Model', res1080p: 450, res1440p: 380, res4k: 290, settings: 'Very High' },
      { game: 'Black Myth: Wukong (Stream Live)', res1080p: 140, res1440p: 105, res4k: 65, settings: 'Cinematic DLSS' },
    ],
    powerConsumption: {
      idleWatt: 60,
      loadWatt: 440,
      recommendedPsuWatt: 850,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Ryzen 7 7800X3D gắn chuẩn xác bo mạch B650 TUF.',
      psuAdequate: true,
      psuInfo: 'Nguồn 850W Gold vận hành bền bỉ 24/7 khi livestream liên tục.',
      clearanceOk: true,
      clearanceInfo: 'Case NZXT H6 Flow thoáng gió vượt trội cho setup kép.',
      coolerOk: true,
      coolerInfo: 'Tản nước 360mm LT720 giữ CPU mát dưới 68°C khi chơi game.',
      summary: 'Dàn máy tối thượng cho Streamer, YouTuber và Creator.',
    },
    aiVerified: true,
    likes: 189,
    commentsCount: 22,
    createdAt: '2026-09-28',
    status: 'approved',
    description: 'Dàn máy tông màu trắng tinh tế dành cho các bạn streamer. Nhờ chip Ryzen 7 7800X3D có bộ nhớ đệm 3D V-Cache khổng lồ và card RTX 4070 Ti Super 16GB có dual encoder AV1, bạn có thể vừa bật cam 4K, chạy mô hình VTuber vừa kéo game max setting cực kỳ mượt mà.',
    tags: ['Streaming', 'RTX 4070 Ti Super', 'Ryzen 7 7800X3D', 'White Setup', 'OBS Studio'],
  },
  {
    id: 'b5',
    slug: 'pure-white-aesthetic-gaming-pc',
    title: 'Pure White Aesthetic 1440p Gamer',
    category: 'Gaming',
    image: '/images/gpu-white.jpg',
    author: {
      name: 'Huy Hoàng',
      avatar: 'H',
      role: 'PC Modder',
    },
    parts: {
      cpu: {
        name: 'AMD Ryzen 5 7600X (Up to 5.3GHz, 6 Nhân 12 Luồng)',
        price: 5690000,
        specs: 'AM5 | 38MB Cache | Tích hợp GPU Radeon',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-7600x',
      },
      gpu: {
        name: 'ASUS Dual GeForce RTX 4070 White OC 12GB',
        price: 16990000,
        specs: '12GB GDDR6X | Dual Fan White | 2K Ray Tracing',
        image: '/images/gpu-white.jpg',
        slug: 'asus-dual-rtx-4070-white-12gb',
      },
      ram: {
        name: 'Corsair Vengeance RGB White 32GB (2x16GB) DDR5 6000MHz',
        price: 3290000,
        specs: '32GB | DDR5 6000MHz CL36 | Tản nhôm trắng',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-rgb-white-32gb',
      },
      mainboard: {
        name: 'ASRock B650M Pro RS WiFi White',
        price: 4190000,
        specs: 'AM5 | Giáp tản nhiệt màu bạc trắng | Wi-Fi 6E',
        image: '/images/cat-mainboard.jpg',
        slug: 'asrock-b650m-pro-rs-wifi',
      },
      ssd: {
        name: 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2',
        price: 2490000,
        specs: 'Đọc 7000MB/s | Ghi 5000MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-980-pro-1tb',
      },
      psu: {
        name: 'Seasonic Focus GX-750 White 750W 80 Plus Gold',
        price: 2990000,
        specs: '750W Gold | Dây cáp bọc lưới trắng | Full Modular',
        image: '/images/cat-psu.jpg',
        slug: 'seasonic-focus-gx-750-white',
      },
      case: {
        name: 'Montech Sky Two White (3 Fan ARGB đảo chiều)',
        price: 2190000,
        specs: 'Kính cong liền mạch | Màu trắng tinh khôi',
        image: '/images/hero-pc.jpg',
        slug: 'montech-sky-two-white',
      },
      cooler: {
        name: 'Thermalright Aqua Elite 240 White ARGB V3',
        price: 1590000,
        specs: 'Rad 240mm trắng | Đèn LED vô cực',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-aqua-elite-240-white',
      },
    },
    price: 38420000,
    performanceNote: '✨ Cấu hình chuẩn 2K Gaming (1440p) với vẻ đẹp "Full White" không tì vết. Trải nghiệm đồ họa đỉnh cao với DLSS 3 và Frame Generation.',
    fpsBenchmarks: [
      { game: 'Cyberpunk 2077 (1440p Ultra DLSS 3)', res1080p: 145, res1440p: 105, res4k: 55, settings: 'Ultra + FG' },
      { game: 'God of War Ragnarok (1440p High)', res1080p: 160, res1440p: 120, res4k: 65, settings: 'High' },
      { game: 'Call of Duty: Warzone', res1080p: 190, res1440p: 140, res4k: 80, settings: 'Competitive' },
      { game: 'Dota 2', res1080p: 260, res1440p: 220, res4k: 160, settings: 'Ultra' },
    ],
    powerConsumption: {
      idleWatt: 50,
      loadWatt: 360,
      recommendedPsuWatt: 750,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Ryzen 5 7600X khớp chuẩn socket AM5 với ASRock B650M Pro RS.',
      psuAdequate: true,
      psuInfo: 'Nguồn Seasonic 750W Gold dư sức kéo RTX 4070 mát mẻ.',
      clearanceOk: true,
      clearanceInfo: 'Case Montech Sky Two lắp gọn tản 240mm nóc và VGA Dual Fan.',
      coolerOk: true,
      coolerInfo: 'Tản AIO 240mm duy trì nhiệt độ CPU ở mức 62-67°C khi chơi game.',
      summary: 'Dàn máy thẩm mỹ xuất sắc, linh kiện đồng bộ tông màu trắng 100%.',
    },
    aiVerified: true,
    likes: 98,
    commentsCount: 9,
    createdAt: '2026-10-01',
    status: 'approved',
    description: 'Tone màu "Snow White" cực bắt mắt cho góc làm việc hiện đại. Tất cả từ vỏ case, dây nguồn bọc dù, tản nước, quạt RGB đến card màn hình đều là màu trắng đồng bộ.',
    tags: ['White Build', 'RTX 4070', '1440p Gaming', 'Ryzen 7000', 'Aesthetic'],
  },
  {
    id: 'b6',
    slug: 'deep-learning-ai-workstation-dual-gpu',
    title: 'Deep Learning & AI Training Rig',
    category: 'Workstation',
    image: '/images/build-neon.jpg',
    author: {
      name: 'Dr. Trí Tuệ Nhân Tạo',
      avatar: 'D',
      role: 'AI Researcher',
    },
    parts: {
      cpu: {
        name: 'AMD Threadripper 7960X (24 Nhân 48 Luồng, 128MB Cache)',
        price: 36990000,
        specs: 'sTR5 | PCIe 5.0 128 Lanes | Quad-Channel DDR5',
        image: '/images/cpu-box.jpg',
        slug: 'amd-threadripper-7960x',
      },
      gpu: {
        name: '2x ASUS ROG Strix RTX 4090 24GB (Total 48GB VRAM)',
        price: 105980000,
        specs: '48GB GDDR6X VRAM | Chạy song song PyTorch / LLM Fine-tuning',
        image: '/images/gpu-strix.jpg',
        slug: 'dual-asus-strix-rtx-4090',
      },
      ram: {
        name: 'Kingston Server Premier 256GB (4x64GB) DDR5 4800MHz ECC Reg',
        price: 26900000,
        specs: '256GB Quad Channel | Registered ECC chống lỗi bộ nhớ',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-server-ecc-256gb-ddr5',
      },
      mainboard: {
        name: 'ASUS Pro WS TRX50-SAGE WIFI',
        price: 24900000,
        specs: 'sTR5 | 5x PCIe 5.0 x16 Slots | Dual 10Gb LAN',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-pro-ws-trx50-sage-wifi',
      },
      ssd: {
        name: '2x Samsung 990 PRO 4TB PCIe 4.0 NVMe (8TB Total)',
        price: 17980000,
        specs: 'Tốc độ 7450MB/s | Chứa Dataset hàng triệu hình ảnh & text',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-4tb-pair',
      },
      psu: {
        name: 'Super Flower Leadex Titanium 1600W Full Modular',
        price: 9990000,
        specs: '1600W | 80 Plus Titanium 94% Efficiency | 4x 12VHPWR',
        image: '/images/cat-psu.jpg',
        slug: 'super-flower-leadex-titanium-1600w',
      },
      case: {
        name: 'Phanteks Enthoo Pro 2 Server Edition High Airflow',
        price: 5490000,
        specs: 'Full Tower | Chứa 2 nguồn & 4 VGA | 15 vị trí quạt',
        image: '/images/hero-pc.jpg',
        slug: 'phanteks-enthoo-pro-2-server',
      },
      cooler: {
        name: 'Noctua NH-U14S TR5-SP6 Silent CPU Cooler',
        price: 3490000,
        specs: 'Đế tiếp xúc khổng lồ phủ trọn vẹn bề mặt IHS Threadripper',
        image: '/images/hero-pc.jpg',
        slug: 'noctua-nh-u14s-tr5-sp6',
      },
    },
    price: 231720000,
    performanceNote: '🧠 Cỗ máy huấn luyện mô hình ngôn ngữ lớn (LLMs), Stable Diffusion LoRA và xử lý thị giác máy tính với 48GB VRAM tốc độ cao.',
    fpsBenchmarks: [
      { game: 'Llama-3-70B 4-bit Inference', res1080p: 48, res1440p: 48, res4k: 48, settings: '48 tokens/s qua Dual 4090' },
      { game: 'Stable Diffusion XL Batch 16 Render', res1080p: 3.2, res1440p: 3.2, res4k: 3.2, settings: '3.2s per 16 images 1024x1024' },
      { game: 'PyTorch ResNet-50 Training Epoch', res1080p: 18, res1440p: 18, res4k: 18, settings: '18s per epoch' },
      { game: 'Cyberpunk 2077 8K Ray Tracing (DLSS 3.5)', res1080p: 210, res1440p: 165, res4k: 110, settings: 'Overdrive Mode' },
    ],
    powerConsumption: {
      idleWatt: 140,
      loadWatt: 1180,
      recommendedPsuWatt: 1600,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Threadripper 7960X tương thích chuẩn main TRX50.',
      psuAdequate: true,
      psuInfo: 'Nguồn 1600W Titanium gánh trọn vẹn đỉnh 1200W của 2 card RTX 4090.',
      clearanceOk: true,
      clearanceInfo: 'Case Phanteks Enthoo Pro 2 hỗ trợ lắp 2 card dày 3.5 slot có bracket đỡ.',
      coolerOk: true,
      coolerInfo: 'Tản Noctua SP6 chuyên dụng cho socket sTR5 giữ CPU dưới 78°C khi Train AI.',
      summary: 'Trạm AI cá nhân mạnh mẽ nhất năm 2026 cho các phòng nghiên cứu.',
    },
    aiVerified: true,
    likes: 340,
    commentsCount: 45,
    createdAt: '2026-09-10',
    status: 'approved',
    description: 'Cỗ máy siêu khủng phục vụ nghiên cứu trí tuệ nhân tạo (AI/Deep Learning), Fine-tuning LLM và Render kỹ xảo điện ảnh. Sở hữu cấu hình Dual RTX 4090 với 48GB VRAM, RAM ECC Registered tự sửa lỗi và bộ nguồn Titanium 1600W vận hành bền bỉ tuần này qua tháng nọ.',
    tags: ['AI Rig', 'Threadripper', 'Dual RTX 4090', 'Deep Learning', '256GB RAM'],
  },
  {
    id: 'b7',
    slug: 'esports-starter-under-15m',
    title: 'eSports Starter - Sinh Viên 15 Triệu',
    category: 'Budget',
    image: '/images/hero-pc.jpg',
    author: {
      name: 'Bảo Long',
      avatar: 'B',
      role: 'Student Gamer',
    },
    parts: {
      cpu: {
        name: 'AMD Ryzen 5 5600 (3.5GHz - 4.4GHz, 6 Nhân 12 Luồng)',
        price: 2890000,
        specs: 'AM4 | 35MB Cache | 65W TDP',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-5-5600',
      },
      gpu: {
        name: 'ASUS Dual Radeon RX 6600 8GB GDDR6',
        price: 5490000,
        specs: '8GB GDDR6 | Tiết kiệm điện | Chiến mượt Full HD',
        image: '/images/gpu-strix.jpg',
        slug: 'asus-dual-rx-6600-8gb',
      },
      ram: {
        name: 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        price: 990000,
        specs: '16GB Dual Channel | DDR4 3200MHz',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-16gb-ddr4',
      },
      mainboard: {
        name: 'MSI B450M-A PRO MAX II',
        price: 1590000,
        specs: 'AM4 | DDR4 Boost | M.2 Slot | Core Boost',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-b450m-a-pro-max-ii',
      },
      ssd: {
        name: 'Kingston NV2 500GB PCIe 4.0 NVMe M.2',
        price: 990000,
        specs: 'Đọc 3500MB/s | Ghi 2100MB/s',
        image: '/images/ssd-nvme.jpg',
        slug: 'kingston-nv2-500gb',
      },
      psu: {
        name: 'MSI MAG A550BN 550W 80 Plus Bronze',
        price: 990000,
        specs: '550W Bronze | Quạt 120mm êm ái',
        image: '/images/cat-psu.jpg',
        slug: 'msi-mag-a550bn-550w',
      },
      case: {
        name: 'Xigmatek NYX 3F Micro-ATX (3 Fan RGB)',
        price: 650000,
        specs: 'Kính cường lực hông | Mặt trước thoáng khí',
        image: '/images/hero-pc.jpg',
        slug: 'xigmatek-nyx-3f',
      },
      cooler: {
        name: 'Tản nhiệt khí Deepcool AG400 ARGB',
        price: 490000,
        specs: '4 Ống đồng | TDP 220W | Quạt ARGB 120mm',
        image: '/images/hero-pc.jpg',
        slug: 'deepcool-ag400-argb',
      },
    },
    price: 14080000,
    performanceNote: '🎯 Ngon - Bổ - Rẻ nhất tầm giá dưới 15 triệu. Kéo 200+ FPS LMHT, Valorant, CS2 và chơi mượt GTA V, Black Myth Wukong mức thiết lập hợp lý.',
    fpsBenchmarks: [
      { game: 'League of Legends (1080p Max)', res1080p: 280, res1440p: 190, res4k: 110, settings: 'Very High' },
      { game: 'Valorant (1080p Low/Med)', res1080p: 340, res1440p: 210, res4k: 120, settings: 'eSports Setting' },
      { game: 'Counter-Strike 2 (1080p Med)', res1080p: 180, res1440p: 110, res4k: 60, settings: 'Competitive' },
      { game: 'Genshin Impact (1080p Max)', res1080p: 60, res1440p: 60, res4k: 40, settings: 'Max FPS Cap' },
      { game: 'Grand Theft Auto V', res1080p: 120, res1440p: 80, res4k: 45, settings: 'High' },
    ],
    powerConsumption: {
      idleWatt: 40,
      loadWatt: 220,
      recommendedPsuWatt: 550,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Ryzen 5 5600 chạy tương thích tốt trên bo mạch B450M với BIOS mới nhất.',
      psuAdequate: true,
      psuInfo: 'Nguồn 550W Bronze dư 60% công suất cho cặp combo 5600 + RX 6600 (ăn ~220W).',
      clearanceOk: true,
      clearanceInfo: 'Linh kiện mATX vừa vặn trong case Xigmatek NYX nhỏ gọn.',
      coolerOk: true,
      coolerInfo: 'Deepcool AG400 làm mát tuyệt vời cho CPU 65W TDP.',
      summary: 'Dàn máy hiệu năng trên giá tiền (p/p) vô địch phân khúc dưới 15 triệu.',
    },
    aiVerified: true,
    likes: 210,
    commentsCount: 26,
    createdAt: '2026-10-02',
    status: 'approved',
    description: 'Dành cho các bạn học sinh, sinh viên cần một chiếc PC vừa học tập, làm đồ án đồ họa Photoshop/Illustrator, vừa quẩy tưng bừng mọi tựa game online hot nhất hiện nay với ngân sách tiết kiệm nhất.',
    tags: ['Budget', 'Under 15M', 'Ryzen 5 5600', 'RX 6600', 'Học sinh sinh viên'],
  },
  {
    id: 'b8',
    slug: 'all-black-stealth-workstation-cad-revit',
    title: 'All-Black Stealth - Kiến Trúc & CAD/Revit',
    category: 'Workstation',
    image: '/images/hero-pc.jpg',
    author: {
      name: 'KTS. Nguyễn Minh',
      avatar: 'K',
      role: 'Architect',
    },
    parts: {
      cpu: {
        name: 'Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)',
        price: 11290000,
        specs: 'LGA 1700 | 33MB Cache | Xung đơn nhân cực cao cho AutoCAD',
        image: '/images/cpu-box.jpg',
        slug: 'intel-core-i7-14700k',
      },
      gpu: {
        name: 'Gigabyte GeForce RTX 4070 Ti Super WINDFORCE 16GB',
        price: 23490000,
        specs: '16GB VRAM | Render Lumion, V-Ray, Enscape cực nhanh',
        image: '/images/gpu-strix.jpg',
        slug: 'gigabyte-rtx-4070-ti-super-16gb',
      },
      ram: {
        name: 'Corsair Vengeance LPX 64GB (2x32GB) DDR5 6000MHz Black',
        price: 5790000,
        specs: '64GB Dual Kit | Profile thấp chống cấn tản khí',
        image: '/images/ram-rgb.jpg',
        slug: 'corsair-vengeance-64gb-ddr5-black',
      },
      mainboard: {
        name: 'MSI MAG Z790 TOMAHAWK WIFI DDR5',
        price: 7490000,
        specs: 'LGA 1700 | 16+1+1 Phases 90A SPS | 4x M.2 PCIe 4.0',
        image: '/images/cat-mainboard.jpg',
        slug: 'msi-mag-z790-tomahawk-wifi',
      },
      ssd: {
        name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2',
        price: 4590000,
        specs: 'Đọc 7450MB/s | Ghi 6900MB/s | Tối ưu mở file CAD nặng',
        image: '/images/ssd-nvme.jpg',
        slug: 'samsung-990-pro-2tb',
      },
      psu: {
        name: 'Seasonic Focus GX-850 850W 80 Plus Gold ATX 3.0',
        price: 3690000,
        specs: '850W Gold | Dây cáp đen dẹt | Bảo hành 10 năm',
        image: '/images/cat-psu.jpg',
        slug: 'seasonic-focus-gx-850-black',
      },
      case: {
        name: 'Antec P20C Stealth E-ATX Black (Full Kim loại cách âm)',
        price: 2490000,
        specs: 'Mặt trước kim loại phay xước | Lưới lọc bụi 2 lớp',
        image: '/images/hero-pc.jpg',
        slug: 'antec-p20c-stealth-black',
      },
      cooler: {
        name: 'Thermalright Frost Commander 140 Black (Tản khí 5 ống đồng)',
        price: 1390000,
        specs: '2 Quạt 140mm + 120mm | Chịu tải nhiệt TDP 280W',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-frost-commander-140',
      },
    },
    price: 60220000,
    performanceNote: '🏛️ Tối ưu riêng cho Kiến trúc sư, Kỹ sư xây dựng: Dựng hình AutoCAD, Revit, SketchUp, Render Lumion & D5 Render thời gian thực siêu mượt.',
    fpsBenchmarks: [
      { game: 'Lumion 2024 Benchmark 4K', res1080p: 90, res1440p: 72, res4k: 48, settings: 'Ray Tracing Scene (100% Score)' },
      { game: 'V-Ray 6 GPU Render Time (giây)', res1080p: 12, res1440p: 12, res4k: 12, settings: 'RTX OptiX CUDA' },
      { game: 'AutoCAD 2026 3D Orbit 500MB File', res1080p: 144, res1440p: 144, res4k: 120, settings: 'Smooth Wireframe' },
      { game: 'Forza Horizon 5', res1080p: 210, res1440p: 165, res4k: 105, settings: 'Extreme' },
    ],
    powerConsumption: {
      idleWatt: 60,
      loadWatt: 490,
      recommendedPsuWatt: 850,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Intel i7-14700K tương thích tuyệt đối bo mạch Z790 Tomahawk.',
      psuAdequate: true,
      psuInfo: 'Nguồn Seasonic 850W Gold đảm bảo điện áp chuẩn sạch cho render dài ngày.',
      clearanceOk: true,
      clearanceInfo: 'RAM Corsair LPX chân thấp không bị cấn quạt của tản Frost Commander 140.',
      coolerOk: true,
      coolerInfo: 'Tản tháp đôi FC140 giữ i7-14700K ổn định không vượt quá 82°C khi full tải.',
      summary: 'Dàn máy kỹ thuật chuyên nghiệp, không đèn LED rườm rà, tập trung 100% vào hiệu năng.',
    },
    aiVerified: true,
    likes: 85,
    commentsCount: 11,
    createdAt: '2026-10-04',
    status: 'approved',
    description: 'Thiết kế theo phong cách "Stealth" thuần đen không đèn LED RGB, mang lại sự tập trung cao độ trong môi trường văn phòng kiến trúc. Cấu hình chọn lọc i7-14700K cho xung đơn nhân cực cao giúp xoay bản vẽ 3D mượt mà và 16GB VRAM của RTX 4070 Ti Super giúp chứa trọn vẹn thư viện vật liệu 4K của Lumion/Enscape.',
    tags: ['Architecture', 'AutoCAD', 'Lumion', 'Revit', 'All Black', 'Stealth'],
  },
  {
    id: 'b9',
    slug: 'mini-itx-compact-travel-gaming-pc',
    title: 'SFF Mini-ITX Beast - Nhỏ Gọn Bỏ Balo',
    category: 'Gaming',
    image: '/images/build-neon.jpg',
    author: {
      name: 'Vũ Nam',
      avatar: 'V',
      role: 'ITX Builder',
    },
    parts: {
      cpu: {
        name: 'AMD Ryzen 7 7700 (3.8GHz - 5.3GHz, 8 Nhân 16 Luồng, 65W)',
        price: 7890000,
        specs: 'AM5 | TDP chỉ 65W mát mẻ | 40MB Cache',
        image: '/images/cpu-box.jpg',
        slug: 'amd-ryzen-7-7700',
      },
      gpu: {
        name: 'Inno3D GeForce RTX 4070 Twin X2 12GB (Dài chỉ 250mm)',
        price: 15490000,
        specs: '12GB GDDR6X | Thiết kế 2 slot gọn gàng | Chuẩn SFF',
        image: '/images/gpu-strix.jpg',
        slug: 'inno3d-rtx-4070-twin-x2',
      },
      ram: {
        name: 'Kingston FURY Beast 32GB (2x16GB) DDR5 6000MHz',
        price: 2990000,
        specs: '32GB | DDR5 6000MHz CL36 | Tản nhôm thấp',
        image: '/images/ram-rgb.jpg',
        slug: 'kingston-fury-beast-32gb-ddr5',
      },
      mainboard: {
        name: 'ASUS ROG STRIX B650E-I GAMING WIFI Mini-ITX',
        price: 8290000,
        specs: 'Mini-ITX | PCIe 5.0 x16 & M.2 | Wi-Fi 6E | Audio SupremeFX',
        image: '/images/cat-mainboard.jpg',
        slug: 'asus-rog-strix-b650e-i-gaming-wifi',
      },
      ssd: {
        name: 'Crucial T500 2TB PCIe 4.0 NVMe M.2',
        price: 3690000,
        specs: 'Đọc 7400MB/s | Ghi 7000MB/s | Có tản nhiệt nhôm mỏng',
        image: '/images/ssd-nvme.jpg',
        slug: 'crucial-t500-2tb',
      },
      psu: {
        name: 'Corsair SF750 750W 80 Plus Platinum SFX Modular',
        price: 4290000,
        specs: 'Chuẩn kích thước nhỏ SFX | 80 Plus Platinum 92% | Cáp bọc dù',
        image: '/images/cat-psu.jpg',
        slug: 'corsair-sf750-platinum',
      },
      case: {
        name: 'FormD T1 V2.1 Titanium Black (Dung tích chỉ 9.95 Lít)',
        price: 5490000,
        specs: 'Nhôm CNC cao cấp | Hỗ trợ nguồn SFX và VGA 3 slot',
        image: '/images/hero-pc.jpg',
        slug: 'formd-t1-v2-itx-case',
      },
      cooler: {
        name: 'Thermalright AXP90-X47 Full Copper (Tản đồng nguyên khối)',
        price: 1190000,
        specs: 'Cao chỉ 47mm | Lá tản đồng đỏ 100% | Quạt 90mm PWM êm',
        image: '/images/hero-pc.jpg',
        slug: 'thermalright-axp90-x47-full-copper',
      },
    },
    price: 49320000,
    performanceNote: '🎒 Cỗ máy tí hon dung tích dưới 10 Lít nhưng mang sức mạnh quái vật 2K Gaming 144Hz. Dễ dàng bỏ vào balo đi công tác hoặc thi đấu LAN Party.',
    fpsBenchmarks: [
      { game: 'Counter-Strike 2 (1440p)', res1080p: 380, res1440p: 290, res4k: 160, settings: 'Competitive High' },
      { game: 'Cyberpunk 2077 (1440p Ultra DLSS 3)', res1080p: 140, res1440p: 100, res4k: 50, settings: 'Ultra' },
      { game: 'Helldivers 2', res1080p: 130, res1440p: 95, res4k: 55, settings: 'High' },
      { game: 'Shadow of the Tomb Raider', res1080p: 180, res1440p: 135, res4k: 75, settings: 'Highest' },
    ],
    powerConsumption: {
      idleWatt: 45,
      loadWatt: 310,
      recommendedPsuWatt: 750,
    },
    aiCompatibility: {
      status: 'compatible',
      score: 100,
      socketMatch: true,
      socketInfo: 'Ryzen 7 7700 65W lắp tương thích hoàn toàn trên main Mini-ITX B650E-I.',
      psuAdequate: true,
      psuInfo: 'Nguồn Corsair SF750 Platinum đỉnh cao hiệu suất, gánh nhẹ nhàng mức tiêu thụ 310W.',
      clearanceOk: true,
      clearanceInfo: 'FormD T1 tinh chỉnh không gian 2.5 slot khớp chính xác GPU Inno3D 250mm.',
      coolerOk: true,
      coolerInfo: 'Tản AXP90-X47 Full Copper cao 47mm nằm gọn gàng bên trong nắp hông case.',
      summary: 'Tuyệt tác PC Mini-ITX nhỏ gọn tối thượng cho người thích xê dịch.',
    },
    aiVerified: true,
    likes: 176,
    commentsCount: 28,
    createdAt: '2026-10-06',
    status: 'approved',
    description: 'Thú chơi PC kích thước nhỏ (Small Form Factor - SFF). Với thể tích vỏn vẹn 9.95 Lít, chiếc máy này có thể bỏ gọn vào vali xách tay máy bay nhưng vẫn sở hữu card RTX 4070 và CPU 8 nhân 16 luồng mạnh mẽ.',
    tags: ['Mini-ITX', 'SFF PC', 'FormD T1', 'Compact', 'Bỏ balo'],
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    slug: 'huong-dan-tu-lap-rap-pc-gaming-tu-a-den-z-2026',
    title: 'Hướng dẫn tự lắp ráp PC Gaming từ A đến Z cho người mới bắt đầu (Cập nhật 2026)',
    category: 'Hướng dẫn build PC',
    cover: '/images/hero-pc.jpg',
    excerpt: 'Từng bước chi tiết từ khâu chuẩn bị dụng cụ, gắn CPU, tra keo tản nhiệt, đi dây nguồn cho đến cách thiết lập BIOS và cài đặt Windows 11 mượt mà nhất.',
    content: `
## 1. Chuẩn bị trước khi lắp ráp
Tự lắp ráp một bộ máy tính cá nhân (DIY PC) không chỉ giúp bạn tiết kiệm chi phí mà còn mang lại sự thỏa mãn to lớn khi tự tay tạo nên cỗ máy của mình. Trước khi bắt đầu, hãy chuẩn bị:
- Một tua vít 4 cạnh có từ tính (nam châm).
- Bề mặt bàn làm việc phẳng, rộng rãi, sạch sẽ, không tĩnh điện.
- Dây thít nhựa (cable ties) để cố định dây nguồn gọn gàng.
- Đèn pin hoặc đèn flash điện thoại để soi các khe ốc nhỏ.

---

## 2. Quy trình 7 bước lắp ráp chuẩn chuyên gia

### Bước 1: Lắp CPU & RAM lên Bo Mạch Chủ (Mainboard) ngoài hộp
Đặt Mainboard lên chính chiếc hộp bìa carton của nó.
- **Lắp CPU**: Mở chốt ngàm socket (LGA1700 cho Intel hoặc AM5 cho AMD). Đặt CPU sao cho dấu tam giác vàng trên góc CPU khớp với dấu tam giác trên socket. Tuyệt đối không dùng lực đè mạnh, chỉ cần đặt rơi nhẹ nhàng rồi gạt cần chốt lại.
- **Lắp RAM**: Mở lẫy 2 bên khe cắm RAM. Với hệ thống 2 thanh RAM, hãy cắm vào khe **A2 và B2** (khe số 2 và số 4 tính từ CPU sang) để kích hoạt Dual-Channel tối ưu.

### Bước 2: Cài đặt ổ cứng SSD M.2 NVMe
Tháo tấm giáp tản nhiệt nhôm của khe M.2 đầu tiên (khe kết nối trực tiếp với CPU). Bóc miếng dán bảo vệ tản nhiệt, cắm thanh SSD vào góc nghiêng 30 độ rồi ấn nhẹ xuống và siết ốc cố định.

### Bước 3: Lắp Tản Nhiệt CPU
Nếu dùng tản khí, hãy nhớ **bóc miếng dán nilon ở đáy tản nhiệt** trước khi tra keo! Chấm một hạt đậu keo tản nhiệt ở giữa CPU, sau đó đặt đế tản lên và siết ốc đối xứng từng vòng một.

### Bước 4: Lắp Nguồn (PSU) và gắn chặn main (I/O Shield) vào vỏ Case
Cắm các dây cáp cần thiết (24-pin Mainboard, 8-pin CPU, PCIe cho GPU) vào nguồn trước khi đưa nguồn vào hộc case. Điều này giúp thao tác dễ dàng hơn nhiều.

### Bước 5: Đưa Mainboard vào trong Case
Căn chỉnh Mainboard trùng với các chân ốc đồng (Standoffs) của vỏ case. Siết nhẹ các ốc góc trước rồi siết chặt đều tay.

### Bước 6: Cắm dây Front Panel (Power SW, Reset SW, Audio, USB 3.0)
Tham khảo sơ đồ chân cắm ở góc dưới bên phải mainboard. Nút bấm khởi động (Power SW) không phân biệt cực âm dương (+/-).

### Bước 7: Lắp Card Màn Hình (VGA) & Cắm dây nguồn GPU
Mở 2-3 thanh chắn khe PCIe phía sau case. Cắm card VGA dứt khoát vào khe PCIe x16 đầu tiên đến khi nghe tiếng "Click" chốt gài. Siết ốc cố định vào case và cắm dây nguồn 12VHPWR hoặc PCIe 8-pin.

---

## 3. Khởi động lần đầu & Cài đặt tối ưu
- Cắm dây nguồn, bật công tắc PSU và nhấn nút Power trên case.
- Nhấn phím \`Delete\` hoặc \`F2\` liên tục để vào BIOS.
- **Bật XMP (với Intel) hoặc EXPO (với AMD)** để RAM chạy đúng tốc độ thực tế (ví dụ từ 4800MHz lên 6000MHz).
- Cắm USB cài Windows 11 và tiến hành cài đặt theo hướng dẫn.
    `,
    readingMinutes: 8,
    publishedAt: '2026-10-03',
    author: {
      name: 'PCHub Technical Team',
      avatar: 'P',
      role: 'Hardware Senior Editor',
    },
    tags: ['Build PC', 'Hướng dẫn', 'Cài đặt', 'DIY PC', 'Mẹo phần cứng'],
  },
  {
    id: 'p2',
    slug: 'top-cau-hinh-pc-do-hoa-render-3d-toi-uu-chi-phi-2026',
    title: 'Top cấu hình PC đồ họa & Render 3D tối ưu chi phí trong năm 2026',
    category: 'Đánh giá linh kiện',
    cover: '/images/hero-pc.jpg',
    excerpt: 'Phân tích sự khác biệt giữa cấu hình làm đồ họa 2D Photoshop/Illustrator, dựng video 4K/8K Premiere, và trạm Render 3D Blender/Unreal Engine chuyên nghiệp.',
    content: `
## 1. Hiểu đúng nhu cầu phần cứng theo từng phần mềm đồ họa

Nhiều người dùng thường mắc sai lầm khi dồn hết tiền vào Card màn hình (GPU) trong khi phần mềm họ sử dụng lại ăn chủ yếu vào xung nhịp đơn nhân của CPU và dung lượng RAM:

- **Đồ họa 2D (Photoshop, Illustrator, InDesign)**: Yêu cầu CPU có xung đơn nhân càng cao càng tốt (như i5-13400F, i5-14600K hoặc Ryzen 5 7600X), tối thiểu 32GB RAM và SSD NVMe tốc độ cao.
- **Dựng phim & Video Editor (Premiere Pro, After Effects, DaVinci Resolve)**: Cần CPU nhiều nhân luồng kết hợp bộ mã hóa phần cứng mạnh (Intel QuickSync hoặc NVIDIA NVENC), GPU có từ 12GB - 16GB VRAM và RAM từ 64GB trở lên.
- **Render 3D & Kiến trúc (Blender, 3ds Max, Maya, V-Ray, Unreal Engine 5)**: Sức mạnh GPU là yếu tố quyết định thời gian render (RTX 4070 Ti Super 16GB, RTX 4080 Super hoặc RTX 4090).

---

## 2. Gợi ý 3 phân khúc cấu hình đồ họa chuẩn bài

### Phân khúc 1: Đồ họa đa nhiệm & Dựng video 4K (25 – 30 Triệu)
- **CPU**: Intel Core i5-14600K (14 Nhân 20 Luồng)
- **Mainboard**: B760M Gaming DDR5
- **RAM**: 32GB DDR5 5600MHz
- **GPU**: NVIDIA GeForce RTX 4060 Ti 16GB (phiên bản 16GB VRAM cực kỳ lợi hại khi render video)
- **SSD**: 1TB PCIe 4.0 NVMe (Đọc 5000MB/s)
- **Nguồn**: 650W 80 Plus Bronze

### Phân khúc 2: Studio Sáng Tạo & Render 3D Chuyên Nghiệp (55 – 65 Triệu)
- **CPU**: AMD Ryzen 9 7900X hoặc Intel Core i7-14700K
- **Mainboard**: X670E hoặc Z790 DDR5
- **RAM**: 64GB DDR5 6000MHz
- **GPU**: NVIDIA GeForce RTX 4070 Ti Super 16GB / RTX 4080 Super
- **SSD**: 2TB Samsung 990 PRO (7450MB/s)
- **Nguồn**: 850W Gold ATX 3.0

---

## 3. Lời khuyên vàng khi chọn linh kiện Workstation
1. Luôn chọn GPU NVIDIA cho công việc đồ họa vì hệ sinh thái phần mềm hỗ trợ CUDA, OptiX và Tensor Core vượt trội.
2. Không bao giờ tiết kiệm ở bộ nguồn (PSU) vì trạm làm việc sẽ tải 100% công suất liên tục hàng giờ liền.
    `,
    readingMinutes: 6,
    publishedAt: '2026-09-29',
    author: {
      name: 'KTS. Lê Nam',
      avatar: 'L',
      role: 'Content Creator',
    },
    tags: ['Workstation', 'Render 3D', 'Premiere Pro', 'Blender', 'Top PC'],
  },
  {
    id: 'p3',
    slug: 'danh-gia-chi-tiet-intel-core-ultra-va-amd-ryzen-9000',
    title: 'Đánh giá chi tiết Intel Core Ultra & AMD Ryzen 9000: Đâu là ông vua Gaming & Đồ họa?',
    category: 'Tin công nghệ',
    cover: '/images/cpu-box.jpg',
    excerpt: 'So sánh chi tiết kiến trúc vi xử lý mới nhất: Hiệu năng trên mỗi Watt điện, khả năng ép xung, nhiệt độ vận hành và mức giá tại thị trường Việt Nam.',
    content: `
Cuộc đua giữa Intel và AMD chưa bao giờ hạ nhiệt. Trong năm 2026, cả hai gã khổng lồ đều mang đến những bước nhảy vọt về tiến trình sản xuất và hiệu năng trí tuệ nhân tạo (NPU).

## 1. AMD Ryzen 9000 Series (Kiến trúc Zen 5)
- **Điểm mạnh**: Tiến trình TSMC 4nm siêu tiết kiệm điện năng. Nhiệt độ mát hơn đáng kể so với thế hệ trước (giảm từ 7-10°C). Tương thích trọn vẹn với socket AM5 kéo dài đến 2027+.
- **Hiệu năng đơn nhân**: Tăng trung bình 16% IPC, giúp các tựa game như CS2, Valorant đạt mức khung hình cực đại.

## 2. Intel Core Ultra Series (Kiến trúc Arrow Lake)
- **Điểm mạnh**: Loại bỏ hoàn toàn Hyper-Threading truyền thống để tối ưu hiệu năng P-Core và E-Core thế hệ mới. Tích hợp nhân xử lý AI NPU mạnh mẽ cho các tác vụ Copilot và xử lý ảnh thông minh.
- **Tiêu thụ điện năng**: Mức TDP tối đa đã được kiểm soát chặt chẽ ở ngưỡng 250W, không còn tình trạng quá nhiệt đột ngột như thế hệ 14.

## 3. Bảng so sánh nhanh

| Tiêu chí | AMD Ryzen 9000 | Intel Core Ultra |
| :--- | :--- | :--- |
| **Tiến trình** | TSMC 4nm | Intel 20A / TSMC 3nm |
| **Socket** | AM5 (Hỗ trợ lâu dài) | LGA 1851 (Mới) |
| **Tiêu thụ điện** | Siêu tiết kiệm (65W - 120W) | Trung bình (125W - 250W) |
| **Chơi game eSports** | ⭐⭐⭐⭐⭐ (Vô địch FPS) | ⭐⭐⭐⭐ (Rất mượt mà) |
| **Đa nhiệm & Nén file** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Kết luận
Nếu bạn ưu tiên sự mát mẻ, tiết kiệm điện và khả năng nâng cấp sau này mà không cần thay mainboard, **AMD Ryzen 9000** là sự lựa chọn không thể tuyệt vời hơn. Còn nếu bạn làm việc đa tác vụ hỗn hợp, sáng tạo nội dung và yêu cầu tính ổn định của nền tảng Intel, **Core Ultra** sẽ làm bạn hài lòng.
    `,
    readingMinutes: 7,
    publishedAt: '2026-09-25',
    author: {
      name: 'Văn Chung',
      avatar: 'C',
      role: 'Tech Reviewer',
    },
    tags: ['Intel', 'AMD', 'CPU Review', 'So sánh', 'Ryzen 9000'],
  },
  {
    id: 'p4',
    slug: 'cach-chon-nguon-may-tinh-psu-chuan-cong-suat-tranh-sut-ap',
    title: 'Cách chọn nguồn máy tính (PSU) chuẩn công suất, tránh sụt áp khi kéo RTX 40/50 series',
    category: 'Mẹo & thủ thuật',
    cover: '/images/cat-psu.jpg',
    excerpt: 'Bộ nguồn là trái tim của cả dàn máy. Bí quyết tính tổng công suất TDP, hiểu đúng về chuẩn 80 Plus Bronze/Gold/Platinum và chuẩn nguồn mới ATX 3.0 với cổng 12VHPWR.',
    content: `
## 1. Tại sao không được tiếc tiền cho bộ nguồn (PSU)?
Bộ nguồn máy tính (Power Supply Unit) chịu trách nhiệm chuyển đổi dòng điện xoay chiều 220V thành các dòng điện một chiều 12V, 5V, 3.3V cực kỳ chính xác để nuôi các linh kiện đắt tiền như CPU, GPU và ổ cứng. Một bộ nguồn kém chất lượng có thể gây:
- Sập nguồn đột ngột khi vào pha giao tranh nặng trong game.
- Cháy nổ, đoản mạch làm hỏng toàn bộ Mainboard và Card màn hình trị giá hàng chục triệu.
- Rung nhiễu điện áp làm giảm tuổi thọ tụ điện trên bo mạch.

---

## 2. Công thức tính công suất nguồn chuẩn xác

$$\\text{Công suất khuyến nghị} = (\\text{TDP CPU} + \\text{TDP GPU} + 100\\text{W linh kiện khác}) \\times 1.35$$

Hệ số an toàn **1.35** giúp bộ nguồn luôn hoạt động ở dải tải **50% - 70%** – đây là mức tải mà nguồn đạt hiệu suất chuyển đổi điện cao nhất và quạt tản nhiệt chạy êm ái nhất.

### Bảng tra nhanh công suất nguồn theo Card đồ họa (GPU):
- **RTX 4060 / RX 6600**: Nguồn từ **550W - 650W Bronze**.
- **RTX 4070 / RTX 4070 Super**: Nguồn từ **650W - 750W Gold**.
- **RTX 4070 Ti Super / RTX 4080 Super**: Nguồn từ **750W - 850W Gold ATX 3.0**.
- **RTX 4090 / RTX 5090**: Nguồn từ **1000W - 1200W Gold/Platinum ATX 3.0**.

---

## 3. Lưu ý sống còn về chuẩn ATX 3.0 & Cáp 12VHPWR (12V-2x6)
Với các dòng card đồ họa đời mới, hiện tượng tăng đột biến công suất trong tích tắc (Power Spikes lên đến 200-300%) rất hay xảy ra. Chuẩn **ATX 3.0** được thiết kế riêng để hấp thụ các đợt sốc điện này. Hãy luôn đảm bảo bạn **cắm thật chặt cáp 12VHPWR** sao cho không còn khe hở nào để tránh hiện tượng sinh nhiệt ở đầu cắm!
    `,
    readingMinutes: 5,
    publishedAt: '2026-09-20',
    author: {
      name: 'Hoàng Long',
      avatar: 'H',
      role: 'PSU Specialist',
    },
    tags: ['Nguồn máy tính', 'PSU', 'ATX 3.0', 'Kinh nghiệm', 'An toàn điện'],
  },
  {
    id: 'p5',
    slug: 'meo-toi-uu-windows-11-bios-tang-15-20-fps',
    title: 'Mẹo tối ưu Windows 11 & BIOS để tăng 15-20% FPS cho máy tính chơi game',
    category: 'Mẹo & thủ thuật',
    cover: '/images/cat-gear.jpg',
    excerpt: 'Tổng hợp các thiết lập tinh chỉnh hệ thống hiệu quả nhất: Bật Game Mode, ReBAR (Resizable BAR), tắt ứng dụng chạy ngầm và tối ưu độ trễ chuột bàn phím.',
    content: `
Nhiều bạn sau khi sắm dàn PC cấu hình khủng về vẫn gặp hiện tượng giật lag nhẹ (micro-stutter) do chưa tối ưu hệ điều hành và BIOS. Dưới đây là 5 bước tinh chỉnh miễn phí giúp mở khóa toàn bộ sức mạnh phần cứng của bạn!

## 1. Bật XMP / EXPO và Resizable BAR trong BIOS
- **XMP/EXPO**: Giúp RAM chạy đúng xung nhịp danh định thay vì mức mặc định 4800MHz của JEDEC.
- **Resizable BAR (hoặc Smart Access Memory trên AMD)**: Cho phép CPU truy cập trực tiếp vào toàn bộ bộ nhớ VRAM của Card đồ họa cùng lúc, giúp tăng từ 5% đến 15% FPS trong các tựa game thế giới mở như Forza Horizon, Cyberpunk 2077 hay Assassin's Creed.

## 2. Bật tính năng Hardware-Accelerated GPU Scheduling (HAGS) trong Windows 11
1. Nhấn chuột phải ngoài màn hình Desktop > Chọn **Display Settings**.
2. Cuộn xuống chọn **Graphics** > Nhấp vào **Default graphics settings**.
3. Gạt bật **Hardware-accelerated GPU scheduling** và khởi động lại máy.
*(Tính năng này là bắt buộc để sử dụng công nghệ tạo khung hình DLSS 3 Frame Generation).*

## 3. Tối ưu Game Mode và Power Plan
- Vào **Settings > Gaming > Game Mode** > Bật ON.
- Vào **Control Panel > Power Options** > Chọn chế độ **High Performance** hoặc **Ultimate Performance**.

## 4. Dọn dẹp ứng dụng khởi động cùng Windows (Startup Apps)
Nhấn tổ hợp phím \`Ctrl + Shift + Esc\` mở Task Manager > Chuyển sang tab **Startup apps** > Nhấp chuột phải chọn **Disable** tất cả các ứng dụng không cần thiết như Spotify, Skype, Adobe Updater, Discord... để giải phóng RAM và chu kỳ CPU chạy ngầm.
    `,
    readingMinutes: 5,
    publishedAt: '2026-09-14',
    author: {
      name: 'Alex Hải',
      avatar: 'A',
      role: 'Enthusiast Builder',
    },
    tags: ['Tối ưu FPS', 'Windows 11', 'BIOS Tweaks', 'Gaming Tips'],
  },
  {
    id: 'p6',
    slug: 'so-sanh-tan-nhiet-khi-va-tan-nhiet-nuoc-aio-khi-nao-nen-nang-cap',
    title: 'So sánh tản nhiệt khí và tản nhiệt nước AIO: Khi nào bạn thực sự nên nâng cấp?',
    category: 'Đánh giá linh kiện',
    cover: '/images/hero-pc.jpg',
    excerpt: 'Giải mã những hiểu lầm phổ biến: Liệu tản nhiệt nước có nguy cơ rò rỉ nước không? Tản khí tháp đôi có đủ làm mát CPU Core i7/i9 hay Ryzen 7/9 khi tải nặng?',
    content: `
Khi chọn mua tản nhiệt cho CPU, câu hỏi phổ biến nhất luôn là: "Nên chọn tản khí cho bền hay chọn tản nước AIO cho đẹp và mát?". Hãy cùng PCHub phân tích chi tiết!

## 1. Tản nhiệt khí (Air Cooler)
- **Ưu điểm**: Độ bền gần như vĩnh cửu (chỉ có quạt quay là bộ phận chuyển động, hỏng quạt thì thay với giá vài chục nghìn), không bao giờ lo rủi ro rò rỉ nước, giá thành rẻ hơn (chỉ từ 400.000đ đến 2.500.000đ).
- **Nhược điểm**: Kích thước cồng kềnh, dễ bị cấn thanh RAM có tản cao, che mất vẻ đẹp RGB của bo mạch chủ, khả năng làm mát giảm dần khi nhiệt độ phòng tăng cao vào mùa hè.
- **Thích hợp cho**: Các CPU có TDP dưới 150W như Core i5-13400F, i5-14400, Ryzen 5 5600, Ryzen 5 7600, Ryzen 7 7700.

---

## 2. Tản nhiệt nước All-In-One (AIO Liquid Cooler)
- **Ưu điểm**: Thẩm mỹ đỉnh cao với đèn LED RGB, màn hình LCD hiển thị nhiệt độ/GIF động; hiệu quả làm mát vượt trội khi ép xung hoặc render nặng; đưa nhiệt lượng tản thẳng ra ngoài vỏ case qua nóc, giúp bên trong thùng máy luôn thoáng mát.
- **Nhược điểm**: Giá thành cao hơn (từ 1.500.000đ đến 7.000.000đ); tuổi thọ bơm (pump) trung bình khoảng 4 - 6 năm; cần chọn vỏ case có kích thước hỗ trợ radiator 240mm hoặc 360mm.
- **Thích hợp cho**: Các CPU tỏa nhiệt lớn như Core i7-14700K, Core i9-14900K, Ryzen 9 7900X, 7950X hoặc người dùng yêu thích sự gọn gàng, hiện đại.

---

## Lời khuyên từ chuyên gia PCHub
- Nếu ngân sách dưới 20 triệu: Hãy chọn **tản nhiệt khí tháp 4-6 ống đồng** (như Deepcool AG400, Thermalright Assassin X 120) để dồn tiền nâng cấp GPU hoặc dung lượng SSD.
- Nếu dàn máy từ 35 triệu trở lên hoặc bạn sử dụng CPU dòng K/X để làm việc đồ họa: Một bộ **tản nước AIO 240mm hoặc 360mm** sẽ là khoản đầu tư hoàn toàn xứng đáng cho cả hiệu năng lẫn vẻ đẹp góc làm việc của bạn.
    `,
    readingMinutes: 6,
    publishedAt: '2026-09-08',
    author: {
      name: 'PCHub Technical Team',
      avatar: 'P',
      role: 'Hardware Senior Editor',
    },
    tags: ['Tản nhiệt', 'AIO Cooler', 'Tản khí', 'Làm mát PC', 'Tư vấn phần cứng'],
  },
];

export const INITIAL_COMMUNITY_COMMENTS: CommunityComment[] = [
  {
    id: 'c1',
    buildId: 'b1',
    user: { name: 'Hoàng Nam', avatar: 'H' },
    content: 'Cấu hình i9 + RTX 4090 này chiến Cyberpunk 4K mượt mà thật sự, mình cũng vừa lắp một bộ tương tự tại PCHub tuần trước, nhiệt độ mát rượi!',
    createdAt: '2026-09-16 14:20',
    likes: 12,
  },
  {
    id: 'c2',
    buildId: 'b1',
    user: { name: 'Alex Hải', avatar: 'A' },
    content: 'Cảm ơn bạn nhé! Nhớ bật EXPO và DLSS 3.5 Frame Gen là FPS bay nóc nhà luôn đó.',
    parentId: 'c1',
    createdAt: '2026-09-16 15:05',
    likes: 5,
  },
  {
    id: 'c3',
    buildId: 'b1',
    user: { name: 'Minh Tuấn', avatar: 'M' },
    content: 'Cho mình hỏi nguồn 1000W này có sẵn dây 12VHPWR cắm trực tiếp vào 4090 không hay phải dùng cổng chuyển đổi vậy shop?',
    createdAt: '2026-09-18 09:30',
    likes: 3,
  },
  {
    id: 'c4',
    buildId: 'b1',
    user: { name: 'Alex Hải', avatar: 'A' },
    content: 'Nguồn Corsair RM1000x Shift là chuẩn ATX 3.0 có sẵn dây native 12VHPWR cắm trực tiếp 1 đầu duy nhất cực gọn, không cần cổng chuyển nha bạn!',
    parentId: 'c3',
    createdAt: '2026-09-18 10:15',
    likes: 8,
  },
  {
    id: 'c5',
    buildId: 'b2',
    user: { name: 'Vũ Phong', avatar: 'V' },
    content: 'Dàn workstation này render Blender 4.2 với OptiX nhanh chóng mặt, 128GB RAM chạy máy ảo mượt mà không bao giờ lo tràn bộ nhớ.',
    createdAt: '2026-09-20 18:45',
    likes: 7,
  },
  {
    id: 'c6',
    buildId: 'b3',
    user: { name: 'Trần Đạt', avatar: 'T' },
    content: 'Tầm giá 21 triệu mà có cả i5 đời 13 + RTX 4060 + 32GB RAM DDR5 là quá hợp lý cho học sinh sinh viên rồi, lưu lại để cuối tháng lãnh lương rước em nó về!',
    createdAt: '2026-09-24 11:10',
    likes: 19,
  },
];

// LocalStorage helpers for persistent interactivity
const LOCAL_STORAGE_BUILDS_KEY = 'pchub_community_builds_v2';
const LOCAL_STORAGE_COMMENTS_KEY = 'pchub_community_comments_v2';
const LOCAL_STORAGE_LIKES_KEY = 'pchub_community_liked_ids_v2';
const LOCAL_STORAGE_SAVED_BUILDS_KEY = 'pchub_community_saved_build_ids_v2';

export function getStoredCommunityBuilds(): CommunityBuild[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_BUILDS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BUILDS_KEY);
    if (!raw) return INITIAL_COMMUNITY_BUILDS;
    const customBuilds: CommunityBuild[] = JSON.parse(raw);
    return [...customBuilds, ...INITIAL_COMMUNITY_BUILDS];
  } catch {
    return INITIAL_COMMUNITY_BUILDS;
  }
}

export function saveCommunityBuild(newBuild: CommunityBuild): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BUILDS_KEY);
    const existing: CommunityBuild[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newBuild);
    localStorage.setItem(LOCAL_STORAGE_BUILDS_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Failed to save community build:', err);
    return false;
  }
}

export function getStoredComments(buildId: string): CommunityComment[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_COMMENTS.filter(c => c.buildId === buildId);
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY);
    const customComments: CommunityComment[] = raw ? JSON.parse(raw) : [];
    const all = [...customComments, ...INITIAL_COMMUNITY_COMMENTS];
    return all.filter(c => c.buildId === buildId);
  } catch {
    return INITIAL_COMMUNITY_COMMENTS.filter(c => c.buildId === buildId);
  }
}

export function addCommunityComment(comment: CommunityComment): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY);
    const existing: CommunityComment[] = raw ? JSON.parse(raw) : [];
    existing.unshift(comment);
    localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Failed to add community comment:', err);
    return false;
  }
}

export function getLikedBuildIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleLikeBuildId(buildId: string): { isLiked: boolean; countDelta: number } {
  if (typeof window === 'undefined') return { isLiked: false, countDelta: 0 };
  try {
    const liked = getLikedBuildIds();
    const index = liked.indexOf(buildId);
    if (index >= 0) {
      liked.splice(index, 1);
      localStorage.setItem(LOCAL_STORAGE_LIKES_KEY, JSON.stringify(liked));
      return { isLiked: false, countDelta: -1 };
    } else {
      liked.push(buildId);
      localStorage.setItem(LOCAL_STORAGE_LIKES_KEY, JSON.stringify(liked));
      return { isLiked: true, countDelta: 1 };
    }
  } catch {
    return { isLiked: false, countDelta: 0 };
  }
}

export function getSavedCommunityBuildIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_BUILDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveCommunityBuildId(buildId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = getSavedCommunityBuildIds();
    const index = saved.indexOf(buildId);
    if (index >= 0) {
      saved.splice(index, 1);
      localStorage.setItem(LOCAL_STORAGE_SAVED_BUILDS_KEY, JSON.stringify(saved));
      return false;
    } else {
      saved.push(buildId);
      localStorage.setItem(LOCAL_STORAGE_SAVED_BUILDS_KEY, JSON.stringify(saved));
      return true;
    }
  } catch {
    return false;
  }
}

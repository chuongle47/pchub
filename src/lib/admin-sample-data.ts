export interface AdminSampleOrder {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  time_ago: string;
  display_total: string;
}

export interface AdminSampleQuote {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  total: number;
  status: string;
  created_at: string;
  time_ago: string;
  assigned_profile?: { full_name: string };
}

export interface AdminSampleStockProduct {
  id: string;
  name: string;
  short_name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface AdminTopProduct {
  name: string;
  revenue_text: string;
  qty: number;
  percent: number;
}

const now = Date.now();

export const SAMPLE_ORDERS: AdminSampleOrder[] = [
  {
    id: 'ord-0047',
    code: 'ORD-0047',
    customer_name: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@gmail.com',
    total: 24200000,
    display_total: '24.2tr',
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'pending',
    created_at: new Date(now - 2 * 60 * 1000).toISOString(),
    time_ago: '2 phút trước',
  },
  {
    id: 'ord-0046',
    code: 'ORD-0046',
    customer_name: 'Trần Thị B',
    phone: '0912345678',
    email: 'tran.b@gmail.com',
    total: 15500000,
    display_total: '15.5tr',
    payment_method: 'vnpay',
    payment_status: 'paid',
    status: 'completed',
    created_at: new Date(now - 15 * 60 * 1000).toISOString(),
    time_ago: '15 phút trước',
  },
  {
    id: 'ord-0045',
    code: 'ORD-0045',
    customer_name: 'Lê Hoàng C',
    phone: '0987654321',
    email: 'hoangc.le@gmail.com',
    total: 8900000,
    display_total: '8.9tr',
    payment_method: 'vnpay',
    payment_status: 'paid',
    status: 'completed',
    created_at: new Date(now - 60 * 60 * 1000).toISOString(),
    time_ago: '1 giờ trước',
  },
  {
    id: 'ord-0044',
    code: 'ORD-0044',
    customer_name: 'Phạm D',
    phone: '0933445566',
    email: 'd.pham@gmail.com',
    total: 112000000,
    display_total: '112.0tr',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    status: 'shipping',
    created_at: new Date(now - 3 * 3600 * 1000).toISOString(),
    time_ago: '3 giờ trước',
  },
  {
    id: 'ord-0043',
    code: 'ORD-0043',
    customer_name: 'Vũ E',
    phone: '0944556677',
    email: 'vu.e@gmail.com',
    total: 3400000,
    display_total: '3.4tr',
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'pending',
    created_at: new Date(now - 4 * 3600 * 1000).toISOString(),
    time_ago: '4 giờ trước',
  },
];

export const SAMPLE_QUOTES: AdminSampleQuote[] = [
  {
    id: 'quote-001',
    code: 'BG-2024-001',
    customer_name: 'Hoàng Minh Tuấn',
    phone: '0918273645',
    email: 'tuan.hm@gmail.com',
    total: 32500000,
    status: 'new',
    created_at: new Date(now - 25 * 60 * 1000).toISOString(),
    time_ago: '25 phút trước',
    assigned_profile: { full_name: 'Lê Văn Chương' },
  },
  {
    id: 'quote-002',
    code: 'BG-2024-002',
    customer_name: 'Đặng Thu Hà',
    phone: '0909123888',
    email: 'thuha.dang@gmail.com',
    total: 18200000,
    status: 'processing',
    created_at: new Date(now - 2 * 3600 * 1000).toISOString(),
    time_ago: '2 giờ trước',
    assigned_profile: { full_name: 'Nguyễn Kỹ Thuật' },
  },
  {
    id: 'quote-003',
    code: 'BG-2024-003',
    customer_name: 'Trần Quốc Bảo',
    phone: '0977889900',
    email: 'bao.tran@gmail.com',
    total: 45000000,
    status: 'sent',
    created_at: new Date(now - 5 * 3600 * 1000).toISOString(),
    time_ago: '5 giờ trước',
    assigned_profile: { full_name: 'Lê Văn Chương' },
  },
];

export const SAMPLE_LOW_STOCK: AdminSampleStockProduct[] = [
  {
    id: 'p-stock-1',
    name: 'RTX 4090 ASUS ROG Strix OC 24GB',
    short_name: 'RTX 4090 ASUS R...',
    sku: 'ROG-RTX4090-O24G',
    stock: 2,
    price: 48990000,
  },
  {
    id: 'p-stock-2',
    name: 'Intel Core i9-14900KS Special Edition',
    short_name: 'i9-14900KS',
    sku: 'BX8071514900KS',
    stock: 0,
    price: 16990000,
  },
  {
    id: 'p-stock-3',
    name: 'NZXT Kraken Elite 360 RGB White Liquid Cooler',
    short_name: 'NZXT Kraken Elite...',
    sku: 'RL-KR36E-W1',
    stock: 4,
    price: 7890000,
  },
  {
    id: 'p-stock-4',
    name: 'MSI MEG Z790 GODLIKE MAX Gaming Motherboard',
    short_name: 'MSI MEG Z790 CO...',
    sku: 'MSI-Z790-GODLIKE',
    stock: 1,
    price: 29990000,
  },
  {
    id: 'p-stock-5',
    name: 'Seasonic Prime TX-1600 Titanium 1600W Modular',
    short_name: 'Seasonic Prime TX...',
    sku: 'SSR-1600TR',
    stock: 3,
    price: 12990000,
  },
];

export const SAMPLE_TOP_PRODUCTS: AdminTopProduct[] = [
  {
    name: 'RTX 4090 ASUS ROG',
    revenue_text: '420tr',
    qty: 12,
    percent: 92,
  },
  {
    name: 'Intel Core i9-14900K',
    revenue_text: '315tr',
    qty: 24,
    percent: 72,
  },
  {
    name: 'Samsung 990 PRO 2TB',
    revenue_text: '185tr',
    qty: 45,
    percent: 54,
  },
  {
    name: 'Corsair Dominator 64GB',
    revenue_text: '142tr',
    qty: 58,
    percent: 42,
  },
  {
    name: 'ASUS ROG Swift OLED',
    revenue_text: '120tr',
    qty: 6,
    percent: 32,
  },
];

export const SAMPLE_AI_STATS = {
  sessions: 1204,
  converted_orders: 142,
  conversion_rate: '11.8%',
  resolved_percent: 68,
  escalated_percent: 19,
  unanswered_percent: 13,
};


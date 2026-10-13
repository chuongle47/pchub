export interface ContactButton {
  id: string;
  type: 'phone' | 'zalo' | 'messenger';
  label: string;
  sublabel: string;
  value: string;
  href: string;
  color: string;
  openNewTab: boolean;
  enabled: boolean;
}

export interface Showroom {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isHeadquarter?: boolean;
  mapEmbedUrl: string;
  directionUrl: string;
}

// Cấu hình đồng bộ chính xác với WordPress "Floating Contact Buttons" mới nhất
export const CONTACT_CONFIG = {
  enabled: true,
  position: 'right' as const, // 'Góc phải'
  hotline: '0322323233',
  hotlineDisplay: '0322 323 233',
  zalo: '0333333333',
  messenger: 'dfd',
  email: 'support@pchub.vn',
  workingHours: '8:00 – 21:30 (Thứ 2 – Chủ nhật)',

  // Địa chỉ duy nhất của PCHub theo yêu cầu: Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh
  address: 'Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh',

  // Danh sách nút theo đúng thứ tự và màu sắc đã lưu trong WordPress Admin:
  // 1. Messenger (chuong) - Màu xanh Messenger (#0084ff)
  // 2. Call now (0322323233) - Màu xanh lá (#00c853)
  // 3. Chat Zalo (0333333333) - Màu xanh Zalo (#0068ff)
  buttons: [
    {
      id: 'messenger',
      type: 'messenger' as const,
      label: 'Messenger',
      sublabel: '@chuong',
      value: 'chuong',
      href: 'https://m.me/chuong',
      color: '#0084ff', // Màu xanh Messenger WordPress
      openNewTab: true,
      enabled: true,
    },
    {
      id: 'phone',
      type: 'phone' as const,
      label: 'Call now',
      sublabel: '0322 323 233',
      value: '0322323233',
      href: 'tel:0322323233',
      color: '#00c853', // Màu xanh lá WordPress Admin
      openNewTab: true,
      enabled: true,
    },
    {
      id: 'zalo',
      type: 'zalo' as const,
      label: 'Chat Zalo',
      sublabel: '0333 333 333',
      value: '0333333333',
      href: 'https://zalo.me/0333333333',
      color: '#0068ff', // Màu xanh Zalo WordPress
      openNewTab: true,
      enabled: true,
    },
  ],

  // Hệ thống địa chỉ duy nhất
  showrooms: [
    {
      id: 'hcm-phuloi',
      city: 'TP. Hồ Chí Minh',
      name: 'Showroom & Trụ Sở PCHub',
      address: 'Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh',
      phone: '0322 323 233',
      hours: '8:00 - 21:30 (Tất cả các ngày trong tuần)',
      isHeadquarter: true,
      mapEmbedUrl: 'https://www.google.com/maps?q=Số+06+Trần+Văn+Ơn+Phú+Lợi+TP+Hồ+Chí+Minh&output=embed',
      directionUrl: 'https://maps.google.com/?q=Số+06+Trần+Văn+Ơn+Phú+Lợi+TP+Hồ+Chí+Minh'
    }
  ]
};

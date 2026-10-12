export interface ContactButton {
  id: string;
  type: 'phone' | 'zalo' | 'messenger';
  label: string;
  sublabel: string;
  value: string;
  href: string;
  color: string;
  openNewTab: boolean;
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

export const CONTACT_CONFIG = {
  // Config extracted from WordPress "Nút liên hệ nổi" plugin
  enabled: true,
  position: 'right' as const, // 'Góc phải'
  hotline: '0901234567',
  hotlineDisplay: '0901 234 567',
  zalo: '0901234567',
  messenger: 'pchub',
  email: 'support@pchub.vn',
  workingHours: '8:00 – 21:30 (Thứ 2 – Chủ nhật)',

  // 3 buttons configured in WordPress Admin
  buttons: [
    {
      id: 'phone',
      type: 'phone' as const,
      label: 'Gọi ngay',
      sublabel: '0901 234 567',
      value: '0901234567',
      href: 'tel:0901234567',
      color: '#00a651', // Màu xanh lá WordPress
      openNewTab: false,
    },
    {
      id: 'zalo',
      type: 'zalo' as const,
      label: 'Chat Zalo',
      sublabel: '0901 234 567',
      value: '0901234567',
      href: 'https://zalo.me/0901234567',
      color: '#0068ff', // Màu xanh Zalo
      openNewTab: true,
    },
    {
      id: 'messenger',
      type: 'messenger' as const,
      label: 'Messenger',
      sublabel: '@pchub',
      value: 'pchub',
      href: 'https://m.me/pchub',
      color: '#0084ff', // Màu xanh Messenger
      openNewTab: true,
    },
  ],

  // Hệ thống showroom PCHub
  showrooms: [
    {
      id: 'hcm-q1',
      city: 'TP. Hồ Chí Minh',
      name: 'Showroom & Trụ Sở Chính Quận 1',
      address: '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      phone: '0901 234 567',
      hours: '8:00 - 21:30 (Tất cả các ngày trong tuần)',
      isHeadquarter: true,
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4975549887714!2d106.690897375838!3d10.773145459247657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3bfbbd087b%3A0xb3e0d860e34c9c28!2zMTIzIE5ndXnhu4VuIFRyw6NpLCBC4bq_biBUaMOgbmgsIFF14bqtbiAxLCBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionUrl: 'https://maps.google.com/?q=123+Nguyen+Trai+Ben+Thanh+Quan+1+TPHCM'
    },
    {
      id: 'hcm-thuduc',
      city: 'TP. Hồ Chí Minh',
      name: 'Showroom TP. Thủ Đức',
      address: '456 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh',
      phone: '0901 234 568',
      hours: '8:30 - 21:00 (Tất cả các ngày)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5204449887714!2d106.784897375838!3d10.849145459247657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276bfbbd087b%3A0xb3e0d860e34c9c28!2zNDU2IEzDqiBWxINuIFZp4buHdCwgVMSDbmcgTmjGoW4gUGjDuiBBLCBUaOG7pyDEkOG7qWM!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionUrl: 'https://maps.google.com/?q=456+Le+Van+Viet+Tang+Nhon+Phu+A+Thu+Duc'
    },
    {
      id: 'hn-caugiay',
      city: 'Hà Nội',
      name: 'Showroom Cầu Giấy (Hà Nội)',
      address: '789 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
      phone: '0901 234 569',
      hours: '8:00 - 21:00 (Tất cả các ngày)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8638559887714!2d105.791897375838!3d21.034145459247657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3bfbbd087b%3A0xb3e0d860e34c9c28!2zNzg5IEPhuqd1IEdp4bqleSwgROG7i2NoIFbhu41uZywgQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionUrl: 'https://maps.google.com/?q=789+Cau+Giay+Dich+Vong+Cau+Giay+Ha+Noi'
    },
    {
      id: 'dn-haichau',
      city: 'Đà Nẵng',
      name: 'Showroom Đà Nẵng',
      address: '321 Nguyễn Văn Linh, Phường Thạc Gián, Quận Hải Châu, Đà Nẵng',
      phone: '0901 234 570',
      hours: '8:00 - 20:30 (Tất cả các ngày)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0204449887714!2d108.214897375838!3d16.059145459247657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142193bfbbd087b%3A0xb3e0d860e34c9c28!2zMzIxIE5ndXnhu4VuIFbEg24gTGluaCwgVGjhuqFjIEdpw6FuLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq1bmc!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionUrl: 'https://maps.google.com/?q=321+Nguyen+Van+Linh+Thac+Gian+Hai+Chau+Da+Nang'
    },
    {
      id: 'ct-ninhkieu',
      city: 'Cần Thơ',
      name: 'Showroom Cần Thơ',
      address: '654 Trần Hưng Đạo, Phường An Phú, Quận Ninh Kiều, Cần Thơ',
      phone: '0901 234 571',
      hours: '8:00 - 20:30 (Tất cả các ngày)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8204449887714!2d105.774897375838!3d10.029145459247657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0623bfbbd087b%3A0xb3e0d860e34c9c28!2zNjU0IFRy4bqnbiBIxrBuZyDEkOG6oW8sIEFuIFBow7osIE5pbmggS2nhu4F1LCBD4bqnbiBUaMah!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionUrl: 'https://maps.google.com/?q=654+Tran+Hung+Dao+An+Phu+Ninh+Kieu+Can+Tho'
    }
  ]
};

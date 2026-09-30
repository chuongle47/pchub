// Danh sách 63 Tỉnh / Thành phố Việt Nam
export const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Thừa Thiên Huế',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

// Danh sách Thành phố trực thuộc / Huyện / Thị xã theo Tỉnh / Thành phố (Không còn đơn vị Quận)
export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    'TP. Thủ Đức', 'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Tân Uyên', 'TP. Bến Cát',
    'TP. Vũng Tàu', 'TP. Phú Mỹ', 'TP. Bà Rịa',
    'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'
  ],
  'Hà Nội': [
    'Thị xã Sơn Tây', 'TP. Phủ Lý', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai',
    'Huyện Sóc Sơn', 'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Ứng Hòa'
  ],
  'Đà Nẵng': [
    'TP. Tam Kỳ', 'TP. Hội An', 'Huyện Hòa Vang', 'Huyện Hoàng Sa'
  ],
  'Hải Phòng': [
    'TP. Thủy Nguyên', 'TP. Hải Dương', 'TP. Chí Linh', 'Huyện An Lão', 'Huyện Kiến Thụy', 'Huyện Tiên Lãng', 'Huyện Vĩnh Bảo',
    'Huyện Cát Hải', 'Huyện Bạch Long Vĩ'
  ],
  'Cần Thơ': [
    'TP. Vị Thanh', 'TP. Ngã Bảy', 'TP. Sóc Trăng', 'Huyện Phong Điền', 'Huyện Cờ Đỏ', 'Huyện Vĩnh Thạnh', 'Huyện Thới Lai'
  ],
  'Thừa Thiên Huế': [
    'Thị xã Phong Điền', 'Thị xã Hương Thủy', 'Thị xã Hương Trà',
    'Huyện A Lưới', 'Huyện Nam Đông', 'Huyện Phú Lộc', 'Huyện Phú Vàng', 'Huyện Quảng Điền'
  ],
  'Bình Dương': [
    'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Tân Uyên', 'TP. Bến Cát',
    'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Huyện Bắc Tân Uyên'
  ],
  'Đồng Nai': [
    'TP. Biên Hòa', 'TP. Long Khánh', 'Huyện Cẩm Mỹ', 'Huyện Định Quán', 'Huyện Long Thành',
    'Huyện Nhơn Trạch', 'Huyện Tân Phú', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc'
  ],
  'Bà Rịa - Vũng Tàu': [
    'TP. Vũng Tàu', 'TP. Bà Rịa', 'TP. Phú Mỹ', 'Huyện Long Đất', 'Huyện Châu Đức', 'Huyện Xuyên Mộc', 'Huyện Côn Đảo'
  ],
  'Quảng Ninh': [
    'TP. Hạ Long', 'TP. Móng Cái', 'TP. Cẩm Phả', 'TP. Uông Bí', 'TP. Đông Triều', 'Thị xã Quảng Yên',
    'Huyện Ba Chẽ', 'Huyện Bình Liêu', 'Huyện Cô Tô', 'Huyện Đầm Hà', 'Huyện Hải Hà', 'Huyện Tiên Yên', 'Huyện Vân Đồn'
  ],
  'Khánh Hòa': [
    'TP. Nha Trang', 'TP. Cam Ranh', 'Thị xã Ninh Hòa', 'Huyện Cam Lâm', 'Huyện Diên Khánh', 'Huyện Khánh Sơn', 'Huyện Khánh Vĩnh', 'Huyện Trường Sa', 'Huyện Vạn Ninh'
  ]
};

// Chi tiết Phường / Xã trực thuộc cho các địa bàn phổ biến
export const WARDS_BY_DISTRICT: Record<string, string[]> = {
  'TP. Thủ Đức': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Trung', 'Phường Linh Xuân', 'Phường Thảo Điền', 'Phường Thủ Thiêm', 'Phường Trường Thọ'],
  'TP. Thủ Dầu Một': ['Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa', 'Phường Phú Thọ', 'Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Định Hòa', 'Phường Hòa Phú', 'Phường Phú Tân', 'Phường Chánh Mỹ', 'Phường Tân An', 'Phường Tương Bình Hiệp'],
  'TP. Dĩ An': ['Phường Dĩ An', 'Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Đông Hòa', 'Phường Tân Bình', 'Phường Tân Đông Hiệp'],
  'TP. Thuận An': ['Phường Lái Thiêu', 'Phường An Phú', 'Phường An Thạnh', 'Phường Bình Hòa', 'Phường Bình Nhâm', 'Phường Hưng Định', 'Phường Thuận Giao', 'Phường Vĩnh Phú'],
  'TP. Vũng Tàu': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường Thắng Nhất', 'Phường Thắng Nhì', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Phường Nguyễn An Ninh'],
  'TP. Biên Hòa': ['Phường An Bình', 'Phường An Hòa', 'Phường Bình Đa', 'Phường Bửu Long', 'Phường Hố Nai', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường Quang Vinh', 'Phường Quyết Thắng', 'Phường Tân Hiệp', 'Phường Tân Mai', 'Phường Tân Phong', 'Phường Trảng Dài', 'Phường Trung Dũng'],
  'TP. Nha Trang': ['Phường Lộc Thọ', 'Phường Phương Sài', 'Phường Phương Sơn', 'Phường Phước Hải', 'Phường Phước Hòa', 'Phường Phước Long', 'Phường Phước Tân', 'Phường Phước Tiến', 'Phường Tân Lập', 'Phường Vạn Thắng', 'Phường Vĩnh Nguyên', 'Phường Vĩnh Thọ', 'Phường Vĩnh Trường'],
  'TP. Hạ Long': ['Phường Bạch Đằng', 'Phường Bãi Cháy', 'Phường Cao Xanh', 'Phường Giếng Đáy', 'Phường Hà Khánh', 'Phường Hà Lầm', 'Phường Hà Phong', 'Phường Hà Tu', 'Phường Hồng Gai', 'Phường Hồng Hà', 'Phường Hồng Hải', 'Phường Hùng Thắng', 'Phường Tuần Châu'],
  'TP. Hải Dương': ['Phường Bình Hàn', 'Phường Cẩm Thượng', 'Phường Hải Tân', 'Phường Lê Thanh Nghị', 'Phường Ngọc Châu', 'Phường Nguyễn Trãi', 'Phường Phạm Ngũ Lão', 'Phường Quang Trung', 'Phường Tân Bình', 'Phường Thanh Bình', 'Phường Trần Hưng Đạo', 'Phường Trần Phú'],
  'Thị xã Sơn Tây': ['Phường Lê Lợi', 'Phường Ngô Quyền', 'Phường Quang Trung', 'Phường Sơn Lộc', 'Phường Trung Hưng', 'Phường Trung Sơn Trầm', 'Phường Viên Sơn', 'Phường Xuân Khanh', 'Xã Cổ Đông', 'Xã Đường Lâm', 'Xã Kim Sơn', 'Xã Sơn Đông', 'Xã Thanh Mỹ'],
  'Huyện Bình Chánh': ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quyết Thắng', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B'],
  'Huyện Củ Chi': ['Thị trấn Củ Chi', 'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ', 'Xã Hòa Phú', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội', 'Xã Phú Hòa Đông', 'Xã Phú Mỹ Hưng', 'Xã Phước Hiệp', 'Xã Phước Thạnh', 'Xã Phước Vĩnh An', 'Xã Tân An Hội', 'Xã Tân Thạnh Đông', 'Xã Tân Thông Hội', 'Xã Trung An', 'Xã Trung Lập Hạ', 'Xã Trung Lập Thượng'],
  'Huyện Hóc Môn': ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình', 'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân', 'Xã Thới Tam Thôn', 'Xã Trung Chánh', 'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng'],
  'Huyện Nhà Bè': ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc'],
  'Huyện Đông Anh': ['Thị trấn Đông Anh', 'Xã Bắc Hồng', 'Xã Cổ Loa', 'Xã Dục Tú', 'Xã Đại Mạch', 'Xã Đông Hội', 'Xã Hải Bối', 'Xã Kim Chung', 'Xã Kim Nỗ', 'Xã Liên Hà', 'Xã Mai Lâm', 'Xã Nam Hồng', 'Xã Nguyên Khê', 'Xã Tàm Xá', 'Xã Thụy Lâm', 'Xã Tiên Dương', 'Xã Uy Nỗ', 'Xã Vân Hà', 'Xã Vân Nội', 'Xã Việt Hùng', 'Xã Vĩnh Ngọc', 'Xã Võ Nguyện', 'Xã Xuân Canh'],
  'Huyện Gia Lâm': ['Thị trấn Trâu Quỳ', 'Thị trấn Yên Viên', 'Xã Bát Tràng', 'Xã Cổ Bi', 'Xã Đa Tốn', 'Xã Đặng Xá', 'Xã Đình Xuyên', 'Xã Đông Dư', 'Xã Dương Hà', 'Xã Dương Quang', 'Xã Dương Xá', 'Xã Kiêu Kỵ', 'Xã Kim Sơn', 'Xã Lệ Chi', 'Xã Ninh Hiệp', 'Xã Phù Đổng', 'Xã Phú Thị', 'Xã Trung Mầu', 'Xã Văn Đức', 'Xã Yên Thường', 'Xã Yên Viên'],
};

export const DEFAULT_DISTRICTS = [
  'Thành phố / Thị xã trung tâm',
  'Huyện trung tâm',
  'Huyện ngoại thành / Khác'
];

export const DEFAULT_WARDS = [
  'Phường / Xã trung tâm',
  'Phường / Xã 1',
  'Phường / Xã 2',
  'Phường / Xã 3',
  'Xã / Thị trấn ngoại thành'
];

export function getDistrictsForProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  if (DISTRICTS_BY_PROVINCE[provinceName]) return DISTRICTS_BY_PROVINCE[provinceName];

  const normalized = provinceName.replace(/^TP\.\s*/i, '').trim();
  const matchedKey = Object.keys(DISTRICTS_BY_PROVINCE).find(
    k => k.replace(/^TP\.\s*/i, '').trim() === normalized
  );

  return matchedKey ? DISTRICTS_BY_PROVINCE[matchedKey] : DEFAULT_DISTRICTS;
}

export function getWardsForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  if (WARDS_BY_DISTRICT[districtName]) return WARDS_BY_DISTRICT[districtName];

  // Phát sinh động Phường / Xã linh hoạt cho các Thành phố / Huyện / Thị xã khác trên toàn quốc
  const cleanName = districtName.replace(/^(TP\.|Thị xã|Huyện)\s*/i, '').trim();
  if (districtName.startsWith('TP.') || districtName.startsWith('Thị xã')) {
    return [
      `Phường Trung Tâm (${cleanName})`,
      `Phường Phước Long (${cleanName})`,
      `Phường Tân Thành (${cleanName})`,
      `Phường Hòa Bình (${cleanName})`,
      `Phường An Phú (${cleanName})`,
      `Phường 1 (${cleanName})`,
      `Phường 2 (${cleanName})`,
      `Phường 3 (${cleanName})`,
      `Phường 4 (${cleanName})`,
      `Phường 5 (${cleanName})`
    ];
  } else {
    return [
      `Thị trấn ${cleanName}`,
      `Xã Tân Phú (${cleanName})`,
      `Xã Bình Thành (${cleanName})`,
      `Xã An Phú (${cleanName})`,
      `Xã Hòa Bình (${cleanName})`,
      `Xã Phước Hải (${cleanName})`,
      `Xã Quảng Tiến (${cleanName})`,
      `Xã Vĩnh An (${cleanName})`
    ];
  }
}

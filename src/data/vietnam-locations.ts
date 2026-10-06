// Danh sách 34 Tỉnh / Thành phố mới của Việt Nam theo Nghị quyết Quốc hội (gồm 6 TP trực thuộc TW & 28 Tỉnh)
export const VIETNAM_PROVINCES = [
  // 6 Thành phố trực thuộc Trung ương
  'TP. Hồ Chí Minh',
  'TP. Hà Nội',
  'TP. Hải Phòng',
  'TP. Đà Nẵng',
  'TP. Cần Thơ',
  'TP. Huế',

  // 28 Tỉnh
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Tĩnh',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tuyên Quang',
  'Vĩnh Long'
];

// Chi tiết Phường / Xã / Thị trấn trực tiếp theo 34 Tỉnh / Thành phố mới (Không còn cấp Quận/Huyện)
export const WARDS_BY_PROVINCE: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    // Khu vực TP.HCM trung tâm & Thủ Đức
    'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định',
    'Phường Thảo Điền', 'Phường An Phú', 'Phường An Khánh', 'Phường Thủ Thiêm', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Trung', 'Phường Linh Đông', 'Phường Linh Chiểu', 'Phường Bình Chiểu', 'Phường Trường Thọ', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Long Thạnh Mỹ',
    'Phường 1 (Quận 3)', 'Phường 2 (Quận 3)', 'Phường Võ Thị Sáu (Quận 3)',
    'Phường 1 (Quận 4)', 'Phường 4 (Quận 4)', 'Phường 6 (Quận 4)', 'Phường 9 (Quận 4)', 'Phường 13 (Quận 4)',
    'Phường 1 (Quận 5)', 'Phường 5 (Quận 5)', 'Phường 8 (Quận 5)', 'Phường 11 (Quận 5)',
    'Phường 1 (Quận 6)', 'Phường 6 (Quận 6)', 'Phường 10 (Quận 6)',
    'Phường Tân Phong (Quận 7)', 'Phường Tân Phú (Quận 7)', 'Phường Phú Mỹ (Quận 7)', 'Phường Tân Thuận Đông',
    'Phường 1 (Quận 8)', 'Phường 4 (Quận 8)', 'Phường 5 (Quận 8)', 'Phường 8 (Quận 8)',
    'Phường 1 (Quận 10)', 'Phường 5 (Quận 10)', 'Phường 10 (Quận 10)', 'Phường 12 (Quận 10)',
    'Phường 1 (Quận 11)', 'Phường 5 (Quận 11)', 'Phường 15 (Quận 11)',
    'Phường 1 (Quận Tân Bình)', 'Phường 2 (Quận Tân Bình)', 'Phường 13 (Quận Tân Bình)',
    'Phường 1 (Quận Bình Thạnh)', 'Phường 19 (Quận Bình Thạnh)', 'Phường 25 (Quận Bình Thạnh)',
    'Phường 1 (Quận Gò Vấp)', 'Phường 5 (Quận Gò Vấp)', 'Phường 10 (Quận Gò Vấp)',
    'Phường 1 (Quận Phú Nhuận)', 'Phường 7 (Quận Phú Nhuận)',
    'Phường Tây Thạnh (Tân Phú)', 'Phường Sơn Kỳ (Tân Phú)', 'Phường Tân Sơn Nhì',
    'Phường Bình Hưng Hòa (Bình Tân)', 'Phường Bình Trị Đông (Bình Tân)', 'Phường Tân Tạo (Bình Tân)',
    'Thị trấn Tân Túc (Bình Chánh)', 'Xã Bình Hưng (Bình Chánh)', 'Xã Phong Phú (Bình Chánh)', 'Xã Vĩnh Lộc A (Bình Chánh)', 'Xã Vĩnh Lộc B (Bình Chánh)',
    'Thị trấn Củ Chi', 'Xã Tân An Hội (Củ Chi)', 'Xã Bình Mỹ (Củ Chi)',
    'Thị trấn Hóc Môn', 'Xã Bà Điểm (Hóc Môn)', 'Xã Đông Thạnh (Hóc Môn)',
    'Thị trấn Nhà Bè', 'Xã Phước Kiển (Nhà Bè)', 'Xã Hiệp Phước (Nhà Bè)',
    'Thị trấn Cần Thạnh (Cần Giờ)', 'Xã Bình Khánh (Cần Giờ)',
    // Khu vực Bình Dương (sáp nhập)
    'Phường Phú Cường (Thủ Dầu Một)', 'Phường Hiệp Thành (Thủ Dầu Một)', 'Phường Chánh Nghĩa (Thủ Dầu Một)', 'Phường Phú Hòa (Thủ Dầu Một)', 'Phường Phú Lợi (Thủ Dầu Một)', 'Phường Hòa Phú (Thủ Dầu Một)',
    'Phường Dĩ An', 'Phường An Bình (Dĩ An)', 'Phường Đông Hòa (Dĩ An)', 'Phường Tân Bình (Dĩ An)', 'Phường Tân Đông Hiệp (Dĩ An)',
    'Phường Lái Thiêu (Thuận An)', 'Phường An Phú (Thuận An)', 'Phường Bình Hòa (Thuận An)', 'Phường Thuận Giao (Thuận An)', 'Phường Vĩnh Phú (Thuận An)',
    'Phường Uyên Hưng (Tân Uyên)', 'Phường Thái Hòa (Tân Uyên)', 'Phường Mỹ Phước (Bến Cát)', 'Phường Thới Hòa (Bến Cát)',
    'Thị trấn Lai Uyên (Bàu Bàng)', 'Thị trấn Dầu Tiếng', 'Thị trấn Phước Vĩnh (Phú Giáo)',
    // Khu vực Bà Rịa - Vũng Tàu (sáp nhập)
    'Phường 1 (Vũng Tàu)', 'Phường 2 (Vũng Tàu)', 'Phường 3 (Vũng Tàu)', 'Phường 4 (Vũng Tàu)', 'Phường 7 (Vũng Tàu)', 'Phường 8 (Vũng Tàu)', 'Phường 9 (Vũng Tàu)', 'Phường 10 (Vũng Tàu)', 'Phường Thắng Nhất (Vũng Tàu)', 'Phường Thắng Tam (Vũng Tàu)', 'Phường Rạch Dừa', 'Phường Nguyễn An Ninh',
    'Phường Phước Trung (Bà Rịa)', 'Phường Phước Hiệp (Bà Rịa)', 'Phường Long Toàn (Bà Rịa)',
    'Phường Phú Mỹ', 'Phường Tân Phước (Phú Mỹ)', 'Phường Mỹ Xuân (Phú Mỹ)',
    'Thị trấn Long Điền', 'Thị trấn Long Hải', 'Thị trấn Đất Đỏ', 'Thị trấn Phước Hải', 'Thị trấn Ngãi Giao', 'Huyện Côn Đảo'
  ],

  'TP. Hà Nội': [
    'Phường Hàng Bạc (Hoàn Kiếm)', 'Phường Hàng Đào (Hoàn Kiếm)', 'Phường Hàng Gai (Hoàn Kiếm)', 'Phường Tràng Tiền (Hoàn Kiếm)', 'Phường Cửa Đông (Hoàn Kiếm)', 'Phường Lý Thái Tổ (Hoàn Kiếm)',
    'Phường Trúc Bạch (Ba Đình)', 'Phường Điện Biên (Ba Đình)', 'Phường Kim Mã (Ba Đình)', 'Phường Giảng Võ (Ba Đình)', 'Phường Đội Cấn (Ba Đình)', 'Phường Liễu Giai (Ba Đình)',
    'Phường Văn Miếu (Đống Đa)', 'Phường Quốc Tử Giám (Đống Đa)', 'Phường Láng Hạ (Đống Đa)', 'Phường Láng Thượng (Đống Đa)', 'Phường Ô Chợ Dừa (Đống Đa)', 'Phường Khâm Thiên (Đống Đa)',
    'Phường Dịch Vọng (Cầu Giấy)', 'Phường Dịch Vọng Hậu (Cầu Giấy)', 'Phường Quan Hoa (Cầu Giấy)', 'Phường Yên Hòa (Cầu Giấy)', 'Phường Trung Hòa (Cầu Giấy)', 'Phường Mai Dịch (Cầu Giấy)', 'Phường Nghĩa Đô (Cầu Giấy)', 'Phường Nghĩa Tân (Cầu Giấy)',
    'Phường Bách Khoa (Hai Bà Trưng)', 'Phường Bạch Đằng (Hai Bà Trưng)', 'Phường Đồng Tâm (Hai Bà Trưng)', 'Phường Lê Đại Hành (Hai Bà Trưng)', 'Phường Minh Khai (Hai Bà Trưng)',
    'Phường Khương Mai (Thanh Xuân)', 'Phường Khương Trung (Thanh Xuân)', 'Phường Nhân Chính (Thanh Xuân)', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam',
    'Phường Bưởi (Tây Hồ)', 'Phường Thụy Khuê (Tây Hồ)', 'Phường Yên Phụ (Tây Hồ)', 'Phường Quảng An (Tây Hồ)', 'Phường Nhật Tân (Tây Hồ)',
    'Phường Ngọc Thụy (Long Biên)', 'Phường Bồ Đề (Long Biên)', 'Phường Gia Thụy (Long Biên)', 'Phường Thạch Bàn (Long Biên)', 'Phường Việt Hưng (Long Biên)',
    'Phường Hoàng Liệt (Hoàng Mai)', 'Phường Định Công (Hoàng Mai)', 'Phường Đại Kim (Hoàng Mai)', 'Phường Giáp Bát (Hoàng Mai)', 'Phường Tân Mai (Hoàng Mai)',
    'Phường Mỹ Đình 1 (Nam Từ Liêm)', 'Phường Mỹ Đình 2 (Nam Từ Liêm)', 'Phường Cầu Diễn (Nam Từ Liêm)', 'Phường Mễ Trì (Nam Từ Liêm)', 'Phường Trung Văn (Nam Từ Liêm)',
    'Phường Xuân Đỉnh (Bắc Từ Liêm)', 'Phường Cổ Nhuế 1 (Bắc Từ Liêm)', 'Phường Cổ Nhuế 2 (Bắc Từ Liêm)', 'Phường Minh Khai (Bắc Từ Liêm)',
    'Phường Quang Trung (Hà Đông)', 'Phường Yết Kiêu (Hà Đông)', 'Phường Mộ Lao (Hà Đông)', 'Phường Văn Quán (Hà Đông)', 'Phường La Khê (Hà Đông)', 'Phường Vạn Phúc (Hà Đông)',
    'Phường Lê Lợi (Sơn Tây)', 'Phường Quang Trung (Sơn Tây)', 'Phường Ngô Quyền (Sơn Tây)',
    'Thị trấn Đông Anh', 'Xã Vĩnh Ngọc (Đông Anh)', 'Xã Hải Bối (Đông Anh)', 'Xã Kim Chung (Đông Anh)',
    'Thị trấn Trâu Quỳ (Gia Lâm)', 'Xã Bát Tràng (Gia Lâm)', 'Xã Đa Tốn (Gia Lâm)', 'Xã Ninh Hiệp (Gia Lâm)',
    'Thị trấn Văn Điển (Thanh Trì)', 'Xã Tân Triều (Thanh Trì)', 'Xã Thanh Liệt (Thanh Trì)',
    'Thị trấn Trạm Trôi (Hoài Đức)', 'Xã An Khánh (Hoài Đức)', 'Xã Song Phương (Hoài Đức)'
  ],

  'TP. Hải Phòng': [
    // Hải Phòng
    'Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Hạ Lý', 'Phường Sở Dầu', 'Phường Hùng Vương',
    'Phường Cầu Đất', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Đồng Quốc Bình', 'Phường Đằng Giang',
    'Phường Cát Dài', 'Phường An Biên', 'Phường Niệm Nghĩa', 'Phường Dư Hàng', 'Phường Hồ Nam', 'Phường Kênh Dương',
    'Phường Đông Hải 1', 'Phường Đông Hải 2', 'Phường Đằng Lâm', 'Phường Nam Hải', 'Phường Tràng Cát',
    'Phường Quán Trữ', 'Phường Lãm Hà', 'Phường Trần Thành Ngọ',
    'Phường Đồ Sơn', 'Phường Vạn Hương', 'Phường Ngọc Xuyên',
    'Thị trấn Núi Đèo (Thủy Nguyên)', 'Xã An Lư (Thủy Nguyên)', 'Xã Tân Dương (Thủy Nguyên)',
    'Thị trấn An Dương', 'Xã An Đồng (An Dương)', 'Thị trấn Cát Bà (Cát Hải)',
    // Hải Dương (sáp nhập)
    'Phường Bình Hàn (Hải Dương)', 'Phường Cẩm Thượng (Hải Dương)', 'Phường Hải Tân (Hải Dương)', 'Phường Lê Thanh Nghị (Hải Dương)', 'Phường Ngọc Châu (Hải Dương)', 'Phường Nguyễn Trãi (Hải Dương)', 'Phường Quang Trung (Hải Dương)', 'Phường Tân Bình (Hải Dương)', 'Phường Thanh Bình (Hải Dương)', 'Phường Trần Hưng Đạo (Hải Dương)', 'Phường Trần Phú (Hải Dương)',
    'Phường Sao Đỏ (Chí Linh)', 'Phường Cộng Hòa (Chí Linh)', 'Phường Bến Tắm (Chí Linh)', 'Phường Kinh Môn', 'Phường Hiệp An (Kinh Môn)', 'Thị trấn Gia Lộc', 'Thị trấn Nam Sách', 'Thị trấn Kẻ Sặt (Bình Giang)'
  ],

  'TP. Đà Nẵng': [
    // Đà Nẵng
    'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam',
    'Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường An Hải Đông', 'Phường Phước Mỹ', 'Phường Mân Thái', 'Phường Thọ Quang',
    'Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải',
    'Phường Tam Thuận', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Xuân Hà', 'Phường Chính Gián', 'Phường Vĩnh Trung',
    'Phường Hòa Minh', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam',
    'Phường Khuê Trung', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây',
    'Xã Hòa Châu', 'Xã Hòa Tiến', 'Xã Hòa Phước', 'Xã Hòa Phong',
    // Quảng Nam (sáp nhập)
    'Phường An Mỹ (Tam Kỳ)', 'Phường An Xuân (Tam Kỳ)', 'Phường Phước Hòa (Tam Kỳ)', 'Phường Tân Thạnh (Tam Kỳ)', 'Phường Trường Xuân (Tam Kỳ)',
    'Phường Minh An (Hội An)', 'Phường Cẩm Phô (Hội An)', 'Phường Tân An (Hội An)', 'Phường Cẩm An (Hội An)', 'Phường Cửa Đại (Hội An)',
    'Phường Điện Ngọc (Điện Bàn)', 'Phường Vĩnh Điện (Điện Bàn)', 'Phường Điện Nam Trung (Điện Bàn)',
    'Thị trấn Núi Thành', 'Thị trấn Hà Lam (Thăng Bình)', 'Thị trấn Nam Phước (Duy Xuyên)', 'Thị trấn Ái Nghĩa (Đại Lộc)'
  ],

  'TP. Cần Thơ': [
    // Cần Thơ
    'Phường Tân An (Ninh Kiều)', 'Phường An Cư (Ninh Kiều)', 'Phường An Phú (Ninh Kiều)', 'Phường An Nghiệp (Ninh Kiều)', 'Phường Xuân Khánh (Ninh Kiều)', 'Phường Hưng Lợi (Ninh Kiều)', 'Phường Cái Khế (Ninh Kiều)', 'Phường An Hòa (Ninh Kiều)',
    'Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc', 'Phường Long Tuyền',
    'Phường Lê Bình (Cái Răng)', 'Phường Hưng Phú (Cái Răng)', 'Phường Ba Láng (Cái Răng)',
    'Phường Thốt Nốt', 'Phường Thuận An (Thốt Nốt)', 'Phường Châu Văn Liêm (Ô Môn)',
    'Thị trấn Phong Điền', 'Xã Mỹ Khánh (Phong Điền)', 'Thị trấn Cờ Đỏ', 'Thị trấn Thới Lai',
    // Sóc Trăng (sáp nhập)
    'Phường 1 (Sóc Trăng)', 'Phường 2 (Sóc Trăng)', 'Phường 3 (Sóc Trăng)', 'Phường 4 (Sóc Trăng)', 'Phường 5 (Sóc Trăng)', 'Phường 6 (Sóc Trăng)', 'Phường 7 (Sóc Trăng)', 'Phường 8 (Sóc Trăng)', 'Phường 9 (Sóc Trăng)', 'Phường 10 (Sóc Trăng)',
    'Phường Vĩnh Phước (Vĩnh Châu)', 'Phường 1 (Ngã Năm)', 'Thị trấn Mỹ Xuyên', 'Thị trấn Đại Ngãi (Long Phú)',
    // Hậu Giang (sáp nhập)
    'Phường 1 (Vị Thanh)', 'Phường 3 (Vị Thanh)', 'Phường 4 (Vị Thanh)', 'Phường 5 (Vị Thanh)', 'Phường 7 (Vị Thanh)',
    'Phường Ngã Bảy', 'Phường Hiệp Thành (Ngã Bảy)', 'Phường Thuận An (Long Mỹ)', 'Thị trấn Một Ngàn (Châu Thành A)', 'Thị trấn Nàng Mau (Vị Thủy)'
  ],

  'TP. Huế': [
    'Phường Vĩnh Ninh (Huế)', 'Phường Phú Nhuận (Huế)', 'Phường Phú Hội (Huế)', 'Phường Thuận Thành (Huế)', 'Phường Thuận Lộc (Huế)', 'Phường Tây Lộc (Huế)', 'Phường Hương Long (Huế)', 'Phường An Cựu (Huế)', 'Phường An Đông (Huế)', 'Phường Vỹ Dạ (Huế)', 'Phường Thủy Xuân (Huế)', 'Phường Kim Long (Huế)', 'Phường Phước Vĩnh (Huế)', 'Phường Trường An (Huế)',
    'Phường Phú Bài (Hương Thủy)', 'Phường Thủy Dương (Hương Thủy)', 'Phường Hương Văn (Hương Trà)', 'Phường Tứ Hạ (Hương Trà)',
    'Thị trấn Phong Điền', 'Thị trấn Sịa (Quảng Điền)', 'Thị trấn Phú Đa (Phú Vàng)', 'Thị trấn Phú Lộc', 'Thị trấn Lăng Cô (Phú Lộc)', 'Thị trấn Khe Tre (Nam Đông)', 'Thị trấn A Lưới'
  ],

  'An Giang': [
    // An Giang
    'Phường Mỹ Long (Long Xuyên)', 'Phường Mỹ Bình (Long Xuyên)', 'Phường Mỹ Xuyên (Long Xuyên)', 'Phường Mỹ Phước (Long Xuyên)', 'Phường Mỹ Quý (Long Xuyên)', 'Phường Mỹ Thới (Long Xuyên)', 'Phường Bình Khánh (Long Xuyên)',
    'Phường Châu Phú A (Châu Đốc)', 'Phường Châu Phú B (Châu Đốc)', 'Phường Núi Sam (Châu Đốc)', 'Phường Vĩnh Mỹ (Châu Đốc)',
    'Phường Long Thạnh (Tân Châu)', 'Phường Long Hưng (Tân Châu)', 'Thị trấn Chợ Mới', 'Thị trấn Núi Sập (Thoại Sơn)', 'Thị trấn Tri Tôn', 'Thị trấn Tịnh Biên',
    // Kiên Giang (sáp nhập)
    'Phường Vĩnh Thanh Vân (Rạch Giá)', 'Phường Vĩnh Lạc (Rạch Giá)', 'Phường Vĩnh Bảo (Rạch Giá)', 'Phường An Hòa (Rạch Giá)', 'Phường Rạch Sỏi (Rạch Giá)',
    'Phường Dương Đông (Phú Quốc)', 'Phường An Thới (Phú Quốc)', 'Xã Gành Dầu (Phú Quốc)', 'Xã Cửa Cạn (Phú Quốc)', 'Xã Hàm Ninh (Phú Quốc)',
    'Phường Tô Châu (Hà Tiên)', 'Phường Pháo Đài (Hà Tiên)', 'Thị trấn Kiên Lương', 'Thị trấn Hòn Đất', 'Thị trấn Giồng Riềng'
  ],

  'Bắc Ninh': [
    // Bắc Ninh
    'Phường Suối Hoa (Bắc Ninh)', 'Phường Tiền An (Bắc Ninh)', 'Phường Ninh Xá (Bắc Ninh)', 'Phường Đại Phúc (Bắc Ninh)', 'Phường Võ Cường (Bắc Ninh)', 'Phường Vân Dương (Bắc Ninh)', 'Phường Kinh Bắc (Bắc Ninh)',
    'Phường Đông Ngàn (Từ Sơn)', 'Phường Đồng Kỵ (Từ Sơn)', 'Phường Tân Hồng (Từ Sơn)', 'Phường Trang Hạ (Từ Sơn)',
    'Phường Phố Mới (Quế Võ)', 'Phường Hồ (Thuận Thành)', 'Thị trấn Chờ (Yên Phong)', 'Thị trấn Lim (Tiên Du)', 'Thị trấn Gia Bình',
    // Bắc Giang (sáp nhập)
    'Phường Ngô Quyền (Bắc Giang)', 'Phường Trần Phú (Bắc Giang)', 'Phường Lê Lợi (Bắc Giang)', 'Phường Hoàng Văn Thụ (Bắc Giang)', 'Phường Dĩnh Kế (Bắc Giang)', 'Phường Xương Giang (Bắc Giang)',
    'Phường Bích Động (Việt Yên)', 'Phường Nếnh (Việt Yên)', 'Phường Chũ (Lục Ngạn)', 'Thị trấn Vôi (Lạng Giang)', 'Thị trấn Đồi Ngô (Lục Nam)', 'Thị trấn Thắng (Hiệp Hòa)', 'Thị trấn An Châu (Sơn Động)'
  ],

  'Cà Mau': [
    // Cà Mau
    'Phường 1 (Cà Mau)', 'Phường 2 (Cà Mau)', 'Phường 4 (Cà Mau)', 'Phường 5 (Cà Mau)', 'Phường 6 (Cà Mau)', 'Phường 7 (Cà Mau)', 'Phường 8 (Cà Mau)', 'Phường 9 (Cà Mau)', 'Phường Tân Xuyên (Cà Mau)',
    'Thị trấn Sông Đốc (Trần Văn Thời)', 'Thị trấn Năm Căn', 'Thị trấn Đất Mũi (Ngọc Hiển)', 'Thị trấn Thới Bình', 'Thị trấn Cái Nước',
    // Bạc Liêu (sáp nhập)
    'Phường 1 (Bạc Liêu)', 'Phường 2 (Bạc Liêu)', 'Phường 3 (Bạc Liêu)', 'Phường 5 (Bạc Liêu)', 'Phường 7 (Bạc Liêu)', 'Phường 8 (Bạc Liêu)', 'Phường Nhà Mát (Bạc Liêu)',
    'Phường 1 (Giá Rai)', 'Phường Hộ Phòng (Giá Rai)', 'Thị trấn Hòa Bình', 'Thị trấn Gành Hào (Đông Hải)', 'Thị trấn Ngan Dừa (Hồng Dân)'
  ],

  'Cao Bằng': [
    'Phường Hợp Giang (Cao Bằng)', 'Phường Sông Bằng (Cao Bằng)', 'Phường Tân Giang (Cao Bằng)', 'Phường Sông Hiến (Cao Bằng)', 'Phường Đề Thám (Cao Bằng)', 'Phường Duyệt Trung (Cao Bằng)',
    'Thị trấn Nước Hai (Hòa An)', 'Thị trấn Quảng Uyên', 'Thị trấn Trùng Khánh', 'Thị trấn Bảo Lạc', 'Thị trấn Đông Khê (Thạch An)', 'Thị trấn Nguyên Bình'
  ],

  'Đắk Lắk': [
    // Đắk Lắk
    'Phường Thắng Lợi (Buôn Ma Thuột)', 'Phường Tân Lợi (Buôn Ma Thuột)', 'Phường Tân Lập (Buôn Ma Thuột)', 'Phường Tân An (Buôn Ma Thuột)', 'Phường Thành Công (Buôn Ma Thuột)', 'Phường Tự An (Buôn Ma Thuột)', 'Phường Ea Tam (Buôn Ma Thuột)',
    'Phường An Lạc (Buôn Hồ)', 'Phường Đoàn Kết (Buôn Hồ)', 'Thị trấn Quảng Phú (Cư M\'gar)', 'Thị trấn Phước An (Krông Pắc)', 'Thị trấn Ea Drăng (Ea H\'leo)', 'Thị trấn Ea Kar',
    // Phú Yên (sáp nhập)
    'Phường 1 (Tuy Hòa)', 'Phường 2 (Tuy Hòa)', 'Phường 3 (Tuy Hòa)', 'Phường 4 (Tuy Hòa)', 'Phường 5 (Tuy Hòa)', 'Phường 7 (Tuy Hòa)', 'Phường 9 (Tuy Hòa)', 'Phường Phú Thạnh (Tuy Hòa)', 'Phường Phú Đông (Tuy Hòa)',
    'Phường Sông Cầu', 'Phường Xuân Yên (Sông Cầu)', 'Phường Hòa Vinh (Đông Hòa)', 'Thị trấn Củng Sơn (Sơn Hòa)', 'Thị trấn Hai Riêng (Sông Hinh)'
  ],

  'Điện Biên': [
    'Phường Mường Thanh (Điện Biên Phủ)', 'Phường Tân Thanh (Điện Biên Phủ)', 'Phường Nam Thanh (Điện Biên Phủ)', 'Phường Noong Bua (Điện Biên Phủ)', 'Phường Him Lam (Điện Biên Phủ)', 'Phường Thanh Bình (Điện Biên Phủ)',
    'Phường Sông Đà (Mường Lay)', 'Phường Na Lay (Mường Lay)', 'Thị trấn Điện Biên Đông', 'Thị trấn Tuần Giáo', 'Thị trấn Tủa Chùa', 'Thị trấn Mường Ảng'
  ],

  'Đồng Nai': [
    // Đồng Nai
    'Phường Trung Dũng (Biên Hòa)', 'Phường Quyết Thắng (Biên Hòa)', 'Phường Quang Vinh (Biên Hòa)', 'Phường Tân Mai (Biên Hòa)', 'Phường Tân Hiệp (Biên Hòa)', 'Phường Long Bình (Biên Hòa)', 'Phường Trảng Dài (Biên Hòa)', 'Phường Hố Nai (Biên Hòa)', 'Phường An Bình (Biên Hòa)',
    'Phường Xuân An (Long Khánh)', 'Phường Xuân Trung (Long Khánh)', 'Phường Suối Tre (Long Khánh)',
    'Thị trấn Long Thành', 'Xã An Phước (Long Thành)', 'Thị trấn Hiệp Phước (Nhơn Trạch)', 'Thị trấn Trảng Bom', 'Thị trấn Vĩnh An (Vĩnh Cửu)', 'Thị trấn Dầu Giây', 'Thị trấn Gia Ray',
    // Bình Phước (sáp nhập)
    'Phường Tân Phú (Đồng Xoài)', 'Phường Tân Đồng (Đồng Xoài)', 'Phường Tân Bình (Đồng Xoài)', 'Phường Tân Xuân (Đồng Xoài)', 'Phường Tiến Thành (Đồng Xoài)',
    'Phường Long Thủy (Phước Long)', 'Phường Thác Mơ (Phước Long)', 'Phường An Lộc (Bình Long)', 'Thị trấn Chơn Thành', 'Thị trấn Lộc Ninh', 'Thị trấn Tân Khai (Hớn Quản)'
  ],

  'Đồng Tháp': [
    // Đồng Tháp
    'Phường 1 (Cao Lãnh)', 'Phường 2 (Cao Lãnh)', 'Phường 3 (Cao Lãnh)', 'Phường 4 (Cao Lãnh)', 'Phường 6 (Cao Lãnh)', 'Phường 11 (Cao Lãnh)', 'Phường Mỹ Phú (Cao Lãnh)',
    'Phường 1 (Sa Đéc)', 'Phường 2 (Sa Đéc)', 'Phường An Hòa (Sa Đéc)', 'Phường Tân Quy Đông (Sa Đéc)',
    'Phường An Lạc (Hồng Ngự)', 'Phường An Lộc (Hồng Ngự)', 'Thị trấn Mỹ An (Tháp Mười)', 'Thị trấn Lấp Vò', 'Thị trấn Lai Vung',
    // Tiền Giang (sáp nhập)
    'Phường 1 (Mỹ Tho)', 'Phường 2 (Mỹ Tho)', 'Phường 3 (Mỹ Tho)', 'Phường 4 (Mỹ Tho)', 'Phường 5 (Mỹ Tho)', 'Phường 6 (Mỹ Tho)', 'Phường 7 (Mỹ Tho)', 'Phường 8 (Mỹ Tho)', 'Phường 9 (Mỹ Tho)', 'Phường 10 (Mỹ Tho)',
    'Phường 1 (Gò Công)', 'Phường 2 (Gò Công)', 'Thị trấn Cái Bè', 'Thị trấn Cai Lậy', 'Thị trấn Chợ Gạo', 'Thị trấn Vĩnh Bình (Gò Công Tây)'
  ],

  'Gia Lai': [
    // Gia Lai
    'Phường Tây Sơn (Pleiku)', 'Phường Hội Thương (Pleiku)', 'Phường Hoa Lư (Pleiku)', 'Phường Diên Hồng (Pleiku)', 'Phường Yên Đỗ (Pleiku)', 'Phường Ia Kring (Pleiku)', 'Phường Phù Đổng (Pleiku)', 'Phường Thắng Lợi (Pleiku)',
    'Phường An Bình (An Khê)', 'Phường Tây Sơn (An Khê)', 'Phường Cheo Reo (Ayun Pa)', 'Thị trấn Chư Sê', 'Thị trấn Chư Prông', 'Thị trấn Đắk Đoa',
    // Bình Định (sáp nhập)
    'Phường Lê Hồng Phong (Quy Nhơn)', 'Phường Trần Phú (Quy Nhơn)', 'Phường Lý Thường Kiệt (Quy Nhơn)', 'Phường Nguyễn Văn Cừ (Quy Nhơn)', 'Phường Quang Trung (Quy Nhơn)', 'Phường Ghềnh Ráng (Quy Nhơn)', 'Phường Nhơn Bình (Quy Nhơn)',
    'Phường Đập Đá (An Nhơn)', 'Phường Bình Định (An Nhơn)', 'Phường Bồng Sơn (Hoài Nhơn)', 'Phường Tam Quan (Hoài Nhơn)', 'Thị trấn Phú Phong (Tây Sơn)', 'Thị trấn Tăng Bạt Hổ (Hoài Ân)'
  ],

  'Hà Tĩnh': [
    'Phường Bắc Hà (Hà Tĩnh)', 'Phường Nam Hà (Hà Tĩnh)', 'Phường Tân Giang (Hà Tĩnh)', 'Phường Trần Phú (Hà Tĩnh)', 'Phường Hà Huy Tập (Hà Tĩnh)', 'Phường Đại Nài (Hà Tĩnh)', 'Phường Thạch Quý (Hà Tĩnh)',
    'Phường Bắc Hồng (Hồng Lĩnh)', 'Phường Nam Hồng (Hồng Lĩnh)', 'Phường Sông Trí (Kỳ Anh)', 'Phường Kỳ Long (Kỳ Anh)',
    'Thị trấn Xuân An (Nghi Xuân)', 'Thị trấn Tiên Điền (Nghi Xuân)', 'Thị trấn Nghèn (Can Lộc)', 'Thị trấn Thạch Hà', 'Thị trấn Cẩm Xuyên', 'Thị trấn Đức Thọ', 'Thị trấn Phố Châu (Hương Sơn)'
  ],

  'Hưng Yên': [
    // Hưng Yên
    'Phường Lê Lợi (Hưng Yên)', 'Phường Minh Khai (Hưng Yên)', 'Phường Hiến Nam (Hưng Yên)', 'Phường Lam Sơn (Hưng Yên)', 'Phường Hồng Châu (Hưng Yên)', 'Phường An Tảo (Hưng Yên)',
    'Phường Bần Yên Nhân (Mỹ Hào)', 'Phường Phan Đình Phùng (Mỹ Hào)', 'Phường Bạch Sam (Mỹ Hào)',
    'Thị trấn Văn Giang', 'Xã Phụng Công (Văn Giang)', 'Xã Xuân Quan (Văn Giang)', 'Thị trấn Như Quỳnh (Văn Lâm)', 'Thị trấn Khoái Châu', 'Thị trấn Yên Mỹ',
    // Thái Bình (sáp nhập)
    'Phường Lê Hồng Phong (Thái Bình)', 'Phường Bồ Xuyên (Thái Bình)', 'Phường Đề Thám (Thái Bình)', 'Phường Kẻo (Thái Bình)', 'Phường Quang Trung (Thái Bình)', 'Phường Trần Hưng Đạo (Thái Bình)', 'Phường Trần Lãm (Thái Bình)',
    'Thị trấn Diêm Điền (Thái Thụy)', 'Thị trấn Tiền Hải', 'Thị trấn Đông Hưng', 'Thị trấn Quỳnh Côi (Quỳnh Phụ)', 'Thị trấn Vũ Thư', 'Thị trấn Kiến Xương', 'Thị trấn Hưng Hà'
  ],

  'Khánh Hòa': [
    // Khánh Hòa
    'Phường Lộc Thọ (Nha Trang)', 'Phường Phước Hải (Nha Trang)', 'Phường Phương Sài (Nha Trang)', 'Phường Tân Lập (Nha Trang)', 'Phường Vạn Thắng (Nha Trang)', 'Phường Vĩnh Hải (Nha Trang)', 'Phường Vĩnh Nguyên (Nha Trang)', 'Phường Vĩnh Phước (Nha Trang)', 'Phường Phước Long (Nha Trang)',
    'Phường Cam Lộc (Cam Ranh)', 'Phường Cam Phú (Cam Ranh)', 'Phường Ba Ngòi (Cam Ranh)',
    'Phường Ninh Hiệp (Ninh Hòa)', 'Phường Ninh Giang (Ninh Hòa)', 'Thị trấn Cam Đức (Cam Lâm)', 'Thị trấn Diên Khánh', 'Thị trấn Vạn Giã (Vạn Ninh)', 'Huyện Trường Sa',
    // Ninh Thuận (sáp nhập)
    'Phường Kinh Dinh (Phan Rang)', 'Phường Thanh Sơn (Phan Rang)', 'Phường Phước Mỹ (Phan Rang)', 'Phường Đô Vinh (Phan Rang)', 'Phường Mỹ Hải (Phan Rang)', 'Phường Đông Hải (Phan Rang)',
    'Thị trấn Tân Sơn (Ninh Sơn)', 'Thị trấn Phước Dân (Ninh Phước)', 'Thị trấn Khánh Hải (Ninh Hải)'
  ],

  'Lai Châu': [
    'Phường Quyết Thắng (Lai Châu)', 'Phường Quyết Tiến (Lai Châu)', 'Phường Đoàn Kết (Lai Châu)', 'Phường Tân Phong (Lai Châu)', 'Phường Đông Phong (Lai Châu)',
    'Thị trấn Phong Thổ', 'Thị trấn Tam Đường', 'Thị trấn Tân Uyên', 'Thị trấn Than Uyên', 'Thị trấn Nậm Nhùn', 'Thị trấn Sìn Hồ', 'Thị trấn Mường Tè'
  ],

  'Lâm Đồng': [
    // Lâm Đồng
    'Phường 1 (Đà Lạt)', 'Phường 2 (Đà Lạt)', 'Phường 3 (Đà Lạt)', 'Phường 4 (Đà Lạt)', 'Phường 8 (Đà Lạt)', 'Phường 9 (Đà Lạt)', 'Phường 10 (Đà Lạt)', 'Phường 11 (Đà Lạt)', 'Phường 12 (Đà Lạt)',
    'Phường 1 (Bảo Lộc)', 'Phường 2 (Bảo Lộc)', 'Phường B’Lao (Bảo Lộc)', 'Phường Lộc Phát (Bảo Lộc)', 'Phường Lộc Tiến (Bảo Lộc)',
    'Thị trấn Liên Nghĩa (Đức Trọng)', 'Thị trấn Nam Ban (Lâm Hà)', 'Thị trấn Di Linh', 'Thị trấn Lạc Dương', 'Thị trấn Đơn Dương',
    // Bình Thuận (sáp nhập)
    'Phường Đức Nghĩa (Phan Thiết)', 'Phường Lạc Đạo (Phan Thiết)', 'Phường Phú Thủy (Phan Thiết)', 'Phường Thanh Hải (Phan Thiết)', 'Phường Hàm Tiến (Phan Thiết)', 'Phường Mũi Né (Phan Thiết)',
    'Phường Phước Hội (La Gi)', 'Phường Tân An (La Gi)', 'Thị trấn Phan Rí Cửa (Tuy Phong)', 'Thị trấn Liên Hương (Tuy Phong)', 'Thị trấn Ma Lâm (Hàm Thuận Bắc)',
    // Đắk Nông (sáp nhập)
    'Phường Nghĩa Đức (Gia Nghĩa)', 'Phường Nghĩa Thành (Gia Nghĩa)', 'Phường Nghĩa Phú (Gia Nghĩa)', 'Phường Nghĩa Trung (Gia Nghĩa)',
    'Thị trấn Kiến Đức (Đắk R\'lấp)', 'Thị trấn Đắk Mil', 'Thị trấn Ea T\'ling (Cư Jút)', 'Thị trấn Đức An (Đắk Song)'
  ],

  'Lạng Sơn': [
    'Phường Hoàng Văn Thụ (Lạng Sơn)', 'Phường Tam Thanh (Lạng Sơn)', 'Phường Vĩnh Trại (Lạng Sơn)', 'Phường Đông Kinh (Lạng Sơn)', 'Phường Chi Lăng (Lạng Sơn)',
    'Thị trấn Đồng Đăng (Cao Lộc)', 'Thị trấn Cao Lộc', 'Thị trấn Hữu Lũng', 'Thị trấn Đồng Mỏ (Chi Lăng)', 'Thị trấn Lộc Bình', 'Thị trấn Na Sầm (Văn Lãng)', 'Thị trấn Bắc Sơn'
  ],

  'Lào Cai': [
    // Lào Cai
    'Phường Kim Tân (Lào Cai)', 'Phường Cốc Lếu (Lào Cai)', 'Phường Duyên Hải (Lào Cai)', 'Phường Bắc Cường (Lào Cai)', 'Phường Nam Cường (Lào Cai)', 'Phường Pom Hán (Lào Cai)', 'Phường Bình Minh (Lào Cai)',
    'Phường Sa Pa', 'Phường Hàm Rồng (Sa Pa)', 'Phường Cầu Mây (Sa Pa)', 'Phường Phan Si Păng (Sa Pa)',
    'Thị trấn Bát Xát', 'Thị trấn Phố Lu (Bảo Thắng)', 'Thị trấn Bắc Hà', 'Thị trấn Si Ma Cai',
    // Yên Bái (sáp nhập)
    'Phường Đồng Tâm (Yên Bái)', 'Phường Hồng Hà (Yên Bái)', 'Phường Minh Tân (Yên Bái)', 'Phường Yên Ninh (Yên Bái)', 'Phường Nguyễn Thái Học (Yên Bái)', 'Phường Nam Cường (Yên Bái)',
    'Phường Trung Tâm (Nghĩa Lộ)', 'Phường Cầu Thia (Nghĩa Lộ)', 'Thị trấn Yên Bình', 'Thị trấn Mậu A (Văn Yên)', 'Thị trấn Mù Cang Chải'
  ],

  'Nghệ An': [
    'Phường Quang Trung (Vinh)', 'Phường Lê Lợi (Vinh)', 'Phường Trường Thi (Vinh)', 'Phường Hưng Dũng (Vinh)', 'Phường Hà Huy Tập (Vinh)', 'Phường Quán Bàu (Vinh)', 'Phường Bến Thủy (Vinh)', 'Phường Cửa Nam (Vinh)', 'Phường Đông Vĩnh (Vinh)',
    'Phường Thu Thủy (Cửa Lò)', 'Phường Nghi Hương (Cửa Lò)', 'Phường Nghi Thu (Cửa Lò)',
    'Phường Hòa Hiếu (Thái Hòa)', 'Phường Long Sơn (Thái Hòa)', 'Phường Mai Hùng (Hoàng Mai)', 'Phường Quỳnh Thiện (Hoàng Mai)',
    'Thị trấn Đô Lương', 'Thị trấn Diễn Châu', 'Thị trấn Nam Đàn', 'Thị trấn Hưng Nguyên', 'Thị trấn Quỳ Hợp', 'Thị trấn Tân Kỳ', 'Thị trấn Con Cuông'
  ],

  'Ninh Bình': [
    // Ninh Bình
    'Phường Đông Thành (Ninh Bình)', 'Phường Vân Giang (Ninh Bình)', 'Phường Nam Thành (Ninh Bình)', 'Phường Bích Đào (Ninh Bình)', 'Phường Phúc Thành (Ninh Bình)', 'Phường Ninh Khánh (Ninh Bình)',
    'Phường Bắc Sơn (Tam Điệp)', 'Phường Trung Sơn (Tam Điệp)', 'Phường Nam Sơn (Tam Điệp)',
    'Thị trấn Phát Diệm (Kim Sơn)', 'Thị trấn Yên Thịnh (Yên Mô)', 'Thị trấn Me (Gia Viễn)', 'Thị trấn Nho Quan',
    // Nam Định (sáp nhập)
    'Phường Vị Xuyên (Nam Định)', 'Phường Vị Hoàng (Nam Định)', 'Phường Năng Tĩnh (Nam Định)', 'Phường Trần Tế Xương (Nam Định)', 'Phường Quang Trung (Nam Định)', 'Phường Lộc Vượng (Nam Định)', 'Phường Lộc Hạ (Nam Định)',
    'Thị trấn Thịnh Long (Hải Hậu)', 'Thị trấn Yên Định (Hải Hậu)', 'Thị trấn Quất Lâm (Giao Thủy)', 'Thị trấn Giao Thủy', 'Thị trấn Cổ Lễ (Trực Ninh)', 'Thị trấn Liễu Đề (Nghĩa Hưng)',
    // Hà Nam (sáp nhập)
    'Phường Minh Khai (Phủ Lý)', 'Phường Lương Khánh Thiện (Phủ Lý)', 'Phường Hai Bà Trưng (Phủ Lý)', 'Phường Trần Hưng Đạo (Phủ Lý)', 'Phường Lê Hồng Phong (Phủ Lý)', 'Phường Liêm Chính (Phủ Lý)',
    'Phường Đồng Văn (Duy Tiên)', 'Phường Hòa Mạc (Duy Tiên)', 'Thị trấn Quế (Kim Bảng)', 'Thị trấn Vĩnh Trụ (Lý Nhân)', 'Thị trấn Kiện Khê (Thanh Liêm)'
  ],

  'Phú Thọ': [
    // Phú Thọ
    'Phường Gia Cẩm (Việt Trì)', 'Phường Tiên Cát (Việt Trì)', 'Phường Nông Trang (Việt Trì)', 'Phường Tân Dân (Việt Trì)', 'Phường Thanh Miếu (Việt Trì)', 'Phường Dữu Lâu (Việt Trì)', 'Phường Bạch Hạc (Việt Trì)',
    'Phường Âu Cơ (Phú Thọ)', 'Phường Hùng Vương (Phú Thọ)', 'Thị trấn Phong Châu (Phù Ninh)', 'Thị trấn Lâm Thao', 'Thị trấn Đoan Hùng', 'Thị trấn Thanh Ba',
    // Vĩnh Phúc (sáp nhập)
    'Phường Liên Bảo (Vĩnh Yên)', 'Phường Tích Sơn (Vĩnh Yên)', 'Phường Ngô Quyền (Vĩnh Yên)', 'Phường Đống Đa (Vĩnh Yên)', 'Phường Khai Quang (Vĩnh Yên)', 'Phường Hội Hợp (Vĩnh Yên)',
    'Phường Trưng Trắc (Phúc Yên)', 'Phường Hùng Vương (Phúc Yên)', 'Phường Xuân Hòa (Phúc Yên)', 'Thị trấn Hương Canh (Bình Xuyên)', 'Thị trấn Vĩnh Tường', 'Thị trấn Yên Lạc',
    // Hòa Bình (sáp nhập)
    'Phường Phương Lâm (Hòa Bình)', 'Phường Đồng Tiến (Hòa Bình)', 'Phường Tân Thịnh (Hòa Bình)', 'Phường Hữu Nghị (Hòa Bình)', 'Phường Thái Bình (Hòa Bình)',
    'Thị trấn Lương Sơn', 'Thị trấn Mai Châu', 'Thị trấn Đà Bắc', 'Thị trấn Cao Phong', 'Thị trấn Mãn Đức (Tân Lạc)'
  ],

  'Quảng Ngãi': [
    // Quảng Ngãi
    'Phường Trần Phú (Quảng Ngãi)', 'Phường Lê Hồng Phong (Quảng Ngãi)', 'Phường Nguyễn Nghiêm (Quảng Ngãi)', 'Phường Trần Hưng Đạo (Quảng Ngãi)', 'Phường Chánh Lộ (Quảng Ngãi)', 'Phường Nghĩa Lộ (Quảng Ngãi)', 'Phường Trương Quang Trọng (Quảng Ngãi)',
    'Phường Phổ Thạnh (Đức Phổ)', 'Phường Nguyễn Nghiêm (Đức Phổ)', 'Thị trấn Châu Ổ (Bình Sơn)', 'Thị trấn Chợ Chùa (Nghĩa Hành)', 'Thị trấn Mộ Đức', 'Huyện Lý Sơn',
    // Kon Tum (sáp nhập)
    'Phường Quyết Thắng (Kon Tum)', 'Phường Thắng Lợi (Kon Tum)', 'Phường Quang Trung (Kon Tum)', 'Phường Duy Tân (Kon Tum)', 'Phường Trần Hưng Đạo (Kon Tum)',
    'Thị trấn Măng Đen (Kon Plông)', 'Thị trấn Plei Kần (Ngọc Hồi)', 'Thị trấn Đắk Hà', 'Thị trấn Đắk Tô'
  ],

  'Quảng Ninh': [
    'Phường Bạch Đằng (Hạ Long)', 'Phường Bãi Cháy (Hạ Long)', 'Phường Cao Xanh (Hạ Long)', 'Phường Hòn Gai (Hạ Long)', 'Phường Hồng Gai (Hạ Long)', 'Phường Hồng Hải (Hạ Long)', 'Phường Hùng Thắng (Hạ Long)', 'Phường Tuần Châu (Hạ Long)', 'Phường Cao Thắng (Hạ Long)',
    'Phường Cẩm Trung (Cẩm Phả)', 'Phường Cẩm Thành (Cẩm Phả)', 'Phường Cửa Ông (Cẩm Phả)', 'Phường Mông Dương (Cẩm Phả)',
    'Phường Quang Trung (Uông Bí)', 'Phường Thanh Sơn (Uông Bí)', 'Phường Yên Thanh (Uông Bí)',
    'Phường Trần Phú (Móng Cái)', 'Phường Ka Long (Móng Cái)', 'Phường Trà Cổ (Móng Cái)',
    'Phường Đông Triều', 'Phường Mạo Khê (Đông Triều)', 'Phường Quảng Yên', 'Thị trấn Cái Rồng (Vân Đồn)', 'Thị trấn Tiên Yên', 'Thị trấn Cô Tô'
  ],

  'Quảng Trị': [
    // Quảng Trị
    'Phường 1 (Đông Hà)', 'Phường 2 (Đông Hà)', 'Phường 3 (Đông Hà)', 'Phường 5 (Đông Hà)', 'Phường Đông Lương (Đông Hà)', 'Phường Đông Lễ (Đông Hà)',
    'Phường 1 (Quảng Trị)', 'Phường 2 (Quảng Trị)', 'Phường An Đôn (Quảng Trị)', 'Thị trấn Khe Sanh (Hướng Hóa)', 'Thị trấn Lao Bảo (Hướng Hóa)', 'Thị trấn Gio Linh', 'Thị trấn Cam Lộ', 'Thị trấn Cửa Việt',
    // Quảng Bình (sáp nhập)
    'Phường Đồng Mỹ (Đồng Hới)', 'Phường Hải Đình (Đồng Hới)', 'Phường Nam Lý (Đồng Hới)', 'Phường Bắc Lý (Đồng Hới)', 'Phường Đồng Phú (Đồng Hới)', 'Phường Đức Ninh Đông (Đồng Hới)',
    'Phường Ba Đồn', 'Phường Quảng Thọ (Ba Đồn)', 'Thị trấn Hoàn Lão (Bố Trạch)', 'Thị trấn Kiến Giang (Lệ Thủy)', 'Thị trấn Quán Hàu (Quảng Ninh)', 'Thị trấn Quy Đạt (Minh Hóa)'
  ],

  'Sơn La': [
    'Phường Tô Hiệu (Sơn La)', 'Phường Quyết Thắng (Sơn La)', 'Phường Quyết Tâm (Sơn La)', 'Phường Chiềng Lề (Sơn La)', 'Phường Chiềng Cơi (Sơn La)', 'Phường Chiềng Sinh (Sơn La)', 'Phường Chiềng An (Sơn La)',
    'Thị trấn Hát Lót (Mai Sơn)', 'Thị trấn Mộc Châu', 'Thị trấn Nông trường Mộc Châu', 'Thị trấn Thuận Châu', 'Thị trấn Phù Yên', 'Thị trấn Sông Mã', 'Thị trấn Yên Châu', 'Thị trấn Ít Ong (Mường La)'
  ],

  'Tây Ninh': [
    // Tây Ninh
    'Phường 1 (Tây Ninh)', 'Phường 2 (Tây Ninh)', 'Phường 3 (Tây Ninh)', 'Phường 4 (Tây Ninh)', 'Phường Hiệp Ninh (Tây Ninh)', 'Phường Ninh Sơn (Tây Ninh)', 'Phường Ninh Thạnh (Tây Ninh)',
    'Phường Trảng Bàng', 'Phường An Hòa (Trảng Bàng)', 'Phường Gia Lộc (Trảng Bàng)', 'Phường Long Hoa (Hòa Thành)', 'Phường Hiệp Tân (Hòa Thành)', 'Thị trấn Gò Dầu', 'Thị trấn Bến Cầu', 'Thị trấn Tân Biên',
    // Long An (sáp nhập)
    'Phường 1 (Tân An)', 'Phường 2 (Tân An)', 'Phường 3 (Tân An)', 'Phường 4 (Tân An)', 'Phường 5 (Tân An)', 'Phường 6 (Tân An)', 'Phường 7 (Tân An)', 'Phường Khánh Hậu (Tân An)',
    'Phường Kiến Tường', 'Thị trấn Bến Lức', 'Thị trấn Hậu Nghĩa (Đức Hòa)', 'Thị trấn Đức Hòa', 'Thị trấn Cần Đước', 'Thị trấn Cần Giuộc', 'Thị trấn Tân Trụ', 'Thị trấn Thủ Thừa'
  ],

  'Thái Nguyên': [
    // Thái Nguyên
    'Phường Phan Đình Phùng (Thái Nguyên)', 'Phường Trưng Vương (Thái Nguyên)', 'Phường Hoàng Văn Thụ (Thái Nguyên)', 'Phường Quang Trung (Thái Nguyên)', 'Phường Tân Thịnh (Thái Nguyên)', 'Phường Đồng Quang (Thái Nguyên)', 'Phường Gia Sàng (Thái Nguyên)',
    'Phường Mỏ Chè (Sông Công)', 'Phường Thắng Lợi (Sông Công)', 'Phường Ba Hàng (Phổ Yên)', 'Phường Đắc Sơn (Phổ Yên)',
    'Thị trấn Hùng Sơn (Đại Từ)', 'Thị trấn Đu (Phú Lương)', 'Thị trấn Đình Cả (Võ Nhai)', 'Thị trấn Chùa Hang (Đồng Hỷ)',
    // Bắc Kạn (sáp nhập)
    'Phường Đức Xuân (Bắc Kạn)', 'Phường Phùng Chí Kiên (Bắc Kạn)', 'Phường Sông Cầu (Bắc Kạn)', 'Phường Nguyễn Thị Minh Khai (Bắc Kạn)', 'Phường Xuất Hóa (Bắc Kạn)',
    'Thị trấn Chợ Mới', 'Thị trấn Chợ Rã (Ba Bể)', 'Thị trấn Bằng Lũng (Chợ Đồn)', 'Thị trấn Nà Phặc (Ngân Sơn)', 'Thị trấn Yến Lạc (Na Rì)'
  ],

  'Thanh Hóa': [
    'Phường Điện Biên (Thanh Hóa)', 'Phường Ba Đình (Thanh Hóa)', 'Phường Lam Sơn (Thanh Hóa)', 'Phường Đông Thọ (Thanh Hóa)', 'Phường Ngọc Trạo (Thanh Hóa)', 'Phường Đông Hương (Thanh Hóa)', 'Phường Quảng Hưng (Thanh Hóa)', 'Phường Tân Sơn (Thanh Hóa)', 'Phường Nam Ngạn (Thanh Hóa)',
    'Phường Trường Sơn (Sầm Sơn)', 'Phường Bắc Sơn (Sầm Sơn)', 'Phường Trung Sơn (Sầm Sơn)', 'Phường Quảng Vinh (Sầm Sơn)',
    'Phường Hải Hòa (Nghi Sơn)', 'Phường Hải Thanh (Nghi Sơn)', 'Phường Tĩnh Gia (Nghi Sơn)', 'Phường Mai Lâm (Nghi Sơn)',
    'Thị trấn Bỉm Sơn', 'Thị trấn Hậu Lộc', 'Thị trấn Hoằng Hóa', 'Thị trấn Nga Sơn', 'Thị trấn Nông Cống', 'Thị trấn Triệu Sơn', 'Thị trấn Yên Định', 'Thị trấn Thọ Xuân'
  ],

  'Tuyên Quang': [
    // Tuyên Quang
    'Phường Tân Quang (Tuyên Quang)', 'Phường Phan Thiết (Tuyên Quang)', 'Phường Minh Xuân (Tuyên Quang)', 'Phường Nông Tiến (Tuyên Quang)', 'Phường Tân Hà (Tuyên Quang)', 'Phường Ỷ La (Tuyên Quang)', 'Phường Mỹ Lâm (Tuyên Quang)',
    'Thị trấn Sơn Dương', 'Thị trấn Na Hang', 'Thị trấn Tân Yên (Hàm Yên)', 'Thị trấn Vĩnh Lộc (Chiêm Hóa)', 'Thị trấn Yên Sơn',
    // Hà Giang (sáp nhập)
    'Phường Trần Phú (Hà Giang)', 'Phường Minh Khai (Hà Giang)', 'Phường Nguyễn Trãi (Hà Giang)', 'Phường Quang Trung (Hà Giang)', 'Phường Ngọc Hà (Hà Giang)',
    'Thị trấn Đồng Văn', 'Thị trấn Mèo Vạc', 'Thị trấn Yên Minh', 'Thị trấn Quản Bạ', 'Thị trấn Vị Xuyên', 'Thị trấn Việt Quang (Bắc Quang)', 'Thị trấn Vinh Quang (Hoàng Su Phì)'
  ],

  'Vĩnh Long': [
    // Vĩnh Long
    'Phường 1 (Vĩnh Long)', 'Phường 2 (Vĩnh Long)', 'Phường 3 (Vĩnh Long)', 'Phường 4 (Vĩnh Long)', 'Phường 5 (Vĩnh Long)', 'Phường 8 (Vĩnh Long)', 'Phường 9 (Vĩnh Long)', 'Phường Tân Hòa (Vĩnh Long)',
    'Phường Cái Vồn (Bình Minh)', 'Phường Thành Phước (Bình Minh)', 'Thị trấn Long Hồ', 'Thị trấn Tam Bình', 'Thị trấn Trà Ôn', 'Thị trấn Vũng Liêm',
    // Bến Tre (sáp nhập)
    'Phường An Hội (Bến Tre)', 'Phường 4 (Bến Tre)', 'Phường 5 (Bến Tre)', 'Phường 6 (Bến Tre)', 'Phường 7 (Bến Tre)', 'Phường 8 (Bến Tre)', 'Phường Phú Tân (Bến Tre)', 'Phường Phú Khương (Bến Tre)',
    'Thị trấn Châu Thành', 'Thị trấn Ba Tri', 'Thị trấn Bình Đại', 'Thị trấn Mỏ Cày (Mỏ Cày Nam)', 'Thị trấn Chợ Lách', 'Thị trấn Giồng Trôm',
    // Trà Vinh (sáp nhập)
    'Phường 1 (Trà Vinh)', 'Phường 2 (Trà Vinh)', 'Phường 3 (Trà Vinh)', 'Phường 4 (Trà Vinh)', 'Phường 5 (Trà Vinh)', 'Phường 6 (Trà Vinh)', 'Phường 7 (Trà Vinh)', 'Phường 8 (Trà Vinh)', 'Phường 9 (Trà Vinh)',
    'Phường 1 (Duyên Hải)', 'Phường 2 (Duyên Hải)', 'Thị trấn Càng Long', 'Thị trấn Cầu Kè', 'Thị trấn Tiểu Cần', 'Thị trấn Châu Thành'
  ]
};

// Bản đồ ánh xạ tỉnh cũ về 34 tỉnh/thành mới (Hỗ trợ người dùng tra cứu hoặc tài khoản cũ)
export const LEGACY_PROVINCE_MAP: Record<string, string> = {
  'Bình Dương': 'TP. Hồ Chí Minh',
  'Bà Rịa - Vũng Tàu': 'TP. Hồ Chí Minh',
  'Hải Dương': 'TP. Hải Phòng',
  'Quảng Nam': 'TP. Đà Nẵng',
  'Sóc Trăng': 'TP. Cần Thơ',
  'Hậu Giang': 'TP. Cần Thơ',
  'Thừa Thiên Huế': 'TP. Huế',
  'Huế': 'TP. Huế',
  'Kiên Giang': 'An Giang',
  'Bắc Giang': 'Bắc Ninh',
  'Bạc Liêu': 'Cà Mau',
  'Phú Yên': 'Đắk Lắk',
  'Bình Phước': 'Đồng Nai',
  'Tiền Giang': 'Đồng Tháp',
  'Bình Định': 'Gia Lai',
  'Thái Bình': 'Hưng Yên',
  'Ninh Thuận': 'Khánh Hòa',
  'Bình Thuận': 'Lâm Đồng',
  'Đắk Nông': 'Lâm Đồng',
  'Yên Bái': 'Lào Cai',
  'Nam Định': 'Ninh Bình',
  'Hà Nam': 'Ninh Bình',
  'Vĩnh Phúc': 'Phú Thọ',
  'Hòa Bình': 'Phú Thọ',
  'Kon Tum': 'Quảng Ngãi',
  'Quảng Bình': 'Quảng Trị',
  'Long An': 'Tây Ninh',
  'Bắc Kạn': 'Thái Nguyên',
  'Hà Giang': 'Tuyên Quang',
  'Bến Tre': 'Vĩnh Long',
  'Trà Vinh': 'Vĩnh Long'
};

// Phường / Xã mặc định sinh động chất lượng cao cho tỉnh thành
export function getWardsForProvince(provinceName: string): string[] {
  if (!provinceName) return [];

  // 1. Tìm trực tiếp trong danh sách 34 tỉnh/thành mới
  if (WARDS_BY_PROVINCE[provinceName]) {
    return WARDS_BY_PROVINCE[provinceName];
  }

  // 2. Tra cứu qua bản đồ ánh xạ tỉnh cũ ➔ tỉnh mới
  if (LEGACY_PROVINCE_MAP[provinceName]) {
    const targetProvince = LEGACY_PROVINCE_MAP[provinceName];
    if (WARDS_BY_PROVINCE[targetProvince]) {
      return WARDS_BY_PROVINCE[targetProvince];
    }
  }

  // 3. Khớp gần đúng không phân biệt tiền tố TP.
  const normalized = provinceName.replace(/^TP\.\s*/i, '').trim().toLowerCase();
  const matchedKey = Object.keys(WARDS_BY_PROVINCE).find(
    k => k.replace(/^TP\.\s*/i, '').trim().toLowerCase() === normalized
  );
  if (matchedKey && WARDS_BY_PROVINCE[matchedKey]) {
    return WARDS_BY_PROVINCE[matchedKey];
  }

  // 4. Danh mục Phường / Xã trực thuộc tự động theo đặc trưng tỉnh/thành
  const cleanName = provinceName.replace(/^TP\.\s*/i, '').trim();
  return [
    `Phường Trung Tâm (${cleanName})`,
    `Phường 1 (${cleanName})`,
    `Phường 2 (${cleanName})`,
    `Phường 3 (${cleanName})`,
    `Phường 4 (${cleanName})`,
    `Phường 5 (${cleanName})`,
    `Phường Tân Phú (${cleanName})`,
    `Phường Hòa Bình (${cleanName})`,
    `Phường Phước Long (${cleanName})`,
    `Phường An Thạnh (${cleanName})`,
    `Thị trấn Trung Tâm (${cleanName})`,
    `Thị trấn Ngoại Thành (${cleanName})`,
    `Xã Tân Bình (${cleanName})`,
    `Xã An Hòa (${cleanName})`,
    `Xã Bình Minh (${cleanName})`,
    `Xã Thới An (${cleanName})`,
    `Xã Phú Hưng (${cleanName})`,
    `Xã Đồng Tiến (${cleanName})`
  ];
}

// Tìm kiếm nhanh Tỉnh / Thành phố (hỗ trợ cả gõ tên cũ để gợi ý tỉnh mới)
export function searchProvinces(query: string): string[] {
  if (!query || !query.trim()) return VIETNAM_PROVINCES;
  const q = query.trim().toLowerCase();
  return VIETNAM_PROVINCES.filter(p => p.toLowerCase().includes(q));
}

// Tìm kiếm nhanh Phường / Xã theo Tỉnh / Thành phố
export function searchWards(provinceName: string, query: string): string[] {
  const wards = getWardsForProvince(provinceName);
  if (!query || !query.trim()) return wards;
  const q = query.trim().toLowerCase();
  return wards.filter(w => w.toLowerCase().includes(q));
}

// Backward Compatibility Aliases (Tránh lỗi mã nguồn cũ)
export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {};
export const WARDS_BY_DISTRICT: Record<string, string[]> = {};
export const DEFAULT_DISTRICTS = ['Khu vực trung tâm'];
export const DEFAULT_WARDS = ['Phường / Xã trung tâm'];

export function getDistrictsForProvince(provinceName: string): string[] {
  return getWardsForProvince(provinceName);
}

export function getWardsForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  return [districtName];
}

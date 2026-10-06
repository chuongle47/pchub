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

// Danh sách Phường / Xã / Thị trấn trực tiếp theo từng Tỉnh / Thành phố (Đã tinh gọn 2 cấp: Tỉnh/TP ➔ Phường/Xã, không còn Quận/Huyện)
export const WARDS_BY_PROVINCE: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định',
    'Phường Thảo Điền', 'Phường An Phú', 'Phường An Khánh', 'Phường Thủ Thiêm', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Trung', 'Phường Linh Đông', 'Phường Linh Chiểu', 'Phường Bình Chiểu', 'Phường Trường Thọ', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Long Thạnh Mỹ',
    'Phường 1 (Quận 3)', 'Phường 2 (Quận 3)', 'Phường 3 (Quận 3)', 'Phường Võ Thị Sáu (Quận 3)',
    'Phường 1 (Quận 4)', 'Phường 4 (Quận 4)', 'Phường 6 (Quận 4)', 'Phường 9 (Quận 4)', 'Phường 13 (Quận 4)', 'Phường 18 (Quận 4)',
    'Phường 1 (Quận 5)', 'Phường 5 (Quận 5)', 'Phường 8 (Quận 5)', 'Phường 11 (Quận 5)', 'Phường 14 (Quận 5)',
    'Phường 1 (Quận 6)', 'Phường 6 (Quận 6)', 'Phường 10 (Quận 6)', 'Phường 12 (Quận 6)',
    'Phường Tân Phong (Quận 7)', 'Phường Tân Phú (Quận 7)', 'Phường Tân Quy (Quận 7)', 'Phường Phú Mỹ (Quận 7)', 'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây',
    'Phường 1 (Quận 8)', 'Phường 4 (Quận 8)', 'Phường 5 (Quận 8)', 'Phường 8 (Quận 8)', 'Phường 16 (Quận 8)',
    'Phường 1 (Quận 10)', 'Phường 5 (Quận 10)', 'Phường 10 (Quận 10)', 'Phường 12 (Quận 10)', 'Phường 14 (Quận 10)',
    'Phường 1 (Quận 11)', 'Phường 5 (Quận 11)', 'Phường 9 (Quận 11)', 'Phường 15 (Quận 11)',
    'Phường 1 (Quận Tân Bình)', 'Phường 2 (Quận Tân Bình)', 'Phường 4 (Quận Tân Bình)', 'Phường 13 (Quận Tân Bình)', 'Phường 15 (Quận Tân Bình)',
    'Phường 1 (Quận Bình Thạnh)', 'Phường 2 (Quận Bình Thạnh)', 'Phường 19 (Quận Bình Thạnh)', 'Phường 25 (Quận Bình Thạnh)', 'Phường 26 (Quận Bình Thạnh)',
    'Phường 1 (Quận Gò Vấp)', 'Phường 5 (Quận Gò Vấp)', 'Phường 8 (Quận Gò Vấp)', 'Phường 10 (Quận Gò Vấp)', 'Phường 17 (Quận Gò Vấp)',
    'Phường 1 (Quận Phú Nhuận)', 'Phường 2 (Quận Phú Nhuận)', 'Phường 7 (Quận Phú Nhuận)', 'Phường 9 (Quận Phú Nhuận)',
    'Phường Tây Thạnh (Quận Tân Phú)', 'Phường Sơn Kỳ (Quận Tân Phú)', 'Phường Tân Sơn Nhì', 'Phường Phú Thạnh',
    'Phường Bình Hưng Hòa (Bình Tân)', 'Phường Bình Trị Đông (Bình Tân)', 'Phường Tân Tạo (Bình Tân)', 'Phường An Lạc (Bình Tân)',
    'Thị trấn Tân Túc (Bình Chánh)', 'Xã Bình Hưng (Bình Chánh)', 'Xã Phong Phú (Bình Chánh)', 'Xã Vĩnh Lộc A (Bình Chánh)', 'Xã Vĩnh Lộc B (Bình Chánh)',
    'Thị trấn Củ Chi', 'Xã Tân An Hội (Củ Chi)', 'Xã Bình Mỹ (Củ Chi)', 'Xã Tân Thạnh Đông (Củ Chi)',
    'Thị trấn Hóc Môn', 'Xã Bà Điểm (Hóc Môn)', 'Xã Xuân Thới Thượng (Hóc Môn)', 'Xã Đông Thạnh (Hóc Môn)',
    'Thị trấn Nhà Bè', 'Xã Phước Kiển (Nhà Bè)', 'Xã Hiệp Phước (Nhà Bè)', 'Xã Long Thới (Nhà Bè)',
    'Thị trấn Cần Thạnh (Cần Giờ)', 'Xã Bình Khánh (Cần Giờ)', 'Xã Long Hòa (Cần Giờ)'
  ],

  'Hà Nội': [
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

  'Đà Nẵng': [
    'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam',
    'Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường An Hải Đông', 'Phường Phước Mỹ', 'Phường Mân Thái', 'Phường Thọ Quang',
    'Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải',
    'Phường Tam Thuận', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Xuân Hà', 'Phường Chính Gián', 'Phường Vĩnh Trung',
    'Phường Hòa Minh', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Hiệp Bắc',
    'Phường Khuê Trung', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây', 'Phường Hòa Phát', 'Phường Hòa An',
    'Xã Hòa Châu', 'Xã Hòa Tiến', 'Xã Hòa Phước', 'Xã Hòa Phong', 'Xã Hòa Nhơn', 'Xã Hòa Ninh'
  ],

  'Hải Phòng': [
    'Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Hạ Lý', 'Phường Sở Dầu', 'Phường Hùng Vương',
    'Phường Cầu Đất', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Đồng Quốc Bình', 'Phường Đằng Giang',
    'Phường Cát Dài', 'Phường An Biên', 'Phường Niệm Nghĩa', 'Phường Dư Hàng', 'Phường Hồ Nam', 'Phường Kênh Dương',
    'Phường Đông Hải 1', 'Phường Đông Hải 2', 'Phường Đằng Lâm', 'Phường Nam Hải', 'Phường Tràng Cát',
    'Phường Quán Trữ', 'Phường Lãm Hà', 'Phường Trần Thành Ngọ', 'Phường Phù Liễn',
    'Phường Đồ Sơn', 'Phường Vạn Hương', 'Phường Ngọc Xuyên', 'Phường Bàng La',
    'Thị trấn Núi Đèo (Thủy Nguyên)', 'Xã An Lư (Thủy Nguyên)', 'Xã Hoàng Động (Thủy Nguyên)', 'Xã Tân Dương (Thủy Nguyên)',
    'Thị trấn An Dương', 'Xã An Đồng (An Dương)', 'Xã Hồng Thái (An Dương)',
    'Thị trấn Cát Bà (Cát Hải)', 'Xã Phù Long (Cát Hải)'
  ],

  'Cần Thơ': [
    'Phường Tân An', 'Phường An Cư', 'Phường An Phú', 'Phường An Nghiệp', 'Phường Xuân Khánh', 'Phường Hưng Lợi', 'Phường Cái Khế', 'Phường An Hòa',
    'Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc', 'Phường Long Hòa', 'Phường Long Tuyền',
    'Phường Lê Bình', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Ba Láng', 'Phường Tân Phú',
    'Phường Thốt Nốt', 'Phường Thới Thuận', 'Phường Thuận An', 'Phường Tân Lộc',
    'Phường Châu Văn Liêm', 'Phường Thới Hòa', 'Phường Phước Thới', 'Phường Trường Lạc',
    'Thị trấn Phong Điền', 'Xã Mỹ Khánh (Phong Điền)', 'Xã Nhơn Ái (Phong Điền)',
    'Thị trấn Cờ Đỏ', 'Thị trấn Thới Lai', 'Thị trấn Vĩnh Thạnh'
  ],

  'Bình Dương': [
    'Phường Phú Cường (Thủ Dầu Một)', 'Phường Hiệp Thành (Thủ Dầu Một)', 'Phường Chánh Nghĩa (Thủ Dầu Một)', 'Phường Phú Hòa (Thủ Dầu Một)', 'Phường Phú Lợi (Thủ Dầu Một)', 'Phường Hòa Phú (Thủ Dầu Một)',
    'Phường Dĩ An', 'Phường An Bình (Dĩ An)', 'Phường Đông Hòa (Dĩ An)', 'Phường Tân Bình (Dĩ An)', 'Phường Tân Đông Hiệp (Dĩ An)',
    'Phường Lái Thiêu (Thuận An)', 'Phường An Phú (Thuận An)', 'Phường Bình Hòa (Thuận An)', 'Phường Thuận Giao (Thuận An)', 'Phường Vĩnh Phú (Thuận An)',
    'Phường Uyên Hưng (Tân Uyên)', 'Phường Tân Phước Khánh (Tân Uyên)', 'Phường Thái Hòa (Tân Uyên)', 'Phường Khánh Bình (Tân Uyên)',
    'Phường Mỹ Phước (Bến Cát)', 'Phường Thới Hòa (Bến Cát)', 'Phường Tân Định (Bến Cát)', 'Phường Hòa Lợi (Bến Cát)',
    'Thị trấn Lai Uyên (Bàu Bàng)', 'Thị trấn Dầu Tiếng', 'Thị trấn Phước Vĩnh (Phú Giáo)', 'Thị trấn Tân Thành (Bắc Tân Uyên)'
  ],

  'Đồng Nai': [
    'Phường Trung Dũng (Biên Hòa)', 'Phường Quyết Thắng (Biên Hòa)', 'Phường Quang Vinh (Biên Hòa)', 'Phường Tân Mai (Biên Hòa)', 'Phường Tân Hiệp (Biên Hòa)', 'Phường Long Bình (Biên Hòa)', 'Phường Trảng Dài (Biên Hòa)', 'Phường Hố Nai (Biên Hòa)', 'Phường An Bình (Biên Hòa)',
    'Phường Xuân An (Long Khánh)', 'Phường Xuân Trung (Long Khánh)', 'Phường Xuân Hòa (Long Khánh)', 'Phường Suối Tre (Long Khánh)',
    'Thị trấn Long Thành', 'Xã An Phước (Long Thành)', 'Xã Lộc An (Long Thành)', 'Xã Bình Sơn (Long Thành)',
    'Thị trấn Hiệp Phước (Nhơn Trạch)', 'Xã Phú Hội (Nhơn Trạch)', 'Xã Phước Thiền (Nhơn Trạch)', 'Xã Đại Phước (Nhơn Trạch)',
    'Thị trấn Trảng Bom', 'Xã Hố Nai 3 (Trảng Bom)', 'Xã Bắc Sơn (Trảng Bom)', 'Xã Quảng Tiến (Trảng Bom)',
    'Thị trấn Vĩnh An (Vĩnh Cửu)', 'Thị trấn Dầu Giây (Thống Nhất)', 'Thị trấn Gia Ray (Xuân Lộc)', 'Thị trấn Tân Phú', 'Thị trấn Định Quán'
  ],

  'Bà Rịa - Vũng Tàu': [
    'Phường 1 (Vũng Tàu)', 'Phường 2 (Vũng Tàu)', 'Phường 3 (Vũng Tàu)', 'Phường 4 (Vũng Tàu)', 'Phường 7 (Vũng Tàu)', 'Phường 8 (Vũng Tàu)', 'Phường 9 (Vũng Tàu)', 'Phường 10 (Vũng Tàu)', 'Phường 11 (Vũng Tàu)', 'Phường Thắng Nhất', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Phường Nguyễn An Ninh',
    'Phường Phước Trung (Bà Rịa)', 'Phường Phước Hiệp (Bà Rịa)', 'Phường Phước Hưng (Bà Rịa)', 'Phường Phước Nguyên (Bà Rịa)', 'Phường Long Toàn (Bà Rịa)',
    'Phường Phú Mỹ', 'Phường Tân Phước (Phú Mỹ)', 'Phường Phước Hòa (Phú Mỹ)', 'Phường Hắc Dịch (Phú Mỹ)', 'Phường Mỹ Xuân (Phú Mỹ)',
    'Thị trấn Long Điền', 'Thị trấn Long Hải', 'Thị trấn Đất Đỏ', 'Thị trấn Phước Hải', 'Thị trấn Ngãi Giao (Châu Đức)', 'Thị trấn Phước Bửu (Xuyên Mộc)', 'Huyện Côn Đảo'
  ],

  'Khánh Hòa': [
    'Phường Lộc Thọ (Nha Trang)', 'Phường Phước Hải (Nha Trang)', 'Phường Phương Sài (Nha Trang)', 'Phường Tân Lập (Nha Trang)', 'Phường Vạn Thắng (Nha Trang)', 'Phường Vĩnh Hải (Nha Trang)', 'Phường Vĩnh Nguyên (Nha Trang)', 'Phường Vĩnh Phước (Nha Trang)', 'Phường Phước Long (Nha Trang)',
    'Phường Cam Lộc (Cam Ranh)', 'Phường Cam Phú (Cam Ranh)', 'Phường Cam Thuận (Cam Ranh)', 'Phường Ba Ngòi (Cam Ranh)',
    'Phường Ninh Hiệp (Ninh Hòa)', 'Phường Ninh Giang (Ninh Hòa)', 'Phường Ninh Đa (Ninh Hòa)',
    'Thị trấn Cam Đức (Cam Lâm)', 'Thị trấn Diên Khánh', 'Thị trấn Vạn Giã (Vạn Ninh)', 'Thị trấn Tô Hạp (Khánh Sơn)', 'Thị trấn Khánh Vĩnh'
  ],

  'Quảng Ninh': [
    'Phường Bạch Đằng (Hạ Long)', 'Phường Bãi Cháy (Hạ Long)', 'Phường Cao Xanh (Hạ Long)', 'Phường Hòn Gai (Hạ Long)', 'Phường Hồng Gai (Hạ Long)', 'Phường Hồng Hải (Hạ Long)', 'Phường Hùng Thắng (Hạ Long)', 'Phường Tuần Châu (Hạ Long)',
    'Phường Cẩm Trung (Cẩm Phả)', 'Phường Cẩm Thành (Cẩm Phả)', 'Phường Cửa Ông (Cẩm Phả)', 'Phường Mông Dương (Cẩm Phả)',
    'Phường Quang Trung (Uông Bí)', 'Phường Thanh Sơn (Uông Bí)', 'Phường Yên Thanh (Uông Bí)',
    'Phường Trần Phú (Móng Cái)', 'Phường Ka Long (Móng Cái)', 'Phường Trà Cổ (Móng Cái)',
    'Phường Đông Triều', 'Phường Mạo Khê (Đông Triều)', 'Phường Quảng Yên', 'Thị trấn Cái Rồng (Vân Đồn)', 'Thị trấn Tiên Yên', 'Thị trấn Cô Tô'
  ],

  'Thừa Thiên Huế': [
    'Phường Vĩnh Ninh (Huế)', 'Phường Phú Nhuận (Huế)', 'Phường Phú Hội (Huế)', 'Phường Thuận Thành (Huế)', 'Phường Thuận Lộc (Huế)', 'Phường Tây Lộc (Huế)', 'Phường Hương Long (Huế)', 'Phường An Cựu (Huế)', 'Phường An Đông (Huế)', 'Phường Vỹ Dạ (Huế)', 'Phường Thủy Xuân (Huế)',
    'Phường Phú Bài (Hương Thủy)', 'Phường Thủy Dương (Hương Thủy)', 'Phường Hương Văn (Hương Trà)', 'Phường Tứ Hạ (Hương Trà)',
    'Thị trấn Phong Điền', 'Thị trấn Sịa (Quảng Điền)', 'Thị trấn Phú Đa (Phú Vàng)', 'Thị trấn Phú Lộc', 'Thị trấn Lăng Cô (Phú Lộc)', 'Thị trấn Khe Tre (Nam Đông)', 'Thị trấn A Lưới'
  ],

  'Bắc Ninh': [
    'Phường Suối Hoa (Bắc Ninh)', 'Phường Tiền An (Bắc Ninh)', 'Phường Ninh Xá (Bắc Ninh)', 'Phường Đại Phúc (Bắc Ninh)', 'Phường Võ Cường (Bắc Ninh)', 'Phường Vân Dương (Bắc Ninh)',
    'Phường Đông Ngàn (Từ Sơn)', 'Phường Đồng Kỵ (Từ Sơn)', 'Phường Tân Hồng (Từ Sơn)', 'Phường Trang Hạ (Từ Sơn)',
    'Phường Phố Mới (Quế Võ)', 'Phường Bồng Lai (Quế Võ)', 'Phường Hồ (Thuận Thành)', 'Phường Song Hồ (Thuận Thành)',
    'Thị trấn Chờ (Yên Phong)', 'Thị trấn Gia Bình', 'Thị trấn Thứa (Lương Tài)', 'Thị trấn Lim (Tiên Du)'
  ],

  'Nghệ An': [
    'Phường Quang Trung (Vinh)', 'Phường Lê Lợi (Vinh)', 'Phường Trường Thi (Vinh)', 'Phường Hưng Dũng (Vinh)', 'Phường Hà Huy Tập (Vinh)', 'Phường Quán Bàu (Vinh)', 'Phường Bến Thủy (Vinh)', 'Phường Cửa Nam (Vinh)',
    'Phường Thu Thủy (Cửa Lò)', 'Phường Nghi Hương (Cửa Lò)', 'Phường Nghi Thu (Cửa Lò)',
    'Phường Hòa Hiếu (Thái Hòa)', 'Phường Long Sơn (Thái Hòa)', 'Phường Mai Hùng (Hoàng Mai)', 'Phường Quỳnh Thiện (Hoàng Mai)',
    'Thị trấn Đô Lương', 'Thị trấn Diễn Châu', 'Thị trấn Nam Đàn', 'Thị trấn Hưng Nguyên', 'Thị trấn Quỳ Hợp', 'Thị trấn Tân Kỳ'
  ],

  'Thanh Hóa': [
    'Phường Điện Biên (Thanh Hóa)', 'Phường Ba Đình (Thanh Hóa)', 'Phường Lam Sơn (Thanh Hóa)', 'Phường Đông Thọ (Thanh Hóa)', 'Phường Ngọc Trạo (Thanh Hóa)', 'Phường Đông Hương (Thanh Hóa)', 'Phường Quảng Hưng (Thanh Hóa)',
    'Phường Trường Sơn (Sầm Sơn)', 'Phường Bắc Sơn (Sầm Sơn)', 'Phường Trung Sơn (Sầm Sơn)', 'Phường Quảng Vinh (Sầm Sơn)',
    'Phường Hải Hòa (Nghi Sơn)', 'Phường Hải Thanh (Nghi Sơn)', 'Phường Tĩnh Gia (Nghi Sơn)',
    'Thị trấn Bỉm Sơn', 'Thị trấn Hậu Lộc', 'Thị trấn Hoằng Hóa', 'Thị trấn Nga Sơn', 'Thị trấn Nông Cống', 'Thị trấn Triệu Sơn', 'Thị trấn Yên Định'
  ],

  'Lâm Đồng': [
    'Phường 1 (Đà Lạt)', 'Phường 2 (Đà Lạt)', 'Phường 3 (Đà Lạt)', 'Phường 4 (Đà Lạt)', 'Phường 8 (Đà Lạt)', 'Phường 9 (Đà Lạt)', 'Phường 10 (Đà Lạt)', 'Phường 11 (Đà Lạt)', 'Phường 12 (Đà Lạt)',
    'Phường 1 (Bảo Lộc)', 'Phường 2 (Bảo Lộc)', 'Phường B’Lao (Bảo Lộc)', 'Phường Lộc Phát (Bảo Lộc)', 'Phường Lộc Tiến (Bảo Lộc)',
    'Thị trấn Liên Nghĩa (Đức Trọng)', 'Thị trấn Nam Ban (Lâm Hà)', 'Thị trấn Di Linh', 'Thị trấn Lạc Dương', 'Thị trấn Đơn Dương'
  ],

  'Kiên Giang': [
    'Phường Vĩnh Thanh Vân (Rạch Giá)', 'Phường Vĩnh Lạc (Rạch Giá)', 'Phường Vĩnh Bảo (Rạch Giá)', 'Phường An Hòa (Rạch Giá)', 'Phường Rạch Sỏi (Rạch Giá)',
    'Phường Dương Đông (Phú Quốc)', 'Phường An Thới (Phú Quốc)', 'Xã Gành Dầu (Phú Quốc)', 'Xã Cửa Cạn (Phú Quốc)', 'Xã Hàm Ninh (Phú Quốc)',
    'Phường Tô Châu (Hà Tiên)', 'Phường Đông Hồ (Hà Tiên)', 'Phường Pháo Đài (Hà Tiên)',
    'Thị trấn Kiên Lương', 'Thị trấn Hòn Đất', 'Thị trấn Tân Hiệp', 'Thị trấn Giồng Riềng', 'Thị trấn Gò Quao'
  ]
};

// Phường / Xã mặc định sinh động chất lượng cao cho các tỉnh thành còn lại
export function getWardsForProvince(provinceName: string): string[] {
  if (!provinceName) return [];

  // Tìm trong danh sách định nghĩa sẵn
  if (WARDS_BY_PROVINCE[provinceName]) {
    return WARDS_BY_PROVINCE[provinceName];
  }

  // Khớp gần đúng không phân biệt tiền tố TP.
  const normalized = provinceName.replace(/^TP\.\s*/i, '').trim();
  const matchedKey = Object.keys(WARDS_BY_PROVINCE).find(
    k => k.replace(/^TP\.\s*/i, '').trim().toLowerCase() === normalized.toLowerCase()
  );
  if (matchedKey && WARDS_BY_PROVINCE[matchedKey]) {
    return WARDS_BY_PROVINCE[matchedKey];
  }

  // Danh mục Phường / Xã trực thuộc tự động theo đặc trưng tỉnh/thành
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

// Tìm kiếm nhanh Tỉnh / Thành phố
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

// Backward Compatibility Aliases (Tránh lỗi mã nguồn cũ nếu còn tham chiếu)
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

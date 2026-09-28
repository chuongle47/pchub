// Danh sách 34 đơn vị hành chính cấp tỉnh trực thuộc Trung ương của Việt Nam
// (Sau khi sắp xếp, sáp nhập theo Nghị quyết của Quốc hội)
export const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'TP. Hà Nội',
  'TP. Hải Phòng',
  'TP. Đà Nẵng',
  'TP. Cần Thơ',
  'TP. Thừa Thiên Huế',
  'An Giang',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
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
  'Hà Tĩnh',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
];

// Danh sách tra cứu mở rộng cho các tỉnh/thành phố trước sáp nhập
export const VIETNAM_63_PROVINCES = [
  ...VIETNAM_PROVINCES,
  'Bà Rịa - Vũng Tàu',
  'Bình Dương',
  'Hà Nam',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
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

// Cập nhật mới nhất danh sách Quận / Huyện / Thành phố trực thuộc
export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    'TP. Thủ Đức', 'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân',
    'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Vũng Tàu', 'TP. Phú Mỹ', 'TP. Bà Rịa',
    'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'
  ],
  'TP. Hà Nội': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Cầu Giấy', 'Quận Đống Đa',
    'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Hà Đông', 'Quận Bắc Từ Liêm', 'Quận Nam Từ Liêm',
    'Thị xã Sơn Tây', 'TP. Phủ Lý', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai',
    'Huyện Sóc Sơn', 'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Ứng Hòa'
  ],
  'Hà Nội': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Cầu Giấy', 'Quận Đống Đa',
    'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Hà Đông', 'Quận Bắc Từ Liêm', 'Quận Nam Từ Liêm',
    'Thị xã Sơn Tây', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai',
    'Huyện Sóc Sơn', 'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Ứng Hòa'
  ],
  'TP. Hải Phòng': [
    'TP. Thủy Nguyên', 'Quận An Dương', 'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An',
    'Quận Đồ Sơn', 'Quận Dương Kinh', 'TP. Hải Dương', 'TP. Chí Linh', 'TP. Hưng Yên', 'Huyện An Lão', 'Huyện Kiến Thụy', 'Huyện Tiên Lãng', 'Huyện Vĩnh Bảo',
    'Huyện Cát Hải', 'Huyện Bạch Long Vĩ'
  ],
  'Hải Phòng': [
    'TP. Thủy Nguyên', 'Quận An Dương', 'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An',
    'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện An Lão', 'Huyện Kiến Thụy', 'Huyện Tiên Lãng', 'Huyện Vĩnh Bảo',
    'Huyện Cát Hải', 'Huyện Bạch Long Vĩ'
  ],
  'TP. Đà Nẵng': [
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ',
    'TP. Tam Kỳ', 'TP. Hội An', 'Huyện Hòa Vang', 'Huyện Hoàng Sa'
  ],
  'Đà Nẵng': [
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ',
    'Huyện Hòa Vang', 'Huyện Hoàng Sa'
  ],
  'TP. Cần Thơ': [
    'Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Quận Thốt Nốt',
    'TP. Vị Thanh', 'TP. Ngã Bảy', 'TP. Sóc Trăng', 'Huyện Phong Điền', 'Huyện Cờ Đỏ', 'Huyện Vĩnh Thạnh', 'Huyện Thới Lai'
  ],
  'Cần Thơ': [
    'Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Quận Thốt Nốt',
    'Huyện Phong Điền', 'Huyện Cờ Đỏ', 'Huyện Vĩnh Thạnh', 'Huyện Thới Lai'
  ],
  'TP. Thừa Thiên Huế': [
    'Quận Phú Xuân', 'Quận Thuận Hóa', 'Thị xã Phong Điền', 'Thị xã Hương Thủy', 'Thị xã Hương Trà',
    'Huyện A Lưới', 'Huyện Nam Đông', 'Huyện Phú Lộc', 'Huyện Phú Vàng', 'Huyện Quảng Điền'
  ],
  'Thừa Thiên Huế': [
    'Quận Phú Xuân', 'Quận Thuận Hóa', 'Thị xã Phong Điền', 'Thị xã Hương Thủy', 'Thị xã Hương Trà',
    'Huyện A Lưới', 'Huyện Nam Đông', 'Huyện Phú Lộc', 'Huyện Phú Vàng', 'Huyện Quảng Điền'
  ],
  'An Giang': [
    'TP. Long Xuyên', 'TP. Châu Đốc', 'Thị xã Tân Châu', 'Thị xã Tịnh Biên',
    'Huyện An Phú', 'Huyện Châu Phú', 'Huyện Châu Thành', 'Huyện Chợ Mới', 'Huyện Phú Tân', 'Huyện Thoại Sơn', 'Huyện Tri Tôn'
  ],
  'Bắc Giang': [
    'TP. Bắc Giang', 'Thị xã Việt Yên', 'Huyện Hiệp Hòa', 'Huyện Lạng Giang', 'Huyện Lục Nam', 'Huyện Lục Ngạn', 'Huyện Sơn Động', 'Huyện Tân Yên', 'Huyện Yên Dũng', 'Huyện Yên Thế'
  ],
  'Bắc Kạn': [
    'TP. Bắc Kạn', 'Huyện Ba Bể', 'Huyện Bạch Thông', 'Huyện Chợ Đồn', 'Huyện Chợ Mới', 'Huyện Na Rì', 'Huyện Ngân Sơn', 'Huyện Pác Nặm'
  ],
  'Bạc Liêu': [
    'TP. Bạc Liêu', 'Thị xã Giá Rai', 'Huyện Đông Hải', 'Huyện Hòa Bình', 'Huyện Hồng Dân', 'Huyện Phước Long', 'Huyện Vĩnh Lợi'
  ],
  'Bắc Ninh': [
    'TP. Bắc Ninh', 'TP. Từ Sơn', 'Thị xã Thuận Thành', 'Thị xã Quế Võ', 'Huyện Gia Bình', 'Huyện Lương Tài', 'Huyện Tiên Du', 'Huyện Yên Phong'
  ],
  'Bến Tre': [
    'TP. Bến Tre', 'Huyện Ba Tri', 'Huyện Bình Đại', 'Huyện Châu Thành', 'Huyện Chợ Lách', 'Huyện Giồng Trôm', 'Huyện Mỏ Cày Bắc', 'Huyện Mỏ Cày Nam', 'Huyện Thạnh Phú'
  ],
  'Bình Định': [
    'TP. Quy Nhơn', 'Thị xã An Nhơn', 'Thị xã Hoài Nhơn', 'Huyện An Lão', 'Huyện Hoài Ân', 'Huyện Phù Cát', 'Huyện Phù Mỹ', 'Huyện Tây Sơn', 'Huyện Vân Canh', 'Huyện Vĩnh Thạnh'
  ],
  'Bình Phước': [
    'TP. Đồng Xoài', 'Thị xã Bình Long', 'Thị xã Phước Long', 'Thị xã Chơn Thành', 'Huyện Bù Đăng', 'Huyện Bù Đốp', 'Huyện Bù Gia Mập', 'Huyện Đồng Phú', 'Huyện Hớn Quản', 'Huyện Lộc Ninh', 'Huyện Phú Riềng'
  ],
  'Bình Thuận': [
    'TP. Phan Thiết', 'Thị xã La Gi', 'Huyện Bắc Bình', 'Huyện Đức Linh', 'Huyện Hàm Tân', 'Huyện Hàm Thuận Bắc', 'Huyện Hàm Thuận Nam', 'Huyện Phú Quý', 'Huyện Tánh Linh', 'Huyện Tuy Phong'
  ],
  'Cà Mau': [
    'TP. Cà Mau', 'Huyện Đầm Dơi', 'Huyện Cái Nước', 'Huyện Năm Căn', 'Huyện Ngọc Hiển', 'Huyện Phú Tân', 'Huyện Thới Bình', 'Huyện Trần Văn Thời', 'Huyện U Minh'
  ],
  'Cao Bằng': [
    'TP. Cao Bằng', 'Huyện Bảo Lạc', 'Huyện Bảo Lâm', 'Huyện Hạ Lang', 'Huyện Hà Quảng', 'Huyện Hòa An', 'Huyện Nguyên Bình', 'Huyện Quảng Hòa', 'Huyện Thạch An', 'Huyện Trùng Khánh'
  ],
  'Đắk Lắk': [
    'TP. Buôn Ma Thuột', 'Thị xã Buôn Hồ', 'Huyện Buôn Đôn', 'Huyện Cư Kuin', 'Huyện Cư M\'gar', 'Huyện Ea H\'leo', 'Huyện Ea Kar', 'Huyện Ea Súp', 'Huyện Krông Ana', 'Huyện Krông Bông', 'Huyện Krông Búk', 'Huyện Krông Năng', 'Huyện Krông Pắc', 'Huyện Lắk', 'Huyện M\'Drắk'
  ],
  'Đắk Nông': [
    'TP. Gia Nghĩa', 'Huyện Cư Jút', 'Huyện Đắk Glong', 'Huyện Đắk Mil', 'Huyện Đắk R\'lấp', 'Huyện Đắk Song', 'Huyện Krông Nô', 'Huyện Tuy Đức'
  ],
  'Điện Biên': [
    'TP. Điện Biên Phủ', 'Thị xã Mường Lay', 'Huyện Điện Biên', 'Huyện Điện Biên Đông', 'Huyện Mường Chà', 'Huyện Mường Nhé', 'Huyện Mường Ảng', 'Huyện Nậm Pồ', 'Huyện Tủa Chùa', 'Huyện Tuần Giáo'
  ],
  'Đồng Nai': [
    'TP. Biên Hòa', 'TP. Long Khánh', 'Huyện Cẩm Mỹ', 'Huyện Định Quán', 'Huyện Long Thành',
    'Huyện Nhơn Trạch', 'Huyện Tân Phú', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc'
  ],
  'Đồng Tháp': [
    'TP. Cao Lãnh', 'TP. Sa Đéc', 'TP. Hồng Ngự', 'Huyện Cao Lãnh', 'Huyện Châu Thành', 'Huyện Hồng Ngự', 'Huyện Lai Vung', 'Huyện Lấp Vò', 'Huyện Tam Nông', 'Huyện Tân Hồng', 'Huyện Thanh Bình', 'Huyện Tháp Mười'
  ],
  'Gia Lai': [
    'TP. Pleiku', 'Thị xã An Khê', 'Thị xã Ayun Pa', 'Huyện Chư Păh', 'Huyện Chư Prông', 'Huyện Chư Sê', 'Huyện Chư Pưh', 'Huyện Đắk Đoa', 'Huyện Đắk Pơ', 'Huyện Đức Cơ', 'Huyện Ia Grai', 'Huyện Ia Pa', 'Huyện K\'Bang', 'Huyện Krông Pa', 'Huyện Kông Chro', 'Huyện Mang Yang', 'Huyện Phú Thiện'
  ],
  'Hà Giang': [
    'TP. Hà Giang', 'Huyện Bắc Quang', 'Huyện Bắc Mê', 'Huyện Hoàng Su Phì', 'Huyện Đồng Văn', 'Huyện Mèo Vạc', 'Huyện Quản Bạ', 'Huyện Quang Bình', 'Huyện Vị Xuyên', 'Huyện Xín Mần', 'Huyện Yên Minh'
  ],
  'Hà Tĩnh': [
    'TP. Hà Tĩnh', 'Thị xã Hồng Lĩnh', 'Thị xã Kỳ Anh', 'Huyện Cẩm Xuyên', 'Huyện Can Lộc', 'Huyện Đức Thọ', 'Huyện Hương Khê', 'Huyện Hương Sơn', 'Huyện Kỳ Anh', 'Huyện Lộc Hà', 'Huyện Nghi Xuân', 'Huyện Thạch Hà', 'Huyện Vũ Quang'
  ],
  'Khánh Hòa': [
    'TP. Nha Trang', 'TP. Cam Ranh', 'Thị xã Ninh Hòa', 'Huyện Cam Lâm', 'Huyện Diên Khánh', 'Huyện Khánh Sơn', 'Huyện Khánh Vĩnh', 'Huyện Trường Sa', 'Huyện Vạn Ninh'
  ],
  'Kiên Giang': [
    'TP. Rạch Giá', 'TP. Hà Tiên', 'TP. Phú Quốc', 'Huyện An Biên', 'Huyện An Minh', 'Huyện Châu Thành', 'Huyện Giang Thành', 'Huyện Giồng Riềng', 'Huyện Gò Quao', 'Huyện Hòn Đất', 'Huyện Kiên Lương', 'Huyện Tân Hiệp', 'Huyện U Minh Thượng', 'Huyện Vĩnh Thạnh'
  ],
  'Kon Tum': [
    'TP. Kon Tum', 'Huyện Đắk Glei', 'Huyện Đắk Hà', 'Huyện Đắk Tô', 'Huyện Kon Plông', 'Huyện Kon Rẫy', 'Huyện Ngọc Hồi', 'Huyện Sa Thầy', 'Huyện Tu Mơ Rông', 'Huyện Ia H\'Drai'
  ],
  'Lai Châu': [
    'TP. Lai Châu', 'Huyện Mường Tè', 'Huyện Nậm Nhùn', 'Huyện Phong Thổ', 'Huyện Sìn Hồ', 'Huyện Tam Đường', 'Huyện Tân Uyên', 'Huyện Than Uyên'
  ],
  'Lâm Đồng': [
    'TP. Đà Lạt', 'TP. Bảo Lộc', 'Huyện Đạ Huoai', 'Huyện Đam Rông', 'Huyện Di Linh', 'Huyện Đơn Dương', 'Huyện Đức Trọng', 'Huyện Lạc Dương', 'Huyện Lâm Hà'
  ],
  'Lạng Sơn': [
    'TP. Lạng Sơn', 'Huyện Bắc Sơn', 'Huyện Bình Gia', 'Huyện Cao Lộc', 'Huyện Chi Lăng', 'Huyện Đình Lập', 'Huyện Hữu Lũng', 'Huyện Lộc Bình', 'Huyện Tràng Định', 'Huyện Văn Lãng', 'Huyện Văn Quan'
  ],
  'Lào Cai': [
    'TP. Lào Cai', 'Thị xã Sa Pa', 'Huyện Bắc Hà', 'Huyện Bảo Thắng', 'Huyện Bảo Yên', 'Huyện Bát Xát', 'Huyện Mường Khương', 'Huyện Si Ma Cai', 'Huyện Văn Bàn'
  ],
  'Long An': [
    'TP. Tân An', 'Thị xã Kiến Tường', 'Huyện Bến Lức', 'Huyện Cần Đước', 'Huyện Cần Giuộc', 'Huyện Châu Thành', 'Huyện Đức Hòa', 'Huyện Đức Huệ', 'Huyện Mộc Hóa', 'Huyện Tân Hưng', 'Huyện Tân Thạnh', 'Huyện Tân Trụ', 'Huyện Thạnh Hóa', 'Huyện Thủ Thừa', 'Huyện Vĩnh Hưng'
  ],
  'Nam Định': [
    'TP. Nam Định', 'Huyện Giao Thủy', 'Huyện Hải Hậu', 'Huyện Nam Trực', 'Huyện Nghĩa Hưng', 'Huyện Trực Ninh', 'Huyện Vụ Bản', 'Huyện Xuân Trường', 'Huyện Ý Yên'
  ],
  'Bà Rịa - Vũng Tàu': [
    'TP. Vũng Tàu', 'TP. Bà Rịa', 'TP. Phú Mỹ', 'Huyện Long Đất', 'Huyện Châu Đức', 'Huyện Xuyên Mộc', 'Huyện Côn Đảo'
  ],
  'Bình Dương': [
    'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Tân Uyên', 'TP. Bến Cát',
    'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Huyện Bắc Tân Uyên'
  ],
  'Hà Nam': [
    'TP. Phủ Lý', 'Thị xã Duy Tiên', 'Thị xã Kim Bảng', 'Huyện Bình Lục', 'Huyện Lý Nhân', 'Huyện Thanh Liêm'
  ],
  'Hải Dương': [
    'TP. Hải Dương', 'TP. Chí Linh', 'Thị xã Kinh Môn', 'Huyện Bình Giang', 'Huyện Cẩm Giàng', 'Huyện Gia Lộc', 'Huyện Kim Thành', 'Huyện Nam Sách', 'Huyện Ninh Giang', 'Huyện Thanh Hà', 'Huyện Thanh Miện', 'Huyện Tứ Kỳ'
  ],
  'Hậu Giang': [
    'TP. Vị Thanh', 'TP. Ngã Bảy', 'Thị xã Long Mỹ', 'Huyện Châu Thành', 'Huyện Châu Thành A', 'Huyện Phụng Hiệp', 'Huyện Vị Thủy'
  ],
  'Hòa Bình': [
    'TP. Hòa Bình', 'Huyện Cao Phong', 'Huyện Đà Bắc', 'Huyện Kim Bôi', 'Huyện Lạc Sơn', 'Huyện Lạc Thủy', 'Huyện Lương Sơn', 'Huyện Mai Châu', 'Huyện Tân Lạc', 'Huyện Yên Thủy'
  ],
  'Hưng Yên': [
    'TP. Hưng Yên', 'Thị xã Mỹ Hào', 'Huyện Ân Thi', 'Huyện Khoái Châu', 'Huyện Kim Động', 'Huyện Phù Cừ', 'Huyện Tiên Lữ', 'Huyện Văn Giang', 'Huyện Văn Lâm', 'Huyện Yên Mỹ'
  ],
  'Nghệ An': [
    'TP. Vinh', 'Thị xã Thái Hòa', 'Thị xã Hoàng Mai', 'Huyện Anh Sơn', 'Huyện Con Cuông', 'Huyện Diễn Châu', 'Huyện Đô Lương', 'Huyện Hưng Nguyên', 'Huyện Kỳ Sơn', 'Huyện Nam Đàn', 'Huyện Nghi Lộc', 'Huyện Nghĩa Đàn', 'Huyện Quỳ Châu', 'Huyện Quỳ Hợp', 'Huyện Quỳnh Lưu', 'Huyện Tân Kỳ', 'Huyện Thanh Chương', 'Huyện Tương Dương', 'Huyện Yên Thành'
  ],
  'Ninh Bình': [
    'TP. Ninh Bình', 'TP. Tam Điệp', 'Huyện Gia Viễn', 'Huyện Kim Sơn', 'Huyện Nho Quan', 'Huyện Yên Khánh', 'Huyện Yên Mô'
  ],
  'Ninh Thuận': [
    'TP. Phan Rang - Tháp Chàm', 'Huyện Bác Ái', 'Huyện Ninh Sơn', 'Huyện Ninh Phước', 'Huyện Ninh Hải', 'Huyện Thuận Bắc', 'Huyện Thuận Nam'
  ],
  'Phú Thọ': [
    'TP. Việt Trì', 'Thị xã Phú Thọ', 'Huyện Cẩm Khê', 'Huyện Đoan Hùng', 'Huyện Hạ Hòa', 'Huyện Lâm Thao', 'Huyện Phù Ninh', 'Huyện Tam Nông', 'Huyện Tân Sơn', 'Huyện Thanh Ba', 'Huyện Thanh Sơn', 'Huyện Thanh Thủy', 'Huyện Yên Lập'
  ],
  'Phú Yên': [
    'TP. Tuy Hòa', 'Thị xã Sông Cầu', 'Thị xã Đông Hòa', 'Huyện Đồng Xuân', 'Huyện Phú Hòa', 'Huyện Sơn Hòa', 'Huyện Tây Hòa', 'Huyện Tuy An', 'Huyện Sông Hinh'
  ],
  'Quảng Bình': [
    'TP. Đồng Hới', 'Thị xã Ba Đồn', 'Huyện Bố Trạch', 'Huyện Lệ Thủy', 'Huyện Minh Hóa', 'Huyện Quảng Ninh', 'Huyện Quảng Trạch', 'Huyện Tuyên Hóa'
  ],
  'Quảng Nam': [
    'TP. Tam Kỳ', 'TP. Hội An', 'Thị xã Điện Bàn', 'Huyện Bắc Trà My', 'Huyện Đại Lộc', 'Huyện Đông Giang', 'Huyện Duy Xuyên', 'Huyện Hiệp Đức', 'Huyện Nam Giang', 'Huyện Nam Trà My', 'Huyện Nông Sơn', 'Huyện Núi Thành', 'Huyện Phú Ninh', 'Huyện Phước Sơn', 'Huyện Quế Sơn', 'Huyện Tây Giang', 'Huyện Thăng Bình'
  ],
  'Quảng Ngãi': [
    'TP. Quảng Ngãi', 'Thị xã Đức Phổ', 'Huyện Ba Tơ', 'Huyện Bình Sơn', 'Huyện Lý Sơn', 'Huyện Minh Long', 'Huyện Mộ Đức', 'Huyện Nghĩa Hành', 'Huyện Sơn Hà', 'Huyện Sơn Tây', 'Huyện Sơn Tịnh', 'Huyện Trà Bồng', 'Huyện Tư Nghĩa'
  ],
  'Quảng Ninh': [
    'TP. Hạ Long', 'TP. Móng Cái', 'TP. Cẩm Phả', 'TP. Uông Bí', 'TP. Đông Triều', 'Thị xã Quảng Yên',
    'Huyện Ba Chẽ', 'Huyện Bình Liêu', 'Huyện Cô Tô', 'Huyện Đầm Hà', 'Huyện Hải Hà', 'Huyện Tiên Yên', 'Huyện Vân Đồn'
  ],
  'Quảng Trị': [
    'TP. Đông Hà', 'Thị xã Quảng Trị', 'Huyện Cam Lộ', 'Huyện Cồn Cỏ', 'Huyện Đakrông', 'Huyện Gio Linh', 'Huyện Hải Lăng', 'Huyện Hướng Hóa', 'Huyện Triệu Phong', 'Huyện Vĩnh Linh'
  ],
  'Sóc Trăng': [
    'TP. Sóc Trăng', 'Thị xã Ngã Năm', 'Thị xã Vĩnh Châu', 'Huyện Châu Thành', 'Huyện Cù Lao Dung', 'Huyện Kế Sách', 'Huyện Long Phú', 'Huyện Mỹ Tú', 'Huyện Mỹ Xuyên', 'Huyện Thạnh Trị', 'Huyện Trần Đề'
  ],
  'Sơn La': [
    'TP. Sơn La', 'Thị xã Mộc Châu', 'Huyện Bắc Yên', 'Huyện Mai Sơn', 'Huyện Mường La', 'Huyện Phù Yên', 'Huyện Quỳnh Nhai', 'Huyện Sông Mã', 'Huyện Sốp Cộp', 'Huyện Thuận Châu', 'Huyện Vân Hồ', 'Huyện Yên Châu'
  ],
  'Tây Ninh': [
    'TP. Tây Ninh', 'Thị xã Trảng Bàng', 'Thị xã Hòa Thành', 'Huyện Bến Cầu', 'Huyện Châu Thành', 'Huyện Dương Minh Châu', 'Huyện Gò Dầu', 'Huyện Tân Biên', 'Huyện Tân Châu'
  ],
  'Thái Bình': [
    'TP. Thái Bình', 'Huyện Đông Hưng', 'Huyện Hưng Hà', 'Huyện Kiến Xương', 'Huyện Quỳnh Phụ', 'Huyện Thái Thụy', 'Huyện Tiền Hải', 'Huyện Vũ Thư'
  ],
  'Thái Nguyên': [
    'TP. Thái Nguyên', 'TP. Sông Công', 'TP. Phổ Yên', 'Huyện Đại Từ', 'Huyện Định Hóa', 'Huyện Đồng Hỷ', 'Huyện Phú Bình', 'Huyện Phú Lương', 'Huyện Võ Nhai'
  ],
  'Thanh Hóa': [
    'TP. Thanh Hóa', 'TP. Sầm Sơn', 'Thị xã Bỉm Sơn', 'Thị xã Nghi Sơn', 'Huyện Bá Thước', 'Huyện Cẩm Thủy', 'Huyện Hà Trung', 'Huyện Hậu Lộc', 'Huyện Hoằng Hóa', 'Huyện Lang Chánh', 'Huyện Mường Lát', 'Huyện Nga Sơn', 'Huyện Ngọc Lặc', 'Huyện Như Thanh', 'Huyện Như Xuân', 'Huyện Nông Cống', 'Huyện Quan Hóa', 'Huyện Quan Sơn', 'Huyện Quảng Xương', 'Huyện Thạch Thành', 'Huyện Thiệu Hóa', 'Huyện Thọ Xuân', 'Huyện Thường Xuân', 'Huyện Triệu Sơn', 'Huyện Vĩnh Lộc', 'Huyện Yên Định'
  ],
  'Tiền Giang': [
    'TP. Mỹ Tho', 'TP. Gò Công', 'Thị xã Cai Lậy', 'Huyện Cái Bè', 'Huyện Châu Thành', 'Huyện Chợ Gạo', 'Huyện Gò Công Đông', 'Huyện Gò Công Tây', 'Huyện Tân Phú Đông', 'Huyện Tân Phước'
  ],
  'Trà Vinh': [
    'TP. Trà Vinh', 'Thị xã Duyên Hải', 'Huyện Càng Long', 'Huyện Cầu Kè', 'Huyện Cầu Ngang', 'Huyện Châu Thành', 'Huyện Duyên Hải', 'Huyện Tiểu Cần', 'Huyện Trà Cú'
  ],
  'Tuyên Quang': [
    'TP. Tuyên Quang', 'Huyện Chiêm Hóa', 'Huyện Hàm Yên', 'Huyện Lâm Bình', 'Huyện Na Hang', 'Huyện Sơn Dương', 'Huyện Yên Sơn'
  ],
  'Vĩnh Long': [
    'TP. Vĩnh Long', 'Thị xã Bình Minh', 'Huyện Bình Tân', 'Huyện Long Hồ', 'Huyện Mang Thít', 'Huyện Tam Bình', 'Huyện Trà Ôn', 'Huyện Vũng Liêm'
  ],
  'Vĩnh Phúc': [
    'TP. Vĩnh Yên', 'TP. Phúc Yên', 'Huyện Bình Xuyên', 'Huyện Lập Thạch', 'Huyện Sông Lô', 'Huyện Tam Dương', 'Huyện Tam Đảo', 'Huyện Vĩnh Tường', 'Huyện Yên Lạc'
  ],
  'Yên Bái': [
    'TP. Yên Bái', 'Thị xã Nghĩa Lộ', 'Huyện Lục Yên', 'Huyện Mù Cang Chải', 'Huyện Trạm Tấu', 'Huyện Trấn Yên', 'Huyện Văn Chấn', 'Huyện Văn Yên', 'Huyện Yên Bình'
  ]
};

export const DEFAULT_DISTRICTS = [
  'Thành phố / Thị xã trung tâm',
  'Quận / Huyện trung tâm',
  'Huyện ngoại thành / Khác'
];

export function getDistrictsForProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  if (DISTRICTS_BY_PROVINCE[provinceName]) return DISTRICTS_BY_PROVINCE[provinceName];

  // Tra cứu thông minh hỗ trợ các biến thể có/không có tiền tố "TP."
  const normalized = provinceName.replace(/^TP\.\s*/i, '').trim();
  const matchedKey = Object.keys(DISTRICTS_BY_PROVINCE).find(
    k => k.replace(/^TP\.\s*/i, '').trim() === normalized
  );

  return matchedKey ? DISTRICTS_BY_PROVINCE[matchedKey] : DEFAULT_DISTRICTS;
}

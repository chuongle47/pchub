-- ============================================================================
-- seed.sql: Initial Seed Data for PCHub (Idempotent)
-- ============================================================================

-- 1. CATEGORIES (Insert if not exists by slug)
INSERT INTO public.categories (slug, name, icon, sort_order, is_active) VALUES
('cpu', 'CPU - Bộ Vi Xử Lý', 'cpu', 1, true),
('mainboard', 'Mainboard - Bo Mạch Chủ', 'circuit-board', 2, true),
('ram', 'RAM - Bộ Nhớ Trong', 'memory-stick', 3, true),
('gpu', 'VGA - Card Màn Hình', 'gpu', 4, true),
('ssd-hdd', 'Ổ Cứng SSD / HDD', 'hard-drive', 5, true),
('psu', 'Nguồn Máy Tính (PSU)', 'zap', 6, true),
('case', 'Vỏ Case Máy Tính', 'box', 7, true),
('cooling', 'Tản Nhiệt CPU / Fan', 'fan', 8, true),
('monitor', 'Màn Hình Máy Tính', 'monitor', 9, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- 2. BRANDS
INSERT INTO public.brands (slug, name, is_active) VALUES
('intel', 'Intel', true),
('amd', 'AMD', true),
('asus', 'ASUS', true),
('msi', 'MSI', true),
('gigabyte', 'Gigabyte', true),
('nvidia', 'NVIDIA', true),
('corsair', 'Corsair', true),
('kingston', 'Kingston', true),
('samsung', 'Samsung', true),
('western-digital', 'Western Digital', true),
('nzxt', 'NZXT', true),
('noctua', 'Noctua', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. STORE SETTINGS
INSERT INTO public.settings (key, value, description) VALUES
('general', '{
    "store_name": "PCHub - High Performance PC Store",
    "hotline": "1900 6868",
    "zalo": "0988888888",
    "email": "support@pchub.vn",
    "address": "Tầng 5, Tòa nhà Tech Tower, Cầu Giấy, Hà Nội",
    "opening_hours": "08:30 - 21:30 hàng ngày",
    "vat_percentage": 8
}'::jsonb, 'Thông tin liên hệ và nhận diện cửa hàng'),
('seo', '{
    "site_title": "PCHub - Chuyên Linh Kiện PC & Build Máy Tính Chuyên Nghiệp",
    "site_description": "Cửa hàng linh kiện máy tính, build PC gaming, đồ họa chính hãng, kiểm tra tương thích AI thông minh, bảo hành tận tâm.",
    "keywords": "build pc, linh kiện máy tính, rtx 4090, ryzen 7, core i7, pchub"
}'::jsonb, 'Cấu hình SEO mặc định')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. SHIPPING ZONES
INSERT INTO public.shipping_zones (name, provinces, fee, free_from, is_active) VALUES
('Nội thành Hà Nội & TP.HCM', ARRAY['Hà Nội', 'Hồ Chí Minh'], 30000, 2000000, true),
('Khu vực Miền Bắc & Miền Nam', ARRAY['Hải Phòng', 'Bắc Ninh', 'Bình Dương', 'Đồng Nai', 'Đà Nẵng'], 45000, 5000000, true),
('Toàn Quốc - Giao Nhanh', ARRAY['Toàn Quốc'], 60000, 10000000, true)
ON CONFLICT DO NOTHING;

-- 5. COUPONS
INSERT INTO public.coupons (code, type, value, min_order, max_discount, max_uses, is_active) VALUES
('PCHUBWELCOME', 'percent', 10, 500000, 200000, 1000, true),
('FREESHIP', 'fixed', 50000, 2000000, NULL, 500, true)
ON CONFLICT (code) DO NOTHING;

-- 6. COMPATIBILITY RULES
INSERT INTO public.compat_rules (rule_type, source_category, target_category, config, is_active) VALUES
('socket_match', 'cpu', 'mainboard', '{
    "description": "Socket CPU phải trùng khớp với Socket trên Bo mạch chủ",
    "mapping": {
        "LGA1700": ["LGA1700"],
        "LGA1851": ["LGA1851"],
        "AM4": ["AM4"],
        "AM5": ["AM5"]
    }
}'::jsonb, true),
('ram_standard', 'ram', 'mainboard', '{
    "description": "Chuẩn RAM (DDR4 / DDR5) phải khớp với chuẩn hỗ trợ của Mainboard",
    "mapping": {
        "DDR4": ["DDR4"],
        "DDR5": ["DDR5"]
    }
}'::jsonb, true),
('psu_wattage_guard', 'gpu', 'psu', '{
    "description": "Công suất nguồn máy tính (PSU) phải đáp ứng mức khuyến nghị tối thiểu của VGA",
    "rules": [
        {"gpu_power_req": 850, "min_psu_wattage": 850},
        {"gpu_power_req": 750, "min_psu_wattage": 750},
        {"gpu_power_req": 650, "min_psu_wattage": 650},
        {"gpu_power_req": 550, "min_psu_wattage": 550}
    ]
}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- 7. PRODUCTS SEED (Linking via slug lookup to avoid hardcoded ID conflicts)
INSERT INTO public.products (
    slug, name, sku, brand_id, category_id,
    price, sale_price, stock, warranty_months,
    images, description, specs, is_hot, is_active
) VALUES
(
    'intel-core-i7-14700k',
    'CPU Intel Core i7-14700K (Up to 5.60 GHz, 20 nhân 28 luồng, 33MB Cache, Raptor Lake Refresh)',
    'CPU-INTEL-14700K',
    (SELECT id FROM public.brands WHERE slug = 'intel' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'cpu' LIMIT 1),
    11490000, 10890000, 25, 36,
    ARRAY['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800'],
    'Intel Core i7-14700K mang đến bước nhảy vọt về hiệu năng đa nhiệm với 20 nhân, xung nhịp 5.6 GHz lý tưởng cho game thủ và đồ họa.',
    '{
        "socket": "LGA1700",
        "cores": 20,
        "threads": 28,
        "base_clock": "3.4 GHz",
        "boost_clock": "5.6 GHz",
        "cache": "33 MB Intel Smart Cache",
        "tdp": 125,
        "max_turbo_power": 253,
        "ram_support": ["DDR4", "DDR5"]
    }'::jsonb,
    true, true
),
(
    'amd-ryzen-7-7800x3d',
    'CPU AMD Ryzen 7 7800X3D (4.2 GHz - 5.0 GHz, 8 nhân 16 luồng, 96MB 3D V-Cache, AM5)',
    'CPU-AMD-7800X3D',
    (SELECT id FROM public.brands WHERE slug = 'amd' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'cpu' LIMIT 1),
    11990000, 11490000, 18, 36,
    ARRAY['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800'],
    'Ông vua chơi game hiện nay với công nghệ 3D V-Cache 96MB độc quyền, hiệu suất khung hình vượt trội trên các tựa game esports và AAA đỉnh cao.',
    '{
        "socket": "AM5",
        "cores": 8,
        "threads": 16,
        "base_clock": "4.2 GHz",
        "boost_clock": "5.0 GHz",
        "cache": "96 MB L3 3D V-Cache",
        "tdp": 120,
        "ram_support": ["DDR5"]
    }'::jsonb,
    true, true
),
(
    'asus-rog-strix-z790-a-gaming-wifi-ii',
    'Mainboard ASUS ROG STRIX Z790-A GAMING WIFI II DDR5',
    'MB-ASUS-Z790A-WIFI',
    (SELECT id FROM public.brands WHERE slug = 'asus' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'mainboard' LIMIT 1),
    10290000, 9790000, 15, 36,
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'],
    'Bo mạch chủ cao cấp tông màu trắng bạc sang trọng, hỗ trợ CPU Intel LGA1700 Gen 12/13/14, 5 khe M.2 PCIe 4.0/5.0, WiFi 7 thế hệ mới.',
    '{
        "chipset": "Z790",
        "socket": "LGA1700",
        "form_factor": "ATX",
        "ram_slots": 4,
        "ram_type": "DDR5",
        "max_ram_capacity": 192,
        "pcie_slots": "PCIe 5.0 x16",
        "m2_slots": 5,
        "connectivity": "WiFi 7 + 2.5Gb LAN"
    }'::jsonb,
    true, true
),
(
    'asus-tuf-gaming-geforce-rtx-4070-ti-super-16gb',
    'Card màn hình ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X OC Edition',
    'VGA-ASUS-4070TIS-16G',
    (SELECT id FROM public.brands WHERE slug = 'asus' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'gpu' LIMIT 1),
    24890000, 23990000, 10, 36,
    ARRAY['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'],
    'Được trang bị chip đồ họa AD103 với 16GB VRAM GDDR6X, hệ thống tản nhiệt 3 quạt vòng bi kép bền bỉ chuẩn quân đội TUF Gaming.',
    '{
        "chipset": "RTX 4070 Ti SUPER",
        "vram": "16 GB GDDR6X",
        "bus_width": "256-bit",
        "length_mm": 305,
        "tdp": 285,
        "recommended_psu": 750,
        "power_connectors": "1x 16-pin 12VHPWR"
    }'::jsonb,
    true, true
)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    stock = EXCLUDED.stock,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
-- Full Clean Data SQL for PC Component Comparison System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stock INT DEFAULT 0,
    specs JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- BRANDS
INSERT INTO brands (id, name, slug) VALUES
('b1000000-0000-0000-0000-000000000001', 'Intel', 'intel'),
('b1000000-0000-0000-0000-000000000002', 'AMD', 'amd'),
('b1000000-0000-0000-0000-000000000003', 'ASUS', 'asus'),
('b1000000-0000-0000-0000-000000000004', 'MSI', 'msi'),
('b1000000-0000-0000-0000-000000000005', 'Gigabyte', 'gigabyte'),
('b1000000-0000-0000-0000-000000000006', 'ASRock', 'asrock'),
('b1000000-0000-0000-0000-000000000007', 'Corsair', 'corsair'),
('b1000000-0000-0000-0000-000000000008', 'G.Skill', 'gskill'),
('b1000000-0000-0000-0000-000000000009', 'Kingston', 'kingston'),
('b1000000-0000-0000-0000-000000000010', 'Samsung', 'samsung'),
('b1000000-0000-0000-0000-000000000011', 'Western Digital', 'western-digital'),
('b1000000-0000-0000-0000-000000000012', 'NZXT', 'nzxt'),
('b1000000-0000-0000-0000-000000000013', 'Lian Li', 'lian-li'),
('b1000000-0000-0000-0000-000000000014', 'Deepcool', 'deepcool'),
('b1000000-0000-0000-0000-000000000015', 'Noctua', 'noctua'),
('b1000000-0000-0000-0000-000000000016', 'Zotac', 'zotac'),
('b1000000-0000-0000-0000-000000000017', 'Sapphire', 'sapphire'),
('b1000000-0000-0000-0000-000000000018', 'Seasonic', 'seasonic')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- CATEGORIES
INSERT INTO categories (id, name, slug, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'CPU - Bộ Vi Xử Lý', 'cpu', 'cpu'),
('c1000000-0000-0000-0000-000000000002', 'Mainboard - Bo Mạch Chủ', 'mainboard', 'circuit-board'),
('c1000000-0000-0000-0000-000000000003', 'RAM - Bộ Nhớ Trong', 'ram', 'memory'),
('c1000000-0000-0000-0000-000000000004', 'GPU - Card Màn Hình', 'gpu', 'gpu'),
('c1000000-0000-0000-0000-000000000005', 'SSD / HDD - Ổ Đĩa Cứng', 'storage', 'hard-drive'),
('c1000000-0000-0000-0000-000000000006', 'PSU - Nguồn Máy Tính', 'psu', 'zap'),
('c1000000-0000-0000-0000-000000000007', 'Case - Vỏ Máy Tính', 'case', 'box'),
('c1000000-0000-0000-0000-000000000008', 'Tản Nhiệt (Cooling)', 'cooling', 'fan')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- PRODUCTS
INSERT INTO products (name, slug, category_id, brand_id, sku, price, stock, specs, image_url) VALUES
('Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng, 36MB Cache, LGA 1700)', 'intel-core-i9-14900k', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071514900K', 13990000, 45, '{"socket":"LGA1700","cores":24,"threads":32,"clock_ghz":"6.0GHz","tdp_watt":253,"integrated_gpu":true,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('Intel Core i9-14900KF (Up to 6.0GHz, 24 Nhân 32 Luồng, 36MB Cache, LGA 1700)', 'intel-core-i9-14900kf', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071514900KF', 13490000, 30, '{"socket":"LGA1700","cores":24,"threads":32,"clock_ghz":"6.0GHz","tdp_watt":253,"integrated_gpu":false,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng, 33MB Cache, LGA 1700)', 'intel-core-i7-14700k', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071514700K', 9290000, 60, '{"socket":"LGA1700","cores":20,"threads":28,"clock_ghz":"5.6GHz","tdp_watt":253,"integrated_gpu":true,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('Intel Core i7-14700KF (Up to 5.6GHz, 20 Nhân 28 Luồng, 33MB Cache, LGA 1700)', 'intel-core-i7-14700kf', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071514700KF', 8890000, 50, '{"socket":"LGA1700","cores":20,"threads":28,"clock_ghz":"5.6GHz","tdp_watt":253,"integrated_gpu":false,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('Intel Core i5-14600K (Up to 5.3GHz, 14 Nhân 20 Luồng, 24MB Cache, LGA 1700)', 'intel-core-i5-14600k', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071514600K', 6490000, 80, '{"socket":"LGA1700","cores":14,"threads":20,"clock_ghz":"5.3GHz","tdp_watt":181,"integrated_gpu":true,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('Intel Core i5-13400F (Up to 4.6GHz, 10 Nhân 16 Luồng, 20MB Cache, LGA 1700)', 'intel-core-i5-13400f', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BX8071513400F', 3990000, 95, '{"socket":"LGA1700","cores":10,"threads":16,"clock_ghz":"4.6GHz","tdp_watt":65,"integrated_gpu":false,"ram_support":["DDR4","DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('AMD Ryzen 9 7950X3D Processor 16 Cores 32 Threads 144MB 3D V-Cache AM5', 'amd-ryzen-9-7950x3d', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '100-100000908WOF', 15990000, 35, '{"socket":"AM5","cores":16,"threads":32,"clock_ghz":"5.7GHz","tdp_watt":120,"integrated_gpu":true,"ram_support":["DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('AMD Ryzen 9 7900X3D Processor 12 Cores 24 Threads 140MB 3D V-Cache AM5', 'amd-ryzen-9-7900x3d', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '100-100000909WOF', 12500000, 40, '{"socket":"AM5","cores":12,"threads":24,"clock_ghz":"5.6GHz","tdp_watt":120,"integrated_gpu":true,"ram_support":["DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('AMD Ryzen 7 7800X3D Processor 8 Cores 16 Threads 104MB 3D V-Cache AM5', 'amd-ryzen-7-7800x3d', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '100-100000910WOF', 9890000, 75, '{"socket":"AM5","cores":8,"threads":16,"clock_ghz":"5.0GHz","tdp_watt":120,"integrated_gpu":true,"ram_support":["DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('AMD Ryzen 5 7600X Processor 6 Cores 12 Threads 38MB Cache AM5', 'amd-ryzen-5-7600x', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '100-100000593WOF', 4990000, 90, '{"socket":"AM5","cores":6,"threads":12,"clock_ghz":"5.3GHz","tdp_watt":105,"integrated_gpu":true,"ram_support":["DDR5"]}'::jsonb, '/images/cpu-box.jpg'),
('AMD Ryzen 5 5600X Processor 6 Cores 12 Threads 35MB Cache AM4', 'amd-ryzen-5-5600x', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '100-100000065BOX', 3290000, 110, '{"socket":"AM4","cores":6,"threads":12,"clock_ghz":"4.6GHz","tdp_watt":65,"integrated_gpu":false,"ram_support":["DDR4"]}'::jsonb, '/images/cpu-box.jpg'),
('ASUS ROG STRIX Z790-E GAMING WIFI II LGA1700 ATX', 'asus-rog-strix-z790-e-gaming-wifi-ii', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'ROG-Z790E-GAMING-WIFI-II', 11490000, 25, '{"socket":"LGA1700","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 5.0"}'::jsonb, '/images/gpu-white.jpg'),
('MSI MPG Z790 CARBON WIFI LGA1700 ATX', 'msi-mpg-z790-carbon-wifi', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'MPG-Z790-CARBON-WIFI', 9890000, 30, '{"socket":"LGA1700","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 5.0"}'::jsonb, '/images/gpu-white.jpg'),
('MSI MAG B760M MORTAR WIFI DDR5 Micro-ATX', 'msi-mag-b760m-mortar-wifi-ddr5', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'MAG-B760M-MORTAR-WIFI-D5', 4290000, 50, '{"socket":"LGA1700","form_factor":"Micro-ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 5.0"}'::jsonb, '/images/gpu-white.jpg'),
('Gigabyte Z790 AORUS ELITE AX LGA1700 ATX', 'gigabyte-z790-aorus-elite-ax', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'Z790-AORUS-ELITE-AX', 6890000, 45, '{"socket":"LGA1700","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 5.0"}'::jsonb, '/images/gpu-white.jpg'),
('Gigabyte X670E AORUS MASTER AM5 ATX', 'gigabyte-x670e-aorus-master', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'X670E-AORUS-MASTER', 12890000, 20, '{"socket":"AM5","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 5.0"}'::jsonb, '/images/gpu-white.jpg'),
('ASUS TUF GAMING B650-PLUS WIFI AM5 ATX', 'asus-tuf-gaming-b650-plus-wifi', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'TUF-GAMING-B650-PLUS-WIFI', 5490000, 40, '{"socket":"AM5","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-white.jpg'),
('ASRock B650M Pro RS WiFi AM5 Micro-ATX', 'asrock-b650m-pro-rs-wifi', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'B650M-PRO-RS-WIFI', 3690000, 55, '{"socket":"AM5","form_factor":"Micro-ATX","ram_type":"DDR5","ram_slots":4,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-white.jpg'),
('G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz CL30', 'gskill-trident-z5-rgb-32gb', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008', 'F5-6000J3038F16GX2-TZ5RK', 3490000, 88, '{"ram_type":"DDR5","capacity_gb":32,"kit":"2x16GB","bus_speed_mhz":6000,"cas_latency":"CL30"}'::jsonb, '/images/ram-rgb.jpg'),
('G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL30 Black', 'gskill-trident-z5-rgb-64gb', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008', 'F5-6000J3040G32GX2-TZ5RK', 6290000, 30, '{"ram_type":"DDR5","capacity_gb":64,"kit":"2x32GB","bus_speed_mhz":6000,"cas_latency":"CL30"}'::jsonb, '/images/ram-rgb.jpg'),
('Corsair Vengeance RGB 32GB (2x16GB) DDR5 5600MHz Black', 'corsair-vengeance-rgb-32gb-ddr5-5600', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', 'CMH32GX5M2B5600C36', 2890000, 65, '{"ram_type":"DDR5","capacity_gb":32,"kit":"2x16GB","bus_speed_mhz":5600,"cas_latency":"CL36"}'::jsonb, '/images/ram-rgb.jpg'),
('Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 7200MHz', 'corsair-dominator-titanium-32gb-ddr5-7200', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', 'CMP32GX5M2X7200C34', 4990000, 25, '{"ram_type":"DDR5","capacity_gb":32,"kit":"2x16GB","bus_speed_mhz":7200,"cas_latency":"CL34"}'::jsonb, '/images/ram-rgb.jpg'),
('Kingston FURY Beast RGB 16GB (2x8GB) DDR4 3200MHz', 'kingston-fury-beast-rgb-16gb-ddr4-3200', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009', 'KF432C16BB1AK2/16', 1190000, 120, '{"ram_type":"DDR4","capacity_gb":16,"kit":"2x8GB","bus_speed_mhz":3200,"cas_latency":"CL16"}'::jsonb, '/images/ram-rgb.jpg'),
('ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X', 'asus-rog-strix-geforce-rtx-4090-oc-edition', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'ROG-STRIX-RTX4090-O24G-GAMING', 54990000, 12, '{"vram_gb":24,"vram_type":"GDDR6X","tdp_watt":450,"length_mm":357,"recommended_psu_watt":1000,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-strix.jpg'),
('MSI GeForce RTX 4090 SUPRIM X 24G GDDR6X', 'msi-geforce-rtx-4090-suprim-x-24g', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'RTX-4090-SUPRIM-X-24G', 52990000, 10, '{"vram_gb":24,"vram_type":"GDDR6X","tdp_watt":450,"length_mm":336,"recommended_psu_watt":1000,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-strix.jpg'),
('ASUS ROG Strix GeForce RTX 4080 SUPER OC Edition 16GB GDDR6X', 'asus-rog-strix-geforce-rtx-4080-super', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'ROG-STRIX-RTX4080S-O16G-GAMING', 32490000, 18, '{"vram_gb":16,"vram_type":"GDDR6X","tdp_watt":320,"length_mm":357,"recommended_psu_watt":850,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-white.jpg'),
('ASUS ROG Strix GeForce RTX 4070 Ti SUPER OC Edition 16GB GDDR6X', 'asus-rog-strix-geforce-rtx-4070-ti-super', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'ROG-STRIX-RTX4070TIS-O16G', 24590000, 22, '{"vram_gb":16,"vram_type":"GDDR6X","tdp_watt":285,"length_mm":336,"recommended_psu_watt":750,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-strix.jpg'),
('Gigabyte AERO GeForce RTX 4060 Ti OC 8G GDDR6 White Edition', 'gigabyte-aero-geforce-rtx-4060-ti', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 'GV-N406TAERO OC-8GD', 12490000, 35, '{"vram_gb":8,"vram_type":"GDDR6","tdp_watt":160,"length_mm":281,"recommended_psu_watt":500,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-white.jpg'),
('MSI Gaming X GeForce RTX 4060 8GB GDDR6 Twin Frozr 9', 'msi-gaming-x-geforce-rtx-4060-8gb', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'RTX-4060-GAMING-X-8G', 8490000, 50, '{"vram_gb":8,"vram_type":"GDDR6","tdp_watt":115,"length_mm":247,"recommended_psu_watt":550,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-strix.jpg'),
('Zotac Gaming GeForce RTX 4070 SUPER Twin Edge 12GB GDDR6X', 'zotac-gaming-geforce-rtx-4070-super', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000016', 'ZT-D40720E-10M', 16290000, 30, '{"vram_gb":12,"vram_type":"GDDR6X","tdp_watt":220,"length_mm":225,"recommended_psu_watt":650,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-white.jpg'),
('Sapphire NITRO+ AMD Radeon RX 7900 XTX Vapor-X 24GB GDDR6', 'sapphire-nitro-amd-radeon-rx-7900-xtx', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000017', '11322-01-20G', 28990000, 15, '{"vram_gb":24,"vram_type":"GDDR6","tdp_watt":420,"length_mm":320,"recommended_psu_watt":850,"pcie_version":"PCIe 4.0"}'::jsonb, '/images/gpu-strix.jpg'),
('Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2 SSD', 'samsung-990-pro-2tb', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', 'MZ-V9P2T0BW', 4890000, 60, '{"type":"SSD_NVMe","capacity_gb":2000,"form_factor":"M.2 2280","read_speed":"7450MB/s","write_speed":"6900MB/s"}'::jsonb, '/images/ram-rgb.jpg'),
('Samsung 980 Pro 1TB PCIe Gen 4.0 x4 NVMe M.2 SSD', 'samsung-980-pro-1tb', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', 'MZ-V8P1T0BW', 2590000, 75, '{"type":"SSD_NVMe","capacity_gb":1000,"form_factor":"M.2 2280","read_speed":"7000MB/s","write_speed":"5000MB/s"}'::jsonb, '/images/ram-rgb.jpg'),
('Western Digital Black SN850X 1TB NVMe M.2 SSD', 'wd-black-sn850x-1tb', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000011', 'WDS100T2X0E', 2590000, 80, '{"type":"SSD_NVMe","capacity_gb":1000,"form_factor":"M.2 2280","read_speed":"7300MB/s","write_speed":"6300MB/s"}'::jsonb, '/images/ram-rgb.jpg'),
('Kingston NV2 1TB PCIe 4.0 NVMe M.2 SSD', 'kingston-nv2-1tb', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000009', 'SNV2S/1000G', 1490000, 150, '{"type":"SSD_NVMe","capacity_gb":1000,"form_factor":"M.2 2280","read_speed":"3500MB/s","write_speed":"2100MB/s"}'::jsonb, '/images/ram-rgb.jpg'),
('Corsair RM1000x 1000W 80 Plus Gold Full Modular Power Supply', 'corsair-rm1000x-1000w-80-plus-gold', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 'CP-9020201-NA', 4390000, 35, '{"wattage":1000,"modularity":"Full-Modular","efficiency_rating":"80_Plus_Gold","fan_size_mm":135}'::jsonb, '/images/gpu-white.jpg'),
('Corsair RM850e 850W 80 Plus Gold Fully Modular ATX 3.0', 'corsair-rm850e-850w-atx-30', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 'CP-9020263-NA', 3190000, 50, '{"wattage":850,"modularity":"Full-Modular","efficiency_rating":"80_Plus_Gold","fan_size_mm":120}'::jsonb, '/images/gpu-white.jpg'),
('Seasonic PRIME GX-850 850W 80 Plus Gold Full Modular', 'seasonic-prime-gx-850-850w', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000018', 'PRIME-GX-850', 3690000, 40, '{"wattage":850,"modularity":"Full-Modular","efficiency_rating":"80_Plus_Gold","fan_size_mm":135}'::jsonb, '/images/gpu-white.jpg'),
('MSI MAG A750GL PCIE5 750W 80 Plus Gold Full Modular', 'msi-mag-a750gl-pcie5-750w', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'MAG-A750GL-PCIE5', 2490000, 65, '{"wattage":750,"modularity":"Full-Modular","efficiency_rating":"80_Plus_Gold","fan_size_mm":120}'::jsonb, '/images/gpu-white.jpg'),
('NZXT H9 Flow RGB Dual-Chamber Mid-Tower Case Black', 'nzxt-h9-flow-rgb-black', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000012', 'CM-H91FB-R1', 4290000, 25, '{"max_gpu_length_mm":435,"max_cooler_height_mm":165,"supported_mainboards":["ATX","Micro-ATX","Mini-ITX"]}'::jsonb, '/images/hero-pc.jpg'),
('NZXT H5 Flow RGB Compact Mid-Tower Case White', 'nzxt-h5-flow-rgb-white', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000012', 'CC-H51FW-R1', 2490000, 40, '{"max_gpu_length_mm":365,"max_cooler_height_mm":165,"supported_mainboards":["ATX","Micro-ATX","Mini-ITX"]}'::jsonb, '/images/hero-pc.jpg'),
('Lian Li O11 Dynamic EVO XL Black E-ATX Case', 'lian-li-o11-dynamic-evo-xl-black', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000013', 'O11DEXL-X', 5890000, 18, '{"max_gpu_length_mm":460,"max_cooler_height_mm":167,"supported_mainboards":["E-ATX","ATX","Micro-ATX"]}'::jsonb, '/images/hero-pc.jpg'),
('Corsair 4000D AIRFLOW Tempered Glass Mid-Tower Black', 'corsair-4000d-airflow-black', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007', 'CC-9011200-WW', 2190000, 70, '{"max_gpu_length_mm":360,"max_cooler_height_mm":170,"supported_mainboards":["ATX","Micro-ATX","Mini-ITX"]}'::jsonb, '/images/hero-pc.jpg'),
('NZXT Kraken Elite 360 RGB Black Liquid AIO Cooler', 'nzxt-kraken-elite-360-rgb-black', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000012', 'RL-KR36E-B1', 6890000, 20, '{"cooling_type":"Liquid_AIO","radiator_size_mm":360,"supported_sockets":["LGA1700","AM5","AM4"],"tdp_capacity_watt":300}'::jsonb, '/images/hero-pc.jpg'),
('Corsair iCUE H150i ELITE LCD XT Liquid CPU Cooler', 'corsair-icue-h150i-elite-lcd-xt', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000007', 'CW-9060075-WW', 7890000, 15, '{"cooling_type":"Liquid_AIO","radiator_size_mm":360,"supported_sockets":["LGA1700","AM5","AM4"],"tdp_capacity_watt":320}'::jsonb, '/images/hero-pc.jpg'),
('Deepcool LT720 360mm High-Performance Liquid CPU Cooler', 'deepcool-lt720-360mm', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000014', 'R-LT720-BKAMNF-G-1', 3290000, 45, '{"cooling_type":"Liquid_AIO","radiator_size_mm":360,"supported_sockets":["LGA1700","AM5","AM4"],"tdp_capacity_watt":300}'::jsonb, '/images/hero-pc.jpg'),
('Noctua NH-D15 chromax.black Dual-Tower Air Cooler', 'noctua-nh-d15-chromax-black', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000015', 'NH-D15-CH-BK', 2990000, 35, '{"cooling_type":"Air","radiator_size_mm":140,"supported_sockets":["LGA1700","AM5","AM4"],"tdp_capacity_watt":220}'::jsonb, '/images/hero-pc.jpg'),
('Thermalright Peerless Assassin 120 SE ARGB Air Cooler', 'thermalright-peerless-assassin-120-se', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000014', 'PA120-SE-ARGB', 890000, 100, '{"cooling_type":"Air","radiator_size_mm":120,"supported_sockets":["LGA1700","AM5","AM4"],"tdp_capacity_watt":240}'::jsonb, '/images/hero-pc.jpg')
ON CONFLICT (slug) DO NOTHING;

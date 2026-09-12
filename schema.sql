-- Database Schema for PC Component Comparison & Filtering System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Categories if not exists
INSERT INTO categories (id, name, slug, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'CPU - Bộ Vi Xử Lý', 'cpu', 'cpu'),
('c1000000-0000-0000-0000-000000000002', 'Mainboard - Bo Mạch Chủ', 'mainboard', 'circuit-board'),
('c1000000-0000-0000-0000-000000000003', 'RAM - Bộ Nhớ Trong', 'ram', 'memory'),
('c1000000-0000-0000-0000-000000000004', 'GPU - Card Màn Hình', 'gpu', 'gpu'),
('c1000000-0000-0000-0000-000000000005', 'SSD / HDD - Ô Đĩa Cứng', 'storage', 'hard-drive'),
('c1000000-0000-0000-0000-000000000006', 'PSU - Nguồn Máy Tính', 'psu', 'zap'),
('c1000000-0000-0000-0000-000000000007', 'Case - Vỏ Máy Tính', 'case', 'box'),
('c1000000-0000-0000-0000-000000000008', 'Tản Nhiệt (Cooling)', 'cooling', 'fan')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 2. Table: brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Core Brands if not exists
INSERT INTO brands (id, name, slug, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Intel', 'intel', true),
('b1000000-0000-0000-0000-000000000002', 'AMD', 'amd', true),
('b1000000-0000-0000-0000-000000000003', 'ASUS', 'asus', true),
('b1000000-0000-0000-0000-000000000004', 'MSI', 'msi', true),
('b1000000-0000-0000-0000-000000000005', 'Gigabyte', 'gigabyte', true),
('b1000000-0000-0000-0000-000000000006', 'NVIDIA', 'nvidia', true),
('b1000000-0000-0000-0000-000000000007', 'Corsair', 'corsair', true),
('b1000000-0000-0000-0000-000000000008', 'Kingston', 'kingston', true),
('b1000000-0000-0000-0000-000000000009', 'Samsung', 'samsung', true),
('b1000000-0000-0000-0000-000000000010', 'Western Digital', 'western-digital', true),
('b1000000-0000-0000-0000-000000000011', 'Cooler Master', 'cooler-master', true),
('b1000000-0000-0000-0000-000000000012', 'NZXT', 'nzxt', true),
('b1000000-0000-0000-0000-000000000013', 'Noctua', 'noctua', true),
('b1000000-0000-0000-0000-000000000014', 'Deepcool', 'deepcool', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Table: products
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

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_specs_gin ON products USING gin(specs);

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import seed from './seed.json';
import { getProductOriginalPrice } from './product-ui';
import {
  fetchSbuyProductsLive,
  getSbuyProductBySlugOrId,
  AppProduct
} from './sbuy';

function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  const isLocalHost = (host?: string) => !host || host === 'localhost' || host === '127.0.0.1';

  let newPool: Pool;
  if (connectionString) {
    const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
    newPool = new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 1500,
      max: 3,
    });
  } else {
    const host = process.env.PGHOST || 'localhost';
    newPool = new Pool({
      host,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'linhkien',
      port: parseInt(process.env.PGPORT || '5432', 10),
      ssl: !isLocalHost(host) ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 1500,
      max: 3,
    });
  }

  newPool.on('error', (err) => {
    console.error('Unexpected error on idle pg client:', err);
  });

  return newPool;
}

export const pool = createPool();

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand_id: string;
  sku: string;
  price: number;
  stock: number;
  specs: any;
  image_url?: string;
  images?: string[];
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  brand_slug?: string;
  original_price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: 'hot' | 'new' | 'sale';
}

export interface ProductsFilter {
  category_id?: string;
  brand_id?: string;
  search?: string;
  slug?: string;
  ids?: string[];
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

const STANDARD_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu', icon: 'cpu' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard', icon: 'circuit-board' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'RAM - Bộ Nhớ Trong', slug: 'ram', icon: 'memory' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'GPU - Card Màn Hình', slug: 'gpu', icon: 'gpu' },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'SSD / HDD - Ổ Đĩa Cứng', slug: 'storage', icon: 'hard-drive' },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'PSU - Nguồn Máy Tính', slug: 'psu', icon: 'zap' },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Case - Vỏ Máy Tính', slug: 'case', icon: 'box' },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Tản Nhiệt (Cooling)', slug: 'cooling', icon: 'fan' },
  { id: 'c1000000-0000-0000-0000-000000000009', name: 'Màn Hình Máy Tính', slug: 'monitor', icon: 'monitor' },
  { id: 'c1000000-0000-0000-0000-000000000010', name: 'Bàn Phím Gaming', slug: 'keyboard', icon: 'keyboard' },
  { id: 'c1000000-0000-0000-0000-000000000011', name: 'Chuột Gaming', slug: 'mouse', icon: 'mouse' },
  { id: 'c1000000-0000-0000-0000-000000000012', name: 'Tai Nghe Gaming', slug: 'headset', icon: 'headphones' },
  { id: 'c1000000-0000-0000-0000-000000000013', name: 'Loa Máy Tính', slug: 'speaker', icon: 'speaker' }
];

export async function getCategories(): Promise<Category[]> {
  const products = await fetchSbuyProductsLive();
  const catCounts: Record<string, number> = {};

  products.forEach(p => {
    if (p.category_id) {
      catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1;
    }
    if (p.category_slug) {
      catCounts[p.category_slug] = (catCounts[p.category_slug] || 0) + 1;
    }
  });

  return STANDARD_CATEGORIES.map(c => ({
    ...c,
    product_count: catCounts[c.id] || catCounts[c.slug] || 0
  }));
}

export async function getBrands(categoryId?: string): Promise<Brand[]> {
  const products = await fetchSbuyProductsLive();
  const brandMap = new Map<string, { id: string; name: string; slug: string; count: number }>();

  products.forEach(p => {
    if (categoryId) {
      const isCatMatch = p.category_id === categoryId || p.category_slug === categoryId;
      if (!isCatMatch) return;
    }

    const bId = p.brand_id || 'b-khac';
    const bName = p.brand_name || 'Khác';
    const bSlug = p.brand_slug || 'khac';

    const existing = brandMap.get(bId) || { id: bId, name: bName, slug: bSlug, count: 0 };
    existing.count += 1;
    brandMap.set(bId, existing);
  });

  return Array.from(brandMap.values())
    .map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      is_active: true,
      product_count: b.count
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProducts(filter: ProductsFilter) {
  const allProducts = await fetchSbuyProductsLive();
  const {
    category_id,
    brand_id,
    search,
    slug,
    ids,
    min_price,
    max_price,
    sort = 'price_asc',
    page = 1,
    limit = 16
  } = filter;

  const pageNum = parseInt(page as any, 10) || 1;
  const limitNum = parseInt(limit as any, 10) || 16;
  const brandIds = brand_id ? brand_id.split(',').filter(Boolean).map(x => x.toLowerCase()) : [];

  const categoryMatch = category_id
    ? STANDARD_CATEGORIES.find(c => c.id === category_id || c.slug === category_id)
    : undefined;

  let filtered = allProducts.filter(p => {
    if (category_id) {
      const matchCat = p.category_id === category_id ||
        p.category_slug === category_id ||
        (categoryMatch && (p.category_id === categoryMatch.id || p.category_slug === categoryMatch.slug));
      if (!matchCat) return false;
    }

    if (brandIds.length > 0) {
      const pBrandId = (p.brand_id || '').toLowerCase();
      const pBrandSlug = (p.brand_slug || '').toLowerCase();
      const pBrandName = (p.brand_name || '').toLowerCase();
      const hasMatch = brandIds.some(term => term === pBrandId || term === pBrandSlug || term === pBrandName);
      if (!hasMatch) return false;
    }

    if (slug && p.slug.toLowerCase() !== slug.toLowerCase()) return false;
    if (ids && ids.length > 0 && !ids.includes(p.id) && !ids.includes(p.slug)) return false;
    if (min_price !== undefined && p.price < parseFloat(min_price as any)) return false;
    if (max_price !== undefined && p.price > parseFloat(max_price as any)) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku && p.sku.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchBrand = (p.brand_name || '').toLowerCase().includes(q);
      const matchCat = (p.category_name || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchSlug && !matchBrand && !matchCat) return false;
    }

    return true;
  });

  // Sorting
  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'name_asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'name_desc') filtered.sort((a, b) => b.name.localeCompare(a.name));

  const totalItems = filtered.length;
  const offset = (pageNum - 1) * limitNum;
  const paginatedProducts = filtered.slice(offset, offset + limitNum);

  return {
    products: paginatedProducts,
    pagination: {
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum) || 1
    }
  };
}

export async function getProductBySlugOrId(idOrSlug: string): Promise<Product | null> {
  const p = await getSbuyProductBySlugOrId(idOrSlug);
  if (!p) return null;
  return {
    ...p,
    original_price: p.original_price || p.originalPrice || getProductOriginalPrice(p.price, p.slug),
    originalPrice: p.original_price || p.originalPrice || getProductOriginalPrice(p.price, p.slug)
  };
}

export async function getProductsBySlugs(slugs: string[]) {
  const allProducts = await fetchSbuyProductsLive();
  const normalized = slugs.map(s => s.toLowerCase());

  const matched = allProducts.filter(p =>
    normalized.includes(p.id.toLowerCase()) || normalized.includes(p.slug.toLowerCase())
  );

  const specKeySet = new Set<string>();
  matched.forEach(p => {
    if (p.specs && typeof p.specs === 'object') {
      Object.keys(p.specs).forEach(k => specKeySet.add(k));
    }
  });

  return {
    products: matched,
    specKeys: Array.from(specKeySet)
  };
}

export async function getCompareProducts(ids: string) {
  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) {
    return { products: [], specKeys: [] };
  }
  return await getProductsBySlugs(idList);
}

export async function getDbStatus() {
  try {
    const products = await fetchSbuyProductsLive();
    const categories = await getCategories();
    return {
      db_connected: true,
      source: 'Sbuy WooCommerce REST API (sbuy.io.vn)',
      product_count: products.length,
      category_count: categories.length,
      message: 'Kết nối trực tiếp thành công tới Sbuy API (không sử dụng Supabase)'
    };
  } catch (err: any) {
    return {
      db_connected: false,
      source: 'Offline Fallback (seed.json)',
      error: err.message
    };
  }
}

export async function initDatabase() {
  return { success: true, message: 'Sbuy API integration is active' };
}

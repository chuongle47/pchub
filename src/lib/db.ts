import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import seed from './seed.json';

function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const isLocalHost = (host?: string) =>
    !host || host === 'localhost' || host === '127.0.0.1';

  if (connectionString) {
    const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
    return new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
      max: 3,
    });
  }

  const host = process.env.PGHOST || 'localhost';
  return new Pool({
    host,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'linhkien',
    port: parseInt(process.env.PGPORT || '5432', 10),
    ssl: !isLocalHost(host) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
    max: 3,
  });
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
  category_name?: string;
  brand_name?: string;
}

export interface MemoryStore {
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

let isPgConnected = false;
const memoryStore: MemoryStore = {
  categories: [],
  brands: [],
  products: []
};

// Default seed categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu', icon: 'cpu' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard', icon: 'circuit-board' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'RAM - Bộ Nhớ Trong', slug: 'ram', icon: 'memory' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'GPU - Card Màn Hình', slug: 'gpu', icon: 'gpu' },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'SSD / HDD - Ổ Đĩa Cứng', slug: 'storage', icon: 'hard-drive' },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'PSU - Nguồn Máy Tính', slug: 'psu', icon: 'zap' },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Case - Vỏ Máy Tính', slug: 'case', icon: 'box' },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Tản Nhiệt (Cooling)', slug: 'cooling', icon: 'fan' }
];

export async function testPgConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    isPgConnected = true;
    return true;
  } catch (err) {
    isPgConnected = false;
    return false;
  }
}

export function loadMemoryFallback() {
  if (memoryStore.products.length > 0) return;

  memoryStore.categories = (seed.categories as Category[]).length
    ? (seed.categories as Category[])
    : [...DEFAULT_CATEGORIES];
  memoryStore.brands = seed.brands as Brand[];
  memoryStore.products = seed.products as Product[];
}

export async function getProductBySlugOrId(idOrSlug: string) {
  const connected = await testPgConnection();
  if (connected) {
    try {
      const query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = $1 OR p.id::text = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [idOrSlug]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (err) {
      console.error('getProductBySlugOrId DB error:', err);
    }
  }

  loadMemoryFallback();
  const catMap = new Map(memoryStore.categories.map(c => [c.id, c.name]));
  const brandNameMap = new Map(memoryStore.brands.map(b => [b.id, b.name]));
  const p = memoryStore.products.find(prod => prod.slug === idOrSlug || prod.id === idOrSlug);
  if (!p) return null;
  return {
    ...p,
    category_name: catMap.get(p.category_id) || 'Danh mục',
    brand_name: brandNameMap.get(p.brand_id) || 'Thương hiệu'
  };
}

export async function getDbStatus() {
  const connected = await testPgConnection();
  if (connected) {
    try {
      const countRes = await pool.query('SELECT COUNT(*) FROM products');
      const brandCountRes = await pool.query('SELECT COUNT(*) FROM brands');
      return {
        db_connected: true,
        source: 'PostgreSQL',
        product_count: parseInt(countRes.rows[0].count, 10),
        brand_count: parseInt(brandCountRes.rows[0].count, 10),
      };
    } catch (e) {
      isPgConnected = false;
    }
  }

  loadMemoryFallback();
  return {
    db_connected: false,
    source: 'In-Memory Fallback (seed.json)',
    product_count: memoryStore.products.length,
    brand_count: memoryStore.brands.length,
    message: 'Vercel cannot reach localhost PostgreSQL. Add DATABASE_URL (Neon/Supabase) in Vercel env, or this seed catalog will be used.'
  };
}

export async function getCategories() {
  const connected = await testPgConnection();
  if (connected) {
    try {
      const query = `
        SELECT c.*, COUNT(p.id)::int as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.slug ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      console.error('DB query error, fallback:', err);
    }
  }

  loadMemoryFallback();
  const catCounts: Record<string, number> = {};
  memoryStore.products.forEach(p => {
    catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1;
  });

  return memoryStore.categories.map(c => ({
    ...c,
    product_count: catCounts[c.id] || 0
  }));
}

export async function getBrands(categoryId?: string) {
  const connected = await testPgConnection();
  if (connected) {
    try {
      let query = `
        SELECT DISTINCT b.*, COUNT(p.id)::int as product_count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id
      `;
      const params = [];
      if (categoryId) {
        query += ` WHERE p.category_id = $1`;
        params.push(categoryId);
      }
      query += ` GROUP BY b.id ORDER BY b.name ASC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (err) {
      console.error('Brands query error, fallback:', err);
    }
  }

  loadMemoryFallback();
  let filteredProds = memoryStore.products;
  if (categoryId) {
    filteredProds = filteredProds.filter(p => p.category_id === categoryId);
  }

  const brandCounts: Record<string, number> = {};
  filteredProds.forEach(p => {
    brandCounts[p.brand_id] = (brandCounts[p.brand_id] || 0) + 1;
  });

  return memoryStore.brands
    .filter(b => categoryId ? brandCounts[b.id] > 0 : true)
    .map(b => ({
      ...b,
      product_count: brandCounts[b.id] || 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface ProductsFilter {
  category_id?: string;
  brand_id?: string; // Comma separated brand IDs
  search?: string;
  slug?: string;
  ids?: string[];
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filter: ProductsFilter) {
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
  const offset = (pageNum - 1) * limitNum;

  const brandIds = brand_id ? brand_id.split(',').filter(Boolean) : [];
  const connected = await testPgConnection();

  if (connected) {
    try {
      let whereConditions = [];
      let params = [];
      let paramIdx = 1;

      if (category_id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id);
        if (isUuid) {
          whereConditions.push(`p.category_id = $${paramIdx++}`);
          params.push(category_id);
        } else {
          whereConditions.push(`p.category_id IN (SELECT id FROM categories WHERE slug = $${paramIdx++})`);
          params.push(category_id);
        }
      }

      if (brandIds.length > 0) {
        whereConditions.push(`p.brand_id = ANY($${paramIdx++})`);
        params.push(brandIds);
      }

      if (search) {
        whereConditions.push(`(p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx} OR p.slug ILIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      if (slug) {
        whereConditions.push(`p.slug = $${paramIdx++}`);
        params.push(slug);
      }

      if (ids && ids.length > 0) {
        whereConditions.push(`p.id = ANY($${paramIdx++})`);
        params.push(ids);
      }

      if (min_price) {
        whereConditions.push(`p.price >= $${paramIdx++}`);
        params.push(parseFloat(min_price as any));
      }

      if (max_price) {
        whereConditions.push(`p.price <= $${paramIdx++}`);
        params.push(parseFloat(max_price as any));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      let orderBy = 'p.price ASC';
      if (sort === 'price_desc') orderBy = 'p.price DESC';
      if (sort === 'name_asc') orderBy = 'p.name ASC';
      if (sort === 'name_desc') orderBy = 'p.name DESC';

      const countQuery = `
        SELECT COUNT(*) 
        FROM products p 
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, params);
      const totalItems = parseInt(countResult.rows[0].count, 10);

      const dataQuery = `
        SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;
      const dataParams = [...params, limitNum, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      return {
        products: dataResult.rows,
        pagination: {
          total: totalItems,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalItems / limitNum)
        }
      };
    } catch (err) {
      console.error('Product query error, fallback:', err);
    }
  }

  loadMemoryFallback();
  const brandSet = new Set(brandIds);
  const catMap = new Map(memoryStore.categories.map(c => [c.id, c.name]));
  const catSlugMap = new Map(memoryStore.categories.map(c => [c.id, c.slug]));
  const brandNameMap = new Map(memoryStore.brands.map(b => [b.id, b.name]));
  const categoryMatch = category_id
    ? memoryStore.categories.find(c => c.id === category_id || c.slug === category_id)
    : undefined;

  let filtered = memoryStore.products.filter(p => {
    if (categoryMatch && p.category_id !== categoryMatch.id) return false;
    if (brandSet.size > 0 && !brandSet.has(p.brand_id)) return false;
    if (slug && p.slug !== slug) return false;
    if (ids && ids.length > 0 && !ids.includes(p.id)) return false;
    if (min_price && p.price < parseFloat(min_price as any)) return false;
    if (max_price && p.price > parseFloat(max_price as any)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku && p.sku.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchSlug) return false;
    }
    return true;
  });

  // Sorting
  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'name_asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'name_desc') filtered.sort((a, b) => b.name.localeCompare(a.name));

  const totalItems = filtered.length;
  const pagedProducts = filtered.slice(offset, offset + limitNum).map(p => ({
    ...p,
    category_name: catMap.get(p.category_id) || 'Danh mục khác',
    category_slug: catSlugMap.get(p.category_id),
    brand_name: brandNameMap.get(p.brand_id) || 'Thương hiệu khác'
  }));

  return {
    products: pagedProducts,
    pagination: {
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum)
    }
  };
}

export async function getProductsBySlugs(slugs: string[]) {
  const normalized = [...new Set(slugs.filter(Boolean))];
  if (normalized.length === 0) {
    return { products: [], specKeys: [] };
  }

  const connected = await testPgConnection();
  let products: Product[] = [];

  if (connected) {
    try {
      const query = `
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = ANY($1) OR p.id::text = ANY($1)
      `;
      const result = await pool.query(query, [normalized]);
      products = result.rows;
    } catch (err) {
      console.error('Slug query error, fallback:', err);
    }
  }

  if (products.length === 0) {
    loadMemoryFallback();
    const catMap = new Map(memoryStore.categories.map(c => [c.id, c.name]));
    const brandNameMap = new Map(memoryStore.brands.map(b => [b.id, b.name]));
    const slugSet = new Set(normalized);
    products = memoryStore.products
      .filter(p => slugSet.has(p.slug) || slugSet.has(p.id))
      .map(p => ({
        ...p,
        category_name: catMap.get(p.category_id) || 'Danh mục',
        brand_name: brandNameMap.get(p.brand_id) || 'Thương hiệu'
      }));
  }

  const specKeySet = new Set<string>();
  products.forEach(p => {
    if (p.specs && typeof p.specs === 'object') {
      Object.keys(p.specs).forEach(k => specKeySet.add(k));
    }
  });

  return {
    products,
    specKeys: Array.from(specKeySet)
  };
}

export async function getCompareProducts(ids: string) {
  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) {
    return { products: [], specKeys: [] };
  }

  let products: Product[] = [];
  const connected = await testPgConnection();

  if (connected) {
    try {
      const query = `
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = ANY($1)
      `;
      const result = await pool.query(query, [idList]);
      products = result.rows;
    } catch (err) {
      console.error('Compare query error, fallback:', err);
    }
  }

  if (products.length === 0) {
    loadMemoryFallback();
    const catMap = new Map(memoryStore.categories.map(c => [c.id, c.name]));
    const brandNameMap = new Map(memoryStore.brands.map(b => [b.id, b.name]));
    const idSet = new Set(idList);

    products = memoryStore.products
      .filter(p => idSet.has(p.id))
      .map(p => ({
        ...p,
        category_name: catMap.get(p.category_id) || 'Danh mục',
        brand_name: brandNameMap.get(p.brand_id) || 'Thương hiệu'
      }));
  }

  const specKeySet = new Set<string>();
  products.forEach(p => {
    if (p.specs && typeof p.specs === 'object') {
      Object.keys(p.specs).forEach(k => specKeySet.add(k));
    }
  });

  return {
    products,
    specKeys: Array.from(specKeySet)
  };
}

export async function initDatabase() {
  const schemaPath = path.join(process.cwd(), '../schema.sql');
  const dataSqlPath = path.join(process.cwd(), '../data.sql');

  const client = await pool.connect();
  try {
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
    }
    if (fs.existsSync(dataSqlPath)) {
      const dataSql = fs.readFileSync(dataSqlPath, 'utf8');
      await client.query(dataSql);
    }
    return { success: true, message: 'Database initialized successfully' };
  } finally {
    client.release();
  }
}

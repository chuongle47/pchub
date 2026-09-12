const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ type: 'application/json' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure all API JSON responses use UTF-8
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// PostgreSQL Pool setup
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'pccomponents',
  port: parseInt(process.env.PGPORT || '5432', 10),
  connectionTimeoutMillis: 3000,
});

let isPgConnected = false;
let memoryStore = {
  categories: [],
  brands: [],
  products: []
};

// Default seed categories
const DEFAULT_CATEGORIES = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu', icon: 'cpu' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard', icon: 'circuit-board' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'RAM - Bộ Nhớ Trong', slug: 'ram', icon: 'memory' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'GPU - Card Màn Hình', slug: 'gpu', icon: 'gpu' },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'SSD / HDD - Ổ Đĩa Cứng', slug: 'storage', icon: 'hard-drive' },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'PSU - Nguồn Máy Tính', slug: 'psu', icon: 'zap' },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Case - Vỏ Máy Tính', slug: 'case', icon: 'box' },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Tản Nhiệt (Cooling)', slug: 'cooling', icon: 'fan' }
];

// Parser for data.sql to build memory fallback
function loadMemoryFallback() {
  console.log('[Memory Fallback] Loading dataset from data.sql...');
  memoryStore.categories = [...DEFAULT_CATEGORIES];

  const brandMap = new Map();
  const productList = [];

  const defaultBrands = [
    { id: 'b1000000-0000-0000-0000-000000000001', name: 'Intel', slug: 'intel', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000002', name: 'AMD', slug: 'amd', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000003', name: 'ASUS', slug: 'asus', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000004', name: 'MSI', slug: 'msi', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000005', name: 'Gigabyte', slug: 'gigabyte', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000006', name: 'NVIDIA', slug: 'nvidia', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000007', name: 'Corsair', slug: 'corsair', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000008', name: 'Kingston', slug: 'kingston', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000009', name: 'Samsung', slug: 'samsung', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000010', name: 'Western Digital', slug: 'western-digital', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000011', name: 'Cooler Master', slug: 'cooler-master', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000012', name: 'NZXT', slug: 'nzxt', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000013', name: 'Noctua', slug: 'noctua', is_active: true },
    { id: 'b1000000-0000-0000-0000-000000000014', name: 'Deepcool', slug: 'deepcool', is_active: true }
  ];
  defaultBrands.forEach(b => brandMap.set(b.id, b));

  const dataSqlPath = path.join(__dirname, 'data.sql');
  if (fs.existsSync(dataSqlPath)) {
    const sqlContent = fs.readFileSync(dataSqlPath, { encoding: 'utf8' });

    // Extract brands: ('b2000000-0000-0000-0000-000000000001','Crucial','crucial',true)
    const brandRegex = /\('([0-9a-f-]+)',\s*'([^']+)',\s*'([^']+)',\s*(true|false)\)/gi;
    let match;
    while ((match = brandRegex.exec(sqlContent)) !== null) {
      const [_, id, name, slug, activeStr] = match;
      brandMap.set(id, { id, name, slug, is_active: activeStr === 'true' });
    }

    // Generate products from generate_series and raw inserts
    let autoProdId = 1;
    function addProd(name, slug, category_id, brand_id, sku, price, stock, specs) {
      productList.push({
        id: `p-${autoProdId++}`,
        name,
        slug,
        category_id,
        brand_id,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        specs: specs || {}
      });
    }

    // CPU extra (lines 1-9)
    for (let i = 28; i <= 40; i++) {
      const brandId = i % 2 === 0 ? 'b1000000-0000-0000-0000-000000000001' : 'b1000000-0000-0000-0000-000000000002';
      addProd(`CPU Extra Model Gen ${i}`, `cpu-extra-model-${i}`, 'c1000000-0000-0000-0000-000000000001', brandId, `CPU-EXTRA-${i}`, 3000000 + i * 200000, 20, {
        socket: i % 2 === 0 ? 'LGA1700' : 'AM5',
        tdp_watt: 65 + i * 5,
        integrated_gpu: false,
        ram_support: ['DDR5']
      });
    }

    // Mainboard extra (lines 11-19)
    for (let i = 21; i <= 40; i++) {
      addProd(`Mainboard Series V${i}`, `mainboard-series-v${i}`, 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', `MB-EXTRA-${i}`, 2500000 + i * 150000, 20, {
        socket: i % 2 === 0 ? 'LGA1700' : 'AM5',
        form_factor: i % 3 === 0 ? 'ATX' : 'Micro-ATX',
        ram_type: 'DDR5',
        ram_slots: 4
      });
    }

    // RAM extra (lines 21-29)
    for (let i = 9; i <= 35; i++) {
      addProd(`RAM Kit Pro Edition ${i}`, `ram-kit-pro-edition-${i}`, 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', `RAM-EXTRA-${i}`, 1000000 + i * 100000, 30, {
        kit: '2x16GB',
        ram_type: i % 2 === 0 ? 'DDR5' : 'DDR4',
        capacity_gb: 32,
        bus_speed_mhz: 3200 + i * 100
      });
    }

    // GPU extra (lines 31-39)
    for (let i = 9; i <= 35; i++) {
      addProd(`GPU Custom Model X${i}`, `gpu-custom-model-x${i}`, 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', `VGA-EXTRA-${i}`, 5000000 + i * 800000, 15, {
        vram_gb: 8,
        tdp_watt: 150 + i * 5,
        length_mm: 240 + i * 2,
        recommended_psu_watt: 550 + i * 10
      });
    }

    // Storage extra (lines 41-49)
    for (let i = 7; i <= 30; i++) {
      addProd(`Storage Drive Speed ${i}`, `storage-drive-speed-${i}`, 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', `STG-EXTRA-${i}`, 800000 + i * 100000, 30, {
        type: 'SSD_NVMe',
        capacity_gb: 512,
        form_factor: 'M.2 2280'
      });
    }

    // PSU extra (lines 51-59)
    for (let i = 6; i <= 25; i++) {
      addProd(`Power Supply Power Pro ${i}`, `power-supply-power-pro-${i}`, 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', `PSU-EXTRA-${i}`, 1000000 + i * 100000, 20, {
        wattage: 500 + i * 20,
        modularity: 'Full-Modular',
        efficiency_rating: '80_Plus_Gold'
      });
    }

    // Case extra (lines 61-69)
    for (let i = 6; i <= 25; i++) {
      addProd(`PC Case Gaming Mesh ${i}`, `pc-case-gaming-mesh-${i}`, 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000012', `CASE-EXTRA-${i}`, 700000 + i * 50000, 20, {
        max_gpu_length_mm: 320,
        max_cooler_height_mm: 160,
        supported_mainboards: ['ATX', 'Micro-ATX']
      });
    }

    // Cooling extra (lines 71-79)
    for (let i = 6; i <= 20; i++) {
      addProd(`Cooler Frost System ${i}`, `cooler-frost-system-${i}`, 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000014', `COOL-EXTRA-${i}`, 500000 + i * 100000, 25, {
        cooling_type: 'Air',
        supported_sockets: ['LGA1700', 'AM5'],
        tdp_capacity_watt: 180 + i * 5
      });
    }

    // Parse batch product inserts
    const insertProdRegex = /\('([^']+)',\s*'([^']+)',\s*'([0-9a-f-]+)',\s*'([0-9a-f-]+)',\s*'([^']+)',\s*([0-9.]+),\s*([0-9]+),\s*'([^']+)'::jsonb\)/gi;
    let pMatch;
    while ((pMatch = insertProdRegex.exec(sqlContent)) !== null) {
      const [_, name, slug, catId, brandId, sku, price, stock, specsJson] = pMatch;
      let specs = {};
      try { specs = JSON.parse(specsJson); } catch (e) {}
      addProd(name, slug, catId, brandId, sku, price, stock, specs);
    }
  }

  memoryStore.brands = Array.from(brandMap.values());
  memoryStore.products = productList;
  console.log(`[Memory Fallback] Loaded ${memoryStore.products.length} products across ${memoryStore.brands.length} brands.`);
}

// Test PostgreSQL Connection
async function testPgConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    isPgConnected = true;
    console.log(`[PostgreSQL] Connection successful at ${res.rows[0].now}`);
  } catch (err) {
    isPgConnected = false;
    console.warn(`[PostgreSQL] Could not connect to PostgreSQL (${err.message}). Using in-memory fallback.`);
  }
}

// System Status API
app.get('/api/status', async (req, res) => {
  if (isPgConnected) {
    try {
      const countRes = await pool.query('SELECT COUNT(*) FROM products');
      const brandCountRes = await pool.query('SELECT COUNT(*) FROM brands');
      return res.json({
        db_connected: true,
        source: 'PostgreSQL',
        product_count: parseInt(countRes.rows[0].count, 10),
        brand_count: parseInt(brandCountRes.rows[0].count, 10),
        database: process.env.PGDATABASE || 'pccomponents'
      });
    } catch (e) {
      isPgConnected = false;
    }
  }

  res.json({
    db_connected: false,
    source: 'In-Memory Fallback (data.sql)',
    product_count: memoryStore.products.length,
    brand_count: memoryStore.brands.length,
    message: 'Running fallback mode. Configure PostgreSQL in .env and trigger POST /api/init-db to sync.'
  });
});

// Initialize PostgreSQL Tables and Seed
app.post('/api/init-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const dataSqlPath = path.join(__dirname, 'data.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
    }

    if (fs.existsSync(dataSqlPath)) {
      const dataSql = fs.readFileSync(dataSqlPath, 'utf8');
      await client.query(dataSql);
    }

    client.release();
    isPgConnected = true;
    res.json({ success: true, message: 'Database initialized and seeded successfully!' });
  } catch (err) {
    console.error('Init DB error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  if (isPgConnected) {
    try {
      const query = `
        SELECT c.*, COUNT(p.id)::int as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.slug ASC
      `;
      const result = await pool.query(query);
      return res.json(result.rows);
    } catch (err) {
      console.error('DB query error, fallback:', err);
    }
  }

  // Fallback memory logic
  const catCounts = {};
  memoryStore.products.forEach(p => {
    catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1;
  });

  const categoriesWithCounts = memoryStore.categories.map(c => ({
    ...c,
    product_count: catCounts[c.id] || 0
  }));

  res.json(categoriesWithCounts);
});

// Brands API
app.get('/api/brands', async (req, res) => {
  const { category_id } = req.query;

  if (isPgConnected) {
    try {
      let query = `
        SELECT DISTINCT b.*, COUNT(p.id)::int as product_count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id
      `;
      const params = [];
      if (category_id) {
        query += ` WHERE p.category_id = $1`;
        params.push(category_id);
      }
      query += ` GROUP BY b.id ORDER BY b.name ASC`;

      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (err) {
      console.error('Brands query error, fallback:', err);
    }
  }

  let filteredProds = memoryStore.products;
  if (category_id) {
    filteredProds = filteredProds.filter(p => p.category_id === category_id);
  }

  const brandCounts = {};
  filteredProds.forEach(p => {
    brandCounts[p.brand_id] = (brandCounts[p.brand_id] || 0) + 1;
  });

  const resultBrands = memoryStore.brands
    .filter(b => category_id ? brandCounts[b.id] > 0 : true)
    .map(b => ({
      ...b,
      product_count: brandCounts[b.id] || 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(resultBrands);
});

// Products API (Filter by Category, Brand, Search, Price, Sort, Pagination)
app.get('/api/products', async (req, res) => {
  const {
    category_id,
    brand_id,
    search,
    min_price,
    max_price,
    sort = 'price_asc',
    page = 1,
    limit = 16
  } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 16;
  const offset = (pageNum - 1) * limitNum;

  // Split multiple brand IDs if passed as comma separated string
  const brandIds = brand_id ? brand_id.split(',').filter(Boolean) : [];

  if (isPgConnected) {
    try {
      let whereConditions = [];
      let params = [];
      let paramIdx = 1;

      if (category_id) {
        whereConditions.push(`p.category_id = $${paramIdx++}`);
        params.push(category_id);
      }

      if (brandIds.length > 0) {
        whereConditions.push(`p.brand_id = ANY($${paramIdx++})`);
        params.push(brandIds);
      }

      if (search) {
        whereConditions.push(`(p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      if (min_price) {
        whereConditions.push(`p.price >= $${paramIdx++}`);
        params.push(parseFloat(min_price));
      }

      if (max_price) {
        whereConditions.push(`p.price <= $${paramIdx++}`);
        params.push(parseFloat(max_price));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      let orderBy = 'p.price ASC';
      if (sort === 'price_desc') orderBy = 'p.price DESC';
      if (sort === 'name_asc') orderBy = 'p.name ASC';
      if (sort === 'name_desc') orderBy = 'p.name DESC';
      if (sort === 'newest') orderBy = 'p.created_at DESC';

      const countQuery = `
        SELECT COUNT(*) 
        FROM products p 
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, params);
      const totalItems = parseInt(countResult.rows[0].count, 10);

      const dataQuery = `
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;
      const dataParams = [...params, limitNum, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      return res.json({
        products: dataResult.rows,
        pagination: {
          total: totalItems,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalItems / limitNum)
        }
      });
    } catch (err) {
      console.error('Product query error, fallback:', err);
    }
  }

  // Memory Fallback filtering
  const brandSet = new Set(brandIds);
  const catMap = new Map(memoryStore.categories.map(c => [c.id, c.name]));
  const brandNameMap = new Map(memoryStore.brands.map(b => [b.id, b.name]));

  let filtered = memoryStore.products.filter(p => {
    if (category_id && p.category_id !== category_id) return false;
    if (brandSet.size > 0 && !brandSet.has(p.brand_id)) return false;
    if (min_price && p.price < parseFloat(min_price)) return false;
    if (max_price && p.price > parseFloat(max_price)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku && p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
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
    brand_name: brandNameMap.get(p.brand_id) || 'Thương hiệu khác'
  }));

  res.json({
    products: pagedProducts,
    pagination: {
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum)
    }
  });
});

// Compare API - fetch products by list of IDs and analyze specs
app.get('/api/products/compare', async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ error: 'Missing product IDs' });
  }

  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) {
    return res.json({ products: [], specKeys: [] });
  }

  let products = [];

  if (isPgConnected) {
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

  // Collect all unique spec keys across selected products
  const specKeySet = new Set();
  products.forEach(p => {
    if (p.specs && typeof p.specs === 'object') {
      Object.keys(p.specs).forEach(k => specKeySet.add(k));
    }
  });

  res.json({
    products,
    specKeys: Array.from(specKeySet)
  });
});

// Start Server
loadMemoryFallback();
testPgConnection();

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  PC Component Comparator Server Running on Port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});

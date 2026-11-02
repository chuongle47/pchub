import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlalyoyazlgsimzudtxw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Direct client for fast public read operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active?: boolean;
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
  sale_price?: number | null;
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
  is_hot?: boolean;
  is_active?: boolean;
  description?: string;
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

// 1. GET CATEGORIES FROM SUPABASE
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, image_url, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching Supabase categories:', error);
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.error('getCategories exception:', err);
    return [];
  }
}

// 2. GET BRANDS FROM SUPABASE
export async function getBrands(categoryId?: string): Promise<Brand[]> {
  try {
    let query = supabase
      .from('brands')
      .select('id, name, slug, logo_url, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    const { data: brands, error } = await query;
    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }

    return (brands || []) as Brand[];
  } catch (err) {
    console.error('getBrands exception:', err);
    return [];
  }
}

// 3. GET PRODUCTS FROM SUPABASE (Storefront main query)
export async function getProducts(filter: ProductsFilter) {
  try {
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
      limit = 16,
    } = filter;

    const pageNum = parseInt(page as any, 10) || 1;
    const limitNum = parseInt(limit as any, 10) || 16;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('products')
      .select(
        'id, name, slug, sku, price, sale_price, stock, specs, images, description, is_hot, is_active, category:categories(id, name, slug), brand:brands(id, name, slug)',
        { count: 'exact' }
      )
      .eq('is_active', true);

    // Filter by Category
    if (category_id && category_id !== 'tat-ca' && category_id !== 'all') {
      // Check if category_id is UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id);
      if (isUuid) {
        query = query.eq('category_id', category_id);
      } else {
        // Find category by slug first
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', category_id).single();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }
    }

    // Filter by Brand
    if (brand_id) {
      const brandList = brand_id.split(',').filter(Boolean);
      if (brandList.length === 1) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandList[0]);
        if (isUuid) {
          query = query.eq('brand_id', brandList[0]);
        } else {
          const { data: b } = await supabase.from('brands').select('id').eq('slug', brandList[0]).single();
          if (b) query = query.eq('brand_id', b.id);
        }
      }
    }

    // Filter by specific slug or IDs
    if (slug) {
      query = query.eq('slug', slug);
    }
    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    // Price range
    if (min_price !== undefined && !isNaN(min_price)) {
      query = query.gte('price', min_price);
    }
    if (max_price !== undefined && !isNaN(max_price)) {
      query = query.lte('price', max_price);
    }

    // Search query
    if (search) {
      const q = search.trim();
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    // Sort order
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'name_asc') {
      query = query.order('name', { ascending: true });
    } else if (sort === 'name_desc') {
      query = query.order('name', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('getProducts error:', error);
      return { products: [], pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 1 } };
    }

    const formattedProducts: Product[] = (data || []).map((p: any) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
      const images = p.images || [];
      const mainImage = images[0] || '/images/cpu-box.jpg';
      const salePrice = p.sale_price && Number(p.sale_price) > 0 ? Number(p.sale_price) : null;
      const price = Number(p.price || 0);

      let badge: 'hot' | 'new' | 'sale' | undefined = undefined;
      if (salePrice && salePrice < price) badge = 'sale';
      else if (p.is_hot) badge = 'hot';

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_id: cat?.id || p.category_id,
        category_name: cat?.name || 'Linh kiện',
        category_slug: cat?.slug || 'linh-kien',
        brand_id: b?.id || p.brand_id,
        brand_name: b?.name || 'Khác',
        brand_slug: b?.slug || 'khac',
        sku: p.sku || '',
        price: salePrice || price,
        original_price: price,
        originalPrice: price,
        sale_price: salePrice,
        stock: Number(p.stock ?? 10),
        specs: p.specs || {},
        images: images,
        image_url: mainImage,
        rating: 5,
        reviewCount: 12,
        badge,
        is_hot: p.is_hot,
        is_active: p.is_active,
        description: p.description,
      };
    });

    const total = count || 0;
    return {
      products: formattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  } catch (err: any) {
    console.error('getProducts exception:', err);
    return { products: [], pagination: { total: 0, page: 1, limit: 16, totalPages: 1 } };
  }
}

// 4. GET SINGLE PRODUCT BY ID OR SLUG
export async function getProductBySlugOrId(idOrSlug: string): Promise<Product | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase
      .from('products')
      .select(
        'id, name, slug, sku, price, sale_price, stock, specs, images, description, is_hot, is_active, category:categories(id, name, slug), brand:brands(id, name, slug)'
      );

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: p, error } = await query.single();
    if (error || !p) {
      return null;
    }

    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
    const images = p.images || [];
    const mainImage = images[0] || '/images/cpu-box.jpg';
    const salePrice = p.sale_price && Number(p.sale_price) > 0 ? Number(p.sale_price) : null;
    const price = Number(p.price || 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: cat?.id || '',
      category_name: cat?.name || 'Linh kiện',
      category_slug: cat?.slug || 'linh-kien',
      brand_id: b?.id || '',
      brand_name: b?.name || 'Khác',
      brand_slug: b?.slug || 'khac',
      sku: p.sku || '',
      price: salePrice || price,
      original_price: price,
      originalPrice: price,
      sale_price: salePrice,
      stock: Number(p.stock ?? 10),
      specs: p.specs || {},
      images: images,
      image_url: mainImage,
      rating: 5,
      reviewCount: 15,
      badge: salePrice && salePrice < price ? 'sale' : p.is_hot ? 'hot' : undefined,
      is_hot: p.is_hot,
      is_active: p.is_active,
      description: p.description,
    };
  } catch (err) {
    console.error('getProductBySlugOrId exception:', err);
    return null;
  }
}

// 5. GET PRODUCTS BY SLUGS (For Build PC & Compare)
export async function getProductsBySlugs(slugs: string[]) {
  try {
    if (!slugs || slugs.length === 0) return { products: [], specKeys: [] };

    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, sku, price, sale_price, stock, specs, images, category:categories(id, name, slug), brand:brands(id, name, slug)')
      .in('slug', slugs);

    if (error || !data) return { products: [], specKeys: [] };

    const specKeySet = new Set<string>();
    const formatted: Product[] = data.map((p: any) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
      if (p.specs && typeof p.specs === 'object') {
        Object.keys(p.specs).forEach((k) => specKeySet.add(k));
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_id: cat?.id || '',
        category_name: cat?.name || '',
        category_slug: cat?.slug || '',
        brand_id: b?.id || '',
        brand_name: b?.name || '',
        brand_slug: b?.slug || '',
        sku: p.sku || '',
        price: Number(p.price || 0),
        stock: Number(p.stock ?? 0),
        specs: p.specs || {},
        images: p.images || [],
        image_url: (p.images && p.images[0]) || '',
      };
    });

    return {
      products: formatted,
      specKeys: Array.from(specKeySet),
    };
  } catch (err) {
    console.error('getProductsBySlugs exception:', err);
    return { products: [], specKeys: [] };
  }
}

// 6. GET COMPARE PRODUCTS
export async function getCompareProducts(ids: string) {
  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) return { products: [], specKeys: [] };
  return await getProductsBySlugs(idList);
}

// 7. DB STATUS (Now pointing to Supabase)
export async function getDbStatus() {
  try {
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    return {
      db_connected: true,
      source: 'Supabase Postgres Database (pchub)',
      product_count: prodCount || 0,
      category_count: catCount || 0,
      message: 'Kết nối thành công tới Supabase Database trực tiếp.'
    };
  } catch (err: any) {
    return {
      db_connected: false,
      source: 'Supabase Error',
      error: err.message
    };
  }
}

export async function initDatabase() {
  return { success: true, message: 'Supabase Database is active' };
}// Add pool export for backward compatibility with legacy scripts
import pg from 'pg';
const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

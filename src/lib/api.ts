export const API_URL = '/api';

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchBrands(categoryId?: string) {
  const url = categoryId ? `${API_URL}/brands?category_id=${categoryId}` : `${API_URL}/brands`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export interface ProductsParams {
  category_id?: string;
  brand_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchProducts(params: ProductsParams) {
  const query = new URLSearchParams();
  if (params.category_id) query.append('category_id', params.category_id);
  if (params.brand_id) query.append('brand_id', params.brand_id);
  if (params.search) query.append('search', params.search);
  if (params.min_price !== undefined) query.append('min_price', params.min_price.toString());
  if (params.max_price !== undefined) query.append('max_price', params.max_price.toString());
  if (params.sort) query.append('sort', params.sort);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchCompareProducts(ids: string[]) {
  if (ids.length === 0) return { products: [], specKeys: [] };
  const res = await fetch(`${API_URL}/products/compare?ids=${ids.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch comparison products');
  return res.json();
}

export async function fetchStatus() {
  const res = await fetch(`${API_URL}/status`);
  if (!res.ok) throw new Error('Failed to fetch database status');
  return res.json();
}

export async function initDb() {
  const res = await fetch(`${API_URL}/init-db`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to initialize database');
  return res.json();
}

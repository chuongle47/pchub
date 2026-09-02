export interface Product {
  id: string;
  slug: string;
  name: string;
  nameVi: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  specs: Record<string, string>;
  tags: string[];
  badge?: 'hot' | 'new' | 'sale';
  warrantyMonths: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}
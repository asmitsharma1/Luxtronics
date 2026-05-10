import type { Product } from '@/data/products';

export interface StoreImage {
  id: number;
  src: string;
  alt?: string;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: StoreImage;
  count: number;
  productCount?: number;
  sampleImage?: string | null;
}

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description?: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  price: string;
  sale_price?: string;
  regular_price?: string;
  images: StoreImage[];
  average_rating?: string;
  rating_count?: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  variations?: number[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const response = await fetchJson<ApiResponse<StoreProduct[]>>('/api/products?per_page=100&page=1');

  if (!response.success) {
    throw new Error(response.error || 'Failed to load products');
  }

  return response.data;
}

export async function fetchStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  try {
    const response = await fetchJson<ApiResponse<StoreProduct>>(`/api/products/slug/${encodeURIComponent(slug)}`);

    return response.success ? response.data : null;
  } catch {
    return null;
  }
}

export async function fetchStoreCategories(page = 1, perPage = 20): Promise<{
  data: StoreCategory[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
}> {
  const response = await fetchJson<{
    success: boolean;
    data: StoreCategory[];
    pagination?: { page: number; perPage: number; total: number; totalPages: number };
    error?: string;
  }>(`/api/categories?page=${page}&per_page=${perPage}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to load categories');
  }

  return {
    data: response.data,
    pagination: response.pagination || { page, perPage, total: response.data.length, totalPages: 1 },
  };
}

export function mapStoreProductToLocalProduct(product: StoreProduct): Product {
  const mainImage = product.images?.[0]?.src || '';
  
  const price = parseFloat(product.price || '0');
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : 0;
  const regularPrice = product.regular_price ? parseFloat(product.regular_price) : 0;

  const activePrice = salePrice > 0 ? salePrice : price;
  const originalPrice = regularPrice > 0 ? regularPrice : price;
  
  const categoryName = product.categories && product.categories.length > 0 
    ? product.categories[0].name 
    : 'Uncategorized';

  return {
    id: product.id.toString(),
    slug: product.slug,
    name: product.name,
    category: categoryName,
    price: Math.round(activePrice),
    oldPrice: originalPrice > activePrice ? Math.round(originalPrice) : undefined,
    image: mainImage,
    rating: parseFloat(product.average_rating || '0'),
    reviews: product.rating_count || 0,
    description: product.description || product.short_description || '',
    badge: originalPrice > activePrice ? `-${Math.round(((originalPrice - activePrice) / originalPrice) * 100)}%` : undefined,
    variations: undefined,
  };
}

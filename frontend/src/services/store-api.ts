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

export interface StoreVariation {
  id: number;
  sku?: string;
  price: number;
  salePrice?: number;
  regularPrice: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  attributes: Array<{
    name: string;
    option: string;
  }>;
  image?: {
    id: number;
    src: string;
    alt: string;
  };
}

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  salePrice?: number;
  regularPrice: number;
  images: StoreImage[];
  average_rating?: string;
  rating_count?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  variations?: StoreVariation[];
  attributes?: Array<{
    name: string;
    value: string;
    options?: string[];
  }>;
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

export async function fetchStoreProducts(page = 1, perPage = 100): Promise<StoreProduct[]> {
  const response = await fetchJson<ApiResponse<StoreProduct[]>>(`/api/products?per_page=${perPage}&page=${page}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to load products');
  }

  return response.data;
}

export async function fetchStoreProduct(slug: string): Promise<StoreProduct | null> {
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

export function mapStoreProductToLocalProduct(product: any): Product | null {
  if (!product || typeof product !== 'object') {
    return null;
  }

  try {
    const images = product.images || [];
    const mainImage = images[0]?.src || '';
    
    // Handle both camelCase (MongoDB) and snake_case (WooCommerce direct)
    const price = product.price || 0;
    const salePrice = product.salePrice ?? product.sale_price;
    const regularPrice = product.regularPrice ?? product.regular_price;
    
    const activePrice = salePrice && salePrice > 0 ? salePrice : price;
    const originalPrice = regularPrice && regularPrice > 0 ? regularPrice : price;
    
    // Safety check for ID
    const productId = (product.id || product._id || Math.random()).toString();

    return {
      id: productId,
      slug: product.slug || '',
      name: product.name || 'Unknown Product',
      category: product.category || (product.categories?.[0]?.name) || 'Uncategorized',
      price: Math.round(Number(activePrice)),
      oldPrice: Number(originalPrice) > Number(activePrice) ? Math.round(Number(originalPrice)) : undefined,
      image: mainImage,
      rating: parseFloat(product.average_rating || '0'),
      reviews: product.rating_count || 0,
      description: product.description || product.shortDescription || product.short_description || '',
      badge: Number(originalPrice) > Number(activePrice) ? `-${Math.round(((Number(originalPrice) - Number(activePrice)) / Number(originalPrice)) * 100)}%` : undefined,
      variations: Array.isArray(product.variations) 
        ? product.variations.filter((v: any) => v && (v.id || v._id)).map((v: any) => {
            const vPrice = v.price || 0;
            const vSalePrice = v.salePrice ?? v.sale_price;
            const vRegularPrice = v.regularPrice ?? v.regular_price;
            const vActivePrice = vSalePrice && vSalePrice > 0 ? vSalePrice : vPrice;
            
            return {
              id: (v.id || v._id).toString(),
              sku: v.sku,
              price: Math.round(Number(vActivePrice)),
              oldPrice: Number(vRegularPrice) > Number(vActivePrice) ? Math.round(Number(vRegularPrice)) : undefined,
              attributes: v.attributes || [],
              image: v.image?.src || v.image,
              stockStatus: v.stockStatus || v.stock_status || 'instock',
            };
          })
        : undefined,
    };
  } catch (err) {
    console.error('Error mapping product:', err, product);
    return null;
  }
}

/**
 * Fetch search suggestions based on a query
 */
export async function fetchSearchSuggestions(query: string): Promise<Product[]> {
  if (!query || query.length < 2) return [];
  
  const response = await fetchJson<ApiResponse<StoreProduct[]>>(`/api/search?q=${encodeURIComponent(query)}&per_page=5`);
  
  if (!response.success || !Array.isArray(response.data)) return [];
  
  return response.data
    .map(mapStoreProductToLocalProduct)
    .filter((p): p is Product => p !== null);
}

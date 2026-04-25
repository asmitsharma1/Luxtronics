/**
 * Bulk Product Import Service for WooCommerce
 * Handles importing large number of products (1 lakh+) efficiently
 */

import { WooProduct } from './woocommerce';

const STORE_URL = import.meta.env.VITE_WOOCOMMERCE_URL;
const CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_SECRET;

interface ImportOptions {
  batchSize?: number; // Products per API call (default: 100)
  delay?: number; // Delay between batches in ms (default: 1000)
  onProgress?: (current: number, total: number) => void;
}

interface ImportCache {
  timestamp: number;
  data: Map<string, any>;
  expiresIn: number; // milliseconds
}

// In-memory cache for imported products
const productCache = new Map<string, ImportCache>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Batch product fetching with pagination
 * Fetches products in batches to avoid API overload
 */
export async function* bulkFetchProducts(
  totalProducts: number,
  options: ImportOptions = {}
) {
  const batchSize = options.batchSize || 100;
  const delay = options.delay || 1000;

  let page = 1;
  let loaded = 0;

  while (loaded < totalProducts) {
    try {
      const params = new URLSearchParams({
        per_page: Math.min(batchSize, 100).toString(), // WooCommerce max is 100
        page: page.toString(),
        orderby: 'id',
        order: 'asc',
      });

      const url = `${STORE_URL}/wp-json/wc/v3/products?${params}`;
      const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const products: WooProduct[] = await response.json();

      if (products.length === 0) break;

      loaded += products.length;
      options.onProgress?.(loaded, totalProducts);

      yield products;

      page++;

      // Delay between batches to avoid API rate limiting
      if (loaded < totalProducts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error fetching batch at page ${page}:`, error);
      throw error;
    }
  }
}

/**
 * Cache products with expiration
 */
export function cacheProducts(key: string, products: WooProduct[], expiresIn = CACHE_DURATION) {
  productCache.set(key, {
    timestamp: Date.now(),
    data: new Map(products.map(p => [p.id.toString(), p])),
    expiresIn,
  });
}

/**
 * Get cached products if not expired
 */
export function getCachedProducts(key: string): Map<string, WooProduct> | null {
  const cache = productCache.get(key);

  if (!cache) return null;

  // Check if cache expired
  if (Date.now() - cache.timestamp > cache.expiresIn) {
    productCache.delete(key);
    return null;
  }

  return cache.data;
}

/**
 * Clear expired caches
 */
export function clearExpiredCaches() {
  const now = Date.now();

  for (const [key, cache] of productCache.entries()) {
    if (now - cache.timestamp > cache.expiresIn) {
      productCache.delete(key);
    }
  }
}

/**
 * Bulk import products with progress tracking
 */
export async function bulkImportProducts(
  options: ImportOptions = {}
): Promise<{ imported: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  try {
    // First, get total product count
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    const countResponse = await fetch(
      `${STORE_URL}/wp-json/wc/v3/products?per_page=1`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    const totalProducts = parseInt(
      countResponse.headers.get('X-WP-Total') || '0'
    );

    console.log(`Starting bulk import of ${totalProducts} products...`);

    // Use generator to fetch and process in batches
    for await (const batch of bulkFetchProducts(totalProducts, options)) {
      try {
        // Cache each batch
        cacheProducts(`batch-${imported}`, batch);
        imported += batch.length;
      } catch (error) {
        failed += 1;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(errorMsg);
      }
    }

    console.log(`✅ Import completed: ${imported} imported, ${failed} failed`);

    return { imported, failed, errors };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(errorMsg);
    return { imported, failed, errors };
  }
}

/**
 * Get products with smart caching
 */
export async function getProductsOptimized(
  page = 1,
  perPage = 50,
  category?: string,
  useCache = true
): Promise<WooProduct[]> {
  const cacheKey = `products-${page}-${perPage}-${category || 'all'}`;

  // Check cache first
  if (useCache) {
    const cached = getCachedProducts(cacheKey);
    if (cached && cached.size > 0) {
      return Array.from(cached.values());
    }
  }

  // Fetch from API
  const params = new URLSearchParams({
    per_page: Math.min(perPage, 100).toString(),
    page: page.toString(),
    orderby: 'id',
  });

  if (category) {
    params.append('category', category);
  }

  const url = `${STORE_URL}/wp-json/wc/v3/products?${params}`;
  const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const products: WooProduct[] = await response.json();

  // Cache results
  if (useCache) {
    cacheProducts(cacheKey, products);
  }

  return products;
}

/**
 * Prefetch next page products for smooth pagination
 */
export function prefetchNextPage(
  currentPage: number,
  perPage: number,
  category?: string
) {
  // Fetch in background without awaiting
  getProductsOptimized(currentPage + 1, perPage, category).catch(err =>
    console.error('Prefetch error:', err)
  );
}

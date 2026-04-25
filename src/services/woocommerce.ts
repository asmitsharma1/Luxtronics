/**
 * WooCommerce API Service
 * Fetches products from WooCommerce REST API
 */

const STORE_URL = import.meta.env.VITE_WOOCOMMERCE_URL || 'https://yourstore.com';
const CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_SECRET;

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  rating_count: number;
  average_rating: string;
  stock_status: string;
}

/**
 * Fetch products from WooCommerce API
 */
export async function fetchWooProducts(
  page = 1,
  perPage = 12,
  category?: string,
  search?: string
): Promise<{ products: WooProduct[]; total: number }> {
  try {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
      orderby: 'date',
      order: 'desc',
    });

    if (category) {
      params.append('category', category);
    }

    if (search) {
      params.append('search', search);
    }

    const url = `${STORE_URL}/wp-json/wc/v3/products?${params}`;

    // Build auth header (Basic Auth)
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API Error: ${response.statusText}`);
    }

    const products: WooProduct[] = await response.json();
    const total = parseInt(response.headers.get('X-WP-Total') || '0');

    return { products, total };
  } catch (error) {
    console.error('Error fetching WooCommerce products:', error);
    throw error;
  }
}

/**
 * Fetch single product by ID
 */
export async function fetchWooProduct(productId: number): Promise<WooProduct> {
  try {
    const url = `${STORE_URL}/wp-json/wc/v3/products/${productId}`;
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching WooCommerce product:', error);
    throw error;
  }
}

/**
 * Fetch WooCommerce categories
 */
export async function fetchWooCategories() {
  try {
    const url = `${STORE_URL}/wp-json/wc/v3/products/categories`;
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching WooCommerce categories:', error);
    throw error;
  }
}

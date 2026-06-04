/**
 * WooCommerce API Service
 * Fetches products from the backend proxy (/api/woo/*) to avoid CORS issues.
 * The backend proxy forwards requests to luxtronics.luxtronics.in securely.
 */

// Backend API URL. In production, same-origin keeps parked domains working and
// avoids accidentally shipping localhost from .env.local into the browser.
const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const isLocalBackendUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(configuredBackendUrl);
const isBrowserOnLocalhost =
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
const BACKEND_URL = isLocalBackendUrl && !isBrowserOnLocalhost ? '' : configuredBackendUrl;
const API_BASE = `${BACKEND_URL}/api/woo`;

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
 * Fetch products via backend proxy
 */
export async function fetchWooProducts(
  page = 1,
  perPage = 12,
  category?: string,
  search?: string
): Promise<{ products: WooProduct[]; total: number }> {
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
    orderby: 'date',
    order: 'desc',
  });

  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE}/products?${params}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Failed to fetch products: ${response.statusText}`);
  }

  const products: WooProduct[] = await response.json();
  const total = parseInt(response.headers.get('X-WP-Total') || '0');

  return { products, total };
}

/**
 * Fetch single product by ID via backend proxy
 */
export async function fetchWooProduct(productId: number): Promise<WooProduct> {
  const response = await fetch(`${API_BASE}/products/${productId}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch WooCommerce categories via backend proxy
 */
export async function fetchWooCategories() {
  const response = await fetch(`${API_BASE}/categories`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

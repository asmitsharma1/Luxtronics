# Performance Optimization Guide for 1 Lakh (100,000) Products

## 🎯 Overview
यह गाइड आपको 1 लाख products को efficiently handle करने का तरीका बताती है।

---

## 1️⃣ WooCommerce Database Optimization

### A. MySQL Indexing (सबसे महत्वपूर्ण!)

अपने WordPress database में ये queries चलाएं:

```sql
-- Product ID indexing
ALTER TABLE wp_posts ADD INDEX idx_post_type (post_type(10));
ALTER TABLE wp_posts ADD INDEX idx_post_status (post_status(10));

-- WooCommerce specific indexes
ALTER TABLE wp_postmeta ADD INDEX idx_meta_key (meta_key(50));
ALTER TABLE wp_postmeta ADD INDEX idx_post_id_meta_key (post_id, meta_key(50));

-- Product attributes
ALTER TABLE wp_term_relationships ADD INDEX idx_term_id (term_id);
ALTER TABLE wp_term_relationships ADD INDEX idx_object_id (object_id);

-- Product meta performance
ALTER TABLE wp_postmeta ADD INDEX idx_post_id (post_id);
```

### B. WooCommerce Settings में optimization करें

```php
// wp-config.php में जोड़ें

// Database optimization
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Disable unnecessary queries
define('WP_DISABLE_FATAL_ERROR_HANDLER', true);
```

### C. Plugin-based optimization

WordPress Admin में ये plugins install करें:
- **WP Super Cache** - Page caching
- **Redis Object Cache** - Advanced caching
- **WP Rocket** - Performance optimization
- **Rank Math** - Bulk optimization

---

## 2️⃣ Frontend Performance Strategy

### A. Lazy Loading Implementation

```typescript
// पहले से imported है use-lazy-products.ts में
import { useInfiniteScroll } from '@/hooks/use-lazy-products';

// Shop.tsx में use करें
export function Shop() {
  const { containerRef, sentinelRef, products, loading } = useInfiniteScroll({
    perPage: 50,
    category: 'smartphones'
  });

  return (
    <div ref={containerRef}>
      {/* Products render होंगे */}
      <div ref={sentinelRef} />
    </div>
  );
}
```

### B. Image Optimization

```html
<!-- Use modern image formats -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" loading="lazy" alt="product" />
</picture>
```

### C. Code Splitting

```typescript
// vite.config.ts में जोड़ें
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'products': ['./src/components/OptimizedProductList'],
          'woo': ['./src/services/woocommerce'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

### D. Bundle Size Reduction

Terminal में check करें:
```bash
npm run build --analyze
```

---

## 3️⃣ Caching Strategy

### A. Frontend Caching (IndexedDB)

```typescript
// services/cache-manager.ts बनाएं
export class ProductCacheManager {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('SunskyProducts', 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async cache(products: any[]) {
    const tx = this.db!.transaction('products', 'readwrite');
    const store = tx.objectStore('products');

    products.forEach(p => store.put(p));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async get(id: string) {
    const tx = this.db!.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const request = store.get(id);

    return new Promise(resolve => {
      request.onsuccess = () => resolve(request.result);
    });
  }
}
```

### B. Service Worker for Offline Caching

```typescript
// public/sw.js
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/wp-json/wc/v3/products')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          const clonedResponse = response.clone();
          caches.open('products-v1').then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        });
      })
    );
  }
});
```

### C. HTTP Caching Headers

```php
// wp-config.php
header('Cache-Control: public, max-age=3600');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
```

---

## 4️⃣ API Optimization

### A. WooCommerce REST API Caching

```php
// functions.php में जोड़ें
add_filter('rest_post_dispatch', function($response) {
  $response->header('Cache-Control', 'public, max-age=3600');
  return $response;
});
```

### B. GraphQL API (बेहतर Alternative)

```bash
npm install @apollo/client graphql
```

GraphQL से products fetch करना ज्यादा efficient है।

### C. Database Query Optimization

```php
// Only fetch needed fields
add_filter('woocommerce_rest_prepare_product', function($response, $product) {
  $data = $response->get_data();
  
  // Keep only essential fields
  $essential = [
    'id', 'name', 'slug', 'price', 'sale_price',
    'images', 'categories', 'rating', 'rating_count'
  ];
  
  $data = array_intersect_key($data, array_flip($essential));
  $response->set_data($data);
  
  return $response;
}, 10, 2);
```

---

## 5️⃣ Pagination Strategy (यह सबसे महत्वपूर्ण है!)

### A. Offset-based Pagination (सही तरीका)

```typescript
// पहले 50 products
GET /wp-json/wc/v3/products?page=1&per_page=50

// अगले 50 products
GET /wp-json/wc/v3/products?page=2&per_page=50
```

❌ AVOID: सभी products एक बार fetch करना

### B. Cursor-based Pagination (बेहतर)

```typescript
// WooCommerce native cursor pagination नहीं है
// लेकिन यह pattern custom implementation के लिए बेहतर है

// पहली request
GET /api/products?cursor=null&limit=50

// अगली request (cursor last product की ID है)
GET /api/products?cursor=12345&limit=50
```

---

## 6️⃣ Performance Monitoring

### A. Google PageSpeed Insights Metrics

```typescript
// Core Web Vitals tracking
export function trackWebVitals() {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}
```

### B. Network Monitoring

```typescript
// Check API response times
const startTime = performance.now();

const response = await fetch('/wp-json/wc/v3/products');

const endTime = performance.now();
console.log(`API response time: ${endTime - startTime}ms`);
```

---

## 7️⃣ Server-side Recommendations

### A. Use CDN for Images

```html
<!-- Cloudflare Image Optimization -->
<img src="https://cdn.example.com/product.jpg?w=500&q=80" alt="product" />
```

### B. Enable GZIP Compression

```apache
# .htaccess
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
</IfModule>
```

### C. Enable HTTP/2

```apache
# htaccess
<IfModule mod_http2.c>
  Protocols h2 http/1.1
</IfModule>
```

### D. Redis Caching (Production)

```bash
# Install Redis
sudo apt-get install redis-server

# WordPress Redis plugin
wp plugin install redis-cache
wp redis enable
```

---

## 8️⃣ Implementation Checklist

✅ Database indexes बनाएं
✅ Lazy loading implement करें
✅ Image optimization करें
✅ Code splitting enable करें
✅ Caching strategy setup करें
✅ CDN use करें
✅ Pagination implement करें
✅ API response size कम करें
✅ Per-page products limit करें (max 100)
✅ Monitoring setup करें

---

## 9️⃣ Expected Performance Results

**Optimization से पहले:**
- First Contentful Paint (FCP): 5-8s
- Largest Contentful Paint (LCP): 10-15s
- Time to Interactive (TTI): 15-20s
- Product Load: सभी products एक बार (timeout error!)

**Optimization के बाद:**
- FCP: 1-2s ✅
- LCP: 2-4s ✅
- TTI: 3-5s ✅
- Product Load: 50 per page (smooth scrolling)
- Lighthouse Score: 90+ 🎯

---

## 🔟 Monitoring & Alerts

```typescript
// Setup performance alerts
if (performance.now() > 5000) {
  console.warn('Slow page load detected!');
  // Send to monitoring service (Sentry, DataDog, etc)
}
```

---

## 📚 Additional Resources

- [WooCommerce Performance Guide](https://woocommerce.com/document/woocommerce-performance/)
- [React Virtual Scrolling](https://react-window.vercel.app/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [MySQL Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

## 💬 Quick Commands

```bash
# Analyze bundle size
npm run build -- --analyze

# Monitor performance
npm run dev -- --inspect

# Test production build
npm run build
npm run preview
```

---

**याद रखें:** यदि site अभी भी slow है, तो:
1. Database queries को profile करें (New Relic, DataDog)
2. API response times check करें
3. Image sizes reduce करें
4. More aggressive caching implement करें
5. Database के लिए optimization करें

**Happy coding! 🚀**

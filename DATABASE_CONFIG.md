/**
 * Database & Cache Configuration for Large Scale Products
 * Best practices for storing and retrieving 1 lakh products efficiently
 */

// ==================== MYSQL CONFIGURATION ====================

/**
 * wp-config.php में add करें यह settings:
 * 
 * // Memory limits
 * define('WP_MEMORY_LIMIT', '256M');
 * define('WP_MAX_MEMORY_LIMIT', '512M');
 * 
 * // Database optimization
 * define('AUTOMATIC_UPDATER_DISABLED', true);
 * define('WP_DISABLE_FATAL_ERROR_HANDLER', true);
 * 
 * // Cache settings
 * define('WP_CACHE', true);
 */

// ==================== DATABASE INDEXES ====================

/**
 * MySQL queries to run in phpMyAdmin or terminal:
 * 
 * -- Posts table indexing
 * ALTER TABLE wp_posts 
 * ADD INDEX idx_post_type (post_type(10)),
 * ADD INDEX idx_post_status (post_status(10)),
 * ADD INDEX idx_post_date (post_date DESC),
 * ADD INDEX idx_post_author (post_author),
 * ADD INDEX idx_post_parent (post_parent);
 * 
 * -- Postmeta table indexing
 * ALTER TABLE wp_postmeta 
 * ADD INDEX idx_post_id (post_id),
 * ADD INDEX idx_meta_key (meta_key(50)),
 * ADD INDEX idx_post_id_meta_key (post_id, meta_key(50));
 * 
 * -- Terms table indexing
 * ALTER TABLE wp_term_relationships 
 * ADD INDEX idx_term_id (term_id),
 * ADD INDEX idx_object_id (object_id),
 * ADD INDEX idx_term_taxonomy (term_taxonomy_id);
 * 
 * ALTER TABLE wp_terms 
 * ADD INDEX idx_slug (slug(20)),
 * ADD INDEX idx_name (name(50));
 * 
 * -- Postmeta for WooCommerce specific
 * ALTER TABLE wp_postmeta 
 * ADD INDEX idx_price_meta (meta_key, post_id),
 * ADD INDEX idx_stock_meta (meta_key, meta_value(10));
 */

// ==================== REDIS CONFIGURATION ====================

/**
 * Redis setup for object caching
 * 
 * Install WordPress Redis Cache plugin:
 * wp plugin install redis-cache --activate
 * 
 * wp redis enable
 * 
 * // wp-config.php
 * define('WP_REDIS_HOST', 'localhost');
 * define('WP_REDIS_PORT', 6379);
 * define('WP_REDIS_TIMEOUT', 1);
 * define('WP_REDIS_READ_TIMEOUT', 1);
 * define('WP_REDIS_DATABASE', 0);
 * define('WP_CACHE_KEY_SALT', 'sunsky_');
 */

// ==================== HTACCESS CONFIGURATION ====================

/**
 * .htaccess में add करें:
 * 
 * # Compression
 * <IfModule mod_deflate.c>
 *   AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
 * </IfModule>
 * 
 * # Browser caching
 * <IfModule mod_expires.c>
 *   ExpiresActive On
 *   ExpiresByType text/html "access plus 1 hour"
 *   ExpiresByType text/css "access plus 1 month"
 *   ExpiresByType text/javascript "access plus 1 month"
 *   ExpiresByType image/jpeg "access plus 1 month"
 *   ExpiresByType image/jpg "access plus 1 month"
 *   ExpiresByType image/png "access plus 1 month"
 *   ExpiresByType image/gif "access plus 1 month"
 *   ExpiresByType image/webp "access plus 1 month"
 * </IfModule>
 * 
 * # HTTP/2 Push
 * <IfModule mod_http2.c>
 *   Protocols h2 http/1.1
 * </IfModule>
 * 
 * # API Caching headers for WooCommerce
 * <FilesMatch "^.*?/wp-json/wc.*?$">
 *   Header set Cache-Control "public, max-age=3600"
 * </FilesMatch>
 */

// ==================== NGINX CONFIGURATION ====================

/**
 * nginx.conf में add करें (यदि nginx use कर रहे हो):
 * 
 * # Gzip compression
 * gzip on;
 * gzip_vary on;
 * gzip_proxied any;
 * gzip_comp_level 6;
 * gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
 * 
 * # Caching for API
 * location ~ ^/wp-json/wc/ {
 *   proxy_cache WORDPRESS;
 *   proxy_cache_valid 200 1h;
 *   proxy_cache_key "$scheme$request_method$host$request_uri";
 * }
 * 
 * # Browser caching
 * location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
 *   expires 30d;
 *   add_header Cache-Control "public, immutable";
 * }
 */

// ==================== PHP-FPM CONFIGURATION ====================

/**
 * php.ini optimizations:
 * 
 * memory_limit = 256M
 * max_execution_time = 300
 * max_input_time = 300
 * post_max_size = 100M
 * upload_max_filesize = 100M
 * 
 * // php-fpm.conf
 * max_children = 50
 * start_servers = 10
 * min_spare_servers = 5
 * max_spare_servers = 10
 * max_requests = 5000
 */

// ==================== WOOCOMMERCE PERFORMANCE HOOKS ====================

/**
 * functions.php में add करें:
 */

export const woocommerceOptimizationCode = `
<?php

// 1. Disable unnecessary WooCommerce features
add_filter('woocommerce_register_post_type_product', '__return_false'); // Custom post type
add_filter('woocommerce_load_gateways', '__return_empty_array'); // Payment gateways

// 2. REST API response optimization
add_filter('woocommerce_rest_product_object_query', function($args) {
  // Limit fields in API response
  $args['posts_per_page'] = 100; // Max allowed
  return $args;
});

// 3. Cache product meta
add_filter('woocommerce_rest_prepare_product', function($response, $product) {
  wp_cache_set('product_' . $product->get_id(), $response, 'products', 3600);
  return $response;
}, 10, 2);

// 4. Optimize product queries
add_filter('posts_request', function($query) {
  if (strpos($query, 'wp_posts.post_type = \\'product\\'') !== false) {
    // Add index hints
    $query = str_replace('FROM wp_posts', 'FROM wp_posts USE INDEX (idx_post_type)', $query);
  }
  return $query;
});

// 5. WooCommerce REST API pagination optimization
add_filter('woocommerce_rest_product_collection_params', function($params) {
  $params['per_page']['maximum'] = 100; // Allow max 100
  return $params;
});

// 6. Disable WooCommerce nonces on REST API
add_filter('woocommerce_rest_check_permissions', function() {
  if (defined('REST_REQUEST') && REST_REQUEST) {
    return true;
  }
});

// 7. Cache busting for new products
add_action('woocommerce_new_product', function($product_id) {
  wp_cache_delete('total_products_count');
  wp_cache_delete('products_list');
});

// 8. Add cache headers to REST API
add_filter('rest_post_dispatch', function($response) {
  $response->header('Cache-Control', 'public, max-age=3600');
  $response->header('X-Cache-Status', 'HIT');
  return $response;
});

// 9. Optimize image loading
add_filter('woocommerce_product_get_image_id', function($image_id, $product) {
  // Cache image IDs
  wp_cache_set('product_image_' . $product->get_id(), $image_id, 'products', 86400);
  return $image_id;
}, 10, 2);

// 10. Database query logging (development only)
if (defined('WP_DEBUG') && WP_DEBUG) {
  define('SAVEQUERIES', true);
  add_action('wp_footer', function() {
    global $wpdb;
    echo '<!-- Total Queries: ' . count($wpdb->queries) . ' -->';
  });
}

?>/
`;

// ==================== FRONTEND IMPLEMENTATION ====================

export const implementationSteps = `
## Implementation Steps

### 1. Shop Page Update
\`\`\`typescript
// pages/Shop.tsx
import OptimizedProductList from '@/components/OptimizedProductList';

export default function Shop() {
  return (
    <Layout>
      <OptimizedProductList 
        perPage={50}
        category={selectedCategory}
      />
    </Layout>
  );
}
\`\`\`

### 2. Product Detail Page
\`\`\`typescript
// pages/ProductDetail.tsx
import { useEffect, useState } from 'react';
import { fetchWooProduct } from '@/services/woocommerce';

export default function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWooProduct(Number(productId))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  
  return <div>{/* Product details */}</div>;
}
\`\`\`

### 3. Search Page with Debounce
\`\`\`typescript
// pages/Search.tsx
import { useProductSearch } from '@/hooks/use-lazy-products';

export default function Search() {
  const { searchTerm, results, search } = useProductSearch(500);

  return (
    <div>
      <input 
        type="text"
        onChange={(e) => search(e.target.value)}
        placeholder="Search products..."
      />
      
      <div className="grid grid-cols-4 gap-4">
        {results.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
\`\`\`
`;

// ==================== MONITORING & ALERTS ====================

export const monitoringCode = `
/**
 * Monitoring configuration
 * Send performance metrics to your backend
 */

export function setupPerformanceMonitoring() {
  // Track Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    const sendMetric = (metric) => {
      // Send to your monitoring backend
      fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify(metric),
      });
    };

    getCLS(sendMetric);
    getFID(sendMetric);
    getFCP(sendMetric);
    getLCP(sendMetric);
    getTTFB(sendMetric);
  });

  // API performance tracking
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = performance.now();
    
    return originalFetch.apply(this, args).then(response => {
      const duration = performance.now() - startTime;
      
      if (duration > 3000) { // Alert if > 3s
        console.warn(\`Slow API call: \${args[0]} (\${duration}ms)\`);
      }
      
      return response;
    });
  };
}
`;

console.log('Database & Cache configuration ready!');

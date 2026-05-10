# WooCommerce Integration Guide

## 📋 Prerequisites

1. **WooCommerce Store Setup**: आपके पास एक WooCommerce store होना चाहिए (WordPress + WooCommerce plugin)
2. **REST API Enabled**: WooCommerce admin में REST API enable होना चाहिए

## 🔧 Step-by-Step Setup

### 1. WooCommerce में REST API Credentials Generate करें

```
WordPress Admin → WooCommerce → Settings → Advanced → REST API
```

1. "Create an API token" पर क्लिक करें
2. Description दें (e.g., "Frontend App")
3. User सलेक्ट करें
4. Permissions: "Read" सलेक्ट करें
5. "Generate API Credentials" पर क्लिक करें
6. Consumer Key और Consumer Secret कॉपी करें

### 2. Environment Variables सेट करें

**.env** फाइल बनाएं (या `.env.local`):

```env
VITE_WOOCOMMERCE_URL=https://yourstore.com
VITE_WOOCOMMERCE_KEY=ck_xxxxxxxxxxxxx
VITE_WOOCOMMERCE_SECRET=cs_xxxxxxxxxxxxx
```

### 3. Shop Page में Products Fetch करें

अपने Shop.tsx में यह import करें:

```typescript
import { useWooProducts } from '@/hooks/use-woo-products';
import { convertWooProductsToLocal } from '@/services/product-converter';
import { useState } from 'react';

export default function Shop() {
  const [page, setPage] = useState(1);
  const { products: wooProducts, loading, error } = useWooProducts(page, 12);
  
  // Convert WooCommerce products to local format
  const products = convertWooProductsToLocal(wooProducts);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your existing Shop UI */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 4. Filter by Category करें

```typescript
const [selectedCategory, setSelectedCategory] = useState<string>();
const { products: wooProducts } = useWooProducts(1, 12, selectedCategory);
```

### 5. Search Functionality

```typescript
const [searchTerm, setSearchTerm] = useState('');
const { products: wooProducts } = useWooProducts(1, 12, undefined, searchTerm);
```

## 🔒 Security Notes

⚠️ **IMPORTANT**: कभी भी `.env` फाइल को commit न करें!

1. `.gitignore` में `.env` और `.env.local` जोड़ें:
   ```
   .env
   .env.local
   .env.*.local
   ```

2. `.env.example` फाइल रखें (credentials के बिना)

3. Production के लिए:
   - API credentials को server-side proxy के through भेजें
   - OAuth2 या JWT tokens use करें

## 📦 CORS Issues का समाधान

अगर CORS errors आ रहे हैं, तो WordPress में यह plugin install करें:

```
Easy WP CORS
```

या wp-config.php में जोड़ें:

```php
define('WP_ENVIRONMENT_TYPE', 'development');
```

## 🧪 Test करें

Terminal में:

```bash
curl -u "ck_xxx:cs_xxx" "https://yourstore.com/wp-json/wc/v3/products?per_page=1"
```

## ✅ FAQ

**Q: API काम नहीं कर रहा?**
- Check करें कि store URL सही है
- REST API enable है या नहीं
- Consumer Key/Secret सही हैं

**Q: Images दिख नहीं रहीं?**
- WooCommerce में product images upload हैं
- Image URL accessible है या नहीं check करें

**Q: Performance slow है?**
- Per page products कम करें (e.g., 6-8)
- Pagination add करें
- Caching implement करें (Redis/Memcache)

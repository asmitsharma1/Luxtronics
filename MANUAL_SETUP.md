# Manual Setup Steps (आपको ये करने हैं)

## 1️⃣ WordPress/WooCommerce Setup (आपके server पर)

### A. WooCommerce REST API Credentials Generate करें

```
WordPress Admin Dashboard में जाएं
├─ WooCommerce
├─ Settings  
├─ Advanced
└─ REST API

फिर:
1. "Create an API token" बटन पर क्लिक करें
2. Description दें (e.g., "Frontend App")
3. User select करें  
4. Permissions: "Read" सलेक्ट करें
5. "Generate API Credentials" क्लिक करें
6. Consumer Key और Consumer Secret कॉपी करें
```

### B. MySQL Database Optimization

**Option 1: PhpMyAdmin (Easy)**
```
1. cPanel → PhpMyAdmin खोलें
2. अपना WordPress database सलेक्ट करें
3. SQL tab पर क्लिक करें
4. DATABASE_CONFIG.md से सभी queries कॉपी करें
5. "Go" बटन क्लिक करें
```

**Option 2: SSH Terminal (Advanced)**
```bash
# Database में connect करें
mysql -u wordpress_user -p wordpress_database

# सभी queries paste करें
ALTER TABLE wp_posts ADD INDEX idx_post_type (post_type(10));
ALTER TABLE wp_posts ADD INDEX idx_post_status (post_status(10));
# ... सभी queries

# Exit करें
exit;
```

---

## 2️⃣ Environment Variables Setup (आपके React App में)

### A. .env फाइल बनाएं (या .env.local)

```
VITE_WOOCOMMERCE_URL=https://yourstore.com
VITE_WOOCOMMERCE_KEY=ck_0a1b2c3d4e5f6g7h8i9j
VITE_WOOCOMMERCE_SECRET=cs_9j8i7h6g5f4e3d2c1b0a
```

**⚠️ IMPORTANT:**
- `.gitignore` में `.env` add करें (secret leak न हो)
- `.env.example` फाइल commit करें (सभी को template दिखे)

---

## 3️⃣ Plugin Installation (Optional लेकिन Recommended)

### A. WordPress में Plugins Install करें

```
WordPress Admin → Plugins → Add New

Install ये plugins:
```

#### Recommended Plugins:

1. **WP Super Cache** (Page Caching)
   - Search करें: "WP Super Cache"
   - Install और Activate करें
   - Settings → WP-Cache को ON करें

2. **Redis Object Cache** (Advanced Caching)
   - Search करें: "Redis Object Cache"
   - Install करें
   - SSH में चलाएं: `wp redis enable`

3. **WP Rocket** (Premium, लेकिन best)
   - Link: https://wp-rocket.me/
   - License खरीदें और install करें

4. **Rank Math** (SEO & Performance)
   - Search करें: "Rank Math"
   - Install और Activate करें

---

## 4️⃣ .htaccess Configuration (यदि Apache server है)

### A. File Edit करें

```
FTP या cPanel File Manager से:
/public_html/.htaccess खोलें

यह content add करें:
```

```apache
# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
</IfModule>

# API Caching
<FilesMatch "^.*?/wp-json/wc.*?$">
  Header set Cache-Control "public, max-age=3600"
</FilesMatch>
```

---

## 5️⃣ React App में Changes करें

### A. Shop Page को Update करें

**Option 1: पूरी तरह Replace करें (Recommended)**
```typescript
// src/pages/Shop.tsx में
import OptimizedShop from '@/components/OptimizedShop';

// अब यह export करें
export default OptimizedShop;
```

**Option 2: Router में Change करें**
```typescript
// App.tsx या routing config में
import OptimizedShop from '@/components/OptimizedShop';

const routes = [
  // ...
  { path: '/shop', element: <OptimizedShop /> }
]
```

### B. npm dependencies check करें

```bash
cd /Users/ak/Downloads/sunsky-finds-main

# सभी packages installed हैं check करें
npm list

# अगर कोई error है तो install करें
npm install
```

---

## 6️⃣ Test करें (Development)

```bash
# Development server start करें
npm run dev

# Browser में खोलें
http://localhost:5173/shop
```

### Check करें:

- [ ] Products load हो रहे हैं (first 50)
- [ ] Scroll down करने पर और products load हों
- [ ] Images दिख रहीं हैं
- [ ] Category filter काम कर रहा है
- [ ] Sort dropdown काम कर रहा है
- [ ] Loading animation दिख रहा है
- [ ] Console में कोई error नहीं है
- [ ] Network tab में API calls < 3s हैं

---

## 7️⃣ Production Deployment

### A. Build करें

```bash
npm run build

# Output: dist/ folder में file होंगी
```

### B. Production में Upload करें

```bash
# FTP से upload करें
dist/ folder की सभी files upload करें अपने hosting पर

# या SSH से
scp -r dist/* user@yourserver.com:/home/user/public_html/
```

### C. Environment Variables Production पर सेट करें

```
अपने hosting पर:
1. File Manager खोलें
2. public_html folder में .env बनाएं
3. Production credentials add करें
```

---

## 8️⃣ Monitoring Setup (Optional)

### A. Google PageSpeed Insights Check करें

```
https://pagespeed.web.dev/

अपना URL डालें और देखें:
- Core Web Vitals
- Performance score
- Improvement suggestions
```

### B. Real-time Monitoring (Advanced)

```
Sentry, DataDog, या New Relic से:
1. Account बनाएं
2. Token generate करें
3. App में integrate करें
```

---

## 9️⃣ Common Issues & Fixes

### Issue: API 401 Unauthorized

```
हो सकता है:
❌ Consumer Key/Secret गलत है
❌ REST API disabled है

Fix:
1. WooCommerce settings check करें
2. New API credentials generate करें
3. .env में सही credentials paste करें
```

### Issue: CORS Error

```
"Access to fetch blocked by CORS policy"

Fix:
1. WordPress में CORS plugin install करें
   wp plugin install easy-wp-cors
   
2. या wp-config.php में add करें:
   define('WP_ENVIRONMENT_TYPE', 'development');
```

### Issue: Images नहीं दिख रहीं

```
Check करें:
1. WooCommerce में products upload हैं
2. Image URLs सही हैं
3. Image CDN configured है
4. CORS settings सही हैं
```

### Issue: Infinite Scroll काम नहीं कर रहा

```
Check करें:
1. DevTools > Elements में sentinel div दिख रहा है
2. DevTools > Console में error नहीं है
3. Network tab में API calls हो रहीं हैं
```

---

## 🔟 Support Resources

### अगर कोई problem हो:

```
1. Check करें: QUICK_START.md
2. Check करें: PERFORMANCE_GUIDE.md
3. Check करें: DATABASE_CONFIG.md
4. DevTools > Console में error देखें
5. WordPress debug.log check करें
6. Network tab में API response check करें
```

---

## ✅ Checklist - Implementation Order

### Day 1:
- [ ] WooCommerce API credentials generate करें
- [ ] .env file बनाएं
- [ ] Database indexes run करें
- [ ] npm run dev से test करें

### Day 2:
- [ ] Shop page को OptimizedShop से replace करें
- [ ] Production में build करें
- [ ] Hosting पर upload करें

### Day 3+:
- [ ] Plugins install करें (caching, etc)
- [ ] .htaccess optimize करें
- [ ] Performance monitor करें
- [ ] Issues fix करें

---

## 🎯 Expected Timeline

```
Setup: 1-2 hours
Testing: 1-2 hours
Deployment: 30 minutes
Monitoring: Ongoing
```

---

**Questions?** अपनी problem को DevTools में debug करते हुए check करें! 🚀

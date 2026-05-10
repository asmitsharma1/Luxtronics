# MongoDB Setup Guide - Production Edition

## 📚 Overview

यह guide आपको **MongoDB को production में setup करने** का तरीका बताएगा।

---

## 1️⃣ MongoDB Cloud (MongoDB Atlas) Setup

### A. Account बनाएं

1. https://www.mongodb.com/cloud/atlas पर जाएं
2. "Sign Up" करें
3. Email verify करें

### B. Free Cluster बनाएं

```
1. Projects → Create Project
   ├─ Name: "sunsky-finds"
   └─ Create

2. Build Database
   ├─ Select: M0 Free (completely free)
   ├─ Provider: AWS
   ├─ Region: India (ap-southeast-1) या अपना nearest
   └─ Create

3. Security → Quick Start
   ├─ Username: mongodb_user
   ├─ Password: (strong password)
   ├─ Add IP Address: 0.0.0.0/0 (allow all in dev)
   └─ Create User
```

### C. Connection String प्राप्त करें

```
1. Databases → Connect
   ├─ Choose connection method: "Drivers"
   ├─ Driver: Node.js
   ├─ Version: 4.x or later
   └─ Copy connection string

Format: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

---

## 2️⃣ Environment Variables Setup

### .env फाइल बनाएं

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://mongodb_user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=sunsky-finds

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Sync Token (for /api/sync endpoint)
SYNC_TOKEN=your-secret-sync-token-here

# WooCommerce Configuration (same as before)
VITE_WOOCOMMERCE_URL=https://yourstore.com
VITE_WOOCOMMERCE_KEY=ck_xxxxxxxxxxxxx
VITE_WOOCOMMERCE_SECRET=cs_xxxxxxxxxxxxx
```

### .env.example बनाएं (credentials बिना)

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
MONGODB_DB_NAME=sunsky-finds

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Sync Token
SYNC_TOKEN=your-secret-sync-token

# WooCommerce Configuration
VITE_WOOCOMMERCE_URL=https://yourstore.com
VITE_WOOCOMMERCE_KEY=ck_xxxxxxxxxxxxx
VITE_WOOCOMMERCE_SECRET=cs_xxxxxxxxxxxxx
```

---

## 3️⃣ NPM Dependencies Install करें

```bash
cd /Users/ak/Downloads/sunsky-finds-main

# Install MongoDB and server dependencies
npm install mongodb cors dotenv express

# For TypeScript support
npm install --save-dev @types/express @types/node ts-node typescript

# For development
npm install --save-dev nodemon
```

### package.json में scripts जोड़ें

```json
{
  "scripts": {
    "dev": "vite",
    "server:dev": "nodemon --exec ts-node server/index.ts",
    "server:build": "tsc --project tsconfig.server.json",
    "server:start": "node dist/server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "sync:products": "ts-node scripts/sync-products.ts",
    "sync:full": "ts-node scripts/sync-full.ts"
  }
}
```

---

## 4️⃣ TypeScript Configuration

### tsconfig.server.json बनाएं

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/server",
    "rootDir": "./server",
    "lib": ["ES2020"],
    "target": "ES2020"
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules", "dist", "src"]
}
```

---

## 5️⃣ CLI Scripts बनाएं (Manual Sync के लिए)

### A. scripts/sync-products.ts

```typescript
/**
 * CLI script to sync products from WooCommerce to MongoDB
 */

import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🔄 Syncing products from WooCommerce to MongoDB...');

    const db = await initializeMongoDB();
    const syncService = new WooCommerceSync(db);

    const result = await syncService.syncProducts({
      batchSize: 100,
      delay: 1000,
      onProgress: (current, total) => {
        const percentage = Math.round((current / total) * 100);
        console.log(`Progress: ${current}/${total} (${percentage}%)`);
      },
    });

    console.log('✅ Sync completed!');
    console.log(`   - Synced: ${result.synced}`);
    console.log(`   - Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    await disconnectMongoDB();
  } catch (error) {
    console.error('❌ Sync failed:', error);
    await disconnectMongoDB();
    process.exit(1);
  }
}

main();
```

### B. scripts/sync-full.ts

```typescript
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🔄 Running full sync (products + categories)...');

    const db = await initializeMongoDB();
    const syncService = new WooCommerceSync(db);

    const result = await syncService.fullSync({
      batchSize: 100,
      delay: 1000,
      onProgress: (current, total) => {
        console.log(`Progress: ${current}/${total}`);
      },
    });

    console.log('✅ Full sync completed!');
    console.log(`   - Products synced: ${result.products}`);
    console.log(`   - Categories synced: ${result.categories}`);

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    await disconnectMongoDB();
  } catch (error) {
    console.error('❌ Sync failed:', error);
    await disconnectMongoDB();
    process.exit(1);
  }
}

main();
```

---

## 6️⃣ Local Development Setup

### A. Local MongoDB Install करें (Optional)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**या Docker से:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### B. Development में Local MongoDB Use करें

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=sunsky-finds-dev
```

---

## 7️⃣ API Testing

### A. Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-23T10:30:00Z"
}
```

### B. Get Products

```bash
curl "http://localhost:3001/api/products?page=1&per_page=50"
```

### C. Search Products

```bash
curl "http://localhost:3001/api/search?q=laptop&per_page=20"
```

### D. Trigger Sync

```bash
curl -X POST http://localhost:3001/api/sync \
  -H "X-Sync-Token: your-secret-sync-token-here" \
  -H "Content-Type: application/json" \
  -d '{"type": "products"}'
```

---

## 8️⃣ Production Deployment

### A. Server को Build करें

```bash
npm run server:build
```

### B. Hosting पर Deploy करें

**Option 1: Render.com (Recommended)**
```
1. Render.com पर account बनाएं
2. New Web Service बनाएं
3. GitHub repository connect करें
4. Build command: npm install && npm run server:build
5. Start command: npm run server:start
6. Environment variables add करें
```

**Option 2: Railway.app**
```
1. railway.app पर account बनाएं
2. New Project → Deploy from GitHub
3. railway.json में config दें
```

**Option 3: Heroku (Legacy)**
```bash
git push heroku main
```

### C. Automatic Sync Schedule करें

**Using Cron Job (Render/Railway):**
```bash
# Every 6 hours sync करें
0 */6 * * * curl -X POST https://api.yourdomain.com/api/sync \
  -H "X-Sync-Token: your-token" \
  -H "Content-Type: application/json" \
  -d '{"type": "incremental"}'
```

**या Webhook से:**
WooCommerce Admin में:
```
Settings → Webhooks
├─ Topic: Product updated
├─ Delivery URL: https://api.yourdomain.com/api/sync/incremental
└─ Secret: your-sync-token
```

---

## 9️⃣ Frontend Integration

### A. API Hook बनाएं

```typescript
// src/hooks/use-mongo-products.ts

import { useState, useEffect } from 'react';

export function useMongoDB<T>(endpoint: string, options = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}${endpoint}`);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
```

### B. Component में Use करें

```typescript
// src/components/MongoProductList.tsx

import { useMongoDB } from '@/hooks/use-mongo-products';

export function MongoProductList() {
  const { data: products, loading } = useMongoDB('/products?per_page=50');

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 🔟 Monitoring & Maintenance

### A. MongoDB Atlas में Monitoring

```
Clusters → Performance
├─ Check: CPU usage
├─ Check: Memory usage
├─ Check: Network I/O
└─ Set: Alerts
```

### B. API Performance Monitoring

```typescript
// src/utils/analytics.ts

export function trackAPIPerformance(endpoint: string, duration: number) {
  if (duration > 3000) {
    console.warn(`⚠️ Slow API: ${endpoint} (${duration}ms)`);
    // Send to monitoring service
  }
}
```

### C. Database Maintenance

```javascript
// Periodically optimize database
db.collection('products').deleteMany({ deletedAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } });
```

---

## 📊 Database Statistics

```bash
# Check MongoDB storage usage
curl http://localhost:3001/api/stats

# Response:
{
  "success": true,
  "data": {
    "totalProducts": 100000,
    "totalCategories": 25,
    "lastUpdated": "2026-04-23T10:30:00Z"
  }
}
```

---

## ⚠️ Security Best Practices

### 1. IP Whitelist (MongoDB Atlas)

```
Security → Network Access
├─ 0.0.0.0/0 (development केवल)
└─ Add IP address (production के लिए specific IPs)
```

### 2. Environment Variables

```bash
# Production में NEVER commit करें
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 3. API Token Protection

```typescript
// Sync endpoint को protect करें
const SYNC_TOKEN = process.env.SYNC_TOKEN;

if (req.headers['x-sync-token'] !== SYNC_TOKEN) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 4. CORS Configuration

```typescript
cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
})
```

---

## 🎯 Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Connection string obtained
- [ ] .env configured with credentials
- [ ] npm packages installed
- [ ] Server successfully connects to MongoDB
- [ ] API endpoints tested (GET products, search, etc)
- [ ] Sync script runs successfully
- [ ] Frontend integrated with API
- [ ] Performance monitored
- [ ] Deployed to production
- [ ] Automatic sync scheduled

---

## 📞 Troubleshooting

### Connection Error: "connect ENOTFOUND"

```
समस्या: MongoDB से connect नहीं हो पा रहे
समाधान:
1. MONGODB_URI check करें
2. IP whitelist add करें (MongoDB Atlas)
3. Username/password सही हैं
4. Internet connection check करें
```

### Slow Queries

```
समस्या: API calls slow हैं
समाधान:
1. Indexes check करें
2. MongoDB Atlas performance monitor देखें
3. Query optimization करें
4. Free tier को paid tier में upgrade करें
```

### Sync Failed

```
समस्या: WooCommerce sync fail हो रहा है
समाधान:
1. WooCommerce API credentials check करें
2. Rate limiting check करें
3. Server logs में error देखें
4. Network connection verify करें
```

---

**🎉 Congratulations! MongoDB setup complete!**

अब आपके पास एक super-fast caching layer है जो 1 लाख products को efficiently serve कर सकता है! 🚀

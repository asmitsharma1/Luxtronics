# MongoDB Quick Setup - 30 मिनट में शुरू करें

## ⚡ Super Quick Start

### Step 1: MongoDB Atlas Account (2 मिनट)

```bash
1. https://www.mongodb.com/cloud/atlas खोलें
2. "Sign Up" करें (Google से or Email)
3. Email verify करें
```

### Step 2: Free Cluster बनाएं (3 मिनट)

```bash
1. Create Project → "sunsky-finds"
2. Build Database → M0 Free
3. Choose: AWS + Region (nearest to you)
4. Create Database
```

### Step 3: Connection String लें (2 मिनट)

```bash
Clusters → Connect → Drivers
├─ Copy connection string
└─ Save करें कहीं
```

Format: `mongodb+srv://username:password@xxxxx.mongodb.net/dbname?retryWrites=true&w=majority`

### Step 4: .env File बनाएं (2 मिनट)

```bash
# Your project folder में .env बनाएं

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=sunsky-finds

PORT=3001
NODE_ENV=production

CORS_ORIGIN=http://localhost:5173,https://yourdomain.com

SYNC_TOKEN=your-secret-token-12345

VITE_WOOCOMMERCE_URL=https://yourstore.com
VITE_WOOCOMMERCE_KEY=ck_xxxxxxxxxxxxx
VITE_WOOCOMMERCE_SECRET=cs_xxxxxxxxxxxxx
```

### Step 5: Dependencies Install करें (5 मिनट)

```bash
npm install mongodb cors dotenv express

npm install --save-dev @types/express @types/node ts-node typescript nodemon
```

### Step 6: Test करें (5 मिनट)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Server
npm run server:dev

# Browser में check करें
curl http://localhost:3001/health
```

### Step 7: Sync करें (5 मिनट)

```bash
# Terminal 3: Run sync script
npx ts-node scripts/sync-products.ts

# Wait करते हुए देखें products sync हो रहे हैं
# ✅ Synced batch 1: 100 products
# ✅ Synced batch 2: 100 products
# ... आदि
```

---

## 📋 Checklist (सभी step complete करें)

- [ ] MongoDB Atlas account बनाया
- [ ] Free cluster बनाया
- [ ] Connection string copy किया
- [ ] .env file बनाया (सही credentials के साथ)
- [ ] npm packages install किए
- [ ] Server start किया (npm run server:dev)
- [ ] Health check success था
- [ ] Sync script run किया
- [ ] All products synced हो गए
- [ ] API से products fetch हो रहे हैं

---

## 🔗 Important Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Connection String Docs](https://docs.mongodb.com/manual/reference/connection-string/)
- [Node.js Driver](https://docs.mongodb.com/drivers/node/)

---

## ⚠️ Common Issues

### Issue: "Invalid MongoDB URI"
```
Solution: Connection string को सही से copy करें
Format: mongodb+srv://username:password@cluster.mongodb.net/
```

### Issue: "Authentication failed"
```
Solution: 
1. Username/password सही हैं check करें
2. Special characters को URL encode करें (@, :, etc)
3. IP whitelist add करें (MongoDB Atlas)
```

### Issue: "Connection timeout"
```
Solution:
1. Network connection check करें
2. MongoDB Atlas में "Allow from Anywhere" सेट करें (IP 0.0.0.0/0)
3. VPN use करें (अगर ISP ने block किया है)
```

---

## 🚀 Next Steps

1. **Products को MongoDB में cache करें**
   ```bash
   npm run sync:products
   ```

2. **Frontend में MongoDB API use करें**
   - [MONGODB_SETUP.md](MONGODB_SETUP.md) देखें

3. **Production में deploy करें**
   - Render.com या Railway.app use करें

---

**🎉 MongoDB setup complete! अब आपके पास super-fast database है!** 🚀

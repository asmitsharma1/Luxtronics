# Luxtronics Deployment Checklist - 503 Fix

## ✅ Changes Made to Fix 503 Error

### 1. **Created PM2 Configuration** (`ecosystem.config.cjs`)
- Single instance mode (prevents multiple processes)
- Memory limit: 256MB
- Auto-restart on crash
- Resource-optimized settings

### 2. **Created Startup Script** (`start-production.sh`)
- Kills all existing Node processes
- Clears PM2 cache
- Starts fresh single instance
- Prevents process accumulation

### 3. **Optimized Server.js**
- MongoDB connection pooling (max 5 connections)
- Better rate limiter memory management
- Graceful error handling
- Memory leak prevention

### 4. **Fixed Vite Config** (`vite.config.ts`)
- Fixed lovable-tagger ESM import issue
- Safe fallback for production builds
- No build errors

### 5. **Created Diagnostic Script** (`check-processes.sh`)
- Quick health check
- Process count monitoring
- Memory and disk usage

---

## 🚀 Deployment Steps

### **Step 1: Upload Files to Hostinger**

Upload these files via FTP or File Manager:
```
ecosystem.config.cjs
start-production.sh
check-processes.sh
server.js (updated)
vite.config.ts (updated)
```

### **Step 2: SSH into Server**
```bash
ssh your-username@your-server.com
cd ~/public_html
```

### **Step 3: Kill Existing Processes**
```bash
# Check what's running
./check-processes.sh

# Kill all Node processes
pkill -9 node

# Clear PM2
pm2 delete all
pm2 flush
```

### **Step 4: Make Scripts Executable**
```bash
chmod +x start-production.sh
chmod +x check-processes.sh
```

### **Step 5: Start Server**
```bash
./start-production.sh
```

### **Step 6: Verify**
```bash
# Check PM2 status
pm2 list
pm2 logs luxtronics-server

# Test API
curl http://localhost:3001/health
curl http://localhost:3001/api/status

# Check website
# Visit: https://luxtronics.com.au
```

---

## 🔍 Testing Locally

Before deploying to production, test locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test with PM2
npm install -g pm2
pm2 start ecosystem.config.cjs

# Check status
pm2 list
pm2 logs

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/status
curl http://localhost:3001/api/products?per_page=10

# Stop
pm2 stop all
```

---

## 📊 Monitoring Commands

```bash
# Check processes
./check-processes.sh

# PM2 status
pm2 list
pm2 info luxtronics-server

# View logs
pm2 logs luxtronics-server
pm2 logs luxtronics-server --lines 100

# Real-time monitoring
pm2 monit

# Resource usage
free -m
df -h
ps aux | wc -l
```

---

## 🆘 Troubleshooting

### Problem: Still getting 503
**Solution:**
```bash
pkill -9 node
pm2 kill
sleep 5
cd ~/public_html
pm2 start ecosystem.config.cjs
pm2 save
```

### Problem: PM2 not installed
**Solution:**
```bash
npm install -g pm2
# Or if no permissions:
npm install pm2
npx pm2 start ecosystem.config.cjs
```

### Problem: Server crashes immediately
**Solution:**
```bash
# Check logs
pm2 logs luxtronics-server --err

# Common issues:
# 1. MongoDB connection - check .env file
# 2. Port already in use - kill processes
# 3. Missing dependencies - run npm install
```

### Problem: Can't access website
**Solution:**
1. Check if server is running: `pm2 list`
2. Check port: `netstat -tuln | grep 3001`
3. Check firewall: Contact Hostinger support
4. Check .htaccess for proxy rules

---

## 🎯 Key Points

1. **Always use PM2** - Never run `node server.js` manually
2. **Single instance only** - Multiple processes = 503 error
3. **Kill old processes** - Before starting new ones
4. **Monitor regularly** - Use `check-processes.sh`
5. **Save PM2 config** - Run `pm2 save` after starting

---

## 📝 Environment Variables

Make sure these are set in `.env` or `.env.local`:

```env
# MongoDB (required)
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=Luxtronics

# Server
PORT=3001
NODE_ENV=production

# WooCommerce (for fallback)
VITE_WOOCOMMERCE_URL_INDIA=https://...
VITE_WOOCOMMERCE_KEY_INDIA=ck_...
VITE_WOOCOMMERCE_SECRET_INDIA=cs_...

# Australia store
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://...
VITE_WOOCOMMERCE_KEY_AUSTRALIA=ck_...
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=cs_...

# New Zealand store
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://...
VITE_WOOCOMMERCE_KEY_NEWZEALAND=ck_...
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=cs_...
```

---

## ✨ Success Indicators

✅ `pm2 list` shows 1 process with status "online"  
✅ `curl http://localhost:3001/health` returns `{"status":"ok"}`  
✅ Website loads at https://luxtronics.com.au  
✅ No 503 errors  
✅ Process count < 10 (check with `check-processes.sh`)  

---

## 🔄 Auto-restart on Server Reboot

To make PM2 start on server reboot:

```bash
pm2 startup
# Copy and run the command it shows
pm2 save
```

---

## 📞 Support

If still having issues:
1. Check logs: `pm2 logs luxtronics-server`
2. Run diagnostics: `./check-processes.sh`
3. Check Hostinger support for process limits
4. Verify all env variables are set correctly

---

## 🎉 Final Notes

- Build works perfectly ✅
- All files optimized for single-process mode ✅
- Memory usage optimized ✅
- MongoDB connection pooling added ✅
- Rate limiter memory leaks fixed ✅
- Diagnostic tools included ✅

**Deploy these changes and the 503 error should be resolved!**

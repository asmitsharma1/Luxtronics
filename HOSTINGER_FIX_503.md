# Fix 503 Resource Limit Error on Hostinger

## Problem
Website showing **503 Service Unavailable - Resource Limit Reached (Max Processes)**

This happens when too many Node.js processes are running simultaneously on Hostinger.

## Solution Steps

### Step 1: SSH into Hostinger Server
```bash
ssh your-username@your-domain.com
```

### Step 2: Kill All Existing Node Processes
```bash
# Kill ALL node processes
pkill -9 node

# Verify no node processes running
ps aux | grep node
```

### Step 3: Check PM2 Processes
```bash
# List PM2 processes
pm2 list

# Delete all PM2 processes
pm2 delete all

# Clear PM2 logs and process list
pm2 flush
pm2 save --force
```

### Step 4: Upload New Files to Hostinger
Upload these new files via FTP/File Manager:
- `ecosystem.config.cjs` - PM2 configuration (single instance only)
- `start-production.sh` - Startup script with process cleanup
- `server.js` - Updated with MongoDB connection pooling and memory optimization

### Step 5: Start Server with New Configuration
```bash
cd /home/your-username/public_html

# Make script executable
chmod +x start-production.sh

# Start server
./start-production.sh
```

### Step 6: Verify Server is Running
```bash
# Check PM2 status
pm2 list
pm2 info luxtronics-server

# Check logs
pm2 logs luxtronics-server --lines 50

# Test API endpoint
curl http://localhost:3001/health
```

### Step 7: Monitor Server
```bash
# Real-time logs
pm2 logs luxtronics-server

# CPU and Memory usage
pm2 monit
```

## Alternative: Quick Fix via Hostinger Panel

1. **Login to Hostinger Control Panel**
2. Go to **Advanced → Terminal** or **Hosting → File Manager**
3. Run these commands:
   ```bash
   pkill -9 node
   pm2 delete all
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

## Key Changes Made

### 1. **Single Instance Configuration** (`ecosystem.config.cjs`)
- Limits to **1 Node process only**
- Max memory: 256MB
- Auto-restart on crash
- Resource-optimized settings

### 2. **Process Cleanup** (`start-production.sh`)
- Kills all old Node processes before starting
- Prevents accumulation of zombie processes
- Ensures clean slate on every deployment

### 3. **MongoDB Connection Pooling** (`server.js`)
- Limited to 5 connections max (was unlimited)
- Prevents MongoDB from consuming too many resources
- Graceful fallback if MongoDB fails

### 4. **Aggressive Memory Management** (`server.js`)
- Rate limiter cleans up old entries more frequently
- Prevents memory leaks
- Better handling of high traffic

## Monitoring Commands

```bash
# Check if process limit is reached
ps aux | wc -l

# Check memory usage
free -m

# Check disk space
df -h

# Check Node.js process count
ps aux | grep node | wc -l
```

## Preventing Future 503 Errors

1. **Always use PM2** with single instance mode
2. **Never run multiple** `node server.js` commands manually
3. **Monitor process count** regularly
4. **Set up auto-restart** in PM2 configuration
5. **Use resource limits** (max_memory_restart)

## If Still Getting 503

1. **Check Hostinger Plan Limits**
   - Some plans have very low process limits (10-25 processes)
   - Consider upgrading if needed

2. **Contact Hostinger Support**
   - Ask them to increase process limit
   - Request temporary limit raise

3. **Optimize Further**
   - Reduce max_memory_restart to 128M
   - Disable unnecessary features
   - Cache more aggressively

## Testing Locally

Before deploying, test the configuration locally:

```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config
pm2 start ecosystem.config.cjs

# Check status
pm2 list
pm2 logs

# Test the server
curl http://localhost:3001/health
curl http://localhost:3001/api/status
```

## Emergency Recovery

If website is completely down:

```bash
# SSH to server
ssh your-username@your-domain.com

# Nuclear option - kill everything
pkill -9 node
pm2 kill

# Wait 5 seconds
sleep 5

# Start fresh
cd /home/your-username/public_html
pm2 start ecosystem.config.cjs
pm2 save
```

---

## Summary

The 503 error was caused by **too many Node.js processes** running simultaneously. The fixes:

✅ Limit to 1 process with PM2  
✅ Kill old processes before starting  
✅ Optimize MongoDB connections  
✅ Better memory management  
✅ Resource limits and auto-restart  

Deploy these changes and run the startup script to fix the issue!

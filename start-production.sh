#!/usr/bin/env bash
# ============================================================================
#  Production Startup Script for Hostinger
#  Kills all existing Node processes to prevent 503 resource limit errors
# ============================================================================
set -e

echo "🔍 Checking for existing Node.js processes..."

# Kill ALL existing node processes (to avoid process limit)
pkill -9 node || true
sleep 2

echo "✅ Old processes cleared"

# Start fresh with PM2 (single instance only)
echo "🚀 Starting Luxtronics server with PM2..."

# Delete any old PM2 process
pm2 delete luxtronics-server || true
pm2 flush || true

# Start with ecosystem config
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save --force

echo "✅ Server started successfully!"
echo "📊 Process status:"
pm2 list
pm2 info luxtronics-server

#!/usr/bin/env bash
# Quick diagnostic script to check what's running on Hostinger

echo "======================================"
echo "  Luxtronics Process Diagnostics"
echo "======================================"
echo ""

echo "📊 Total processes running:"
ps aux | wc -l
echo ""

echo "🔍 Node.js processes:"
NODE_COUNT=$(ps aux | grep node | grep -v grep | wc -l)
echo "Count: $NODE_COUNT"
ps aux | grep node | grep -v grep || echo "No Node processes found"
echo ""

echo "📦 PM2 processes:"
pm2 list || echo "PM2 not running or not installed"
echo ""

echo "💾 Memory usage:"
free -m 2>/dev/null || echo "Memory info not available"
echo ""

echo "💿 Disk space:"
df -h . 2>/dev/null || echo "Disk info not available"
echo ""

echo "🌐 Server listening on ports:"
netstat -tuln 2>/dev/null | grep LISTEN || ss -tuln 2>/dev/null | grep LISTEN || echo "Port info not available"
echo ""

echo "======================================"
if [ "$NODE_COUNT" -gt 5 ]; then
  echo "⚠️  WARNING: Too many Node processes!"
  echo "   Run: pkill -9 node"
  echo "   Then: ./start-production.sh"
else
  echo "✅ Process count looks OK"
fi
echo "======================================"

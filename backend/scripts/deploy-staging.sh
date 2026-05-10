#!/usr/bin/env bash
# =============================================================================
#  deploy-staging.sh — Manual FTP deploy script for STAGING
#  Usage:  bash backend/scripts/deploy-staging.sh
# =============================================================================
set -euo pipefail

if [[ -f ".env.local" ]]; then
  export $(grep -v '^#' .env.local | xargs)
fi

: "${FTP_HOST:?Set FTP_HOST in .env.local or environment}"
: "${FTP_USER:?Set FTP_USER in .env.local or environment}"
: "${FTP_PASS:?Set FTP_PASS in .env.local or environment}"
# Staging usually goes to a subfolder
: "${FTP_REMOTE_DIR:=/public_html/staging}"

BUILD_DIR="${BUILD_DIR:-dist}"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "❌ Build directory '$BUILD_DIR' not found. Run 'npm run build' first."
  exit 1
fi

echo "🚀 Deploying to STAGING: $FTP_REMOTE_DIR"

lftp -c "
  set ftp:ssl-allow yes;
  set ssl:verify-certificate no;
  set ftp:passive-mode yes;
  open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
  mirror --reverse --delete --verbose \
         --exclude-glob .DS_Store \
         --exclude-glob '*.map' \
         $BUILD_DIR/ $FTP_REMOTE_DIR/;
  quit
"

echo "✅ Staging deploy complete!"

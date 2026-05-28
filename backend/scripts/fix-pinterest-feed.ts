/**
 * Fix Pinterest Feed — Bulk update all WooCommerce products with:
 *   1. condition = "new"
 *   2. google_product_category (mapped from WooCommerce category)
 *
 * Run: npm run fix:pinterest
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// ── WooCommerce API ───────────────────────────────────────────────────────────
const Api = (WooCommerceRestApi as any).default ?? WooCommerceRestApi;
const woo = new Api({
  url:            process.env.VITE_WOOCOMMERCE_URL_INDIA    || '',
  consumerKey:    process.env.VITE_WOOCOMMERCE_KEY_INDIA    || '',
  consumerSecret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  version: 'wc/v3',
  timeout: 30000,
});

// ── Google Product Category mapping ──────────────────────────────────────────
// Full taxonomy: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const CATEGORY_MAP: Record<string, string> = {
  // Smartphones & Tablets
  'smart-phone':          '267',   // Electronics > Communications > Telephony > Mobile Phones
  'smartphones':          '267',
  'smart phone':          '267',
  'android-tablet-pc':    '4745',  // Electronics > Computers > Tablet Computers
  'android tablet pc':    '4745',
  'feature-phones':       '267',
  'google':               '267',
  'huawei':               '267',
  'motorola':             '267',
  'honor':                '267',

  // Apple
  'iphone':               '267',
  'apple-accessories':    '1267',  // Electronics > Communications > Telephony > Mobile Phone Accessories
  'apple-parts':          '1267',
  'apple-watch':          '201',   // Electronics > Electronics Accessories > Wearable Technology
  'mac-accessories':      '328',   // Electronics > Computers > Computer Accessories
  'mac-parts':            '328',
  'airpods-protective-case': '1267',

  // Samsung
  'samsung-accessories':  '1267',
  'samsung-parts':        '1267',
  'galaxy-tab-s11':       '4745',
  'galaxy-z-fold8-5g':    '267',
  'galaxy-s25-ultra-5g':  '267',
  'galaxy-s26-5g':        '267',

  // Mobile Parts & Accessories
  'mobile-parts':         '1267',
  'mobile-accessories':   '1267',
  'replacement-parts':    '1267',
  'repair-tools':         '1267',
  'cable-charger':        '1267',
  'tempered-glass':       '1267',
  'cases':                '1267',
  'bags-cases-straps':    '1267',
  'bags, cases & straps': '1267',

  // Xiaomi / OnePlus / OPPO
  'xiaomi':               '267',
  'redmi-k90':            '267',
  'redmi-note-15':        '267',
  'oneplus-oppo-accessories': '1267',
  'oneplus-15':           '267',
  'oppo-find-x9':         '267',
  'oppo-reno14-pro':      '267',

  // Wearables
  'wearables':            '201',   // Electronics > Electronics Accessories > Wearable Technology
  'garmin-watch':         '201',
  'fitbit-watch':         '201',
  'huawei-watch':         '201',

  // Audio
  'audio':                '232',   // Electronics > Audio
  'bluetooth-speakers':   '232',

  // Camera & Photography
  'camera':               '2096',  // Electronics > Cameras & Optics > Cameras
  'camera-accessories':   '2096',
  'camera-filters':       '2096',
  'camera-lens-protector':'2096',
  'photo-studio':         '2096',
  'photographic-supplies':'2096',
  'dji-air-series':       '2096',
  'dji-mavic-series':     '2096',
  'dji-insta360-accessories': '2096',
  'insta360-x-series':    '2096',
  'osmo-pocket-accessories': '2096',
  'gopro-combo-kits':     '2096',
  'live-equipment':       '2096',

  // Gaming
  'game-accessories':     '1279',  // Electronics > Video Game Consoles & Accessories
  'gaming-accessories':   '1279',
  'nintendo-accessories': '1279',
  'pocket-console-accessories': '1279',

  // Consumer Electronics
  'consumer-electronics': '222',   // Electronics
  'android-tv-boxes':     '1801',  // Electronics > Video > Video Players & Recorders
  'projector':            '306',   // Electronics > Video > Projectors
  'ip-camera':            '2425',  // Electronics > Cameras & Optics > Surveillance Systems
  'cctv-accessories':     '2425',
  'access-control-system':'2425',
  'gps-tracker-accessories': '1267',
  '3d-printer-machines':  '499948',// Electronics > 3D Printers

  // In Car
  'in-car':               '8526',  // Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Electronics
  'car-dvrs-accessories': '8526',
  'parking-sensor':       '8526',

  // Outdoor & Sports
  'outdoor-sports':       '990',   // Sporting Goods
  'camping':              '3334',  // Sporting Goods > Outdoor Recreation > Camping & Hiking
  'bicycle-accessories':  '3618',  // Sporting Goods > Cycling
  'fishing':              '3334',

  // Arduino / Tech
  'arduino-scm-supplies': '222',
  'diagnostic-scan-tools':'8526',
};

// Default fallback
const DEFAULT_GOOGLE_CATEGORY = '222'; // Electronics

function getGoogleCategory(categories: any[]): string {
  for (const cat of categories) {
    const slug = (cat.slug || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();
    if (CATEGORY_MAP[slug]) return CATEGORY_MAP[slug];
    if (CATEGORY_MAP[name]) return CATEGORY_MAP[name];
    // Partial match
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (slug.includes(key) || name.includes(key)) return val;
    }
  }
  return DEFAULT_GOOGLE_CATEGORY;
}

// ── Fetch all products ────────────────────────────────────────────────────────
async function fetchAllProducts(): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  console.log('📦 Fetching all products...');
  while (true) {
    try {
      const { data } = await woo.get('products', { per_page: 100, page, status: 'publish' });
      if (!data?.length) break;
      all.push(...data);
      process.stdout.write(`\r   Fetched ${all.length} products (page ${page})...`);
      page++;
    } catch (err: any) {
      console.error(`\n❌ Fetch error page ${page}:`, err.message);
      break;
    }
  }
  console.log(`\n✅ Total: ${all.length} products\n`);
  return all;
}

// ── Update single product ─────────────────────────────────────────────────────
async function updateProduct(id: number, data: any): Promise<boolean> {
  try {
    await woo.put(`products/${id}`, data);
    return true;
  } catch (err: any) {
    return false;
  }
}

// ── Update product variations ─────────────────────────────────────────────────
async function updateVariations(productId: number, googleCat: string): Promise<void> {
  try {
    const { data: variations } = await woo.get(`products/${productId}/variations`, { per_page: 100 });
    if (!variations?.length) return;

    // Batch update variations
    const updates = variations.map((v: any) => ({
      id: v.id,
      meta_data: [
        { key: 'condition', value: 'new' },
        { key: 'google_product_category', value: googleCat },
      ],
    }));

    // WooCommerce batch endpoint
    await woo.post(`products/${productId}/variations/batch`, { update: updates });
  } catch {
    // Non-fatal — variations update failure won't stop main flow
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Pinterest Feed Fix — Starting...\n');
  const t0 = Date.now();

  const products = await fetchAllProducts();

  let success = 0, failed = 0, skipped = 0;

  console.log('🔄 Updating products...\n');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const googleCat = getGoogleCategory(p.categories || []);

    // Check if already set correctly
    const existingCondition = p.meta_data?.find((m: any) => m.key === 'condition')?.value;
    const existingGCat = p.meta_data?.find((m: any) => m.key === 'google_product_category')?.value;

    if (existingCondition === 'new' && existingGCat === googleCat) {
      skipped++;
      process.stdout.write(`\r   [${i + 1}/${products.length}] ✓ ${success} updated | ${skipped} skipped | ${failed} failed`);
      continue;
    }

    const updateData: any = {
      meta_data: [
        { key: 'condition', value: 'new' },
        { key: 'google_product_category', value: googleCat },
      ],
    };

    const ok = await updateProduct(p.id, updateData);
    if (ok) {
      success++;
      // Also update variations if variable product
      if (p.type === 'variable') {
        await updateVariations(p.id, googleCat);
      }
    } else {
      failed++;
    }

    process.stdout.write(`\r   [${i + 1}/${products.length}] ✓ ${success} updated | ${skipped} skipped | ${failed} failed`);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 150));
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n🎉 Done in ${secs}s`);
  console.log(`   ✅ Updated:  ${success}`);
  console.log(`   ⏭️  Skipped:  ${skipped} (already correct)`);
  console.log(`   ❌ Failed:   ${failed}`);
  console.log('\n📌 Next: Regenerate your Pinterest feed in WooCommerce → Pinterest → Sync');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});

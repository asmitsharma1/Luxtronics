#!/usr/bin/env ts-node

/**
 * Fix Slug Index: Remove unique constraint from slug index
 * Connects directly to MongoDB (bypasses createIndexes) to drop and recreate the index
 * Usage: npm run fix:slug-index
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'Luxtronics';

  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔧 FIX SLUG INDEX: Remove unique constraint');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('📦 Connecting to MongoDB...');
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connected\n');

    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    // List current indexes
    console.log('📋 Current indexes on products collection:');
    const indexesBefore = await productsCollection.indexes();
    indexesBefore.forEach((index) => {
      const unique = index.unique ? ' (UNIQUE)' : '';
      console.log(`   - ${index.name}${unique}`);
    });

    // Drop the unique slug index
    console.log('\n🗑️  Dropping slug_1 index...');
    try {
      await productsCollection.dropIndex('slug_1');
      console.log('✅ Dropped slug_1 index');
    } catch (error: any) {
      if (error.code === 27 || error.message?.includes('index not found')) {
        console.log('ℹ️  Index slug_1 does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Recreate as non-unique
    console.log('📝 Creating new non-unique slug index...');
    await productsCollection.createIndex({ slug: 1 });
    console.log('✅ Created non-unique slug index');

    // Verify
    console.log('\n📋 Updated indexes on products collection:');
    const indexesAfter = await productsCollection.indexes();
    indexesAfter.forEach((index) => {
      const unique = index.unique ? ' (UNIQUE ⚠️)' : ' (non-unique ✅)';
      console.log(`   - ${index.name}${unique}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ SLUG INDEX FIX COMPLETED — now run: npm run sync:full');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ SLUG INDEX FIX FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

main();

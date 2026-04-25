const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_WOOCOMMERCE_URL;
const key = process.env.VITE_WOOCOMMERCE_KEY;
const secret = process.env.VITE_WOOCOMMERCE_SECRET;

const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function test() {
  try {
    const wpJson = await axios.get(`${url}/wp-json`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    console.log('/wp-json status:', wpJson.status);
  } catch (error) {
    console.log('/wp-json error status:', error.response ? error.response.status : error.message);
  }

  try {
    const products = await axios.get(`${url}/wp-json/wc/v3/products?per_page=1`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    console.log('/wp-json/wc/v3/products status:', products.status);
    console.log('X-WP-Total:', products.headers['x-wp-total']);
  } catch (error) {
    console.log('/wp-json/wc/v3/products error status:', error.response ? error.response.status : error.message);
  }
}

test();

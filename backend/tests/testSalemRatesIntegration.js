/**
 * Test Salem Live Reference Rates (RapidAPI) Integration End-to-End
 */

import assert from 'assert';
import axios from 'axios';
import { initDatabase, query } from '../src/config/db.js';
import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import {
  fetchSalemReferenceRates,
  clearSalemRatesCache,
} from '../src/services/rapidApiRateService.js';

const TEST_PORT = 8109;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runSalemRatesIntegrationTests() {
  console.log('\n=============================================================');
  console.log('>>> TESTING SALEM LIVE REFERENCE RATES (RAPIDAPI) FLOW <<<');
  console.log('=============================================================\n');

  let server;
  let passedCount = 0;
  let totalCount = 0;

  async function testStep(name, fn) {
    totalCount++;
    try {
      await fn();
      console.log(`✓ TEST ${totalCount}: ${name} - PASSED`);
      passedCount++;
    } catch (err) {
      console.error(`✗ TEST ${totalCount}: ${name} - FAILED:`, err.message);
      throw err;
    }
  }

  try {
    await initDatabase();
    const app = createApp();
    server = app.listen(TEST_PORT, '127.0.0.1');
    console.log(`✓ Test server running on ${BASE_URL}\n`);

    // 1. Admin Login
    const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: config.adminMobile,
      password: config.adminPassword,
    });
    const adminToken = adminLoginRes.data.access_token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✓ Admin authenticated with JWT\n');

    // TEST 1: RapidAPI Service Unit Test - Purity & Unit Extraction
    await testStep('RapidAPI Extraction: strictly 24K 1g Gold & 1g Silver (Rejects 22K, 8g, 1kg)', async () => {
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'test-rapidapi-key-live-123';

      try {
        axios.get = async (url, opts) => {
          assert(url.includes('city=Salem'), `URL must request city=Salem: got ${url}`);
          assert.strictEqual(opts.headers['x-rapidapi-key'], 'test-rapidapi-key-live-123');
          assert.strictEqual(opts.headers['x-rapidapi-host'], 'gold-silver-rates-india.p.rapidapi.com');

          return {
            status: 200,
            data: {
              success: true,
              data: {
                gold: {
                  '22k': { '1gram': 14190, '8grams': 113520, '10grams': 141900 },
                  '24k': { '1gram': 14900, '8grams': 119200, '10grams': 149000 },
                },
                silver: {
                  '1gram': 255,
                  '1kg': 255000,
                },
              },
            },
          };
        };

        const result = await fetchSalemReferenceRates({ forceRefresh: true });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.city, 'Salem');
        assert.strictEqual(result.gold.purity, '24K');
        assert.strictEqual(result.gold.per_gram, 14900, 'Must extract 24K 1gram, NOT 22K (14190)');
        assert.strictEqual(result.silver.per_gram, 255, 'Must extract 1gram, NOT 1kg (255000)');
        assert.strictEqual(result.source, 'RapidAPI');
        assert.strictEqual(result.cached, false);
      } finally {
        axios.get = originalGet;
      }
    });

    // TEST 2: In-Memory Caching & Cache Bypass
    await testStep('In-Memory Caching: 5-min TTL & forceRefresh bypass', async () => {
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'test-rapidapi-key-live-123';
      let externalCalls = 0;

      try {
        axios.get = async () => {
          externalCalls++;
          return {
            status: 200,
            data: {
              success: true,
              data: {
                gold: { '24k': { '1gram': 14900 } },
                silver: { '1gram': 255 },
              },
            },
          };
        };

        // Call A: First fetch -> network call
        const r1 = await fetchSalemReferenceRates();
        assert.strictEqual(externalCalls, 1);
        assert.strictEqual(r1.cached, false);

        // Call B: Second fetch within TTL -> CACHED, no network call
        const r2 = await fetchSalemReferenceRates();
        assert.strictEqual(externalCalls, 1, 'Should NOT call RapidAPI repeatedly within 5 minutes');
        assert.strictEqual(r2.cached, true);
        assert.strictEqual(r2.gold.per_gram, 14900);

        // Call C: Force refresh -> Cache bypass, network call triggered
        const r3 = await fetchSalemReferenceRates({ forceRefresh: true });
        assert.strictEqual(externalCalls, 2, 'forceRefresh=true must bypass cache');
        assert.strictEqual(r3.cached, false);
      } finally {
        axios.get = originalGet;
      }
    });

    // TEST 3: Validation & Error Handling: Malformed / Missing values / No fake fallbacks
    await testStep('Error Handling: Reject malformed response, missing values, missing key without fake data', async () => {
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'test-key';

      try {
        // Sub-test A: Missing 24K gold
        axios.get = async () => ({
          status: 200,
          data: {
            success: true,
            data: {
              gold: { '22k': { '1gram': 14190 } }, // Missing 24k
              silver: { '1gram': 255 },
            },
          },
        });

        let errA = false;
        try {
          await fetchSalemReferenceRates({ forceRefresh: true });
        } catch (e) {
          errA = true;
          assert(e.message.includes('24K 1-gram Gold rate'));
        }
        assert(errA, 'Should error when 24K gold is missing');

        // Sub-test B: Missing silver 1g
        axios.get = async () => ({
          status: 200,
          data: {
            success: true,
            data: {
              gold: { '24k': { '1gram': 14900 } },
              silver: { '1kg': 255000 }, // Missing 1gram
            },
          },
        });

        let errB = false;
        try {
          await fetchSalemReferenceRates({ forceRefresh: true });
        } catch (e) {
          errB = true;
          assert(e.message.includes('1-gram Silver rate'));
        }
        assert(errB, 'Should error when 1g silver is missing');

        // Sub-test C: Missing API key
        config.rapidApiKey = '';
        clearSalemRatesCache();
        let errC = false;
        try {
          await fetchSalemReferenceRates({ forceRefresh: true });
        } catch (e) {
          errC = true;
          assert(e.message.includes('RAPIDAPI_KEY'));
        }
        assert(errC, 'Should error when RapidAPI key is missing');
      } finally {
        axios.get = originalGet;
      }
    });

    // TEST 4: Backend Route GET /api/admin/rates/reference/salem
    await testStep('Backend Route GET /api/admin/rates/reference/salem (Admin Auth & Response format)', async () => {
      // 4a. Unauthenticated request must return 401
      let unauthCaught = false;
      try {
        await axios.get(`${BASE_URL}/api/admin/rates/reference/salem`);
      } catch (e) {
        unauthCaught = true;
        assert.strictEqual(e.response?.status, 401, 'Unauthenticated request must return 401');
      }
      assert(unauthCaught, 'Expected 401 for unauthenticated request');

      // 4b. Authenticated request with mock live rate
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'test-rapidapi-key-live-123';

      try {
        axios.get = async (url, opts) => {
          if (url.includes('Fetch-Gold-Silver')) {
            return {
              status: 200,
              data: {
                success: true,
                data: {
                  gold: { '24k': { '1gram': 14920 } },
                  silver: { '1gram': 256 },
                },
              },
            };
          }
          return originalGet(url, opts);
        };

        const res = await axios.get(`${BASE_URL}/api/admin/rates/reference/salem`, { headers: adminHeaders });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.city, 'Salem');
        assert.strictEqual(res.data.gold.purity, '24K');
        assert.strictEqual(res.data.gold.per_gram, 14920);
        assert.strictEqual(res.data.silver.per_gram, 256);
        assert.strictEqual(res.data.source, 'RapidAPI');
        assert(res.data.updated_at);
      } finally {
        axios.get = originalGet;
      }
    });

    // TEST 5: Admin Custom Mode Saves to MySQL
    await testStep('Admin sets Custom Rates (Gold ₹16,950, Silver ₹280) and saves to MySQL', async () => {
      const customPayload = {
        gold_rate: 16950,
        silver_rate: 280,
        gold: { enabled: true, rate: 16950 },
        silver: { enabled: true, rate: 280 },
      };

      const saveRes = await axios.post(`${BASE_URL}/api/admin/rates/custom`, customPayload, { headers: adminHeaders });
      assert.strictEqual(saveRes.status, 200);

      // Verify Admin Rates endpoint returns custom rates
      const adminRatesRes = await axios.get(`${BASE_URL}/api/admin/rates`, { headers: adminHeaders });
      assert.strictEqual(adminRatesRes.data.gold.active_rate, 16950);
      assert.strictEqual(adminRatesRes.data.gold.mode, 'custom');
      assert.strictEqual(adminRatesRes.data.silver.active_rate, 280);
      assert.strictEqual(adminRatesRes.data.silver.mode, 'custom');

      // Verify directly in MySQL table
      const dbRows = await query('SELECT * FROM rates');
      const dbGold = dbRows.find(r => r.metal === 'gold');
      const dbSilver = dbRows.find(r => r.metal === 'silver');

      assert.strictEqual(parseFloat(dbGold.active_rate), 16950);
      assert.strictEqual(parseFloat(dbGold.custom_rate), 16950);
      assert.strictEqual(dbGold.mode, 'custom');
      assert.strictEqual(parseFloat(dbSilver.active_rate), 280);
      assert.strictEqual(parseFloat(dbSilver.custom_rate), 280);
      assert.strictEqual(dbSilver.mode, 'custom');
    });

    // TEST 6: Customer App Endpoint GET /api/rates returns Custom Rates (NOT raw RapidAPI)
    await testStep('Customer App GET /api/rates receives ONLY saved Custom Rates (16950 / 280)', async () => {
      const publicRes = await axios.get(`${BASE_URL}/api/rates`);
      assert.strictEqual(publicRes.status, 200);
      assert.strictEqual(publicRes.data.gold_rate, 16950, 'Customer gold_rate must be the custom rate');
      assert.strictEqual(publicRes.data.silver_rate, 280, 'Customer silver_rate must be the custom rate');
      assert.strictEqual(publicRes.data.gold.mode, 'custom');
      assert.strictEqual(publicRes.data.silver.mode, 'custom');
    });

    // TEST 7: Fetching Salem Reference Does NOT Overwrite Custom Rates
    await testStep('Fetching Salem Reference again does NOT overwrite saved Custom Customer Rates', async () => {
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'test-rapidapi-key-live-123';

      try {
        axios.get = async (url, opts) => {
          if (url.includes('Fetch-Gold-Silver')) {
            return {
              status: 200,
              data: {
                success: true,
                data: {
                  gold: { '24k': { '1gram': 14980 } }, // New reference rate
                  silver: { '1gram': 259 },
                },
              },
            };
          }
          return originalGet(url, opts);
        };

        // Admin fetches Salem reference again with force refresh
        const refRes = await axios.get(`${BASE_URL}/api/admin/rates/reference/salem?refresh=true`, { headers: adminHeaders });
        assert.strictEqual(refRes.data.gold.per_gram, 14980);
        assert.strictEqual(refRes.data.silver.per_gram, 259);

        // Customer rates MUST REMAIN 16950 and 280!
        const publicRes = await axios.get(`${BASE_URL}/api/rates`);
        assert.strictEqual(publicRes.data.gold_rate, 16950, 'Customer gold rate must NOT be overwritten');
        assert.strictEqual(publicRes.data.silver_rate, 280, 'Customer silver rate must NOT be overwritten');
        assert.strictEqual(publicRes.data.gold.active_rate, 16950);
        assert.strictEqual(publicRes.data.silver.active_rate, 280);

        // MySQL database active_rate MUST REMAIN Custom
        const dbRows = await query('SELECT * FROM rates');
        const dbGold = dbRows.find(r => r.metal === 'gold');
        const dbSilver = dbRows.find(r => r.metal === 'silver');
        assert.strictEqual(parseFloat(dbGold.active_rate), 16950);
        assert.strictEqual(parseFloat(dbSilver.active_rate), 280);
        assert.strictEqual(dbGold.mode, 'custom');
        assert.strictEqual(dbSilver.mode, 'custom');

        // Reference api_rate in DB tracked the new reference rate
        assert.strictEqual(parseFloat(dbGold.api_rate), 14980);
        assert.strictEqual(parseFloat(dbSilver.api_rate), 259);
      } finally {
        axios.get = originalGet;
      }
    });

    // TEST 8: Security - Secret RapidAPI Key is NOT exposed
    await testStep('Security Check: Secret RapidAPI Key is never leaked in API responses', async () => {
      const originalGet = axios.get;
      clearSalemRatesCache();
      config.rapidApiKey = 'ULTRA_SECRET_KEY_99999';

      try {
        axios.get = async (url, opts) => {
          if (url.includes('Fetch-Gold-Silver')) {
            return {
              status: 200,
              data: {
                success: true,
                data: {
                  gold: { '24k': { '1gram': 14900 } },
                  silver: { '1gram': 255 },
                },
              },
            };
          }
          return originalGet(url, opts);
        };

        const res = await axios.get(`${BASE_URL}/api/admin/rates/reference/salem`, { headers: adminHeaders });
        const jsonStr = JSON.stringify(res.data);
        assert(!jsonStr.includes('ULTRA_SECRET_KEY_99999'), 'Response must NOT contain API key');
        assert(!jsonStr.includes('x-rapidapi-key'), 'Response must NOT contain x-rapidapi-key');
      } finally {
        axios.get = originalGet;
      }
    });

    console.log('\n=============================================================');
    console.log(`>>> ALL ${passedCount}/${totalCount} SALEM INTEGRATION TESTS PASSED! <<<`);
    console.log('=============================================================\n');
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
      console.log('✓ Test server shut down cleanly');
    }
  }
}

runSalemRatesIntegrationTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nTest runner encountered error:', err);
    process.exit(1);
  });

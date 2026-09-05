import axios from 'axios';
import config from '../config/env.js';
import { query } from '../config/db.js';
import { cleanRate } from '../utils/formatters.js';

// In-memory cache for RapidAPI Salem rates (5-minute TTL to respect Basic plan rate limits)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedSalemRates = null;
let lastFetchedAt = 0;
let inFlightRequest = null;

/**
 * Fetch live Salem Gold (24K 1g) and Silver (1g) reference rates from RapidAPI.
 *
 * @param {Object} options
 * @param {boolean} [options.forceRefresh=false] - If true, bypasses the in-memory cache
 * @returns {Promise<Object>} Standardized Salem reference rates object
 */
export async function fetchSalemReferenceRates({ forceRefresh = false } = {}) {
  const now = Date.now();

  // 1. Return cached data if still fresh and not forcing refresh
  if (!forceRefresh && cachedSalemRates && (now - lastFetchedAt < CACHE_TTL_MS)) {
    return {
      ...cachedSalemRates,
      cached: true,
      cache_age_seconds: Math.round((now - lastFetchedAt) / 1000),
    };
  }

  // 2. Reuse in-flight promise to avoid duplicate concurrent external requests
  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    try {
      const apiKey = config.rapidApiKey;
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        const error = new Error('RapidAPI key is not configured in backend environment (RAPIDAPI_KEY).');
        error.status = 503;
        error.code = 'RAPIDAPI_KEY_MISSING';
        throw error;
      }

      const host = config.rapidApiHost || 'gold-silver-rates-india.p.rapidapi.com';
      const url = config.rapidApiUrl || `https://${host}/api/Fetch-Gold-Silver/?city=Salem`;

      const response = await axios.get(url, {
        headers: {
          'x-rapidapi-key': apiKey.trim(),
          'x-rapidapi-host': host.trim(),
        },
        timeout: 8000, // 8-second timeout
      });

      if (!response || response.status !== 200 || !response.data) {
        const error = new Error('Invalid response received from RapidAPI.');
        error.status = 502;
        throw error;
      }

      const resData = response.data;

      // Validate success response structure
      if (resData.success !== true || !resData.data) {
        const error = new Error(resData.message || 'RapidAPI returned unsuccessful response for Salem.');
        error.status = 502;
        throw error;
      }

      const data = resData.data;

      // 3. Extract STRICTLY 24K 1gram for Gold
      // Reject 22K, 8grams, 10grams
      const rawGold24k1g = data.gold?.['24k']?.['1gram'];
      const goldRateNum = parseFloat(rawGold24k1g);
      if (isNaN(goldRateNum) || goldRateNum <= 0) {
        const error = new Error('Malformed response from RapidAPI: missing or invalid 24K 1-gram Gold rate.');
        error.status = 502;
        throw error;
      }

      // 4. Extract STRICTLY 1gram for Silver
      // Reject 1kg or historical dates
      const rawSilver1g = data.silver?.['1gram'];
      const silverRateNum = parseFloat(rawSilver1g);
      if (isNaN(silverRateNum) || silverRateNum <= 0) {
        const error = new Error('Malformed response from RapidAPI: missing or invalid 1-gram Silver rate.');
        error.status = 502;
        throw error;
      }

      const cleanedGoldRate = cleanRate(goldRateNum);
      const cleanedSilverRate = cleanRate(silverRateNum);
      const fetchedIso = new Date().toISOString();

      const result = {
        success: true,
        city: 'Salem',
        gold: {
          purity: '24K',
          per_gram: cleanedGoldRate,
        },
        silver: {
          per_gram: cleanedSilverRate,
        },
        source: 'RapidAPI',
        updated_at: fetchedIso,
        cached: false,
      };

      // 5. Update in-memory cache
      cachedSalemRates = result;
      lastFetchedAt = Date.now();

      // 6. Update reference api_rate in MySQL rates table if connected
      // NOTE: This updates api_rate ONLY for tracking and does NOT touch active_rate, custom_rate, or mode.
      try {
        await query(
          "UPDATE rates SET api_rate = ?, updated_at = NOW() WHERE metal = 'gold'",
          [cleanedGoldRate]
        );
        await query(
          "UPDATE rates SET api_rate = ?, updated_at = NOW() WHERE metal = 'silver'",
          [cleanedSilverRate]
        );
      } catch (dbErr) {
        // Non-fatal: DB reference logging failure should not break Admin reference view
        console.warn('[RapidAPI Service] Could not update reference api_rate in DB:', dbErr.message);
      }

      return result;
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          const error = new Error('Invalid RapidAPI key or unauthorized access. Please verify RAPIDAPI_KEY.');
          error.status = 401;
          throw error;
        } else if (status === 429) {
          const error = new Error('RapidAPI rate limit exceeded. Please try again later.');
          error.status = 429;
          throw error;
        } else {
          const msg = err.response.data?.message || err.message;
          const error = new Error(`RapidAPI error (${status}): ${msg}`);
          error.status = 502;
          throw error;
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        const error = new Error('RapidAPI request timed out. Please try again.');
        error.status = 504;
        throw error;
      } else if (err.status) {
        throw err;
      } else {
        const error = new Error(err.message || 'Unable to fetch Salem Gold/Silver reference rates. Please try again.');
        error.status = 502;
        throw error;
      }
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

/**
 * Get current cached Salem reference rates without triggering external network call.
 * Useful for inspection or initial state.
 */
export function getCachedSalemRates() {
  if (cachedSalemRates && (Date.now() - lastFetchedAt < CACHE_TTL_MS)) {
    return {
      ...cachedSalemRates,
      cached: true,
      cache_age_seconds: Math.round((Date.now() - lastFetchedAt) / 1000),
    };
  }
  return null;
}

/**
 * Clear in-memory cache (primarily for unit testing)
 */
export function clearSalemRatesCache() {
  cachedSalemRates = null;
  lastFetchedAt = 0;
  inFlightRequest = null;
}

export default {
  fetchSalemReferenceRates,
  getCachedSalemRates,
  clearSalemRatesCache,
};

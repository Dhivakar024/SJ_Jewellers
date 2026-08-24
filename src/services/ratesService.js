/**
 * Metal Rates Service
 * Fetches live operational market rates for Gold and Silver from the FastAPI backend.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const ratesService = {
  /**
   * Fetch public live Gold and Silver active operational rates
   */
  getRates: async () => {
    return apiClient.get(ENDPOINTS.RATES.PUBLIC, { requiresAuth: false });
  },

  /**
   * Legacy rates persistence helper (preserved for mock fallback)
   */
  saveRates: async ({ goldRate, silverRate }) => {
    try {
      localStorage.setItem('sj_goldRate', goldRate.toString());
      localStorage.setItem('sj_silverRate', silverRate.toString());
    } catch {
      // ignore
    }
    return { success: true, goldRate, silverRate };
  },
};

export default ratesService;

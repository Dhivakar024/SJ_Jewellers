/**
 * Metal Rates Service
 * Fetches live operational market rates for Gold and Silver from the FastAPI backend.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const ratesService = {
  /**
   * Fetch public live Gold and Silver active operational rates from FastAPI backend
   */
  getRates: async () => {
    return apiClient.get(ENDPOINTS.RATES.PUBLIC, { requiresAuth: false });
  },

  /**
   * Update metal custom rates as Admin
   */
  updateCustomRate: async (metal, rateData) => {
    return apiClient.put(`${ENDPOINTS.ADMIN.RATES_CUSTOM}/${metal}`, rateData);
  },

  /**
   * Manually trigger backend sync with external rate provider
   */
  refreshApiRates: async () => {
    return apiClient.post(ENDPOINTS.ADMIN.RATES_REFRESH);
  },
};

export default ratesService;

/**
 * Holdings Service
 * Fetches authenticated customer's Gold & Silver asset balances, average buy rates, and live market valuation.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const holdingsService = {
  /**
   * Fetch complete portfolio holdings across Gold and Silver with live valuation
   */
  getHoldings: async () => {
    return apiClient.get(ENDPOINTS.HOLDINGS.ME);
  },

  /**
   * Fetch specific metal holding and valuation ('gold' or 'silver')
   */
  getMetalHolding: async (metal) => {
    const cleanMetal = metal?.trim().toLowerCase();
    return apiClient.get(ENDPOINTS.HOLDINGS.METAL(cleanMetal));
  },
};

export default holdingsService;

/**
 * Purchase Service
 * Creates Gold & Silver buy transactions on the backend.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const purchaseService = {
  /**
   * Submit purchase order for metal
   * @param {Object} data - { metal: 'gold' | 'silver', quantity_grams: number }
   */
  createPurchase: async (data) => {
    return apiClient.post(ENDPOINTS.PURCHASES.CREATE, data);
  },

  /**
   * Fetch customer purchase history
   */
  getPurchases: async (params = {}) => {
    return apiClient.get(ENDPOINTS.PURCHASES.LIST, { params });
  },

  /**
   * Fetch single purchase by ID
   */
  getPurchaseById: async (id) => {
    return apiClient.get(ENDPOINTS.PURCHASES.DETAIL(id));
  },
};

export default purchaseService;

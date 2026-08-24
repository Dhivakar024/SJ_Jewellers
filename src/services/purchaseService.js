/**
 * Purchase Service
 * Handles customer Gold and Silver purchase order placement and transaction history lookup.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const purchaseService = {
  /**
   * Submit purchase order for Gold or Silver (quantity in grams)
   */
  createPurchase: async ({ metal, quantityGrams }) => {
    const payload = {
      metal: metal?.trim().toLowerCase(),
      quantity_grams: Number(quantityGrams),
    };
    return apiClient.post(ENDPOINTS.PURCHASES.CREATE, payload);
  },

  /**
   * Fetch paginated purchase history for the authenticated customer
   */
  getPurchases: async ({ metal, status, page = 1, limit = 20 } = {}) => {
    return apiClient.get(ENDPOINTS.PURCHASES.LIST, {
      params: { metal, status, page, limit },
    });
  },

  /**
   * Fetch single purchase transaction details by ID
   */
  getPurchaseById: async (purchaseId) => {
    return apiClient.get(ENDPOINTS.PURCHASES.DETAIL(purchaseId));
  },
};

export default purchaseService;

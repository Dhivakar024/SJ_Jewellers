/**
 * Purchase Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const purchaseService = {
  createPurchase: async (purchaseData) => {
    return await api.post(ENDPOINTS.CREATE_PURCHASE, purchaseData);
  },

  getTransactions: async (params = {}) => {
    return await api.get(ENDPOINTS.GET_TRANSACTIONS, { params });
  },
};

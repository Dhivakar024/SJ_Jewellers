/**
 * Withdrawal Service
 * Handles customer metal withdrawal requests, withdrawal history, and request cancellations.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const withdrawalService = {
  /**
   * Submit a new withdrawal request for Gold or Silver
   */
  createWithdrawal: async ({ metal, quantityGrams, withdrawalMode = 'physical' }) => {
    const payload = {
      metal: metal?.trim().toLowerCase(),
      quantity_grams: Number(quantityGrams),
      withdrawal_mode: withdrawalMode?.trim().toLowerCase() || 'physical',
    };
    return apiClient.post(ENDPOINTS.WITHDRAWALS.CREATE, payload);
  },

  /**
   * Fetch paginated withdrawal history for the authenticated customer
   */
  getWithdrawals: async ({ metal, status, page = 1, limit = 20 } = {}) => {
    return apiClient.get(ENDPOINTS.WITHDRAWALS.LIST, {
      params: { metal, status, page, limit },
    });
  },

  /**
   * Fetch single withdrawal details by ID or transaction ID
   */
  getWithdrawalById: async (withdrawalId) => {
    return apiClient.get(ENDPOINTS.WITHDRAWALS.DETAIL(withdrawalId));
  },

  /**
   * Cancel an existing pending withdrawal request and release the reserved weight
   */
  cancelWithdrawal: async (withdrawalId) => {
    return apiClient.patch(ENDPOINTS.WITHDRAWALS.CANCEL(withdrawalId));
  },
};

export default withdrawalService;

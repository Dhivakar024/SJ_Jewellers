/**
 * Withdrawal Service
 * Handles metal withdrawal requests, history, and cancellations.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const withdrawalService = {
  /**
   * Submit withdrawal request for metal
   * @param {Object} data - { metal: 'gold' | 'silver', quantity_grams: number, withdrawal_mode?: 'physical' | 'bank' }
   */
  requestWithdrawal: async (data) => {
    return apiClient.post(ENDPOINTS.WITHDRAWALS.CREATE, data);
  },

  /**
   * Fetch customer withdrawal requests
   */
  getWithdrawals: async (params = {}) => {
    return apiClient.get(ENDPOINTS.WITHDRAWALS.LIST, { params });
  },

  /**
   * Fetch single withdrawal by ID
   */
  getWithdrawalById: async (id) => {
    return apiClient.get(ENDPOINTS.WITHDRAWALS.DETAIL(id));
  },

  /**
   * Cancel pending withdrawal request
   */
  cancelWithdrawal: async (id) => {
    return apiClient.patch(ENDPOINTS.WITHDRAWALS.CANCEL(id));
  },
};

export default withdrawalService;

/**
 * Withdrawal Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const withdrawalService = {
  requestWithdrawal: async (data) => {
    return await api.post(ENDPOINTS.REQUEST_WITHDRAWAL, data);
  },

  getWithdrawals: async () => {
    return await api.get(ENDPOINTS.GET_WITHDRAWALS);
  },
};

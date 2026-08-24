/**
 * Unified Transaction History Service
 * Retrieves customer combined purchases and withdrawals timeline from the FastAPI backend.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const transactionService = {
  /**
   * Fetch paginated unified transaction history (purchases and withdrawals, newest first)
   */
  getTransactions: async ({
    type,
    metal,
    direction,
    status,
    from_date,
    to_date,
    search,
    page = 1,
    limit = 20,
  } = {}) => {
    return apiClient.get(ENDPOINTS.TRANSACTIONS.LIST, {
      params: {
        type,
        metal,
        direction,
        status,
        from_date,
        to_date,
        search,
        page,
        limit,
      },
    });
  },

  /**
   * Fetch paginated unified transaction history (alias)
   */
  getMyTransactions: async (params = {}) => {
    return apiClient.get(ENDPOINTS.TRANSACTIONS.LIST, { params });
  },

  /**
   * Fetch single normalized transaction detail by transaction ID
   */
  getTransactionById: async (transactionId) => {
    return apiClient.get(ENDPOINTS.TRANSACTIONS.DETAIL(transactionId));
  },
};

export default transactionService;

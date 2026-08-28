/**
 * Holdings Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const holdingsService = {
  getHoldings: async () => {
    return await api.get(ENDPOINTS.GET_HOLDINGS);
  },
};

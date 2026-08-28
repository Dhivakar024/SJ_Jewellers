/**
 * Rates Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const ratesService = {
  getLiveRates: async () => {
    return await api.get(ENDPOINTS.GET_RATES, { requiresAuth: false });
  },
};

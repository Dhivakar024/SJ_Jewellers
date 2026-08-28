/**
 * KYC Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const kycService = {
  submitKyc: async (kycData) => {
    return await api.post(ENDPOINTS.SUBMIT_KYC, kycData);
  },
};

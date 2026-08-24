/**
 * KYC Verification Service
 * Handles customer KYC document submission and status queries.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const kycService = {
  /**
   * Fetch authenticated customer's current KYC document & review status
   */
  getKycStatus: async () => {
    return apiClient.get(ENDPOINTS.KYC.ME);
  },

  /**
   * Submit or resubmit customer KYC identification and residential address details
   */
  submitKyc: async ({ fullName, dateOfBirth, gender, address, idType, idNumber }) => {
    const payload = {
      full_name: fullName?.trim(),
      date_of_birth: dateOfBirth?.trim(),
      gender: gender?.trim().toLowerCase(),
      address: {
        address_line: address?.address_line?.trim() || address?.line1?.trim() || address?.address?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        pincode: address?.pincode?.trim() || address?.postal_code?.trim() || '',
      },
      id_type: idType?.trim().toLowerCase(),
      id_number: idNumber?.trim(),
    };

    return apiClient.post(ENDPOINTS.KYC.SUBMIT, payload);
  },
};

export default kycService;

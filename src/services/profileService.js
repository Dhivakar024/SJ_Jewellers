/**
 * Profile Service
 * Manages customer personal profile, contact information, nominee, and address details.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const profileService = {
  /**
   * Fetch authenticated customer's full profile
   */
  getProfile: async () => {
    return apiClient.get(ENDPOINTS.PROFILE.ME);
  },

  /**
   * Create or initialize customer's profile
   */
  createProfile: async (profileData) => {
    return apiClient.patch(ENDPOINTS.PROFILE.ME, profileData);
  },

  /**
   * Update customer's personal profile, nominee, or address details
   */
  updateProfile: async (profileData) => {
    return apiClient.patch(ENDPOINTS.PROFILE.ME, profileData);
  },
};

export default profileService;

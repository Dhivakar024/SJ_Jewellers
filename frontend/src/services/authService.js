/**
 * Authentication Service
 */

import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const authService = {
  login: async (credentials) => {
    return await api.post(ENDPOINTS.LOGIN, credentials, { requiresAuth: false });
  },

  register: async (userData) => {
    return await api.post(ENDPOINTS.REGISTER, userData, { requiresAuth: false });
  },

  sendOtp: async (mobile) => {
    return await api.post(ENDPOINTS.SEND_OTP, { mobile }, { requiresAuth: false });
  },

  verifyOtp: async (mobile, otp) => {
    return await api.post(ENDPOINTS.VERIFY_OTP, { mobile, otp }, { requiresAuth: false });
  },

  forgotPassword: async (mobile) => {
    return await api.post(ENDPOINTS.FORGOT_PASSWORD, { mobile }, { requiresAuth: false });
  },

  resetPassword: async (data) => {
    return await api.post(ENDPOINTS.RESET_PASSWORD, data, { requiresAuth: false });
  },

  getMe: async () => {
    return await api.get(ENDPOINTS.GET_ME);
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {
      // Best effort
    }
  },
};

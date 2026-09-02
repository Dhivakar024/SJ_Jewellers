/**
 * Centralized API Endpoints for SJ Jewellers Backend
 */

export const ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Authentication
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },

  // Profile
  PROFILE: {
    ME: '/api/profile/me',
  },

  // KYC
  KYC: {
    ME: '/api/kyc/me',
    SUBMIT: '/api/kyc/submit',
  },

  // Rates
  RATES: {
    LIVE: '/api/rates',
  },

  // Holdings
  HOLDINGS: {
    ME: '/api/holdings/me',
    BY_METAL: (metal) => `/api/holdings/me/${metal}`,
  },

  // Purchases
  PURCHASES: {
    CREATE: '/api/purchases',
    LIST: '/api/purchases',
    DETAIL: (id) => `/api/purchases/${id}`,
  },

  // Withdrawals
  WITHDRAWALS: {
    CREATE: '/api/withdrawals',
    LIST: '/api/withdrawals',
    DETAIL: (id) => `/api/withdrawals/${id}`,
    CANCEL: (id) => `/api/withdrawals/${id}/cancel`,
  },

  // Transactions (Unified)
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAIL: (id) => `/api/transactions/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    DETAIL: (id) => `/api/notifications/${id}`,
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
  },
};

export default ENDPOINTS;

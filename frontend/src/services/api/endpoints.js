/**
 * Centralized API Endpoints
 */

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GET_ME: '/auth/me',

  // Profile
  GET_PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
  SUBMIT_KYC: '/profile/kyc',

  // Rates & Holdings
  GET_RATES: '/rates/live',
  GET_HOLDINGS: '/holdings',

  // Purchases & Transactions
  CREATE_PURCHASE: '/purchases/create',
  GET_TRANSACTIONS: '/transactions',

  // Withdrawals
  REQUEST_WITHDRAWAL: '/withdrawals/request',
  GET_WITHDRAWALS: '/withdrawals',
};

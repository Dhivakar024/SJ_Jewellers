/**
 * API Endpoints Definition
 * Exact matching routes for the FastAPI backend services.
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },

  // Customer Profile
  PROFILE: {
    ME: '/api/profile/me',
  },

  // KYC Verification
  KYC: {
    SUBMIT: '/api/kyc/submit',
    ME: '/api/kyc/me',
  },

  // Live Metal Rates
  RATES: {
    PUBLIC: '/api/rates',
  },

  // Purchases
  PURCHASES: {
    CREATE: '/api/purchases',
    LIST: '/api/purchases',
    DETAIL: (purchaseId) => `/api/purchases/${purchaseId}`,
  },

  // Holdings & Balances
  HOLDINGS: {
    ME: '/api/holdings/me',
    METAL: (metal) => `/api/holdings/me/${metal}`,
  },

  // Withdrawals
  WITHDRAWALS: {
    CREATE: '/api/withdrawals',
    LIST: '/api/withdrawals',
    DETAIL: (withdrawalId) => `/api/withdrawals/${withdrawalId}`,
    CANCEL: (withdrawalId) => `/api/withdrawals/${withdrawalId}/cancel`,
  },

  // Unified Transaction History
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAIL: (transactionId) => `/api/transactions/${transactionId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    DETAIL: (notificationId) => `/api/notifications/${notificationId}`,
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
  },

  // Admin Portal Endpoints
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    SALES_BY_METAL: '/api/admin/dashboard/sales-by-metal',
    SALES_BY_METAL_TXNS: '/api/admin/dashboard/sales-by-metal/transactions',
    SALES_CHART: '/api/admin/dashboard/sales-chart',
    PENDING_KYC: '/api/admin/dashboard/pending-kyc',
    WITHDRAWALS_SUMMARY: '/api/admin/dashboard/withdrawals-summary',
    RECENT_TRANSACTIONS: '/api/admin/dashboard/recent-transactions',
    RECENT_MEMBERS: '/api/admin/dashboard/recent-members',
    CUSTOMER_GROWTH: '/api/admin/dashboard/customer-growth',
    TRANSACTION_STATS: '/api/admin/dashboard/transaction-stats',
    CURRENT_RATES: '/api/admin/dashboard/current-rates',
    NOTIFICATION_SUMMARY: '/api/admin/dashboard/notification-summary',
    USERS: '/api/admin/users',
    USER_DETAIL: (userId) => `/api/admin/users/${userId}`,
    KYC_PENDING: '/api/admin/kyc/pending',
    KYC_DETAIL: (kycId) => `/api/admin/kyc/${kycId}`,
    KYC_APPROVE: (kycId) => `/api/admin/kyc/${kycId}/approve`,
    KYC_REJECT: (kycId) => `/api/admin/kyc/${kycId}/reject`,
    RATES: '/api/admin/rates',
    RATES_CUSTOM: '/api/admin/rates/custom',
    RATES_REFRESH: '/api/admin/rates/refresh',
    RATES_HISTORY: '/api/admin/rates/history',
    PURCHASES: '/api/admin/purchases',
    WITHDRAWALS: '/api/admin/withdrawals',
    WITHDRAWAL_APPROVE: (withdrawalId) => `/api/admin/withdrawals/${withdrawalId}/approve`,
    WITHDRAWAL_REJECT: (withdrawalId) => `/api/admin/withdrawals/${withdrawalId}/reject`,
    TRANSACTIONS: '/api/admin/transactions',
    NOTIFICATIONS: '/api/admin/notifications',
  },
};

/**
 * Frontend-Only API Client Placeholder
 * Configured with zero external network connectivity for standalone frontend delivery.
 */

export const apiClient = {
  get: async () => ({ success: true, data: null }),
  post: async () => ({ success: true, data: null }),
  put: async () => ({ success: true, data: null }),
  patch: async () => ({ success: true, data: null }),
  delete: async () => ({ success: true, data: null }),
};

export default apiClient;

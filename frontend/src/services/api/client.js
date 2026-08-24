/**
 * Centralized API Client
 * Manages HTTP communication with the FastAPI backend, authentication token injection,
 * request timeouts, and error normalization.
 */

import { getAuthToken, clearAllAuth } from '../../utils/authStorage';

// Read API Base URL from Vite environment variable
const getRawBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getRawBaseUrl();

// Validate Base URL in development
if (import.meta.env?.DEV && !import.meta.env?.VITE_API_BASE_URL) {
  console.info(`[API Client] VITE_API_BASE_URL not set in .env. Defaulting to: ${API_BASE_URL}`);
}

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Normalizes backend error responses into a consistent frontend error object.
 */
export const normalizeApiError = (error, status = 0) => {
  if (error && typeof error === 'object' && error.isNormalized) {
    return error;
  }

  let message = 'An unexpected error occurred. Please try again.';
  let details = null;

  if (error && typeof error === 'object') {
    if (typeof error.detail === 'string') {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      // Pydantic 422 validation errors array
      message = error.detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
      details = error.detail;
    } else if (typeof error.message === 'string') {
      message = error.message;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return {
    success: false,
    status: status || (error?.status ?? 0),
    message,
    details,
    isNormalized: true,
  };
};

/**
 * Core fetch wrapper with timeout, token injection, and response parsing.
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    requiresAuth = true,
    timeout = DEFAULT_TIMEOUT_MS,
    ...restOptions
  } = options;

  // Build full URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Build headers
  const requestHeaders = { ...headers };

  if (!(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Inject Bearer token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      ...restOptions,
    };

    if (body !== undefined) {
      fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    response = await fetch(url, fetchOptions);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw normalizeApiError({ message: 'Request timeout. Please check your network connection.' }, 408);
    }
    throw normalizeApiError({ message: 'Unable to connect to the server. Please ensure the backend is running.' }, 0);
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 Unauthorized globally
  if (response.status === 401 && requiresAuth) {
    clearAllAuth();
    // Do not trigger full page reload if already on login/auth page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.hash.includes('login')) {
      console.warn('[API Client] Unauthorized session expired. Cleared authentication state.');
    }
  }

  // Parse response body
  let responseData;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    throw normalizeApiError(responseData || { message: response.statusText }, response.status);
  }

  return {
    success: true,
    status: response.status,
    data: responseData,
  };
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;

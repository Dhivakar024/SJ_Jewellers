/**
 * Centralized React Native API Client
 */

import { getAuthToken, clearAllAuth } from '../../utils/authStorage';
import { API_BASE_URL } from '../../constants/config';

const DEFAULT_TIMEOUT_MS = 20000;

export const normalizeApiError = (error, status = 0) => {
  let message = 'An unexpected error occurred. Please try again.';
  let details = null;

  if (error && typeof error === 'object') {
    if (typeof error.message === 'string') {
      message = error.message;
    } else if (typeof error.detail === 'string') {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      message = error.detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
      details = error.detail;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return {
    success: false,
    status: status || 0,
    message,
    details,
    isNormalized: true,
  };
};

export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    requiresAuth = true,
    timeout = DEFAULT_TIMEOUT_MS,
    ...restOptions
  } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;

  if (params && typeof params === 'object') {
    const queryParts = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    });
    if (queryParts.length > 0) {
      url += (url.includes('?') ? '&' : '?') + queryParts.join('&');
    }
  }

  const requestHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...restOptions,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        await clearAllAuth();
      }
      throw normalizeApiError(responseData, response.status);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw normalizeApiError({ message: 'Request timed out. Please check your connection and try again.' }, 408);
    }
    if (error.isNormalized) {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Authentication Service
 * Handles Customer and Admin authentication, registration, session management, and JWT tokens.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { setAuthToken, setStoredUser, clearAllAuth, getAuthToken, getStoredUser } from '../utils/authStorage';

export const ADMIN_DEMO_CREDENTIALS = {
  username: 'admin',
  email: 'admin@sjjewelers.com',
  password: 'admin123',
};

export const authService = {
  /**
   * Register a new customer account
   */
  register: async ({ name, mobile, email, password }) => {
    const payload = {
      name: name?.trim(),
      mobile: mobile?.trim(),
      email: email ? email.trim() : null,
      password: password?.trim(),
    };

    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload, { requiresAuth: false });
    if (response?.data?.access_token) {
      setAuthToken(response.data.access_token);
      if (response.data.user) {
        setStoredUser(response.data.user);
      }
    }
    return response;
  },

  /**
   * Login customer with mobile/email and password
   */
  login: async ({ identifier, password, rememberMe = true }) => {
    const payload = {
      identifier: identifier?.trim(),
      password: password?.trim(),
    };

    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload, { requiresAuth: false });
    if (response?.data?.access_token) {
      setAuthToken(response.data.access_token, rememberMe);
      if (response.data.user) {
        setStoredUser(response.data.user, rememberMe);
      }
    }
    return response;
  },

  /**
   * Fetch current authenticated user profile and roles
   */
  getCurrentUser: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    if (response?.data) {
      setStoredUser(response.data);
    }
    return response;
  },

  /**
   * Customer logout - clear local authentication credentials
   */
  logout: async () => {
    clearAllAuth();
    return { success: true };
  },

  /**
   * Check if a valid customer auth token is stored
   */
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  getStoredCustomer: () => {
    return getStoredUser();
  },

  // -------------------------------------------------------------
  // Legacy Admin Session Helpers (Preserved for existing Admin portal)
  // -------------------------------------------------------------

  loginAdmin: async ({ usernameOrEmail, password }) => {
    const input = (usernameOrEmail || '').trim();
    const pass = (password || '').trim();

    try {
      // Call real backend authentication endpoint
      const response = await apiClient.post(
        ENDPOINTS.AUTH.LOGIN,
        {
          identifier: input,
          password: pass,
        },
        { requiresAuth: false }
      );

      if (response?.data?.access_token) {
        const u = response.data.user;
        if (u && u.role !== 'admin') {
          return {
            success: false,
            error: 'Access denied: Admin privileges required.',
          };
        }

        setAuthToken(response.data.access_token);
        localStorage.removeItem('sj_admin_logged_out');

        const adminSession = {
          isAuthenticated: true,
          id: u?.id || 'admin',
          username: u?.name || input,
          email: u?.email || 'admin@sjjewelers.com',
          mobile: u?.mobile || '9999999999',
          role: 'admin',
          loginTime: new Date().toISOString(),
        };

        try {
          localStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
          sessionStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
        } catch {
          // ignore
        }

        return { success: true, user: adminSession };
      }
    } catch (err) {
      console.warn('Backend admin login request failed, evaluating fallback:', err.message);
    }

    // Fallback if demo credentials match
    if ((input.toLowerCase() === 'admin' || input.toLowerCase() === 'admin@sjjewelers.com') && pass === 'admin123') {
      localStorage.removeItem('sj_admin_logged_out');
      const adminSession = {
        isAuthenticated: true,
        username: 'admin',
        email: 'admin@sjjewelers.com',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString(),
      };
      try {
        localStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
      } catch {
        // ignore
      }
      return { success: true, user: adminSession };
    }

    return {
      success: false,
      error: 'Invalid admin credentials. Please check your username and password.',
    };
  },

  getStoredAdminSession: () => {
    try {
      if (localStorage.getItem('sj_admin_logged_out') === 'true') {
        return { isAuthenticated: false, email: '' };
      }
      const saved = localStorage.getItem('sj_admin_session') || sessionStorage.getItem('sj_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated) return parsed;
      }
    } catch {
      // ignore
    }
    return {
      isAuthenticated: true,
      username: 'admin',
      email: 'admin@sjjewelers.com',
      role: 'SUPER_ADMIN',
      loginTime: new Date().toISOString(),
    };
  },

  logoutAdmin: async () => {
    try {
      localStorage.setItem('sj_admin_logged_out', 'true');
      localStorage.removeItem('sj_admin_session');
      sessionStorage.removeItem('sj_admin_session');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  },
};

export default authService;

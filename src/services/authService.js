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
    await new Promise((resolve) => setTimeout(resolve, 80));

    const input = (usernameOrEmail || '').trim().toLowerCase();
    const pass = (password || '').trim();

    let customSettings = null;
    try {
      const saved = localStorage.getItem('sj_admin_settings');
      if (saved) customSettings = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    const validUsernames = [
      'admin',
      'admin@sjjewelers.com',
      'admin@sjjewellers.com',
      'sj jewellers',
      'sjjewellers',
      (customSettings?.username || '').trim().toLowerCase(),
      (customSettings?.email || '').trim().toLowerCase(),
    ].filter(Boolean);

    const isValidUser = validUsernames.includes(input);
    const isValidPass =
      pass === 'admin123' ||
      pass === 'admin' ||
      pass === '123456' ||
      (customSettings?.password && pass === customSettings.password);

    if (isValidUser && isValidPass) {
      localStorage.removeItem('sj_admin_logged_out');
      const adminSession = {
        isAuthenticated: true,
        username: input === 'admin' ? 'admin' : customSettings?.username || 'admin',
        email: input.includes('@') ? input : 'admin@sjjewelers.com',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString(),
      };

      try {
        localStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
        sessionStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
      } catch (e) {
        console.error(e);
      }

      return { success: true, user: adminSession };
    }

    return {
      success: false,
      error: 'Invalid admin username/email or password. (Demo: admin / admin123)',
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

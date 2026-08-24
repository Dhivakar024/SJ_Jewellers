/**
 * Centralized Authentication & Token Storage Utility
 * Manages JWT tokens and customer authentication state safely.
 */

const TOKEN_KEY = 'sj_auth_token';
const USER_KEY = 'sj_auth_user';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    console.error('Error accessing token storage:', e);
    return null;
  }
};

export const setAuthToken = (token, rememberMe = true) => {
  try {
    if (!token) return;
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.error('Error saving auth token:', e);
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Error clearing auth token:', e);
  }
};

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error reading stored user:', e);
    return null;
  }
};

export const setStoredUser = (user, rememberMe = true) => {
  try {
    if (!user) return;
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(USER_KEY, userStr);
    } else {
      sessionStorage.setItem(USER_KEY, userStr);
    }
  } catch (e) {
    console.error('Error saving stored user:', e);
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Error clearing stored user:', e);
  }
};

export const clearAllAuth = () => {
  clearAuthToken();
  clearStoredUser();
};

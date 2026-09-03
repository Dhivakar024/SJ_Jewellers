/**
 * Centralized Authentication & Token Storage Utility
 * Manages JWT tokens and admin authentication state safely.
 */

const TOKEN_KEYS = ['sj_auth_token', 'sj_admin_token', 'token', 'access_token'];
const USER_KEYS = ['sj_auth_user', 'sj_admin_user', 'user', 'admin_user', 'sj_admin_session'];

export const getAuthToken = () => {
  try {
    for (const key of TOKEN_KEYS) {
      const val = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (val && typeof val === 'string' && val.trim() && val !== 'null' && val !== 'undefined') {
        return val.trim();
      }
    }
    // Check if stored inside a JSON object like sj_admin_session
    const sessionStr = localStorage.getItem('sj_admin_session') || sessionStorage.getItem('sj_admin_session');
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed?.token || parsed?.access_token) {
          return (parsed.token || parsed.access_token).trim();
        }
      } catch {}
    }
    return null;
  } catch (e) {
    console.error('Error accessing token storage:', e);
    return null;
  }
};

export const setAuthToken = (token, rememberMe = true) => {
  try {
    if (!token) return;
    const cleanToken = token.toString().trim();
    TOKEN_KEYS.forEach((k) => {
      if (rememberMe) {
        localStorage.setItem(k, cleanToken);
      } else {
        sessionStorage.setItem(k, cleanToken);
      }
    });
    localStorage.removeItem('sj_admin_logged_out');
  } catch (e) {
    console.error('Error saving auth token:', e);
  }
};

export const clearAuthToken = () => {
  try {
    TOKEN_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {
    console.error('Error clearing auth token:', e);
  }
};

export const getStoredUser = () => {
  try {
    for (const key of USER_KEYS) {
      const userStr = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (userStr && typeof userStr === 'string' && userStr !== 'null' && userStr !== 'undefined') {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed && typeof parsed === 'object') {
            if (parsed.user && typeof parsed.user === 'object') return parsed.user;
            return parsed;
          }
        } catch {}
      }
    }
    return null;
  } catch (e) {
    console.error('Error reading stored user:', e);
    return null;
  }
};

export const setStoredUser = (user, rememberMe = true) => {
  try {
    if (!user) return;
    const userStr = JSON.stringify(user);
    USER_KEYS.forEach((k) => {
      if (rememberMe) {
        localStorage.setItem(k, userStr);
      } else {
        sessionStorage.setItem(k, userStr);
      }
    });
    localStorage.removeItem('sj_admin_logged_out');
  } catch (e) {
    console.error('Error saving stored user:', e);
  }
};

export const clearStoredUser = () => {
  try {
    USER_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {
    console.error('Error clearing stored user:', e);
  }
};

export const clearAllAuth = () => {
  clearAuthToken();
  clearStoredUser();
  try {
    localStorage.removeItem('sj_admin_logged_out');
  } catch {}
};

export default {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  clearAllAuth,
};

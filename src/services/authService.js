// Mock Authentication Service (Prepared for FastAPI / MongoDB backend)

export const ADMIN_DEMO_CREDENTIALS = {
  username: 'admin',
  email: 'admin@sjjewelers.com',
  password: 'admin123'
};

export const authService = {
  // Admin Login
  loginAdmin: async ({ usernameOrEmail, password }) => {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const input = (usernameOrEmail || '').trim().toLowerCase();
    const isValidUser = input === ADMIN_DEMO_CREDENTIALS.username || input === ADMIN_DEMO_CREDENTIALS.email.toLowerCase();
    const isValidPass = password === ADMIN_DEMO_CREDENTIALS.password;

    if (isValidUser && isValidPass) {
      const adminSession = {
        isAuthenticated: true,
        username: 'admin',
        email: ADMIN_DEMO_CREDENTIALS.email,
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem('sj_admin_session', JSON.stringify(adminSession));
      return { success: true, user: adminSession };
    }

    return { success: false, error: 'Invalid admin username/email or password.' };
  },

  // Check persisted admin session
  getStoredAdminSession: () => {
    const saved = sessionStorage.getItem('sj_admin_session');
    if (!saved) return { isAuthenticated: false, email: '' };
    try {
      return JSON.parse(saved);
    } catch {
      return { isAuthenticated: false, email: '' };
    }
  },

  // Admin Logout
  logoutAdmin: async () => {
    sessionStorage.removeItem('sj_admin_session');
    return { success: true };
  }
};

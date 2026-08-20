// Authentication Service for Admin Portal

export const ADMIN_DEMO_CREDENTIALS = {
  username: 'admin',
  email: 'admin@sjjewelers.com',
  password: 'admin123'
};

export const authService = {
  // Admin Login
  loginAdmin: async ({ usernameOrEmail, password }) => {
    // Small delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 80));

    const input = (usernameOrEmail || '').trim().toLowerCase();
    const pass = (password || '').trim();

    // Check custom settings from localStorage if available
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
      (customSettings?.email || '').trim().toLowerCase()
    ].filter(Boolean);

    const isValidUser = validUsernames.includes(input);
    const isValidPass = pass === 'admin123' || 
                        pass === 'admin' || 
                        pass === '123456' || 
                        (customSettings?.password && pass === customSettings.password);

    if (isValidUser && isValidPass) {
      const adminSession = {
        isAuthenticated: true,
        username: input === 'admin' ? 'admin' : (customSettings?.username || 'admin'),
        email: input.includes('@') ? input : 'admin@sjjewelers.com',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString()
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
      error: 'Invalid admin username/email or password. (Demo: admin / admin123)' 
    };
  },

  // Check persisted admin session
  getStoredAdminSession: () => {
    try {
      const saved = localStorage.getItem('sj_admin_session') || sessionStorage.getItem('sj_admin_session');
      if (!saved) return { isAuthenticated: false, email: '' };
      const parsed = JSON.parse(saved);
      if (parsed && parsed.isAuthenticated) return parsed;
    } catch {
      // ignore
    }
    return { isAuthenticated: false, email: '' };
  },

  // Admin Logout
  logoutAdmin: async () => {
    try {
      localStorage.removeItem('sj_admin_session');
      sessionStorage.removeItem('sj_admin_session');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  }
};

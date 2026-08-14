import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SignInScreen({ onNavigate }) {
  const { loginUser } = useApp();
  const [username, setUsername] = useState('Demo User');
  const [mobile, setMobile] = useState('9999999999');

  const handleSignIn = (e) => {
    e.preventDefault();
    const user = loginUser({ username: username.trim(), mobile: mobile.trim() });
    
    if (!user.profileCompleted) {
      onNavigate('create-profile');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="auth-screen">
      {/* Centered Heading */}
      <div className="auth-header">
        <h1>
          Welcome !<br />
          Glad to see you !
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="input-group">
          <input
            type="text"
            className="custom-input"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="tel"
            className="custom-input"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="forgot-link" onClick={() => onNavigate('forgot-username')}>
          Forgot username?
        </div>

        <button type="submit" className="btn-primary">
          Sign in
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="auth-footer-text">
        Don't have an account?{' '}
        <span onClick={() => onNavigate('signup')}>Sign Up</span>
      </div>

      {/* Social Login */}
      <div className="social-login-section">
        <div className="social-title">Or Login with</div>
        <div className="social-icons-row">
          {/* Facebook */}
          <div className="social-icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.38823 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9705 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.3399 7.875 13.875 8.80001 13.875 9.74906V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
            </svg>
          </div>

          {/* Google */}
          <div className="social-icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          {/* Instagram */}
          <div className="social-icon-btn">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
              <path d="M12 7.15A4.85 4.85 0 1016.85 12 4.86 4.86 0 0012 7.15zm0 8A3.15 3.15 0 1115.15 12 3.16 3.16 0 0112 15.15zm5.05-8.32a1.13 1.13 0 11-1.13-1.13 1.13 1.13 0 011.13 1.13z" fill="white"/>
              <defs>
                <radialGradient id="ig-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.4 20.6) scale(26.2 26.2)">
                  <stop stopColor="#FED576"/>
                  <stop offset=".26" stopColor="#F47133"/>
                  <stop offset=".6" stopColor="#BC3081"/>
                  <stop offset="1" stopColor="#4C64D3"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

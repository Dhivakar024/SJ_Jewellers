import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLogin({ onSwitchToUserApp }) {
  const { setAdminAuth } = useApp();
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter both Admin Username/Email and Password.');
      return;
    }

    setIsLoading(true);
    const result = await authService.loginAdmin({ usernameOrEmail, password });
    setIsLoading(false);

    if (result.success) {
      setAdminAuth(result.user);
    } else {
      setErrorMsg(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="app-screen-layout" style={{ backgroundColor: '#f8f6fc' }}>
      {/* 1. Top Header */}
      <header className="top-header-bar" style={{ justifyContent: 'flex-start', gap: '12px' }}>
        <button
          className="back-btn"
          onClick={onSwitchToUserApp}
          aria-label="Back to Customer App"
          style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Admin Portal</h2>
      </header>

      {/* 2. Middle Scrollable Content */}
      <main className="app-scroll-content" style={{ padding: '24px 20px 40px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Brand Card */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            backgroundColor: 'var(--primary-purple)',
            color: '#ffd000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(88, 60, 245, 0.35)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e1b2e', letterSpacing: '-0.3px' }}>
            SJ Jewelers Admin
          </h1>
          <p style={{ fontSize: '13.5px', color: '#736d85', fontWeight: '600', marginTop: '4px' }}>
            Authorized Personnel Mobile Portal
          </p>
        </div>

        {/* Login Form Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          border: '1px solid #e2d9fc',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)'
        }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username / Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#2c2642', marginBottom: '6px' }}>
                Admin Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="profile-custom-input"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={18} color="var(--primary-purple)" style={{ position: 'absolute', left: '13px', top: '13px' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#2c2642', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="profile-custom-input"
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                />
                <Lock size={18} color="var(--primary-purple)" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#736d85',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                marginTop: '10px',
                height: '52px',
                fontSize: '16px',
                fontWeight: '800',
                boxShadow: '0 6px 18px rgba(88, 60, 245, 0.35)'
              }}
            >
              {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>

          {/* Demo Note */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#ede7fc',
            borderRadius: '14px',
            border: '1px dashed var(--primary-purple)',
            textAlign: 'center',
            fontSize: '12px',
            color: '#4a3e68',
            fontWeight: '600'
          }}>
            Demo credentials: <strong style={{ color: 'var(--primary-purple)' }}>admin</strong> / <strong style={{ color: 'var(--primary-purple)' }}>admin123</strong>
          </div>
        </div>

        {/* Back to Customer App */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onSwitchToUserApp}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--primary-purple)',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Customer App</span>
          </button>
        </div>
      </main>
    </div>
  );
}

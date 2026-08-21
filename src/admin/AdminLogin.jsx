import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLogin({ onLoginSuccess }) {
  const { setAdminAuth } = useApp() || {};
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter both Admin Username and Password.');
      return;
    }

    setIsLoading(true);
    const result = await authService.loginAdmin({ usernameOrEmail, password });
    setIsLoading(false);

    if (result.success) {
      if (typeof setAdminAuth === 'function') {
        setAdminAuth(result.user);
      }
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#151c3b',
      backgroundImage: 'radial-gradient(circle at 50% 30%, #1a2347 0%, #131936 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#35415f',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        padding: '36px 32px 36px 32px',
        boxSizing: 'border-box',
        color: '#ffffff'
      }}>
        
        {/* Card Header Title */}
        <div style={{ marginBottom: '14px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.3px',
            textAlign: 'left'
          }}>
            Gold & Silver
          </h1>
        </div>

        {/* Subtitle */}
        <div style={{
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: '500',
          color: '#9aa5be',
          marginBottom: '26px'
        }}>
          Admin login
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fca5a5',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Username Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13.5px',
              fontWeight: '500',
              color: '#d1d9e6',
              marginBottom: '7px'
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                border: '1px solid transparent',
                backgroundColor: '#e9eff8',
                padding: '0 16px',
                fontSize: '15px',
                fontWeight: '500',
                color: '#101828',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13.5px',
              fontWeight: '500',
              color: '#d1d9e6',
              marginBottom: '7px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  border: '1px solid transparent',
                  backgroundColor: '#e9eff8',
                  padding: '0 44px 0 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#101828',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(180deg, #ffa000 0%, #d95a00 100%)',
              color: '#111827',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(217, 90, 0, 0.35)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.filter = 'brightness(1.06)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}

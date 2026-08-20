import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLogin({ onLoginSuccess }) {
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
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0b0f19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#151d2f',
        borderRadius: '16px',
        border: '1px solid #222f46',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        padding: '32px 28px',
        boxSizing: 'border-box',
        color: '#ffffff'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            fontSize: '22px',
            fontWeight: '900',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            $
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
            Gold & Silver Admin
          </h1>
          <p style={{ fontSize: '12.5px', color: '#94a3b8' }}>
            Sign in to manage metal rates, members & withdrawals
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontSize: '12.5px',
            fontWeight: '600'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="admin"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  padding: '0 14px 0 38px',
                  fontSize: '13.5px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  padding: '0 38px 0 38px',
                  fontSize: '13.5px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
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
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-btn-orange"
            style={{
              height: '44px',
              fontSize: '14px',
              fontWeight: '700',
              marginTop: '6px'
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#94a3b8'
        }}>
          Demo: <strong style={{ color: '#f59e0b' }}>admin</strong> / <strong style={{ color: '#f59e0b' }}>admin123</strong>
        </div>

      </div>
    </div>
  );
}

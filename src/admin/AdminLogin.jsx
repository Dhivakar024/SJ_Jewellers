import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLogin({ onLoginSuccess }) {
  const { setAdminAuth } = useApp();
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      alert('Please enter your admin registered email.');
      return;
    }
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowForgotModal(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0f0c1b',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(88, 60, 245, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 208, 0, 0.08) 0%, transparent 40%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#181428',
        borderRadius: '28px',
        border: '1px solid #2d2645',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(88, 60, 245, 0.15)',
        padding: '36px 32px',
        boxSizing: 'border-box',
        color: '#ffffff'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary-purple) 0%, #7b5aff 100%)',
            color: '#ffd000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 10px 25px rgba(88, 60, 245, 0.4)'
          }}>
            <ShieldCheck size={36} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 208, 0, 0.12)', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px' }}>
            <Sparkles size={13} color="#ffd000" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffd000', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Salem Jewels Admin Portal
            </span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.4px', margin: '4px 0' }}>
            Management Portal
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
            Enter your administrative credentials to continue
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
              Admin Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g. admin or admin@sjjewelers.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid #332d4f',
                  backgroundColor: '#0f0d19',
                  padding: '0 16px 0 42px',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <User size={18} color="#8b849c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a78bfa',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid #332d4f',
                  backgroundColor: '#0f0d19',
                  padding: '0 44px 0 42px',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={18} color="#8b849c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
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
                  color: '#8b849c',
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

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: '50px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-purple)',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 8px 20px rgba(88, 60, 245, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div style={{
          marginTop: '24px',
          padding: '12px 16px',
          backgroundColor: 'rgba(88, 60, 245, 0.1)',
          borderRadius: '14px',
          border: '1px dashed rgba(167, 139, 250, 0.4)',
          textAlign: 'center',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          Demo Login: <strong style={{ color: '#a78bfa' }}>admin</strong> &nbsp;|&nbsp; Password: <strong style={{ color: '#a78bfa' }}>admin123</strong>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#181428',
            borderRadius: '24px',
            border: '1px solid #2d2645',
            padding: '28px',
            color: '#ffffff'
          }}>
            {!resetSuccess ? (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Reset Admin Password</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>
                  Enter your registered admin email address to receive password reset instructions.
                </p>

                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="email"
                    placeholder="admin@sjjewelers.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '12px',
                      border: '1px solid #332d4f',
                      backgroundColor: '#0f0d19',
                      padding: '0 14px',
                      fontSize: '14px',
                      color: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      style={{
                        flex: 1,
                        height: '44px',
                        borderRadius: '12px',
                        border: '1px solid #332d4f',
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1.5,
                        height: '44px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: 'var(--primary-purple)',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Send Link
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Reset Link Sent</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Please check your inbox at {resetEmail}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

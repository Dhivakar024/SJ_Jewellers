import React, { useState } from 'react';
import { Phone, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CUSTOMER_SUPPORT_PHONE, getTelephoneLink } from '../config/support';

export default function SignInScreen({ onNavigate }) {
  const { loginUser } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const ident = identifier.trim();
    const pass = password.trim();

    if (!ident) {
      setErrorMessage('Please enter your Mobile Number or Email.');
      return;
    }

    if (!pass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginUser({ identifier: ident, password: pass });
      if (!user.profileCompleted) {
        onNavigate('create-profile');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid mobile number/email or password.');
    } finally {
      setIsLoading(false);
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
        {errorMessage && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center', fontWeight: 500 }}>
            {errorMessage}
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            className="custom-input"
            placeholder="Mobile Number / Email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="custom-input"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="current-password"
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#8b849c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '10px' }}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Customer Support Help Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '16px 18px',
          marginTop: '24px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 4px 14px rgba(88, 60, 245, 0.04)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
          Need help signing in?
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.45' }}>
          If you forgot your password or are unable to access your account, please contact Customer Support for account verification and assistance.
        </p>
        <a
          href={getTelephoneLink(CUSTOMER_SUPPORT_PHONE)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f1ecfe',
            color: 'var(--primary-purple)',
            fontWeight: '800',
            fontSize: '14px',
            padding: '9px 18px',
            borderRadius: '12px',
            textDecoration: 'none',
            border: '1px solid #ded5fb',
            transition: 'all 0.15s ease'
          }}
        >
          <Phone size={15} />
          <span>{CUSTOMER_SUPPORT_PHONE}</span>
        </a>
      </div>

      {/* Sign Up Link */}
      <div className="auth-footer-text" style={{ marginTop: '24px' }}>
        Don't have an account?{' '}
        <span onClick={() => onNavigate('signup')}>Sign Up</span>
      </div>
    </div>
  );
}

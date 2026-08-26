import React, { useState } from 'react';
import { Phone, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CUSTOMER_SUPPORT_PHONE, getTelephoneLink } from '../config/support';
import { cleanIndianMobileDigits, formatToE164, isValidIndianMobile } from '../utils/phoneUtils';

export default function SignInScreen({ onNavigate }) {
  const { loginUser } = useApp();
  const [mobileDigits, setMobileDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (e) => {
    const cleaned = cleanIndianMobileDigits(e.target.value);
    setMobileDigits(cleaned);
    setErrorMessage('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    if (!mobileDigits) {
      setErrorMessage('Mobile number is required');
      return;
    }

    if (mobileDigits.length !== 10 || !isValidIndianMobile(mobileDigits)) {
      setErrorMessage('Enter a valid 10-digit mobile number');
      return;
    }

    const pass = password.trim();
    if (!pass) {
      setErrorMessage('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      const formattedMobile = formatToE164(mobileDigits);
      const user = await loginUser({
        identifier: formattedMobile,
        mobile: formattedMobile,
        password: pass,
      });

      if (!user.profileCompleted) {
        onNavigate('create-profile');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid mobile number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen-signin">
      {/* Centered Heading */}
      <div className="auth-header" style={{ marginTop: '6px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '25px', lineHeight: '1.25' }}>
          Welcome !<br />
          Glad to see you !
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column' }}>
        {errorMessage && (
          <div
            style={{
              color: '#ef4444',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              marginBottom: '12px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Mobile Number with Label Above */}
        <div className="input-group">
          <label className="input-field-label">Mobile Number</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            className="custom-input"
            placeholder="Enter 10-digit Mobile Number"
            value={mobileDigits}
            onChange={handleMobileChange}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {/* Password with Label Above */}
        <div className="input-group">
          <label className="input-field-label">Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="custom-input"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              disabled={isLoading}
              autoComplete="new-password"
              style={{ backgroundColor: '#ffffff', border: '1.5px solid #dcd4fa', paddingRight: '48px' }}
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
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '4px' }}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Customer Support Help Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '12px 14px',
          marginTop: '10px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 4px 14px rgba(88, 60, 245, 0.04)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e1b2e', marginBottom: '3px' }}>
          Need help signing in?
        </div>
        <p style={{ fontSize: '11.5px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.4' }}>
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
            fontSize: '13px',
            padding: '7px 14px',
            borderRadius: '12px',
            textDecoration: 'none',
            border: '1px solid #ded5fb',
            transition: 'all 0.15s ease',
          }}
        >
          <Phone size={14} />
          <span>{CUSTOMER_SUPPORT_PHONE}</span>
        </a>
      </div>

      {/* Sign Up Link */}
      <div className="auth-footer-text" style={{ marginTop: '10px', marginBottom: '2px' }}>
        Don't have an account?{' '}
        <span onClick={() => onNavigate('signup')} style={{ cursor: 'pointer', color: 'var(--primary-purple)', fontWeight: '700' }}>
          Sign Up
        </span>
      </div>
    </div>
  );
}

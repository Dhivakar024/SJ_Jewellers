import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CUSTOMER_SUPPORT_PHONE, getTelephoneLink } from '../config/support';

export default function SignUpScreen({ onNavigate }) {
  const { registerUser } = useApp();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const uName = name.trim();
    const uMobile = mobile.trim();
    const uEmail = email.trim();
    const uPass = password.trim();
    const uConfirmPass = confirmPassword.trim();

    if (!uName) {
      setErrorMessage('Please enter your Name.');
      return;
    }
    if (!uMobile) {
      setErrorMessage('Please enter your Mobile Number.');
      return;
    }

    const digitsOnly = uMobile.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!uPass) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (uPass.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (uPass !== uConfirmPass) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Direct customer account registration via backend
      await registerUser({
        name: uName,
        mobile: uMobile,
        email: uEmail || null,
        password: uPass,
      });

      // 2. Immediately redirect new user to Create Profile (NOT Home)
      onNavigate('create-profile');
    } catch (err) {
      setErrorMessage(err.message || 'Mobile number or email already registered. Please sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Back Button */}
      <button className="back-btn" onClick={() => onNavigate('signin')} aria-label="Back">
        <ArrowLeft size={22} />
      </button>

      {/* Heading */}
      <div className="auth-header-left">
        <h1>
          Welcome ! Create your<br />
          new account now.
        </h1>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column' }}>
        {errorMessage && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center', fontWeight: 500 }}>
            {errorMessage}
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            className="custom-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

        <div className="input-group">
          <input
            type="tel"
            className="custom-input"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="tel"
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            className="custom-input"
            placeholder="Email Address (Optional)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="custom-input"
            placeholder="Password (Min 8 chars)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="new-password"
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

        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="custom-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage('');
            }}
            disabled={isLoading}
            autoComplete="new-password"
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '6px' }} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Footer link */}
      <div className="auth-footer-text" style={{ marginTop: '24px' }}>
        Already have an account?{' '}
        <span onClick={() => onNavigate('signin')}>Sign In</span>
      </div>

      {/* Small Customer Support Option */}
      <div style={{ textAlign: 'center', marginTop: '18px', paddingBottom: '10px' }}>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0' }}>
          Need help? Contact Customer Support
        </p>
        <a
          href={getTelephoneLink(CUSTOMER_SUPPORT_PHONE)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary-purple)',
            fontWeight: '800',
            fontSize: '13px',
            textDecoration: 'none'
          }}
        >
          <Phone size={14} />
          <span>{CUSTOMER_SUPPORT_PHONE}</span>
        </a>
      </div>
    </div>
  );
}

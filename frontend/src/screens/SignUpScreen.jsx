import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Phone, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CUSTOMER_SUPPORT_PHONE, getTelephoneLink } from '../config/support';
import { cleanIndianMobileDigits, formatToE164, isValidIndianMobile, isValidFullName } from '../utils/phoneUtils';
import { authService } from '../services';

export default function SignUpScreen({ onNavigate }) {
  const { registerUser } = useApp();
  
  // Step management: 'mobile' -> 'otp' -> 'details'
  const [step, setStep] = useState('mobile');

  const [name, setName] = useState('');
  const [mobileDigits, setMobileDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (e) => {
    const cleaned = cleanIndianMobileDigits(e.target.value);
    setMobileDigits(cleaned);
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
    setErrorMessage('');
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
    setErrorMessage('');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('otp');
      setErrors({});
      setErrorMessage('');
    } else if (step === 'otp') {
      setStep('mobile');
      setErrors({});
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      onNavigate('signin');
    }
  };

  // 1. STEP 1: Send OTP
  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    const newErrors = {};
    const uName = name.trim();
    if (!uName || !isValidFullName(uName)) {
      newErrors.name = 'Please enter a valid name';
    }

    const cleanMobile = cleanIndianMobileDigits(mobileDigits);
    if (!cleanMobile || cleanMobile.length !== 10 || !isValidIndianMobile(cleanMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const formattedMobile = formatToE164(cleanMobile);
      await authService.sendOtp({ mobile: formattedMobile });
      setSuccessMessage('OTP has been sent to your mobile number.');
      setStep('otp');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP. Please check your mobile number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }

    if (cleanOtp.length < 4) {
      setErrors({ otp: 'Please enter the complete OTP' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const formattedMobile = formatToE164(mobileDigits);
      await authService.verifyOtp({ mobile: formattedMobile, otp: cleanOtp });
      setSuccessMessage('');
      setStep('details');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. STEP 3: Create Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    const newErrors = {};
    const uEmail = email.trim();
    const uPass = password.trim();
    const uConfirmPass = confirmPassword.trim();

    if (uEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uEmail)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!uPass) {
      newErrors.password = 'Please enter a password';
    } else if (uPass.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!uConfirmPass) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (uPass !== uConfirmPass) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const formattedMobile = formatToE164(mobileDigits);
      await registerUser({
        name: name.trim(),
        mobile: formattedMobile,
        email: uEmail || null,
        password: uPass,
      });

      // Redirect new user directly to Create Profile (NOT Home, NOT Edit Profile)
      onNavigate('create-profile');
    } catch (err) {
      setErrorMessage(err.message || 'Mobile number or email already registered. Please sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{ padding: '16px 20px 24px 20px' }}>
      {/* Header with Back Button on top-left and Heading directly to its right */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px', marginTop: '2px' }}>
        <button className="back-btn" onClick={handleBack} aria-label="Back" style={{ flexShrink: 0, marginTop: '2px' }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1.25', margin: 0 }}>
            Welcome ! Create your<br />new account now.
          </h1>
        </div>
      </div>

      {/* Messages */}
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

      {successMessage && (
        <div
          style={{
            color: '#059669',
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '13px',
            marginBottom: '12px',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: Enter Full Name & Mobile Number -> Click Get OTP */}
      {/* ======================================================== */}
      {step === 'mobile' && (
        <form onSubmit={handleGetOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="input-group">
            <label className="input-field-label">Full Name</label>
            <input
              type="text"
              className="custom-input"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                setErrorMessage('');
              }}
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.name && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{errors.name}</div>}
          </div>

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
            {errors.mobile && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{errors.mobile}</div>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '4px' }}
            disabled={isLoading || mobileDigits.length !== 10}
          >
            {isLoading ? 'Sending OTP...' : 'Get OTP'}
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* STEP 2: Enter OTP -> Click Submit */}
      {/* ======================================================== */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '14px',
              border: '1px solid #e0d8fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e1b2e' }}>{name}</div>
              <div style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600' }}>{mobileDigits}</div>
            </div>
            <button
              type="button"
              onClick={() => setStep('mobile')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-purple)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Change
            </button>
          </div>

          <div className="input-group">
            <label className="input-field-label">Enter OTP</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="custom-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              disabled={isLoading}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: '700' }}
            />
            {errors.otp && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px', textAlign: 'center' }}>{errors.otp}</div>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '4px' }}
            disabled={isLoading || otp.length < 4}
          >
            {isLoading ? 'Verifying OTP...' : 'Submit'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={handleGetOtp}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-purple)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
              <span>Resend OTP</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* STEP 3: Enter Email & Password -> Click Create Account */}
      {/* ======================================================== */}
      {step === 'details' && (
        <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="input-group">
            <label className="input-field-label">Email Address</label>
            <input
              type="email"
              className="custom-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                setErrorMessage('');
              }}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{errors.email}</div>}
          </div>

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
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
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
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{errors.password}</div>}
          </div>

          <div className="input-group">
            <label className="input-field-label">Confirm Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="custom-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
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
                  padding: '4px',
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <div className="field-error-text" style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '4px' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

      {/* Footer link */}
      <div className="auth-footer-text" style={{ marginTop: '16px', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('signin');
          }}
          className="auth-link"
          style={{
            background: 'none',
            border: 'none',
            padding: '2px 4px',
            color: 'var(--primary-purple)',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Sign In
        </button>
      </div>

      {/* Small Customer Support Option */}
      <div style={{ textAlign: 'center', marginTop: '14px', paddingBottom: '6px' }}>
        <p style={{ fontSize: '11.5px', color: '#6b7280', margin: '0 0 4px 0' }}>
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
            fontSize: '12.5px',
            textDecoration: 'none',
          }}
        >
          <Phone size={13} />
          <span>{CUSTOMER_SUPPORT_PHONE}</span>
        </a>
      </div>
    </div>
  );
}

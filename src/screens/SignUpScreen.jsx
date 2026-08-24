import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SignUpScreen({ onNavigate }) {
  const { sendSignupOtp, verifySignupOtp } = useApp();
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const uName = username.trim();
    const uMobile = mobile.trim();

    if (!uName) {
      setErrorMessage('Please enter your User Name.');
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

    setIsLoading(true);
    try {
      // 1. Authoritative Backend Check & OTP Dispatch
      const res = await sendSignupOtp({ mobile: uMobile, purpose: 'signup' });
      setStep('otp');
      setResendTimer(30);
      setSuccessMessage(res?.data?.message || 'OTP sent successfully! (Dev OTP: 123456)');
    } catch (err) {
      setErrorMessage(err.message || 'Mobile number already registered. Please sign in instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const uOtp = otp.trim();
    if (!uOtp) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      // 2. Verify OTP & Create Customer Account
      await verifySignupOtp({
        username: username.trim(),
        mobile: mobile.trim(),
        otp: uOtp,
        purpose: 'signup',
      });

      // 3. Immediately redirect new user to Create Profile (NOT Home)
      onNavigate('create-profile');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid OTP. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const res = await sendSignupOtp({ mobile: mobile.trim(), purpose: 'signup' });
      setResendTimer(30);
      setSuccessMessage(res?.data?.message || 'New OTP sent successfully! (Dev OTP: 123456)');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('input');
      setOtp('');
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      onNavigate('signin');
    }
  };

  return (
    <div className="auth-screen">
      {/* Back Button */}
      <button className="back-btn" onClick={handleBack} aria-label="Back">
        <ArrowLeft size={22} />
      </button>

      {/* Heading */}
      <div className="auth-header-left">
        <h1>
          {step === 'otp' ? (
            <>
              Verify OTP<br />
              to continue.
            </>
          ) : (
            <>
              Welcome ! Create your<br />
              new account now.
            </>
          )}
        </h1>
        {step === 'otp' && (
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0 0 0' }}>
            Enter the 6-digit code sent to <strong>+91 {mobile.replace(/\D/g, '').slice(-10)}</strong>
          </p>
        )}
      </div>

      {/* Step 1: Name & Mobile Form */}
      {step === 'input' && (
        <form onSubmit={handleGetOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center', fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              className="custom-input"
              placeholder="User Name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMessage('');
              }}
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <input
              type="tel"
              className="custom-input"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                setErrorMessage('');
              }}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Get OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification Form */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center', fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ color: '#059669', fontSize: '12.5px', marginBottom: '12px', textAlign: 'center', fontWeight: 600 }}>
              {successMessage}
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="custom-input"
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setErrorMessage('');
              }}
              disabled={isLoading}
              autoFocus
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend OTP button */}
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#6b7280' }}>
            {resendTimer > 0 ? (
              <span>Resend OTP in <strong>{resendTimer}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {/* Footer link */}
      <div className="auth-footer-text" style={{ marginTop: '30px' }}>
        have an account?{' '}
        <span onClick={() => onNavigate('signin')}>Sign In</span>
      </div>
    </div>
  );
}

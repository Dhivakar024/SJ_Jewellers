import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SignUpScreen({ onNavigate }) {
  const { registerNewUser } = useApp();
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const uName = username.trim();
    const uMobile = mobile.trim();

    if (!uName || !uMobile) {
      setErrorMessage('Please enter your User Name and Mobile Number.');
      return;
    }

    setIsLoading(true);
    try {
      // Register new user & authenticate session
      await registerNewUser({ username: uName, mobile: uMobile });
      
      // Immediately redirect to Profile Fill page
      onNavigate('create-profile');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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

      {/* Form */}
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
          {isLoading ? 'Creating Account...' : 'Get OTP'}
        </button>
      </form>

      {/* Footer link */}
      <div className="auth-footer-text" style={{ marginTop: '30px' }}>
        have an account?{' '}
        <span onClick={() => onNavigate('signin')}>Sign In</span>
      </div>
    </div>
  );
}

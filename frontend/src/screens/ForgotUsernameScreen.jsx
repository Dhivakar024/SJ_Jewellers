import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ForgotUsernameScreen({ onNavigate }) {
  const [mobile, setMobile] = useState('');

  const handleGetOtp = (e) => {
    e.preventDefault();
    onNavigate('signin');
  };

  return (
    <div className="auth-screen">
      {/* Back Button */}
      <button className="back-btn" onClick={() => onNavigate('signin')} aria-label="Back">
        <ArrowLeft size={22} />
      </button>

      {/* Heading */}
      <div className="auth-header-left">
        <h1>Forgot username?</h1>
        <p style={{ color: 'var(--primary-purple)', fontWeight: '700', fontSize: '16px', marginTop: '6px' }}>
          Sign in with your mobile OTP.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleGetOtp} style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
        <div className="input-group">
          <input
            type="tel"
            className="custom-input"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
          Get OTP
        </button>
      </form>
    </div>
  );
}

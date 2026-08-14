import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SignUpScreen({ onNavigate }) {
  const [username, setUsername] = useState('');
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
        <h1>
          Welcome ! Create your<br />
          new account now.
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleGetOtp} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="input-group">
          <input
            type="text"
            className="custom-input"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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

      {/* Footer link */}
      <div className="auth-footer-text" style={{ marginTop: '30px' }}>
        have an account?{' '}
        <span onClick={() => onNavigate('signin')}>Sign In</span>
      </div>
    </div>
  );
}

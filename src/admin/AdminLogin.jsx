import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLogin({ onSwitchToUserApp }) {
  const { setAdminAuth } = useApp();
  const [email, setEmail] = useState('admin@sjjewelers.com');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter Admin Email and Password.');
      return;
    }
    setAdminAuth({ isAuthenticated: true, email });
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f0d19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#171427',
        borderRadius: '24px',
        border: '1px solid #2d2645',
        padding: '36px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            backgroundColor: '#583cf5', margin: '0 auto 16px auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={32} color="#ffd000" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>SJ Jewelers Admin Portal</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: '500' }}>
            Enter your credentials to access the management dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #332d4f',
                  backgroundColor: '#0f0d19', padding: '0 14px 0 42px', fontSize: '14px', color: '#ffffff', outline: 'none'
                }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #332d4f',
                  backgroundColor: '#0f0d19', padding: '0 14px 0 42px', fontSize: '14px', color: '#ffffff', outline: 'none'
                }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#583cf5',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 14px rgba(88, 60, 245, 0.4)'
            }}
          >
            Login to Admin Dashboard
          </button>
        </form>

        {/* Switch to User App */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={onSwitchToUserApp}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to User Mobile App Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
}

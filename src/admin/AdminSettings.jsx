import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, AlertOctagon, ShieldCheck, Lock, Bell, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminSettings() {
  const { settings, setSettings } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      alert('Please enter a new password.');
      return;
    }
    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setAdminPassword('');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      
      {/* 1. General Business & App Settings */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e8e2fa',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-purple)' }}>
            <Store size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>Business & Platform Settings</h3>
            <p style={{ fontSize: '13px', color: '#736d85', marginTop: '2px' }}>Configure business metadata, support channels & maintenance status</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: '#2c2642', display: 'block', marginBottom: '6px' }}>
              Business / Application Name
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              style={{
                width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #dcd4fa',
                backgroundColor: '#f9f7ff', padding: '0 16px', fontSize: '14px', color: '#1e1b2e', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: '#2c2642', display: 'block', marginBottom: '6px' }}>
                Customer Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                style={{
                  width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #dcd4fa',
                  backgroundColor: '#f9f7ff', padding: '0 16px', fontSize: '14px', color: '#1e1b2e', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: '#2c2642', display: 'block', marginBottom: '6px' }}>
                Customer Support Phone
              </label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                style={{
                  width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #dcd4fa',
                  backgroundColor: '#f9f7ff', padding: '0 16px', fontSize: '14px', color: '#1e1b2e', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div style={{
            backgroundColor: '#f8f6fc',
            borderRadius: '16px',
            border: '1px solid #e8e2fa',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <AlertOctagon size={24} color={formData.maintenanceMode ? '#ef4444' : '#64748b'} />
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b2e' }}>Platform Maintenance Mode</div>
                <div style={{ fontSize: '12px', color: '#736d85' }}>Temporarily restrict new purchase orders on customer app</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
              style={{
                backgroundColor: formData.maintenanceMode ? '#ef4444' : '#ede7fc',
                color: formData.maintenanceMode ? '#ffffff' : 'var(--primary-purple)',
                border: formData.maintenanceMode ? 'none' : '1.5px solid var(--primary-purple)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {formData.maintenanceMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ height: '48px', padding: '0 24px', fontSize: '14.5px' }}
            >
              <Save size={16} />
              <span>Save System Settings</span>
            </button>

            {savedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13.5px', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>Settings saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 2. Admin Security & Password Management */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e8e2fa',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <Lock size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>Admin Security & Credentials</h3>
            <p style={{ fontSize: '13px', color: '#736d85', marginTop: '2px' }}>Update administrative access password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: '#2c2642', display: 'block', marginBottom: '6px' }}>
              New Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter new admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={{
                width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #dcd4fa',
                backgroundColor: '#f9f7ff', padding: '0 16px', fontSize: '14px', color: '#1e1b2e', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <button
              type="submit"
              style={{
                height: '46px',
                padding: '0 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#1e1b2e',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Update Password
            </button>

            {passwordSaved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13.5px', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>Password updated successfully!</span>
              </div>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}

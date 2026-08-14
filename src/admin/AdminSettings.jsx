import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminSettings() {
  const { settings, setSettings } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '24px',
        border: '1px solid #2d2645',
        padding: '28px',
        maxWidth: '650px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Settings size={26} color="var(--primary-purple)" />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>Application System Settings</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Configure platform metadata & maintenance controls</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Application Name
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              style={{
                width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #332d4f',
                backgroundColor: '#0f0d19', padding: '0 14px', fontSize: '14px', color: '#ffffff', outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Support Email ID
            </label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              style={{
                width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #332d4f',
                backgroundColor: '#0f0d19', padding: '0 14px', fontSize: '14px', color: '#ffffff', outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Support Phone Number
            </label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              style={{
                width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #332d4f',
                backgroundColor: '#0f0d19', padding: '0 14px', fontSize: '14px', color: '#ffffff', outline: 'none'
              }}
            />
          </div>

          {/* Maintenance Mode Toggle */}
          <div style={{
            backgroundColor: '#0f0d19',
            borderRadius: '16px',
            border: '1px solid #332d4f',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertOctagon size={22} color={formData.maintenanceMode ? '#ef4444' : '#64748b'} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>Maintenance Mode</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Temporarily pause app transactions</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
              style={{
                backgroundColor: formData.maintenanceMode ? '#ef4444' : '#332d4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {formData.maintenanceMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#583cf5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              <Save size={18} />
              <span>Save System Settings</span>
            </button>

            {savedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '14px', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>Settings saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

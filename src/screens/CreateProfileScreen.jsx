import React, { useState } from 'react';
import { LogOut, Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreateProfileScreen({ onNavigate }) {
  const { currentUser, setCurrentUser } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser.name || 'Demo User',
    email: currentUser.email || 'demo@example.com',
    mobile: currentUser.mobile || '9999999999',
    address: '',
    pan: '',
    aadhar: '',
    accountNumber: '',
    ifsc: '',
    nomineeName: '',
    nomineeMobile: '',
    nomineeDob: '',
    nomineeAddress: '',
    relationship: ''
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentUser((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile
    }));
    alert('Profile details saved successfully!');
    onNavigate('profile');
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header className="top-header-bar" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Create Profile</h2>
        <button
          onClick={() => onNavigate('profile')}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          aria-label="Back"
        >
          <LogOut size={24} />
        </button>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '20px 18px 30px 18px' }}>
        <form onSubmit={handleSubmit}>
          {/* Account Details Section */}
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', marginBottom: '14px' }}>
            Account Details
          </h3>

          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #c9b8fc',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px'
          }}>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Name :</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '600', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Email ID */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Email ID :</label>
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Mobile No */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Mobile No :</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '600', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642', marginTop: '10px' }}>Address :</label>
              <textarea
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                style={{
                  flex: 1, borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '10px 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e', outline: 'none'
                }}
              />
            </div>

            {/* PAN Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>PAN Card :</label>
              <input
                type="text"
                placeholder="Enter PAN"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Aadhar Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Aadhar card :</label>
              <input
                type="text"
                placeholder="Enter Aadhar"
                value={formData.aadhar}
                onChange={(e) => handleChange('aadhar', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Account Number */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Account Number :</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* IFSC Number */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>IFSC Number :</label>
              <input
                type="text"
                placeholder="Enter IFSC"
                value={formData.ifsc}
                onChange={(e) => handleChange('ifsc', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>
          </div>

          {/* Nominee Details Section */}
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', marginBottom: '14px' }}>
            Nominee Details
          </h3>

          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #c9b8fc',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px'
          }}>
            {/* Nominee Name */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Name :</label>
              <input
                type="text"
                placeholder="Enter nominee name"
                value={formData.nomineeName}
                onChange={(e) => handleChange('nomineeName', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* Mobile No */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Mobile No :</label>
              <input
                type="tel"
                placeholder="Enter mobile"
                value={formData.nomineeMobile}
                onChange={(e) => handleChange('nomineeMobile', e.target.value)}
                style={{
                  flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                }}
              />
            </div>

            {/* DOB */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>DOB :</label>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.nomineeDob}
                  onChange={(e) => handleChange('nomineeDob', e.target.value)}
                  style={{
                    width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                    backgroundColor: '#e6defa', padding: '0 40px 0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e'
                  }}
                />
                <Calendar size={18} color="var(--primary-purple)" style={{ position: 'absolute', right: '12px', top: '13px' }} />
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642', marginTop: '10px' }}>Address :</label>
              <textarea
                placeholder="Enter address"
                value={formData.nomineeAddress}
                onChange={(e) => handleChange('nomineeAddress', e.target.value)}
                rows={2}
                style={{
                  flex: 1, borderRadius: '12px', border: '1px solid #b2a2e0',
                  backgroundColor: '#e6defa', padding: '10px 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e', outline: 'none'
                }}
              />
            </div>

            {/* Relationship */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ width: '130px', fontSize: '14px', fontWeight: '700', color: '#2c2642' }}>Relationship :</label>
              <div style={{ flex: 1, position: 'relative' }}>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  style={{
                    width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #b2a2e0',
                    backgroundColor: '#e6defa', padding: '0 36px 0 14px', fontSize: '14px', fontWeight: '500', color: '#1e1b2e', appearance: 'none'
                  }}
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                </select>
                <ChevronDown size={18} color="#2c2642" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              style={{
                flex: 1, height: '52px', borderRadius: '16px', border: '1.5px solid var(--primary-purple)',
                backgroundColor: 'transparent', color: 'var(--text-dark)', fontSize: '17px', fontWeight: '800', cursor: 'pointer'
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              style={{
                flex: 1, height: '52px', borderRadius: '16px', border: '1.5px solid var(--primary-purple)',
                backgroundColor: '#ede7fc', color: 'var(--text-dark)', fontSize: '17px', fontWeight: '800', cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

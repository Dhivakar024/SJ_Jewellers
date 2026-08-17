import React, { useState } from 'react';
import { LogOut, Calendar, ChevronDown, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreateProfileScreen({ onNavigate }) {
  const { currentUser, completeUserProfile, logoutUser } = useApp();
  const isExistingCompletedUser = currentUser.profileCompleted === true;

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    mobile: currentUser.mobile || '',
    address: currentUser.address || '',
    pan: currentUser.pan || '',
    aadhar: currentUser.aadhar || '',
    accountNumber: currentUser.accountNumber || '',
    ifsc: currentUser.ifsc || '',
    nomineeName: currentUser.nomineeName || '',
    nomineeMobile: currentUser.nomineeMobile || '',
    nomineeDob: currentUser.nomineeDob || '',
    nomineeAddress: currentUser.nomineeAddress || '',
    relationship: currentUser.relationship || ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleSkip = () => {
    if (!isExistingCompletedUser) {
      sessionStorage.setItem('sj_session_skipped_profile', 'true');
      onNavigate('home');
      return;
    }
    onNavigate('profile');
  };

  const handleHeaderExit = () => {
    if (isExistingCompletedUser) {
      onNavigate('profile');
    } else {
      logoutUser();
      sessionStorage.removeItem('sj_session_skipped_profile');
      onNavigate('signin');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email ID' },
      { key: 'mobile', label: 'Mobile No.' },
      { key: 'address', label: 'Address' },
      { key: 'pan', label: 'PAN Card' },
      { key: 'aadhar', label: 'Aadhaar Card' },
      { key: 'accountNumber', label: 'Account Number' },
      { key: 'ifsc', label: 'IFSC Number' },
      { key: 'nomineeName', label: 'Nominee Name' },
      { key: 'nomineeMobile', label: 'Nominee Mobile No.' },
      { key: 'nomineeDob', label: 'Nominee DOB' },
      { key: 'nomineeAddress', label: 'Nominee Address' },
      { key: 'relationship', label: 'Relationship' }
    ];

    const missingFields = requiredFields.filter((f) => !formData[f.key] || !formData[f.key].trim());

    if (missingFields.length > 0) {
      setErrorMessage(`Please fill all required fields (${missingFields.map((f) => f.label).slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}).`);
      return;
    }

    completeUserProfile(formData);
    sessionStorage.removeItem('sj_session_skipped_profile');
    setErrorMessage('');

    if (isExistingCompletedUser) {
      alert('Profile details updated successfully!');
      onNavigate('profile');
    } else {
      alert('Profile completed successfully! Welcome to SJ Jewelers.');
      onNavigate('home');
    }
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header className="top-header-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isExistingCompletedUser && (
            <button className="back-btn" onClick={() => onNavigate('profile')} aria-label="Back">
              <ArrowLeft size={22} />
            </button>
          )}
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
            {isExistingCompletedUser ? 'Edit Profile' : 'Create Profile'}
          </h2>
        </div>

        <button
          onClick={handleHeaderExit}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
          aria-label="Exit"
        >
          <LogOut size={24} />
        </button>
      </header>

      {/* 2. Middle Scrollable Content (Strict 3-Column Alignment: [Label] [:] [Input]) */}
      <main className="app-scroll-content" style={{ padding: '18px 16px 60px 16px' }}>
        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#dc2626'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section A: Account Details */}
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px', paddingLeft: '2px' }}>
            Account Details
          </h3>

          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '20px',
            padding: '18px 14px',
            border: '1px solid #c9b8fc',
            display: 'flex',
            flexDirection: 'column',
            gap: '13px',
            marginBottom: '24px'
          }}>
            {/* Name */}
            <div className="profile-form-row">
              <div className="profile-label-col">Name</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Email ID */}
            <div className="profile-form-row">
              <div className="profile-label-col">Email ID</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Mobile No. */}
            <div className="profile-form-row">
              <div className="profile-label-col">Mobile No.</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Address */}
            <div className="profile-form-row align-top">
              <div className="profile-label-col">Address</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className="profile-custom-input"
                  style={{
                    height: 'auto',
                    minHeight: '64px',
                    padding: '10px 12px',
                    lineHeight: '1.4',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {/* PAN Card */}
            <div className="profile-form-row">
              <div className="profile-label-col">PAN Card</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter PAN number"
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Aadhaar Card */}
            <div className="profile-form-row">
              <div className="profile-label-col">Aadhaar Card</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter Aadhaar number"
                  value={formData.aadhar}
                  onChange={(e) => handleChange('aadhar', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Account Number */}
            <div className="profile-form-row">
              <div className="profile-label-col">Account Number</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter bank account no"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* IFSC Number */}
            <div className="profile-form-row">
              <div className="profile-label-col">IFSC Number</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter bank IFSC code"
                  value={formData.ifsc}
                  onChange={(e) => handleChange('ifsc', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>
          </div>

          {/* Section B: Nominee Details */}
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px', paddingLeft: '2px' }}>
            Nominee Details
          </h3>

          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '20px',
            padding: '18px 14px',
            border: '1px solid #c9b8fc',
            display: 'flex',
            flexDirection: 'column',
            gap: '13px',
            marginBottom: '24px'
          }}>
            {/* Nominee Name */}
            <div className="profile-form-row">
              <div className="profile-label-col">Name</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  placeholder="Enter nominee name"
                  value={formData.nomineeName}
                  onChange={(e) => handleChange('nomineeName', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* Nominee Mobile */}
            <div className="profile-form-row">
              <div className="profile-label-col">Mobile No.</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="tel"
                  placeholder="Enter nominee mobile"
                  value={formData.nomineeMobile}
                  onChange={(e) => handleChange('nomineeMobile', e.target.value)}
                  className="profile-custom-input"
                />
              </div>
            </div>

            {/* DOB */}
            <div className="profile-form-row">
              <div className="profile-label-col">DOB</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col" style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.nomineeDob}
                  onChange={(e) => handleChange('nomineeDob', e.target.value)}
                  className="profile-custom-input"
                  style={{ paddingRight: '38px' }}
                />
                <Calendar size={18} color="var(--primary-purple)" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Nominee Address */}
            <div className="profile-form-row align-top">
              <div className="profile-label-col">Address</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <textarea
                  placeholder="Enter nominee address"
                  value={formData.nomineeAddress}
                  onChange={(e) => handleChange('nomineeAddress', e.target.value)}
                  rows={2}
                  className="profile-custom-input"
                  style={{
                    height: 'auto',
                    minHeight: '64px',
                    padding: '10px 12px',
                    lineHeight: '1.4',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {/* Relationship */}
            <div className="profile-form-row">
              <div className="profile-label-col">Relationship</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col" style={{ position: 'relative' }}>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="profile-custom-input"
                  style={{ paddingRight: '36px', appearance: 'none' }}
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
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleSkip}
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

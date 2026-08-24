import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { profileService } from '../services';

export default function CreateProfileScreen({ mode = 'create', onNavigate }) {
  const { currentUser, completeUserProfile } = useApp();
  const isEditMode = mode === 'edit';
  const dateInputRef = useRef(null);

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
    relationship: currentUser.relationship || '',
    relationshipDetails: currentUser.relationshipDetails || '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real profile from MongoDB on mount to populate fields
  useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res?.data && isMounted) {
          const u = res.data;
          const p = u.profile || {};
          const relCapitalized = p.relationship
            ? p.relationship.charAt(0).toUpperCase() + p.relationship.slice(1).toLowerCase()
            : '';

          setFormData({
            name: p.full_name || u.name || '',
            email: u.email || '',
            mobile: u.mobile || '',
            address: p.address?.address_line || '',
            pan: p.pan || '',
            aadhar: p.aadhar || '',
            accountNumber: p.account_number || '',
            ifsc: p.ifsc || '',
            nomineeName: p.nominee_name || '',
            nomineeMobile: p.nominee_mobile || '',
            nomineeDob: p.nominee_dob || '',
            nomineeAddress: p.nominee_address || '',
            relationship: relCapitalized,
            relationshipDetails: p.relationship_other || '',
          });
        }
      } catch {
        // Fallback to context state
      }
    };

    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If changing away from Other, clear custom relationship details
      if (field === 'relationship' && value !== 'Other') {
        updated.relationshipDetails = '';
      }
      return updated;
    });
    setErrorMessage('');
  };

  const handleDateChange = (e) => {
    const val = e.target.value; // Format: YYYY-MM-DD
    if (val) {
      const [year, month, day] = val.split('-');
      const formatted = `${day}/${month}/${year}`;
      handleChange('nomineeDob', formatted);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
          dateInputRef.current.click();
        }
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  const handleSkip = () => {
    if (!currentUser.profileCompleted) {
      sessionStorage.setItem('sj_session_skipped_profile', 'true');
      onNavigate('home');
      return;
    }
    onNavigate('profile');
  };

  const handleHeaderBack = () => {
    if (isEditMode) {
      onNavigate('profile');
    } else {
      onNavigate('signin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const requiredFields = [
      { key: 'name', label: 'Name' },
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
      { key: 'relationship', label: 'Relationship' },
    ];

    const missingFields = requiredFields.filter((f) => !formData[f.key] || !formData[f.key].trim());

    if (missingFields.length > 0) {
      setErrorMessage(
        `Please fill all required fields (${missingFields
          .map((f) => f.label)
          .slice(0, 3)
          .join(', ')}${missingFields.length > 3 ? '...' : ''}).`
      );
      return;
    }

    if (formData.relationship === 'Other' && (!formData.relationshipDetails || !formData.relationshipDetails.trim())) {
      setErrorMessage('Please enter your Relationship Details.');
      return;
    }

    // Build backend update payload
    const payload = {
      full_name: formData.name.trim(),
      address: {
        address_line: formData.address.trim(),
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001',
      },
      pan: formData.pan.trim(),
      aadhar: formData.aadhar.trim(),
      account_number: formData.accountNumber.trim(),
      ifsc: formData.ifsc.trim(),
      nominee_name: formData.nomineeName.trim(),
      nominee_mobile: formData.nomineeMobile.trim(),
      nominee_dob: formData.nomineeDob.trim(),
      nominee_address: formData.nomineeAddress.trim(),
      relationship: formData.relationship.trim().toLowerCase(),
      relationship_other: formData.relationship === 'Other' ? formData.relationshipDetails.trim() : null,
    };

    setIsSubmitting(true);
    try {
      // Save directly to MongoDB via Profile PATCH API
      const res = await profileService.updateProfile(payload);
      
      const updatedUserObj = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        pan: formData.pan.trim(),
        aadhar: formData.aadhar.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifsc: formData.ifsc.trim(),
        nomineeName: formData.nomineeName.trim(),
        nomineeMobile: formData.nomineeMobile.trim(),
        nomineeDob: formData.nomineeDob.trim(),
        nomineeAddress: formData.nomineeAddress.trim(),
        relationship: formData.relationship,
        relationshipDetails: formData.relationshipDetails,
        profileCompleted: true,
        isAuthenticated: true,
      };

      completeUserProfile(updatedUserObj);
      sessionStorage.removeItem('sj_session_skipped_profile');

      if (isEditMode) {
        onNavigate('profile');
      } else {
        // Brand-new onboarding user: Navigate DIRECTLY to Home
        onNavigate('home', true);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header (Clean Back Button + Title, NO logout icon) */}
      <header className="top-header-bar" style={{ justifyContent: 'flex-start', gap: '14px' }}>
        <button
          className="back-btn"
          onClick={handleHeaderBack}
          aria-label="Back"
          style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
          {isEditMode ? 'Edit Profile' : 'Create Profile'}
        </h2>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '20px 18px 60px 18px' }}>
        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '14px',
              padding: '12px 16px',
              marginBottom: '18px',
              color: '#dc2626',
              fontSize: '13.5px',
              fontWeight: '700',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section A: Account Details */}
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px', paddingLeft: '2px' }}>
            Account Details
          </h3>

          <div
            style={{
              backgroundColor: '#dcd0ff',
              borderRadius: '20px',
              padding: '18px 14px',
              border: '1px solid #c9b8fc',
              display: 'flex',
              flexDirection: 'column',
              gap: '13px',
              marginBottom: '24px',
            }}
          >
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    resize: 'none',
                  }}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Section B: Nominee Details */}
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px', paddingLeft: '2px' }}>
            Nominee Details
          </h3>

          <div
            style={{
              backgroundColor: '#dcd0ff',
              borderRadius: '20px',
              padding: '18px 14px',
              border: '1px solid #c9b8fc',
              display: 'flex',
              flexDirection: 'column',
              gap: '13px',
              marginBottom: '24px',
            }}
          >
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* DOB (Opens native date picker with formatted DD/MM/YYYY) */}
            <div className="profile-form-row">
              <div className="profile-label-col">DOB</div>
              <div className="profile-colon-col">:</div>
              <div
                className="profile-input-col"
                style={{ position: 'relative', cursor: isSubmitting ? 'default' : 'pointer' }}
                onClick={!isSubmitting ? openDatePicker : undefined}
              >
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.nomineeDob}
                  readOnly
                  className="profile-custom-input"
                  style={{ paddingRight: '38px', cursor: 'pointer' }}
                  disabled={isSubmitting}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                >
                  <Calendar size={18} color="var(--primary-purple)" />
                </div>
                {/* Full-width transparent native Date input overlay */}
                <input
                  ref={dateInputRef}
                  type="date"
                  onChange={handleDateChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 4,
                  }}
                  aria-label="Select Date of Birth"
                  disabled={isSubmitting}
                />
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
                    resize: 'none',
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Relationship Dropdown */}
            <div className="profile-form-row">
              <div className="profile-label-col">Relationship</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col" style={{ position: 'relative' }}>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="profile-custom-input"
                  style={{ paddingRight: '36px', appearance: 'none' }}
                  disabled={isSubmitting}
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown size={18} color="#2c2642" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Relationship Details Input (Shown only when 'Other' is selected) */}
            {formData.relationship === 'Other' && (
              <div className="profile-form-row">
                <div className="profile-label-col">Relationship Details</div>
                <div className="profile-colon-col">:</div>
                <div className="profile-input-col">
                  <input
                    type="text"
                    placeholder="Enter relationship"
                    value={formData.relationshipDetails}
                    onChange={(e) => handleChange('relationshipDetails', e.target.value)}
                    className="profile-custom-input"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              style={{
                flex: 1,
                height: '52px',
                borderRadius: '16px',
                border: '1.5px solid var(--primary-purple)',
                backgroundColor: 'transparent',
                color: 'var(--text-dark)',
                fontSize: '17px',
                fontWeight: '800',
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                height: '52px',
                borderRadius: '16px',
                border: '1.5px solid var(--primary-purple)',
                backgroundColor: '#ede7fc',
                color: 'var(--text-dark)',
                fontSize: '17px',
                fontWeight: '800',
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Submit')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

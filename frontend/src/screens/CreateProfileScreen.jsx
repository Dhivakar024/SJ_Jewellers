import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { profileService } from '../services';
import { cleanIndianMobileDigits, formatToE164, isValidIndianMobile } from '../utils/phoneUtils';

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

  const [errors, setErrors] = useState({});
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
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
    sessionStorage.setItem('sj_session_skipped_profile', 'true');
    onNavigate('home');
  };

  const handleHeaderBack = () => {
    if (isEditMode) {
      onNavigate('profile');
    } else {
      onNavigate('signin');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Name Validation (min 2 chars)
    const nameClean = (formData.name || '').trim();
    if (!nameClean) {
      newErrors.name = 'Full name is required';
    } else if (nameClean.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    // 2. Email Validation (optional, but validated if present)
    const emailClean = (formData.email || '').trim();
    if (emailClean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      newErrors.email = 'Enter a valid email address';
    }

    // 3. User Mobile Validation (10 digits)
    const mobileClean = cleanIndianMobileDigits(formData.mobile);
    if (!mobileClean) {
      newErrors.mobile = 'Mobile number is required';
    } else if (mobileClean.length !== 10 || !isValidIndianMobile(mobileClean)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    // 4. Address Validation (min 5 chars)
    const addressClean = (formData.address || '').trim();
    if (!addressClean) {
      newErrors.address = 'Full address is required';
    } else if (addressClean.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // 5. PAN Card Validation (10-char alphanumeric: 5 letters, 4 digits, 1 letter)
    const panClean = (formData.pan || '').trim().toUpperCase();
    if (!panClean) {
      newErrors.pan = 'PAN card number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean)) {
      newErrors.pan = 'Enter valid 10-char PAN (e.g. ABCDE1234F)';
    }

    // 6. Aadhaar Card Validation (12 digits)
    const aadharClean = (formData.aadhar || '').replace(/\D/g, '');
    if (!aadharClean) {
      newErrors.aadhar = 'Aadhaar number is required';
    } else if (aadharClean.length !== 12) {
      newErrors.aadhar = 'Enter a valid 12-digit Aadhaar number';
    }

    // 7. Bank Account Number (9 to 18 digits)
    const accountClean = (formData.accountNumber || '').replace(/\D/g, '');
    if (!accountClean) {
      newErrors.accountNumber = 'Bank account number is required';
    } else if (accountClean.length < 9 || accountClean.length > 18) {
      newErrors.accountNumber = 'Enter a valid account number (9-18 digits)';
    }

    // 8. Bank IFSC Code (11-char alphanumeric: 4 letters, 0, 6 characters)
    const ifscClean = (formData.ifsc || '').trim().toUpperCase();
    if (!ifscClean) {
      newErrors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscClean)) {
      newErrors.ifsc = 'Enter valid 11-character IFSC (e.g. SBIN0001234)';
    }

    // 9. Nominee Name
    const nomineeNameClean = (formData.nomineeName || '').trim();
    if (!nomineeNameClean) {
      newErrors.nomineeName = 'Nominee name is required';
    } else if (nomineeNameClean.length < 2) {
      newErrors.nomineeName = 'Nominee name must be at least 2 characters';
    }

    // 10. Nominee Mobile (10 digits)
    const nomineeMobileClean = cleanIndianMobileDigits(formData.nomineeMobile);
    if (!nomineeMobileClean) {
      newErrors.nomineeMobile = 'Nominee mobile number is required';
    } else if (nomineeMobileClean.length !== 10 || !isValidIndianMobile(nomineeMobileClean)) {
      newErrors.nomineeMobile = 'Enter a valid 10-digit nominee mobile';
    }

    // 11. Nominee DOB (DD/MM/YYYY)
    const nomineeDobClean = (formData.nomineeDob || '').trim();
    if (!nomineeDobClean) {
      newErrors.nomineeDob = 'Nominee date of birth is required';
    }

    // 12. Nominee Address (min 5 chars)
    const nomineeAddressClean = (formData.nomineeAddress || '').trim();
    if (!nomineeAddressClean) {
      newErrors.nomineeAddress = 'Nominee address is required';
    } else if (nomineeAddressClean.length < 5) {
      newErrors.nomineeAddress = 'Nominee address must be at least 5 characters';
    }

    // 13. Relationship
    const relClean = (formData.relationship || '').trim();
    if (!relClean) {
      newErrors.relationship = 'Please select a relationship';
    }

    // 14. Relationship Details
    const relDetailsClean = (formData.relationshipDetails || '').trim();
    if (relClean === 'Other' && (!relDetailsClean || relDetailsClean.length < 2)) {
      newErrors.relationshipDetails = 'Please specify relationship details';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setErrorMessage('Please correct the highlighted fields before submitting.');
      return;
    }
    setErrors({});

    const nameClean = (formData.name || '').trim();
    const emailClean = (formData.email || '').trim();
    const mobileClean = cleanIndianMobileDigits(formData.mobile);
    const addressClean = (formData.address || '').trim();
    const panClean = (formData.pan || '').trim().toUpperCase();
    const aadharClean = (formData.aadhar || '').replace(/\D/g, '');
    const accountClean = (formData.accountNumber || '').replace(/\D/g, '');
    const ifscClean = (formData.ifsc || '').trim().toUpperCase();
    const nomineeNameClean = (formData.nomineeName || '').trim();
    const nomineeMobileClean = cleanIndianMobileDigits(formData.nomineeMobile);
    const nomineeDobClean = (formData.nomineeDob || '').trim();
    const nomineeAddressClean = (formData.nomineeAddress || '').trim();
    const relClean = (formData.relationship || '').trim();
    const relDetailsClean = (formData.relationshipDetails || '').trim();

    // Build backend update payload
    const payload = {
      full_name: nameClean,
      address: {
        address_line: addressClean,
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001',
      },
      pan: panClean,
      aadhar: aadharClean,
      account_number: accountClean,
      ifsc: ifscClean,
      nominee_name: nomineeNameClean,
      nominee_mobile: formatToE164(nomineeMobileClean),
      nominee_dob: nomineeDobClean,
      nominee_address: nomineeAddressClean,
      relationship: relClean.toLowerCase(),
      relationship_other: relClean === 'Other' ? relDetailsClean : null,
    };

    setIsSubmitting(true);
    try {
      // Save directly to MongoDB via Profile PATCH API
      await profileService.updateProfile(payload);
      
      const updatedUserObj = {
        name: nameClean,
        email: emailClean,
        mobile: formatToE164(mobileClean),
        address: addressClean,
        pan: panClean,
        aadhar: aadharClean,
        accountNumber: accountClean,
        ifsc: ifscClean,
        nomineeName: nomineeNameClean,
        nomineeMobile: formatToE164(nomineeMobileClean),
        nomineeDob: nomineeDobClean,
        nomineeAddress: nomineeAddressClean,
        relationship: relClean,
        relationshipDetails: relClean === 'Other' ? relDetailsClean : '',
        profileCompleted: true,
        isAuthenticated: true,
      };

      completeUserProfile(updatedUserObj);
      sessionStorage.removeItem('sj_session_skipped_profile');

      if (isEditMode) {
        onNavigate('profile');
      } else {
        // Brand-new onboarding user: Navigate DIRECTLY to Home
        onNavigate('home');
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
                {errors.name && <div className="profile-field-error">{errors.name}</div>}
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
                {errors.email && <div className="profile-field-error">{errors.email}</div>}
              </div>
            </div>

            {/* Mobile No. */}
            <div className="profile-form-row">
              <div className="profile-label-col">Mobile No.</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <div className="profile-phone-wrapper">
                  <div className="profile-phone-prefix">+91</div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Enter 10 digits"
                    value={cleanIndianMobileDigits(formData.mobile)}
                    onChange={(e) => handleChange('mobile', cleanIndianMobileDigits(e.target.value))}
                    className="profile-phone-input"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.mobile && <div className="profile-field-error">{errors.mobile}</div>}
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
                {errors.address && <div className="profile-field-error">{errors.address}</div>}
              </div>
            </div>

            {/* PAN Card */}
            <div className="profile-form-row">
              <div className="profile-label-col">PAN Card</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value.toUpperCase().slice(0, 10))}
                  className="profile-custom-input"
                  style={{ textTransform: 'uppercase' }}
                  disabled={isSubmitting}
                />
                {errors.pan && <div className="profile-field-error">{errors.pan}</div>}
              </div>
            </div>

            {/* Aadhaar Card */}
            <div className="profile-form-row">
              <div className="profile-label-col">Aadhaar Card</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                  value={formData.aadhar}
                  onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="profile-custom-input"
                  disabled={isSubmitting}
                />
                {errors.aadhar && <div className="profile-field-error">{errors.aadhar}</div>}
              </div>
            </div>

            {/* Account Number */}
            <div className="profile-form-row">
              <div className="profile-label-col">Account Number</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={18}
                  placeholder="Enter bank account no"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
                  className="profile-custom-input"
                  disabled={isSubmitting}
                />
                {errors.accountNumber && <div className="profile-field-error">{errors.accountNumber}</div>}
              </div>
            </div>

            {/* IFSC Number */}
            <div className="profile-form-row">
              <div className="profile-label-col">IFSC Number</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="e.g. SBIN0001234"
                  value={formData.ifsc}
                  onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase().slice(0, 11))}
                  className="profile-custom-input"
                  style={{ textTransform: 'uppercase' }}
                  disabled={isSubmitting}
                />
                {errors.ifsc && <div className="profile-field-error">{errors.ifsc}</div>}
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
                {errors.nomineeName && <div className="profile-field-error">{errors.nomineeName}</div>}
              </div>
            </div>

            {/* Nominee Mobile */}
            <div className="profile-form-row">
              <div className="profile-label-col">Mobile No.</div>
              <div className="profile-colon-col">:</div>
              <div className="profile-input-col">
                <div className="profile-phone-wrapper">
                  <div className="profile-phone-prefix">+91</div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Enter 10 digits"
                    value={cleanIndianMobileDigits(formData.nomineeMobile)}
                    onChange={(e) => handleChange('nomineeMobile', cleanIndianMobileDigits(e.target.value))}
                    className="profile-phone-input"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.nomineeMobile && <div className="profile-field-error">{errors.nomineeMobile}</div>}
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
                {errors.nomineeDob && <div className="profile-field-error">{errors.nomineeDob}</div>}
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
                {errors.nomineeAddress && <div className="profile-field-error">{errors.nomineeAddress}</div>}
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
                {errors.relationship && <div className="profile-field-error">{errors.relationship}</div>}
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
                  {errors.relationshipDetails && <div className="profile-field-error">{errors.relationshipDetails}</div>}
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

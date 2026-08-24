import React, { useEffect } from 'react';
import { Pencil, UserPlus, LogOut, ShieldCheck, Hand, FileText, Phone, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { profileService } from '../services';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen({ onNavigate, onTogglePlus }) {
  const { currentUser, setCurrentUser, logoutUser } = useApp();
  const isProfileCompleted = currentUser.profileCompleted === true;

  // Refresh profile from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res?.data && isMounted) {
          const uData = res.data;
          const pData = uData.profile || {};
          const isComplete = !!(pData.address?.address_line || pData.full_name);

          setCurrentUser((prev) => ({
            ...prev,
            id: uData.user_id || uData.id || prev.id,
            name: pData.full_name || uData.name || prev.name,
            mobile: uData.mobile || prev.mobile,
            email: uData.email || prev.email,
            kycStatus: uData.kyc_status || prev.kycStatus,
            profileCompleted: isComplete,
            address: pData.address?.address_line || prev.address,
            pan: pData.pan || prev.pan,
            aadhar: pData.aadhar || prev.aadhar,
            accountNumber: pData.account_number || prev.accountNumber,
            ifsc: pData.ifsc || prev.ifsc,
            nomineeName: pData.nominee_name || prev.nomineeName,
            nomineeMobile: pData.nominee_mobile || prev.nomineeMobile,
            nomineeDob: pData.nominee_dob || prev.nomineeDob,
            nomineeAddress: pData.nominee_address || prev.nomineeAddress,
            relationship: pData.relationship || prev.relationship,
            relationshipDetails: pData.relationship_other || prev.relationshipDetails,
          }));
        }
      } catch {
        // use existing user state
      }
    };

    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, [setCurrentUser]);

  const getKycBadgeColor = () => {
    const st = (currentUser.kycStatus || 'pending').toLowerCase();
    switch (st) {
      case 'verified':
      case 'approved':
        return { bg: '#d1fae5', text: '#059669', label: 'Verified' };
      case 'under review':
        return { bg: '#e0f2fe', text: '#0284c7', label: 'Under Review' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' };
      default:
        return { bg: '#fef3c7', text: '#d97706', label: 'Pending' };
    }
  };

  const kycColors = getKycBadgeColor();

  const handleLogout = async () => {
    // Explicit Logout ONLY from main Profile screen
    await logoutUser();
    onNavigate('signin');
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header (Header button shows Create Profile when incomplete, Edit Profile when complete) */}
      <header className="top-header-bar" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Profile</h2>
        <button
          onClick={() => onNavigate('create-profile')}
          style={{
            backgroundColor: '#ede7fc',
            border: '1.5px solid var(--primary-purple)',
            color: 'var(--primary-purple)',
            borderRadius: '16px',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '800',
            fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          aria-label={isProfileCompleted ? 'Edit Profile' : 'Create Profile'}
        >
          {isProfileCompleted ? (
            <>
              <Pencil size={15} />
              <span>Edit Profile</span>
            </>
          ) : (
            <>
              <UserPlus size={15} />
              <span>Create Profile</span>
            </>
          )}
        </button>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '20px 18px 24px 18px' }}>
        {/* User Avatar Card */}
        <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-purple)',
              color: 'white',
              fontSize: '36px',
              fontWeight: '800',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(88, 60, 245, 0.3)',
            }}
          >
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b2e' }}>
            {currentUser.name || 'New User'}
          </h3>

          <p style={{ fontSize: '15px', color: '#736d85', fontWeight: '600', marginTop: '2px' }}>
            +91 {currentUser.mobile || '9876543210'}
          </p>

          <div style={{ marginTop: '10px' }}>
            <span
              style={{
                backgroundColor: kycColors.bg,
                color: kycColors.text,
                fontSize: '12px',
                fontWeight: '800',
                padding: '4px 14px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} />
              KYC: {kycColors.label}
            </span>
          </div>
        </div>

        {/* Quick Menu Options (Starts with Mode of Withdraw) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '10px 16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mode of Withdraw */}
          <div
            onClick={() => onNavigate('withdraw')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 6px',
              borderBottom: '1px solid #f3eeff',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', fontWeight: '700', color: '#1e1b2e' }}>
              <Hand size={20} color="var(--primary-purple)" />
              <span>Mode of Withdraw</span>
            </div>
            <ChevronRight size={18} color="#908ba6" />
          </div>

          {/* Transaction History */}
          <div
            onClick={() => onNavigate('transactions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 6px',
              borderBottom: '1px solid #f3eeff',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', fontWeight: '700', color: '#1e1b2e' }}>
              <FileText size={20} color="var(--primary-purple)" />
              <span>Transaction History</span>
            </div>
            <ChevronRight size={18} color="#908ba6" />
          </div>

          {/* Contact Us */}
          <div
            onClick={() => onNavigate('contact')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 6px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', fontWeight: '700', color: '#1e1b2e' }}>
              <Phone size={20} color="var(--primary-purple)" />
              <span>Contact Us</span>
            </div>
            <ChevronRight size={18} color="#908ba6" />
          </div>
        </div>

        {/* Logout Button (ONLY HERE) */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: '#ff3b30',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 59, 48, 0.25)',
          }}
        >
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </main>

      {/* 3. Fixed Bottom Nav */}
      <BottomNav
        activeTab="profile"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

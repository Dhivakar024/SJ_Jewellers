import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { withdrawalService, kycService } from '../services';
import BottomNav from '../components/BottomNav';

export default function WithdrawScreen({ onNavigate, onTogglePlus }) {
  const { currentUser, setCurrentUser, holdings, goldRate, silverRate, fetchHoldings } = useApp();
  
  // Persistent KYC verification state check
  const isKycVerified =
    (currentUser?.kycStatus || '').toLowerCase() === 'verified' ||
    (currentUser?.kycStatus || '').toLowerCase() === 'approved';

  const [showKycModal, setShowKycModal] = useState(false);
  const [showKycForm, setShowKycForm] = useState(false);
  const [pan, setPan] = useState(currentUser?.pan || '');
  const [aadhar, setAadhar] = useState(currentUser?.aadhar || '');
  const [kycError, setKycError] = useState('');
  const [kycSuccess, setKycSuccess] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const [withdrawAsset, setWithdrawAsset] = useState('Gold');
  const [withdrawGrams, setWithdrawGrams] = useState('');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [createdWithdrawal, setCreatedWithdrawal] = useState(null);

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    setKycError('');

    const cleanPan = (pan || '').trim().toUpperCase();
    const cleanAadhar = (aadhar || '').replace(/[\s-]/g, '').trim();

    if (!cleanPan || !cleanAadhar) {
      setKycError('Please enter both PAN Card Number and Aadhaar Number.');
      return;
    }

    // 10-character PAN validation (e.g. ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      setKycError('Please enter a valid 10-character PAN (e.g. ABCDE1234F).');
      return;
    }

    // 12-digit Aadhaar validation
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(cleanAadhar)) {
      setKycError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      await kycService.submitKyc({ pan: cleanPan, aadhar: cleanAadhar });
      setCurrentUser((prev) => ({
        ...prev,
        pan: cleanPan,
        aadhar: cleanAadhar,
        kycStatus: 'Verified',
      }));
      setKycSuccess(true);
      setTimeout(() => {
        setKycSuccess(false);
        setShowKycForm(false);
        setShowKycModal(false);
        setIsSubmittingKyc(false);
      }, 1400);
    } catch (err) {
      setKycError(err.message || 'Failed to submit KYC. Please try again.');
      setIsSubmittingKyc(false);
    }
  };

  const handleInitiateWithdraw = (asset) => {
    if (!isKycVerified) {
      setShowKycModal(true);
      return;
    }
    setWithdrawAsset(asset);
    setWithdrawGrams('');
    setWithdrawError('');
    setCreatedWithdrawal(null);
    setShowWithdrawForm(true);
  };

  const handleConfirmWithdrawal = async (e) => {
    e.preventDefault();
    if (isSubmittingWithdrawal) return;
    setWithdrawError('');

    const g = parseFloat(withdrawGrams) || 0;
    const maxGrams = withdrawAsset === 'Gold' ? (holdings?.goldGrams || 0) : (holdings?.silverGrams || 0);

    if (g <= 0) {
      setWithdrawError('Please enter a valid gram quantity greater than 0.');
      return;
    }

    if (g > maxGrams) {
      setWithdrawError(`Insufficient ${withdrawAsset.toLowerCase()} balance (Max available: ${maxGrams.toFixed(4)} gm).`);
      return;
    }

    if (withdrawAsset === 'Gold' && g < 0.5) {
      setWithdrawError('Minimum gold withdrawal quantity is 0.5 grams.');
      return;
    }

    if (withdrawAsset === 'Silver' && g < 10.0) {
      setWithdrawError('Minimum silver withdrawal quantity is 10.0 grams.');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const res = await withdrawalService.createWithdrawal({
        metal: withdrawAsset.toLowerCase(),
        quantityGrams: g,
        withdrawalMode: 'physical',
      });

      const wData = res?.data;
      setCreatedWithdrawal(wData);
      setWithdrawSuccess(true);

      if (typeof fetchHoldings === 'function') {
        fetchHoldings();
      }

      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawForm(false);
        onNavigate('transactions');
      }, 1600);
    } catch (err) {
      setWithdrawError(err.message || 'Withdrawal request failed. Please check your balance and try again.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const goldGrams = Number(holdings?.goldGrams) || 0;
  const silverGrams = Number(holdings?.silverGrams) || 0;

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('profile')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Mode of Withdraw</h2>
      </header>

      {/* 2. Middle Scrollable Content Area with bottom navigation clearance */}
      <main className="app-scroll-content" style={{ padding: '20px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Gold Asset Card (Compact, identical reusable card dimensions) */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px 18px',
          textAlign: 'center',
          border: '1px solid #c9b8fc',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 1. Asset Name (Centered) */}
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
            Gold
          </div>

          {/* 2. Balance Value (Large & Readable) */}
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e1b2e', marginBottom: '4px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
            {goldGrams.toFixed(4)}
          </div>

          {/* 3. "Gram" Pill (Directly below balance) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px 16px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            fontWeight: '800',
            color: '#33295c',
            marginBottom: '16px'
          }}>
            Gram
          </div>

          {/* 4. Withdraw Action (Centered near lower part of card) */}
          <button
            type="button"
            onClick={() => handleInitiateWithdraw('Gold')}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '14px',
              border: isKycVerified ? 'none' : '1px solid #b2a2e0',
              backgroundColor: isKycVerified ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.5)',
              color: isKycVerified ? '#ffffff' : '#5b5375',
              fontSize: '15.5px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: isKycVerified ? '0 6px 18px rgba(88, 60, 245, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
            aria-label="Withdraw Gold"
          >
            <ArrowUp size={18} color={isKycVerified ? '#ffffff' : '#5b5375'} strokeWidth={2.5} />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Silver Asset Card (Identical reusable card dimensions to Gold) */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px 18px',
          textAlign: 'center',
          border: '1px solid #c9b8fc',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 1. Asset Name (Centered) */}
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
            Silver
          </div>

          {/* 2. Balance Value (Large & Readable) */}
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e1b2e', marginBottom: '4px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
            {silverGrams.toFixed(4)}
          </div>

          {/* 3. "Gram" Pill (Directly below balance) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px 16px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            fontWeight: '800',
            color: '#33295c',
            marginBottom: '16px'
          }}>
            Gram
          </div>

          {/* 4. Withdraw Action (Centered near lower part of card) */}
          <button
            type="button"
            onClick={() => handleInitiateWithdraw('Silver')}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '14px',
              border: isKycVerified ? 'none' : '1px solid #b2a2e0',
              backgroundColor: isKycVerified ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.5)',
              color: isKycVerified ? '#ffffff' : '#5b5375',
              fontSize: '15.5px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: isKycVerified ? '0 6px 18px rgba(88, 60, 245, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
            aria-label="Withdraw Silver"
          >
            <ArrowUp size={18} color={isKycVerified ? '#ffffff' : '#5b5375'} strokeWidth={2.5} />
            <span>Withdraw</span>
          </button>
        </div>
      </main>

      {/* 3. Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab="profile"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />

      {/* Verify KYC Prompt Modal Sheet */}
      {showKycModal && !showKycForm && (
        <div className="modal-overlay" onClick={() => setShowKycModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              backgroundColor: '#fff4cc', margin: '0 auto 16px auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={30} color="#f59e0b" fill="#f59e0b" />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e1b2e' }}>Verify KYC</h2>

            <p style={{ fontSize: '14px', color: '#6c727f', fontWeight: '500', lineHeight: '1.4', margin: '8px 0 24px 0' }}>
              In order to withdraw assets, you need to complete<br />your KYC verification.
            </p>

            <button
              onClick={() => setShowKycForm(true)}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '16px',
                border: '1.5px solid var(--primary-purple)',
                backgroundColor: '#ede7fc',
                color: 'var(--primary-purple)',
                fontSize: '17px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Verify KYC
            </button>
          </div>
        </div>
      )}

      {/* Frontend KYC Submission Form Modal */}
      {showKycForm && (
        <div className="modal-overlay" onClick={() => !isSubmittingKyc && setShowKycForm(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '28px 24px' }}>
            {!kycSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <ShieldCheck size={26} color="var(--primary-purple)" />
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>
                    Complete KYC Verification
                  </h3>
                </div>

                {kycError && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#fee2e2',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    lineHeight: '1.4'
                  }}>
                    {kycError}
                  </div>
                )}

                <form onSubmit={handleSubmitKyc} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>PAN Card Number</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                      value={pan}
                      onChange={(e) => {
                        setPan(e.target.value.toUpperCase());
                        setKycError('');
                      }}
                      maxLength={10}
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>Aadhaar Number</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Enter 12-digit Aadhaar Number"
                      value={aadhar}
                      onChange={(e) => {
                        setAadhar(e.target.value);
                        setKycError('');
                      }}
                      maxLength={14}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowKycForm(false)}
                      disabled={isSubmittingKyc}
                      style={{
                        flex: 1, height: '50px', borderRadius: '14px', border: '1.5px solid var(--primary-purple)',
                        backgroundColor: 'transparent', color: '#1e1b2e', fontSize: '16px', fontWeight: '800', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmittingKyc}
                      style={{ flex: 1.5, height: '50px', fontSize: '16px', cursor: isSubmittingKyc ? 'not-allowed' : 'pointer' }}
                    >
                      {isSubmittingKyc ? 'Submitting...' : 'Submit KYC'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 14px auto' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
                  KYC Submitted Successfully!
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                  Your documents are submitted for review.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal Form */}
      {showWithdrawForm && (
        <div className="modal-overlay" onClick={() => !isSubmittingWithdrawal && setShowWithdrawForm(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '28px 24px' }}>
            {!withdrawSuccess ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b2e', marginBottom: '14px' }}>
                  Withdraw {withdrawAsset}
                </h3>

                {withdrawError && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    {withdrawError}
                  </div>
                )}

                <form onSubmit={handleConfirmWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>
                      Quantity to Withdraw (Gram)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      className="custom-input"
                      placeholder={`Max available: ${(withdrawAsset === 'Gold' ? goldGrams : silverGrams).toFixed(4)} gm`}
                      value={withdrawGrams}
                      onChange={(e) => {
                        setWithdrawGrams(e.target.value);
                        setWithdrawError('');
                      }}
                      disabled={isSubmittingWithdrawal}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowWithdrawForm(false)}
                      disabled={isSubmittingWithdrawal}
                      style={{
                        flex: 1, height: '50px', borderRadius: '14px', border: '1.5px solid var(--primary-purple)',
                        backgroundColor: 'transparent', color: '#1e1b2e', fontSize: '16px', fontWeight: '800', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmittingWithdrawal}
                      style={{ flex: 1.5, height: '50px', fontSize: '16px' }}
                    >
                      {isSubmittingWithdrawal ? 'Submitting...' : 'Request Withdrawal'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={60} color="#2ecc71" style={{ margin: '0 auto 14px auto' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
                  Withdrawal Requested !
                </h3>
                <p style={{ fontSize: '14px', color: '#6c727f', fontWeight: '600' }}>
                  Your request for {createdWithdrawal?.quantity_grams || withdrawGrams} gm of {withdrawAsset} is pending admin approval.
                </p>
                {createdWithdrawal?.transaction_id && (
                  <p style={{ fontSize: '12.5px', color: '#908ba6', fontWeight: '700', marginTop: '6px' }}>
                    Txn ID: {createdWithdrawal.transaction_id}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WithdrawScreen({ onNavigate }) {
  const { currentUser, holdings, goldRate, silverRate, submitKycRequest, requestWithdrawal } = useApp();
  
  // Persistent KYC verification state check
  const isKycVerified = currentUser.kycStatus === 'Verified';

  const [showKycModal, setShowKycModal] = useState(false);
  const [showKycForm, setShowKycForm] = useState(false);
  const [pan, setPan] = useState(currentUser.pan || '');
  const [aadhar, setAadhar] = useState(currentUser.aadhar || '');

  const [withdrawAsset, setWithdrawAsset] = useState('Gold');
  const [withdrawGrams, setWithdrawGrams] = useState('');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleSubmitKyc = (e) => {
    e.preventDefault();
    if (!pan || !aadhar) {
      alert('Please enter both PAN Card and Aadhaar Number.');
      return;
    }
    submitKycRequest({ pan, aadhar });
    setShowKycForm(false);
    setShowKycModal(false);
    alert('KYC Documents submitted successfully! Your status is now Under Review.');
  };

  const handleInitiateWithdraw = (asset) => {
    if (!isKycVerified) {
      setShowKycModal(true);
      return;
    }
    setWithdrawAsset(asset);
    setWithdrawGrams('');
    setShowWithdrawForm(true);
  };

  const handleConfirmWithdrawal = (e) => {
    e.preventDefault();
    const g = parseFloat(withdrawGrams) || 0;
    const maxGrams = withdrawAsset === 'Gold' ? holdings.goldGrams : holdings.silverGrams;

    if (g <= 0 || g > maxGrams) {
      alert(`Please enter a valid gram quantity (Max available: ${maxGrams.toFixed(4)} gm).`);
      return;
    }

    const currentRate = withdrawAsset === 'Gold' ? (goldRate || 13263.65) : (silverRate || 265.00);

    requestWithdrawal({
      asset: withdrawAsset,
      quantity: `${g.toFixed(4)} gm`,
      amount: `₹ ${(g * currentRate).toFixed(2)}`
    });

    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawForm(false);
      onNavigate('transactions');
    }, 1600);
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('profile')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Mode of Withdraw</h2>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content withdraw-cards-container">
        {/* Unified Cards Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Gold Asset Card */}
          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '24px',
            padding: '24px 20px',
            textAlign: 'center',
            border: '1px solid #c9b8fc',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* 1. Asset Name (Centered) */}
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', marginBottom: '8px' }}>
              Gold
            </div>

            {/* 2. Balance Value (Large & Readable) */}
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#1e1b2e', marginBottom: '6px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
              {holdings.goldGrams.toFixed(4)}
            </div>

            {/* 3. "Gram" Pill (Directly below balance) */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 18px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              fontSize: '13.5px',
              fontWeight: '800',
              color: '#33295c',
              marginBottom: '22px'
            }}>
              Gram
            </div>

            {/* 4. Withdraw Action (Centered near lower part of card) */}
            <button
              type="button"
              onClick={() => handleInitiateWithdraw('Gold')}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '16px',
                border: isKycVerified ? 'none' : '1px solid #b2a2e0',
                backgroundColor: isKycVerified ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.5)',
                color: isKycVerified ? '#ffffff' : '#5b5375',
                fontSize: '16px',
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

          {/* Silver Asset Card */}
          <div style={{
            backgroundColor: '#dcd0ff',
            borderRadius: '24px',
            padding: '24px 20px',
            textAlign: 'center',
            border: '1px solid #c9b8fc',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* 1. Asset Name (Centered) */}
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', marginBottom: '8px' }}>
              Silver
            </div>

            {/* 2. Balance Value (Large & Readable) */}
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#1e1b2e', marginBottom: '6px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
              {holdings.silverGrams.toFixed(4)}
            </div>

            {/* 3. "Gram" Pill (Directly below balance) */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 18px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              fontSize: '13.5px',
              fontWeight: '800',
              color: '#33295c',
              marginBottom: '22px'
            }}>
              Gram
            </div>

            {/* 4. Withdraw Action (Centered near lower part of card) */}
            <button
              type="button"
              onClick={() => handleInitiateWithdraw('Silver')}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '16px',
                border: isKycVerified ? 'none' : '1px solid #b2a2e0',
                backgroundColor: isKycVerified ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.5)',
                color: isKycVerified ? '#ffffff' : '#5b5375',
                fontSize: '16px',
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
        </div>
      </main>

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
        <div className="modal-overlay" onClick={() => setShowKycForm(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={26} color="var(--primary-purple)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>
                Complete KYC Verification
              </h3>
            </div>

            <form onSubmit={handleSubmitKyc} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>PAN Card Number</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>Aadhaar Number</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Enter 12-digit Aadhaar Number"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowKycForm(false)}
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
                  style={{ flex: 1.5, height: '50px', fontSize: '16px' }}
                >
                  Submit KYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal Form */}
      {showWithdrawForm && (
        <div className="modal-overlay" onClick={() => setShowWithdrawForm(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '28px 24px' }}>
            {!withdrawSuccess ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b2e', marginBottom: '14px' }}>
                  Withdraw {withdrawAsset}
                </h3>

                <form onSubmit={handleConfirmWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#5b5375', marginBottom: '4px' }}>
                      Quantity to Withdraw (Gram)
                    </label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder={`Max available: ${(withdrawAsset === 'Gold' ? holdings.goldGrams : holdings.silverGrams).toFixed(4)} gm`}
                      value={withdrawGrams}
                      onChange={(e) => setWithdrawGrams(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowWithdrawForm(false)}
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
                      style={{ flex: 1.5, height: '50px', fontSize: '16px' }}
                    >
                      Request Withdrawal
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
                  Your request for {withdrawGrams} gm of {withdrawAsset} is pending admin approval.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

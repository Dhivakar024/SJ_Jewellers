import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WithdrawScreen({ onNavigate }) {
  const { currentUser, holdings, submitKycRequest, requestWithdrawal } = useApp();
  const [showKycModal, setShowKycModal] = useState(currentUser.kycStatus !== 'Verified');
  const [showKycForm, setShowKycForm] = useState(false);
  const [pan, setPan] = useState('');
  const [aadhar, setAadhar] = useState('');

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
    if (currentUser.kycStatus !== 'Verified') {
      setShowKycModal(true);
      return;
    }
    setWithdrawAsset(asset);
    setShowWithdrawForm(true);
  };

  const handleConfirmWithdrawal = (e) => {
    e.preventDefault();
    const g = parseFloat(withdrawGrams) || 0;
    const maxGrams = withdrawAsset === 'Gold' ? holdings.goldGrams : holdings.silverGrams;

    if (g <= 0 || g > maxGrams) {
      alert(`Please enter a valid gram quantity (Max available: ${maxGrams} gm).`);
      return;
    }

    requestWithdrawal({
      asset: withdrawAsset,
      quantity: `${g.toFixed(4)} gm`,
      amount: withdrawAsset === 'Gold' ? `₹ ${(g * 13263.65).toFixed(2)}` : `₹ ${(g * 265.00).toFixed(2)}`
    });

    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawForm(false);
      onNavigate('transactions');
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Header */}
      <div className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Mode of Withdraw</h2>
      </div>

      {/* Content */}
      <div className="screen-content" style={{ padding: '20px 18px', gap: '20px' }}>
        {/* Gold Box */}
        <div style={{
          backgroundColor: '#c4b5fd',
          borderRadius: '22px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #a78bfa'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>Gold</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e1b2e', marginBottom: '8px' }}>
            {holdings.goldGrams.toFixed(4)}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            fontWeight: '700',
            color: '#33295c',
            marginBottom: '20px'
          }}>
            Gram
          </div>
          <button
            onClick={() => handleInitiateWithdraw('Gold')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1e1b2e',
              fontSize: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>↑ Withdraw</span>
          </button>
        </div>

        {/* Silver Box */}
        <div style={{
          backgroundColor: '#c4b5fd',
          borderRadius: '22px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #a78bfa'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>Silver</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e1b2e', marginBottom: '8px' }}>
            {holdings.silverGrams.toFixed(4)}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            fontWeight: '700',
            color: '#33295c',
            marginBottom: '20px'
          }}>
            Gram
          </div>
          <button
            onClick={() => handleInitiateWithdraw('Silver')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1e1b2e',
              fontSize: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>↑ Withdraw</span>
          </button>
        </div>
      </div>

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
              In order to withdraw gold, you need to complete<br />your KYC verification
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
                      placeholder={`Max available: ${withdrawAsset === 'Gold' ? holdings.goldGrams : holdings.silverGrams} gm`}
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

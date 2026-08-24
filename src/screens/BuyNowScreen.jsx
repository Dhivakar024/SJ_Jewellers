import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { purchaseService } from '../services';
import BottomNav from '../components/BottomNav';

export default function BuyNowScreen({ assetType = 'gold', onNavigate, onTogglePlus }) {
  const { goldRate, silverRate, addPurchaseTransaction } = useApp();
  
  // Dynamic Gold / Silver state on the SAME page
  const [selectedAsset, setSelectedAsset] = useState(assetType || 'gold');
  const isGold = selectedAsset === 'gold';
  const ratePerGram = isGold ? goldRate : silverRate;

  const [mode, setMode] = useState('rupees'); // 'rupees' or 'grams'
  
  // Reusable selected quick option state
  const [selectedQuickOption, setSelectedQuickOption] = useState('100');

  // Presets definition
  const rupeesPresets = ['50', '100', '150', '200'];
  const gramsPresets = isGold 
    ? ['0.0050', '0.0100', '0.0200', '0.0500'] 
    : ['1.00', '5.00', '10.00', '25.00'];

  const [rupeesVal, setRupeesVal] = useState('100');
  const [gramsVal, setGramsVal] = useState((100 / ratePerGram).toFixed(4));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseResponse, setPurchaseResponse] = useState(null);

  // Sync prop changes if user enters via direct link
  useEffect(() => {
    if (assetType) {
      setSelectedAsset(assetType);
    }
  }, [assetType]);

  // Recalculate if selectedAsset or ratePerGram changes
  useEffect(() => {
    if (mode === 'rupees') {
      const num = parseFloat(rupeesVal) || 100;
      setGramsVal((num / ratePerGram).toFixed(4));
    } else {
      const gm = parseFloat(gramsVal) || (isGold ? 0.01 : 5);
      setRupeesVal((gm * ratePerGram).toFixed(2));
    }
  }, [selectedAsset, ratePerGram]);

  const handleAssetSwitch = (asset) => {
    setSelectedAsset(asset);
    const newRate = asset === 'gold' ? goldRate : silverRate;
    if (mode === 'rupees') {
      const num = parseFloat(rupeesVal) || 100;
      setGramsVal((num / newRate).toFixed(4));
    } else {
      const defaultGm = asset === 'gold' ? '0.0100' : '5.00';
      setSelectedQuickOption(defaultGm);
      setGramsVal(defaultGm);
      setRupeesVal((parseFloat(defaultGm) * newRate).toFixed(2));
    }
  };

  const handleRupeesChange = (val) => {
    setRupeesVal(val);
    const num = parseFloat(val) || 0;
    setGramsVal((num / ratePerGram).toFixed(4));
    if (rupeesPresets.includes(val)) {
      setSelectedQuickOption(val);
    } else {
      setSelectedQuickOption(null);
    }
  };

  const handleGramsChange = (val) => {
    setGramsVal(val);
    const num = parseFloat(val) || 0;
    setRupeesVal((num * ratePerGram).toFixed(2));
    if (gramsPresets.includes(val)) {
      setSelectedQuickOption(val);
    } else {
      setSelectedQuickOption(null);
    }
  };

  const handleSelectPresetRupees = (amt) => {
    setSelectedQuickOption(amt);
    setRupeesVal(amt);
    const num = parseFloat(amt) || 0;
    setGramsVal((num / ratePerGram).toFixed(4));
  };

  const handleSelectPresetGrams = (gm) => {
    setSelectedQuickOption(gm);
    setGramsVal(gm);
    const num = parseFloat(gm) || 0;
    setRupeesVal((num * ratePerGram).toFixed(2));
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'rupees') {
      const defaultAmt = '100';
      setSelectedQuickOption(defaultAmt);
      setRupeesVal(defaultAmt);
      setGramsVal((parseFloat(defaultAmt) / ratePerGram).toFixed(4));
    } else {
      const defaultGm = isGold ? '0.0100' : '5.00';
      setSelectedQuickOption(defaultGm);
      setGramsVal(defaultGm);
      setRupeesVal((parseFloat(defaultGm) * ratePerGram).toFixed(2));
    }
  };

  // Dynamic GST & Total calculations for preview
  const rawAmount = parseFloat(rupeesVal || '0');
  const gstAmount = rawAmount * 0.03;
  const totalAmountWithGst = rawAmount + gstAmount;

  const handleProceed = () => {
    const gNum = parseFloat(gramsVal);
    if (parseFloat(rupeesVal) <= 0 || !gNum || gNum <= 0) {
      alert('Please enter a valid amount or gram quantity.');
      return;
    }
    if (isGold && gNum < 0.005) {
      alert('Minimum gold purchase quantity is 0.005 grams.');
      return;
    }
    if (!isGold && gNum < 0.1) {
      alert('Minimum silver purchase quantity is 0.1 grams.');
      return;
    }
    setPurchaseError('');
    setShowConfirmModal(true);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handleConfirmPay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPurchaseError('');

    const currentAsset = (selectedAsset || 'gold').toLowerCase() === 'gold' ? 'gold' : 'silver';
    const gramsNumber = parseFloat(gramsVal) || 0;

    try {
      // Create purchase directly on FastAPI backend with server-authoritative rates and GST calculation
      const res = await purchaseService.createPurchase({
        metal: currentAsset,
        quantityGrams: gramsNumber,
      });

      const purchaseData = res?.data;
      if (purchaseData) {
        setPurchaseResponse(purchaseData);
        setPaymentSuccess(true);

        // Update local context for immediate display
        addPurchaseTransaction({
          id: purchaseData.transaction_id || purchaseData.purchase_id,
          assetType: currentAsset,
          asset: currentAsset === 'gold' ? 'Gold' : 'Silver',
          amount: purchaseData.total_amount,
          grams: purchaseData.quantity_grams,
          ratePerGram: purchaseData.rate_per_gram,
          paymentMethod: selectedMethod || 'UPI',
        });

        setTimeout(() => {
          setShowConfirmModal(false);
          onNavigate('transactions');
        }, 1500);
      }
    } catch (err) {
      setPurchaseError(err.message || 'Purchase failed. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header Bar */}
      <header className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Buy Now</h2>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS, with padding for fixed bottom nav) */}
      <main className="app-scroll-content" style={{ padding: '16px 18px 85px 18px' }}>
        
        {/* Gold / Silver Segmented Selector at Top */}
        <div style={{
          backgroundColor: '#f1ecfe',
          borderRadius: '30px',
          padding: '4px',
          display: 'flex',
          margin: '0 auto 16px auto',
          width: '230px'
        }}>
          <button
            type="button"
            onClick={() => handleAssetSwitch('gold')}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: isGold ? 'var(--primary-purple)' : 'transparent',
              color: isGold ? '#ffffff' : '#736d85',
              fontWeight: '700',
              fontSize: '14.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Gold
          </button>
          <button
            type="button"
            onClick={() => handleAssetSwitch('silver')}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: !isGold ? 'var(--primary-purple)' : 'transparent',
              color: !isGold ? '#ffffff' : '#736d85',
              fontWeight: '700',
              fontSize: '14.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Silver
          </button>
        </div>

        {/* Live Rate Header Box with Pill */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: isGold ? '#ffd000' : '#e2e6ea',
              color: '#000',
              fontSize: '11px',
              fontWeight: '900',
              padding: '3px 8px',
              borderRadius: '10px'
            }}>24KT</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e1b2e' }}>
              Live {isGold ? 'Gold' : 'Silver'} Rate
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-purple)' }}>
            ₹ {ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
          </div>
        </div>

        {/* Input Mode Toggle (Buy in Rupees vs Buy in Grams) */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #f0eafc',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => handleSwitchMode('rupees')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: mode === 'rupees' ? '3px solid var(--primary-purple)' : '3px solid transparent',
              color: mode === 'rupees' ? 'var(--primary-purple)' : '#736d85',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Buy in Rupees (₹)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('grams')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: mode === 'grams' ? '3px solid var(--primary-purple)' : '3px solid transparent',
              color: mode === 'grams' ? 'var(--primary-purple)' : '#736d85',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Buy in Grams (gm)
          </button>
        </div>

        {/* Input Display Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 8px 24px rgba(88, 60, 245, 0.06)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '13px', color: '#736d85', fontWeight: '700', marginBottom: '8px' }}>
            {mode === 'rupees' ? 'ENTER AMOUNT (₹)' : 'ENTER QUANTITY (GRAMS)'}
          </div>

          {mode === 'rupees' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e1b2e' }}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rupeesVal}
                  onChange={(e) => handleRupeesChange(e.target.value)}
                  placeholder="0"
                  style={{
                    border: 'none',
                    fontSize: '36px',
                    fontWeight: '900',
                    color: '#1e1b2e',
                    width: '180px',
                    textAlign: 'left',
                    outline: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
              <div style={{ fontSize: '15px', color: 'var(--primary-purple)', fontWeight: '800', marginTop: '6px' }}>
                ≈ {gramsVal} gm {isGold ? 'Gold' : 'Silver'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.0001"
                  value={gramsVal}
                  onChange={(e) => handleGramsChange(e.target.value)}
                  placeholder="0.0000"
                  style={{
                    border: 'none',
                    fontSize: '36px',
                    fontWeight: '900',
                    color: '#1e1b2e',
                    width: '180px',
                    textAlign: 'right',
                    outline: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e' }}>gm</span>
              </div>
              <div style={{ fontSize: '15px', color: 'var(--primary-purple)', fontWeight: '800', marginTop: '6px' }}>
                ≈ ₹ {rupeesVal}
              </div>
            </div>
          )}
        </div>

        {/* Quick Amount / Gram Selectors */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13.5px', color: '#736d85', fontWeight: '700', marginBottom: '10px', paddingLeft: '4px' }}>
            Quick Select
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {mode === 'rupees' ? (
              rupeesPresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPresetRupees(amt)}
                  style={{
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: selectedQuickOption === amt ? '2px solid var(--primary-purple)' : '1px solid #e8e2fa',
                    backgroundColor: selectedQuickOption === amt ? '#f1ecfe' : '#ffffff',
                    color: selectedQuickOption === amt ? 'var(--primary-purple)' : '#1e1b2e',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ₹{amt}
                </button>
              ))
            ) : (
              gramsPresets.map((gm) => (
                <button
                  key={gm}
                  type="button"
                  onClick={() => handleSelectPresetGrams(gm)}
                  style={{
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: selectedQuickOption === gm ? '2px solid var(--primary-purple)' : '1px solid #e8e2fa',
                    backgroundColor: selectedQuickOption === gm ? '#f1ecfe' : '#ffffff',
                    color: selectedQuickOption === gm ? 'var(--primary-purple)' : '#1e1b2e',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {gm}g
                </button>
              ))
            )}
          </div>
        </div>

        {/* GST Notice Box */}
        <div style={{
          backgroundColor: '#f6f2ff',
          borderRadius: '16px',
          padding: '12px 16px',
          border: '1px solid #e2d9fa',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#5b5375',
          lineHeight: '1.4'
        }}>
          <strong>Note:</strong> Standard 3% GST will be calculated at checkout as per Govt. regulations.
        </div>

        {/* Primary Proceed CTA Button */}
        <button
          onClick={handleProceed}
          className="btn-primary"
          style={{ width: '100%', height: '54px', fontSize: '17px' }}
        >
          Proceed to Buy {isGold ? 'Gold' : 'Silver'}
        </button>

      </main>

      {/* 3. Fixed Bottom Nav */}
      <BottomNav
        activeTab="buy"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />

      {/* 4. Payment Confirmation / Bottom Sheet Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowConfirmModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '28px 24px' }}>
            {!paymentSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <ShieldCheck size={26} color="var(--primary-purple)" />
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>
                    Payment Summary
                  </h3>
                </div>

                {purchaseError && (
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
                    {purchaseError}
                  </div>
                )}

                <div style={{
                  backgroundColor: '#f6f2ff',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>Asset</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{isGold ? '24KT Gold' : '24KT Silver'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>Quantity</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{gramsVal} gm</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>Live Rate</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>₹ {ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm</span>
                  </div>

                  {/* 1. Base Amount Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>Amount</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>₹ {rawAmount.toFixed(2)}</span>
                  </div>

                  {/* 2. Dynamic 3% GST Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>GST (3%)</span>
                    <span style={{ fontWeight: '800', color: 'var(--primary-purple)' }}>+ ₹ {gstAmount.toFixed(2)}</span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#e2d9fa', margin: '4px 0' }}></div>

                  {/* 3. Total Amount Row (Amount + 3% GST) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '900', color: '#1e1b2e' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--primary-purple)' }}>₹ {totalAmountWithGst.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#5b5375', marginBottom: '10px' }}>
                    Select Payment Method
                  </div>

                  <div
                    onClick={() => setSelectedMethod('UPI')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: selectedMethod === 'UPI' ? '2px solid var(--primary-purple)' : '1px solid #dcd4fa',
                      backgroundColor: selectedMethod === 'UPI' ? '#f6f2ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Smartphone size={22} color="var(--primary-purple)" />
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b2e' }}>UPI Payment</div>
                        <div style={{ fontSize: '12px', color: '#6c727f' }}>Google Pay, PhonePe, Paytm</div>
                      </div>
                    </div>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: selectedMethod === 'UPI' ? '6px solid var(--primary-purple)' : '2px solid #a49bbd'
                    }}></div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPay}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{ width: '100%', height: '52px', fontSize: '16px' }}
                >
                  {isProcessing ? 'Processing Payment...' : `Pay ₹ ${totalAmountWithGst.toFixed(2)}`}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={64} color="#2ecc71" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e', marginBottom: '8px' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontSize: '15px', color: '#6c727f', fontWeight: '600' }}>
                  You have successfully purchased {purchaseResponse?.quantity_grams || gramsVal} gm of {isGold ? 'Gold' : 'Silver'}.
                </p>
                {purchaseResponse?.transaction_id && (
                  <p style={{ fontSize: '13px', color: '#908ba6', fontWeight: '700', marginTop: '6px' }}>
                    Transaction ID: {purchaseResponse.transaction_id}
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

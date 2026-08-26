import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function BuyNowScreen({ assetType = 'gold', onNavigate, onTogglePlus }) {
  const { goldRate, silverRate, addPurchaseTransaction, buyNowState, setBuyNowState } = useApp();
  
  // Dynamic Gold / Silver state on the SAME page
  const [selectedAsset, setSelectedAsset] = useState(() => buyNowState?.assetType || assetType || 'gold');
  const isGold = selectedAsset === 'gold';
  const ratePerGram = isGold ? goldRate : silverRate;

  const [mode, setMode] = useState(() => buyNowState?.mode || 'rupees'); // 'rupees' or 'grams'
  
  // Reusable selected quick option state
  const [selectedQuickOption, setSelectedQuickOption] = useState(() => buyNowState?.selectedQuickOption || '100');

  // Presets definition
  const rupeesPresets = ['50', '100', '150', '200'];
  const gramsPresets = isGold 
    ? ['0.0050', '0.0100', '0.0200', '0.0500'] 
    : ['1.00', '5.00', '10.00', '25.00'];

  const [rupeesVal, setRupeesVal] = useState(() => buyNowState?.rupeesVal || '100');
  const [gramsVal, setGramsVal] = useState(() => buyNowState?.gramsVal || (100 / ratePerGram).toFixed(4));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseResponse, setPurchaseResponse] = useState(null);

  // Sync state back to context for complete preservation when navigating away and back
  useEffect(() => {
    if (typeof setBuyNowState === 'function') {
      setBuyNowState({
        assetType: selectedAsset,
        mode,
        rupeesVal,
        gramsVal,
        selectedQuickOption,
      });
    }
  }, [selectedAsset, mode, rupeesVal, gramsVal, selectedQuickOption, setBuyNowState]);

  // Sync prop changes if user enters via direct link with different asset
  useEffect(() => {
    if (assetType && assetType !== selectedAsset && !buyNowState?.assetType) {
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
    if (isGold && gNum < 0.001) {
      alert('Minimum gold purchase quantity is 0.001 grams.');
      return;
    }
    if (!isGold && gNum < 0.01) {
      alert('Minimum silver purchase quantity is 0.01 grams.');
      return;
    }
    setPurchaseError('');
    setShowConfirmModal(true);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handleConfirmPay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPurchaseError('');

    const currentAsset = (selectedAsset || 'gold').toLowerCase() === 'gold' ? 'gold' : 'silver';
    const gramsNumber = parseFloat(gramsVal) || 0;
    const metalVal = gramsNumber * ratePerGram;
    const gstVal = parseFloat((metalVal * 0.03).toFixed(2));
    const totalVal = parseFloat((metalVal + gstVal).toFixed(2));

    setTimeout(() => {
      // Update local context for immediate display
      const newTxn = addPurchaseTransaction({
        assetType: currentAsset,
        asset: currentAsset === 'gold' ? 'Gold' : 'Silver',
        amount: totalVal,
        grams: gramsNumber,
        ratePerGram: ratePerGram,
        paymentMethod: selectedMethod || 'UPI',
      });

      setPurchaseResponse({
        transaction_id: newTxn.id,
        quantity_grams: gramsNumber,
        metal_value: metalVal,
        gst_amount: gstVal,
        total_amount: totalVal,
      });

      setPaymentSuccess(true);
      setIsProcessing(false);

      setTimeout(() => {
        setShowConfirmModal(false);
        onNavigate('transactions', { from: 'buy' });
      }, 1400);
    }, 500);
  };

  return (
    <div className="app-screen-layout" style={{ backgroundColor: '#eee7ff' }}>
      {/* 1. Header Matching Screenshot */}
      <header
        style={{
          backgroundColor: '#583cf5',
          padding: '16px 18px 20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexShrink: 0
        }}
      >
        <button
          onClick={() => onNavigate('home')}
          aria-label="Back"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '13px',
            backgroundColor: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e1b2e',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} color="#1e1b2e" />
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
          Buy Now
        </h1>
      </header>

      {/* 2. Scrollable Content Area */}
      <main
        className="app-scroll-content"
        style={{
          padding: '20px 18px 95px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          backgroundColor: '#eee7ff'
        }}
      >
        {/* Live Gold/Silver Rate Card */}
        <div
          style={{
            backgroundColor: '#ded4fc',
            borderRadius: '24px',
            padding: '24px 18px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(88, 60, 245, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isGold ? '#ffd000' : '#c0c5cb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isGold ? '0 2px 6px rgba(255, 208, 0, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={isGold ? '#f59e0b' : '#94a3b8'} />
                <path d="M12 6v12M9 9h6M9 15h6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: '17px', fontWeight: '800', color: '#1e1b2e' }}>
              {isGold ? 'Gold Price' : 'Silver Price'}
            </span>
          </div>

          <div
            style={{
              fontSize: '30px',
              fontWeight: '900',
              color: '#583cf5',
              marginTop: '4px',
              letterSpacing: '-0.5px'
            }}
          >
            ₹{ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / gm
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#736d85', marginTop: '2px' }}>
            + 3% GST
          </div>
        </div>

        {/* Section Heading */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '900',
            color: '#1e1b2e',
            textAlign: 'center',
            margin: '4px 0 0 0'
          }}
        >
          Buy Your Assets
        </h2>

        {/* Buy Mode Selector Pills */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {/* Buy in Rupees Option */}
          <div
            onClick={() => handleSwitchMode('rupees')}
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: mode === 'rupees' ? '0 4px 14px rgba(88, 60, 245, 0.08)' : 'none',
              border: mode === 'rupees' ? '1.5px solid #583cf5' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: mode === 'rupees' ? '6px solid #583cf5' : '2px solid #b7a9ff',
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b2e' }}>
              Buy in Rupees
            </span>
          </div>

          {/* Buy in Grams Option */}
          <div
            onClick={() => handleSwitchMode('grams')}
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: mode === 'grams' ? '0 4px 14px rgba(88, 60, 245, 0.08)' : 'none',
              border: mode === 'grams' ? '1.5px solid #583cf5' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: mode === 'grams' ? '6px solid #583cf5' : '2px solid #b7a9ff',
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b2e' }}>
              Buy in Grams
            </span>
          </div>
        </div>

        {/* Amount & Quantity Combined Input Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '2px solid #583cf5',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 6px 18px rgba(88, 60, 245, 0.08)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {mode === 'rupees' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e' }}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rupeesVal}
                  onChange={(e) => handleRupeesChange(e.target.value)}
                  placeholder="0"
                  style={{
                    border: 'none',
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#1e1b2e',
                    width: '100%',
                    maxWidth: '120px',
                    outline: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
              <div style={{ fontSize: '19px', fontWeight: '900', color: '#1e1b2e', whiteSpace: 'nowrap' }}>
                {gramsVal} <span style={{ fontSize: '16px', fontWeight: '700', color: '#736d85' }}>gm</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.0001"
                  value={gramsVal}
                  onChange={(e) => handleGramsChange(e.target.value)}
                  placeholder="0.0000"
                  style={{
                    border: 'none',
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#1e1b2e',
                    width: '100%',
                    maxWidth: '120px',
                    outline: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#736d85' }}>gm</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e1b2e', whiteSpace: 'nowrap' }}>
                ₹ {rupeesVal}
              </div>
            </>
          )}
        </div>

        {/* Quick Amount / Gram Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
          {mode === 'rupees' ? (
            rupeesPresets.map((amt) => {
              const isSelected = selectedQuickOption === amt;
              const isPopular = amt === '200';
              return (
                <div key={amt} style={{ position: 'relative' }}>
                  {isPopular && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-3px',
                        backgroundColor: '#ffd000',
                        color: '#000000',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        zIndex: 2,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                      }}
                    >
                      Popular
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectPresetRupees(amt)}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: '16px',
                      border: isSelected ? 'none' : '1.5px solid #a38cfb',
                      backgroundColor: isSelected ? '#583cf5' : '#ede7fc',
                      color: isSelected ? '#ffffff' : '#583cf5',
                      fontWeight: '900',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(88, 60, 245, 0.4)' : 'none'
                    }}
                  >
                    ₹ {amt}
                  </button>
                </div>
              );
            })
          ) : (
            gramsPresets.map((gm, idx) => {
              const isSelected = selectedQuickOption === gm;
              const isPopular = idx === 3;
              return (
                <div key={gm} style={{ position: 'relative' }}>
                  {isPopular && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-3px',
                        backgroundColor: '#ffd000',
                        color: '#000000',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        zIndex: 2,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                      }}
                    >
                      Popular
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectPresetGrams(gm)}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: '16px',
                      border: isSelected ? 'none' : '1.5px solid #a38cfb',
                      backgroundColor: isSelected ? '#583cf5' : '#ede7fc',
                      color: isSelected ? '#ffffff' : '#583cf5',
                      fontWeight: '900',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(88, 60, 245, 0.4)' : 'none'
                    }}
                  >
                    {gm}g
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Big Primary Proceed CTA Button */}
        <button
          onClick={handleProceed}
          style={{
            width: '100%',
            height: '54px',
            backgroundColor: '#583cf5',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '800',
            borderRadius: '18px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(88, 60, 245, 0.35)',
            marginTop: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          Proceed
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
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #ef4444',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}
                  >
                    {purchaseError}
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: '#f6f2ff',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
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

                  {/* Base Amount Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>Amount</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>₹ {rawAmount.toFixed(2)}</span>
                  </div>

                  {/* Dynamic 3% GST Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5b5375', fontWeight: '600' }}>
                    <span>GST (3%)</span>
                    <span style={{ fontWeight: '800', color: 'var(--primary-purple)' }}>+ ₹ {gstAmount.toFixed(2)}</span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#e2d9fa', margin: '4px 0' }}></div>

                  {/* Total Amount Row (Amount + 3% GST) */}
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
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: selectedMethod === 'UPI' ? '6px solid var(--primary-purple)' : '2px solid #a49bbd'
                      }}
                    ></div>
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

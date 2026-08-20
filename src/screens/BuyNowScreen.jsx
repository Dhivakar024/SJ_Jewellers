import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
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

  // Dynamic GST & Total calculations
  const rawAmount = parseFloat(rupeesVal || '0');
  const gstAmount = rawAmount * 0.03;
  const totalAmountWithGst = rawAmount + gstAmount;

  const handleProceed = () => {
    if (parseFloat(rupeesVal) <= 0 || parseFloat(gramsVal) <= 0) {
      alert('Please enter a valid amount or gram quantity.');
      return;
    }
    setShowConfirmModal(true);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handleConfirmPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      const currentAsset = (selectedAsset || 'gold').toLowerCase() === 'gold' ? 'gold' : 'silver';
      const currentRate = currentAsset === 'gold' ? goldRate : silverRate;
      const gramsNumber = parseFloat(gramsVal) || 0;
      const amountNumber = parseFloat(totalAmountWithGst.toFixed(2)) || 0;

      // Update global context state with exact selected asset & grams
      addPurchaseTransaction({
        assetType: currentAsset,
        asset: currentAsset === 'gold' ? 'Gold' : 'Silver',
        amount: amountNumber,
        grams: gramsNumber,
        ratePerGram: currentRate,
        paymentMethod: selectedMethod || 'UPI'
      });

      setTimeout(() => {
        setShowConfirmModal(false);
        onNavigate('transactions');
      }, 1500);
    }, 1000);
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

        {/* Live Price Box */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '18px 20px',
          textAlign: 'center',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: isGold ? '#ffd000' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '15px' }}>{isGold ? '🪙' : '🥈'}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#33295c' }}>
              {isGold ? '24KT Gold Price' : '24KT Silver Price'}
            </span>
          </div>

          <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary-purple)', margin: '4px 0' }}>
            ₹{ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / gm
          </div>

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#685d8a' }}>
            + 3% GST
          </div>
        </div>

        {/* Section Heading */}
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)', margin: '20px 0 14px 0' }}>
          Buy Your Assets
        </h3>

        {/* Radio Pill Selector */}
        <div style={{
          backgroundColor: '#f1ecfe',
          borderRadius: '16px',
          padding: '6px',
          display: 'flex',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => handleSwitchMode('rupees')}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: mode === 'rupees' ? '#ffffff' : 'transparent',
              color: 'var(--text-dark)',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: mode === 'rupees' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: mode === 'rupees' ? '6px solid var(--primary-purple)' : '2px solid #a49bbd'
            }}></div>
            <span>Buy in Rupees</span>
          </button>

          <button
            onClick={() => handleSwitchMode('grams')}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: mode === 'grams' ? '#ffffff' : 'transparent',
              color: 'var(--text-dark)',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: mode === 'grams' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: mode === 'grams' ? '6px solid var(--primary-purple)' : '2px solid #a49bbd'
            }}></div>
            <span>Buy in Grams</span>
          </button>
        </div>

        {/* Input Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '2px solid var(--primary-purple)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1c1829' }}>₹</span>
            <input
              type="text"
              value={rupeesVal}
              onChange={(e) => handleRupeesChange(e.target.value)}
              style={{
                width: '110px',
                border: 'none',
                outline: 'none',
                fontSize: '22px',
                fontWeight: '900',
                color: '#1c1829',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={gramsVal}
              onChange={(e) => handleGramsChange(e.target.value)}
              style={{
                width: '90px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontWeight: '700',
                color: '#1c1829',
                textAlign: 'right',
                backgroundColor: 'transparent'
              }}
            />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#706987' }}>gm</span>
          </div>
        </div>

        {/* Quick Amount Preset Chips */}
        {mode === 'rupees' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {rupeesPresets.map((amt) => {
              const isSelected = selectedQuickOption === amt;
              return (
                <div key={amt} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetRupees(amt)}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '14px',
                      border: isSelected ? '1.5px solid var(--primary-purple)' : '1px solid var(--primary-purple)',
                      backgroundColor: isSelected ? 'var(--primary-purple)' : '#ede7fc',
                      color: isSelected ? '#ffffff' : 'var(--primary-purple)',
                      fontSize: '15px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 14px rgba(88, 60, 245, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ₹ {amt}
                  </button>
                  {amt === '200' && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-4px',
                      backgroundColor: '#ffd000',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: '900',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      pointerEvents: 'none'
                    }}>
                      Popular
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {gramsPresets.map((gm, idx) => {
              const isSelected = selectedQuickOption === gm;
              return (
                <div key={gm} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetGrams(gm)}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '14px',
                      border: isSelected ? '1.5px solid var(--primary-purple)' : '1px solid var(--primary-purple)',
                      backgroundColor: isSelected ? 'var(--primary-purple)' : '#ede7fc',
                      color: isSelected ? '#ffffff' : 'var(--primary-purple)',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 14px rgba(88, 60, 245, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: '1.2'
                    }}
                  >
                    <span>{gm}</span>
                    <span style={{ fontSize: '11px', opacity: 0.9 }}>gm</span>
                  </button>
                  {idx === gramsPresets.length - 1 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-4px',
                      backgroundColor: '#ffd000',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: '900',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      pointerEvents: 'none'
                    }}>
                      Popular
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Large Proceed Button */}
        <button
          onClick={handleProceed}
          className="btn-primary"
          style={{
            marginTop: '6px',
            marginBottom: '10px',
            boxShadow: '0 6px 18px rgba(88, 60, 245, 0.35)'
          }}
        >
          Proceed
        </button>
      </main>

      {/* 3. Fixed Bottom Navigation Bar (Active Tab = 'buy') */}
      <BottomNav
        activeTab="buy"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />

      {/* 4. Mock Payment Gateway Modal Step with Dynamic 3% GST */}
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
                    <span>Order ID</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>

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
                  You have successfully purchased {gramsVal} gm of {isGold ? 'Gold' : 'Silver'}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

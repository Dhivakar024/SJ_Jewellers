import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function BuyNowScreen({ assetType = 'gold', onNavigate, onTogglePlus }) {
  const { goldRate, silverRate, addPurchaseTransaction } = useApp();
  const isGold = assetType === 'gold';
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

  // Recalculate if assetType or ratePerGram changes
  useEffect(() => {
    if (mode === 'rupees') {
      const num = parseFloat(rupeesVal) || 100;
      setGramsVal((num / ratePerGram).toFixed(4));
    } else {
      const gm = parseFloat(gramsVal) || (isGold ? 0.01 : 5);
      setRupeesVal((gm * ratePerGram).toFixed(2));
    }
  }, [assetType, ratePerGram]);

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
      
      // Update global context state
      addPurchaseTransaction({
        asset: isGold ? 'Gold' : 'Silver',
        amount: rupeesVal,
        quantity: `${gramsVal}g`,
        paymentMethod: 'UPI'
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
      <main className="app-scroll-content" style={{ padding: '20px 18px 85px 18px' }}>
        {/* Live Price Box */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: isGold ? '#ffd000' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '15px' }}>{isGold ? '🪙' : '🥈'}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#33295c' }}>
              {isGold ? 'Gold Price' : 'Silver Price'}
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
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)', margin: '24px 0 16px 0' }}>
          Buy Your Assets
        </h3>

        {/* Radio Pill Selector */}
        <div style={{
          backgroundColor: '#f1ecfe',
          borderRadius: '16px',
          padding: '6px',
          display: 'flex',
          gap: '8px',
          marginBottom: '24px'
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
          marginBottom: '24px'
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

        {/* Quick Amount Preset Chips (Highlighted with Proceed button purple when selected) */}
        {mode === 'rupees' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '28px'
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
            marginBottom: '28px'
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

      {/* 4. Mock Payment Gateway Modal Step */}
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
                    <span>Amount</span>
                    <span style={{ fontWeight: '800', color: '#1e1b2e' }}>₹ {rupeesVal}</span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#dcd4fa', margin: '4px 0' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
                    <span style={{ color: '#1e1b2e' }}>Total Amount</span>
                    <span style={{ color: 'var(--primary-purple)', fontSize: '20px' }}>
                      ₹ {parseFloat(rupeesVal || '0').toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Section (UPI / GooglePay / PhonePe only) */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e1b2e', marginBottom: '10px' }}>
                    Select Payment Method
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '13px 16px',
                      borderRadius: '14px',
                      border: '2px solid var(--primary-purple)',
                      backgroundColor: '#f3eeff',
                      cursor: 'default'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '14px', color: '#1e1b2e' }}>
                      <Smartphone size={20} color="var(--primary-purple)" />
                      <span>UPI / GooglePay / PhonePe</span>
                    </div>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: '6px solid var(--primary-purple)'
                    }}></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    disabled={isProcessing}
                    onClick={() => setShowConfirmModal(false)}
                    style={{
                      flex: 1,
                      height: '52px',
                      borderRadius: '14px',
                      border: '1.5px solid var(--primary-purple)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-dark)',
                      fontSize: '16px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPay}
                    className="btn-primary"
                    style={{ flex: 1.5, height: '52px', fontSize: '16px' }}
                  >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={64} color="#2ecc71" style={{ margin: '0 auto 14px auto' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e', marginBottom: '6px' }}>
                  Payment Successful !
                </h3>
                <p style={{ fontSize: '15px', color: '#5b5375', fontWeight: '700', marginBottom: '16px' }}>
                  Purchased {gramsVal} gm of {isGold ? 'Gold' : 'Silver'} for ₹ {rupeesVal}
                </p>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#e6f7ef',
                  color: '#059669',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '800'
                }}>
                  Added to Your Holdings
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

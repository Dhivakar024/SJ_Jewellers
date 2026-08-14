import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function BuyNowScreen({ assetType = 'gold', onNavigate, onTogglePlus }) {
  const { goldRate, silverRate, addPurchaseTransaction } = useApp();
  const isGold = assetType === 'gold';
  const ratePerGram = isGold ? goldRate : silverRate;

  const [mode, setMode] = useState('rupees'); // 'rupees' or 'grams'
  const [rupeesVal, setRupeesVal] = useState('2000');
  const [gramsVal, setGramsVal] = useState(isGold ? (2000 / goldRate).toFixed(4) : (2000 / silverRate).toFixed(4));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleRupeesChange = (val) => {
    setRupeesVal(val);
    const num = parseFloat(val) || 0;
    setGramsVal((num / ratePerGram).toFixed(4));
  };

  const handleGramsChange = (val) => {
    setGramsVal(val);
    const num = parseFloat(val) || 0;
    setRupeesVal((num * ratePerGram).toFixed(2));
  };

  const handleSelectPresetRupees = (amt) => {
    handleRupeesChange(amt.toString());
  };

  const handleSelectPresetGrams = (gm) => {
    handleGramsChange(gm.toString());
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
        asset: assetType,
        amount: rupeesVal,
        grams: gramsVal,
        paymentMethod: selectedMethod
      });

      setTimeout(() => {
        setShowConfirmModal(false);
        onNavigate('transactions');
      }, 1800);
    }, 1200);
  };

  const rupeesPresets = ['50', '100', '150'];
  const gramsPresets = isGold 
    ? ['0.0038', '0.0075', '0.0113'] 
    : ['0.1887', '0.3774', '0.5660'];

  const popularGrams = isGold ? '0.0151' : '0.7547';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Header Bar */}
      <div className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Buy Now</h2>
      </div>

      {/* Screen Content */}
      <div className="screen-content" style={{ padding: '20px 18px 30px 18px' }}>
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
            onClick={() => { setMode('rupees'); handleRupeesChange('2000'); }}
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
            onClick={() => { setMode('grams'); handleGramsChange(isGold ? '0.1508' : '7.5472'); }}
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
                width: '80px',
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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {rupeesPresets.map((amt) => (
              <button
                key={amt}
                onClick={() => handleSelectPresetRupees(amt)}
                style={{
                  flex: 1,
                  height: '52px',
                  borderRadius: '16px',
                  border: '1px solid var(--primary-purple)',
                  backgroundColor: '#ede7fc',
                  color: 'var(--primary-purple)',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ₹ {amt}
              </button>
            ))}

            {/* Popular 200 Chip */}
            <div style={{ width: '100%', marginTop: '4px' }}>
              <div style={{ position: 'relative', width: '140px' }}>
                <button
                  onClick={() => handleSelectPresetRupees('200')}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '16px',
                    border: '1px solid var(--primary-purple)',
                    backgroundColor: '#ede7fc',
                    color: 'var(--primary-purple)',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ₹ 200
                </button>
                <span style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ffd000',
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  Popular
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {gramsPresets.map((gm) => (
              <button
                key={gm}
                onClick={() => handleSelectPresetGrams(gm)}
                style={{
                  flex: 1,
                  height: '54px',
                  borderRadius: '16px',
                  border: '1px solid var(--primary-purple)',
                  backgroundColor: '#ede7fc',
                  color: 'var(--primary-purple)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {gm}<br /><span style={{ fontSize: '11px', fontWeight: '600' }}>gm</span>
              </button>
            ))}

            {/* Popular Grams Chip */}
            <div style={{ width: '100%', marginTop: '4px' }}>
              <div style={{ position: 'relative', width: '140px' }}>
                <button
                  onClick={() => handleSelectPresetGrams(popularGrams)}
                  style={{
                    width: '100%',
                    height: '54px',
                    borderRadius: '16px',
                    border: '1px solid var(--primary-purple)',
                    backgroundColor: '#ede7fc',
                    color: 'var(--primary-purple)',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {popularGrams} gm
                </button>
                <span style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ffd000',
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  Popular
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Large Proceed Button near bottom of content area */}
        <button
          onClick={handleProceed}
          className="btn-primary"
          style={{
            marginTop: '20px',
            marginBottom: '10px',
            boxShadow: '0 6px 18px rgba(88, 60, 245, 0.35)'
          }}
        >
          Proceed
        </button>
      </div>

      {/* Mock Payment Gateway Modal Step */}
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

                {/* Payment Method Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e1b2e', marginBottom: '10px' }}>
                    Select Payment Method
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'UPI', label: 'UPI / GooglePay / PhonePe', icon: <Smartphone size={18} /> },
                      { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                      { id: 'NetBanking', label: 'Net Banking', icon: <Building2 size={18} /> }
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '14px',
                          border: selectedMethod === m.id ? '2px solid var(--primary-purple)' : '1px solid #dcd4fa',
                          backgroundColor: selectedMethod === m.id ? '#f3eeff' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '14px', color: '#1e1b2e' }}>
                          {m.icon}
                          <span>{m.label}</span>
                        </div>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: selectedMethod === m.id ? '6px solid var(--primary-purple)' : '2px solid #a49bbd'
                        }}></div>
                      </div>
                    ))}
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
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '800'
                }}>
                  Holdings & Transactions Updated
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="buy"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

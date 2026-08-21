import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AdminRates() {
  const { 
    goldRate, 
    silverRate, 
    isGoldCustom, 
    isSilverCustom, 
    customGoldInput, 
    customSilverInput, 
    saveRates 
  } = useApp() || {};

  const [goldCustom, setGoldCustom] = useState(Boolean(isGoldCustom));
  const [silverCustom, setSilverCustom] = useState(Boolean(isSilverCustom));
  const [goldInput, setGoldInput] = useState(customGoldInput || (goldRate ? goldRate.toString() : ''));
  const [silverInput, setSilverInput] = useState(customSilverInput || (silverRate ? silverRate.toString() : ''));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const gVal = parseFloat(goldInput) || goldRate;
    const sVal = parseFloat(silverInput) || silverRate;

    if (typeof saveRates === 'function') {
      saveRates({
        newGoldRate: gVal,
        newSilverRate: sVal,
        goldCustom,
        silverCustom,
        goldInputVal: goldInput,
        silverInputVal: silverInput
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Rates</h1>
        <p className="admin-page-sub">
          Set custom gold and silver rates (₹/gram). Custom rate must be at least the current API rate.
        </p>
      </div>

      {/* 2. Rates Configuration Card */}
      <div className="admin-card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Gold Rate Input Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Gold Indicator & Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#fef3c7',
                    color: '#D4A017',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 1px 3px rgba(212, 160, 23, 0.2)',
                    flexShrink: 0
                  }}>
                    $
                  </div>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--admin-text-main-light)', margin: 0, display: 'block', lineHeight: 1.2 }}>
                      Gold
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted-light)' }}>
                      Current API: ₹{(goldRate || 13818.88).toLocaleString('en-IN')}/g
                    </span>
                  </div>
                </div>
                
                {/* Larger API / Custom Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span style={{
                    fontWeight: !goldCustom ? '700' : '500',
                    color: !goldCustom ? 'var(--admin-text-main-light)' : 'var(--admin-text-muted-light)'
                  }}>
                    API
                  </span>

                  <div
                    onClick={() => setGoldCustom(!goldCustom)}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle custom gold rate"
                    style={{
                      width: '46px',
                      height: '26px',
                      backgroundColor: goldCustom ? '#10b981' : '#cbd5e1',
                      borderRadius: '14px',
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transform: goldCustom ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>

                  <span style={{
                    fontWeight: goldCustom ? '700' : '500',
                    color: goldCustom ? 'var(--admin-text-main-light)' : 'var(--admin-text-muted-light)'
                  }}>
                    Custom
                  </span>
                </div>
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 13850.00"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                className="admin-input"
                style={{ height: '44px', fontSize: '15px', fontWeight: '600' }}
              />
            </div>

            {/* Silver Rate Input Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Silver Indicator & Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 1px 3px rgba(100, 116, 139, 0.2)',
                    flexShrink: 0
                  }}>
                    $
                  </div>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--admin-text-main-light)', margin: 0, display: 'block', lineHeight: 1.2 }}>
                      Silver
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted-light)' }}>
                      Current API: ₹{(silverRate || 206.17).toLocaleString('en-IN')}/g
                    </span>
                  </div>
                </div>
                
                {/* Larger API / Custom Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span style={{
                    fontWeight: !silverCustom ? '700' : '500',
                    color: !silverCustom ? 'var(--admin-text-main-light)' : 'var(--admin-text-muted-light)'
                  }}>
                    API
                  </span>

                  <div
                    onClick={() => setSilverCustom(!silverCustom)}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle custom silver rate"
                    style={{
                      width: '46px',
                      height: '26px',
                      backgroundColor: silverCustom ? '#10b981' : '#cbd5e1',
                      borderRadius: '14px',
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transform: silverCustom ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>

                  <span style={{
                    fontWeight: silverCustom ? '700' : '500',
                    color: silverCustom ? 'var(--admin-text-main-light)' : 'var(--admin-text-muted-light)'
                  }}>
                    Custom
                  </span>
                </div>
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 210.00"
                value={silverInput}
                onChange={(e) => setSilverInput(e.target.value)}
                className="admin-input"
                style={{ height: '44px', fontSize: '15px', fontWeight: '600' }}
              />
            </div>
          </div>

          {/* Save Button & Note */}
          <div style={{ borderTop: '1px solid var(--admin-border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button type="submit" className="admin-btn-orange" style={{ padding: '10px 24px', fontSize: '14.5px' }}>
                Save Rates
              </button>
              {savedSuccess && (
                <span style={{ fontSize: '13.5px', color: '#10b981', fontWeight: '700' }}>
                  ✓ Rates saved & updated across the portal!
                </span>
              )}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--admin-text-muted-light)' }}>
              Custom rates remain active until today 11:59 PM, after which they will automatically revert to live API rates.
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}

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
  } = useApp();

  const [goldCustom, setGoldCustom] = useState(isGoldCustom);
  const [silverCustom, setSilverCustom] = useState(isSilverCustom);
  const [goldInput, setGoldInput] = useState(customGoldInput || goldRate.toString());
  const [silverInput, setSilverInput] = useState(customSilverInput || silverRate.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const gVal = parseFloat(goldInput) || goldRate;
    const sVal = parseFloat(silverInput) || silverRate;

    saveRates({
      newGoldRate: gVal,
      newSilverRate: sVal,
      goldCustom,
      silverCustom,
      goldInputVal: goldInput,
      silverInputVal: silverInput
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Rates</h1>
        <p className="admin-page-sub">
          Set custom gold and silver rates (₹/gram). Custom rate must be at least the current API rate.
        </p>
      </div>

      {/* 2. Rates Configuration Card */}
      <div className="admin-card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Gold Rate Input */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--admin-text-main-light)' }}>Gold</label>
                
                {/* API / Custom Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <span style={{ fontWeight: !goldCustom ? '700' : '400', color: !goldCustom ? 'var(--admin-text-main-light)' : '#6b7280' }}>API</span>
                  <div
                    onClick={() => setGoldCustom(!goldCustom)}
                    style={{
                      width: '36px',
                      height: '20px',
                      backgroundColor: goldCustom ? '#10b981' : '#cbd5e1',
                      borderRadius: '12px',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transform: goldCustom ? 'translateX(16px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: goldCustom ? '700' : '400', color: goldCustom ? 'var(--admin-text-main-light)' : '#6b7280' }}>Custom</span>
                </div>
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 6500"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                className="admin-input"
              />
            </div>

            {/* Silver Rate Input */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--admin-text-main-light)' }}>Silver</label>
                
                {/* API / Custom Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <span style={{ fontWeight: !silverCustom ? '700' : '400', color: !silverCustom ? 'var(--admin-text-main-light)' : '#6b7280' }}>API</span>
                  <div
                    onClick={() => setSilverCustom(!silverCustom)}
                    style={{
                      width: '36px',
                      height: '20px',
                      backgroundColor: silverCustom ? '#10b981' : '#cbd5e1',
                      borderRadius: '12px',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transform: silverCustom ? 'translateX(16px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: silverCustom ? '700' : '400', color: silverCustom ? 'var(--admin-text-main-light)' : '#6b7280' }}>Custom</span>
                </div>
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 85"
                value={silverInput}
                onChange={(e) => setSilverInput(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          {/* Save Button & Note */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="submit" className="admin-btn-orange">
                Save
              </button>
              {savedSuccess && (
                <span style={{ fontSize: '12.5px', color: '#10b981', fontWeight: '700' }}>
                  Rates saved & updated in customer app!
                </span>
              )}
            </div>

            <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '10px' }}>
              Custom rates are valid until today 11:59 PM. After that they will reset to API.
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}

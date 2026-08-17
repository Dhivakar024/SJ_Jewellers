import React, { useState } from 'react';
import { Coins, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ratesService } from '../services/ratesService';

export default function AdminRates() {
  const { goldRate, setGoldRate, silverRate, setSilverRate } = useApp();
  const [goldInput, setGoldInput] = useState(goldRate.toString());
  const [silverInput, setSilverInput] = useState(silverRate.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    const gNum = parseFloat(goldInput) || 13263.65;
    const sNum = parseFloat(silverInput) || 265.00;

    await ratesService.saveRates({ goldRate: gNum, silverRate: sNum });
    setGoldRate(gNum);
    setSilverRate(sNum);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleResetDefaults = () => {
    setGoldInput('13263.65');
    setSilverInput('265.00');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Live Rates Preview Banner */}
      <div style={{
        backgroundColor: '#dcd0ff',
        borderRadius: '22px',
        padding: '20px',
        border: '1px solid #c9b8fc',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Coins size={22} color="var(--primary-purple)" />
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#33295c' }}>
            Current Live Rates
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#685d8a' }}>24KT Gold / gm</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary-purple)' }}>
              ₹ {goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: '#bca9f7' }}></div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#685d8a' }}>Silver / gm</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary-purple)' }}>
              ₹ {silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#065f46',
          fontSize: '13.5px',
          fontWeight: '700'
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>Asset rates updated successfully across the app!</span>
        </div>
      )}

      {/* Editable Form Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '22px 20px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
          Update Daily Asset Rates
        </h4>

        <form onSubmit={handleSaveRates} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Gold Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#2c2642', marginBottom: '6px' }}>
              24KT Gold Rate (₹ / Gram)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '18px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                className="profile-custom-input"
                style={{ paddingLeft: '36px', fontSize: '16px', fontWeight: '800', color: '#1e1b2e' }}
              />
            </div>
          </div>

          {/* Silver Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#2c2642', marginBottom: '6px' }}>
              Silver Rate (₹ / Gram)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '18px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                value={silverInput}
                onChange={(e) => setSilverInput(e.target.value)}
                className="profile-custom-input"
                style={{ paddingLeft: '36px', fontSize: '16px', fontWeight: '800', color: '#1e1b2e' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                flex: 1,
                height: '50px',
                borderRadius: '16px',
                border: '1.5px solid var(--primary-purple)',
                backgroundColor: 'transparent',
                color: 'var(--primary-purple)',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 1.5,
                height: '50px',
                fontSize: '15px',
                fontWeight: '800',
                boxShadow: '0 4px 14px rgba(88, 60, 245, 0.35)'
              }}
            >
              Save Rates
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

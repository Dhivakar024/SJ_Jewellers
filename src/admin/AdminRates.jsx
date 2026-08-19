import React, { useState } from 'react';
import { Coins, CheckCircle2, RefreshCw, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ratesService } from '../services/ratesService';

export default function AdminRates() {
  const { goldRate, setGoldRate, silverRate, setSilverRate } = useApp();
  const [goldInput, setGoldInput] = useState(goldRate.toString());
  const [silverInput, setSilverInput] = useState(silverRate.toString());
  const [gstRate, setGstRate] = useState('3');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    const gNum = parseFloat(goldInput) || 16263.65;
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
    setGoldInput('16263.65');
    setSilverInput('265.00');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
      
      {/* 1. Live Market Rates Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* 24KT Gold Rate Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #fde68a',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ backgroundColor: '#ffd000', color: '#000', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '8px' }}>
                24KT
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#78350f' }}>Gold Live Rate</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b2e' }}>
              ₹ {goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#736d85', marginTop: '2px' }}>Per 1.0000 Gram</div>
          </div>

          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={28} color="#b45309" />
          </div>
        </div>

        {/* 24KT Silver Rate Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(100, 116, 139, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '8px' }}>
                24KT
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Silver Live Rate</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b2e' }}>
              ₹ {silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#736d85', marginTop: '2px' }}>Per 1.0000 Gram</div>
          </div>

          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={28} color="#475569" />
          </div>
        </div>
      </div>

      {/* 2. Success Alert */}
      {saveSuccess && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065f46',
          fontSize: '14px',
          fontWeight: '700'
        }}>
          <CheckCircle2 size={22} color="#10b981" />
          <span>Rates updated successfully! Customer applications are now using the updated market pricing.</span>
        </div>
      )}

      {/* 3. Editable Rate Management Form */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>
            Configure Platform Pricing
          </h4>
          <p style={{ fontSize: '13px', color: '#736d85', margin: '4px 0 0 0' }}>
            Changes will instantly update calculations across the entire customer application.
          </p>
        </div>

        <form onSubmit={handleSaveRates} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Gold Rate Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#2c2642', marginBottom: '8px' }}>
                24KT Gold Rate (₹ / Gram)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '13px', fontSize: '16px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={goldInput}
                  onChange={(e) => setGoldInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '14px',
                    border: '1px solid #dcd4fa',
                    backgroundColor: '#f9f7ff',
                    padding: '0 16px 0 36px',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#1e1b2e',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Silver Rate Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#2c2642', marginBottom: '8px' }}>
                24KT Silver Rate (₹ / Gram)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '13px', fontSize: '16px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={silverInput}
                  onChange={(e) => setSilverInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '14px',
                    border: '1px solid #dcd4fa',
                    backgroundColor: '#f9f7ff',
                    padding: '0 16px 0 36px',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#1e1b2e',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Applicable GST */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#2c2642', marginBottom: '8px' }}>
                Applicable GST Rate (%)
              </label>
              <input
                type="text"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid #dcd4fa',
                  backgroundColor: '#f9f7ff',
                  padding: '0 16px',
                  fontSize: '15px',
                  fontWeight: '800',
                  color: '#1e1b2e',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Effective Date */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#2c2642', marginBottom: '8px' }}>
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid #dcd4fa',
                  backgroundColor: '#f9f7ff',
                  padding: '0 16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1e1b2e',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                height: '48px',
                padding: '0 20px',
                borderRadius: '14px',
                border: '1.5px solid var(--primary-purple)',
                backgroundColor: 'transparent',
                color: 'var(--primary-purple)',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 1,
                height: '48px',
                fontSize: '15px',
                boxShadow: '0 6px 18px rgba(88, 60, 245, 0.35)'
              }}
            >
              Save & Broadcast Rates
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

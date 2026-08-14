import React, { useState } from 'react';
import { Coins, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminRates() {
  const { goldRate, silverRate, updateRates, usersList, holdings } = useApp();
  const [newGold, setNewGold] = useState(goldRate.toString());
  const [newSilver, setNewSilver] = useState(silverRate.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalGoldSold = usersList.reduce((acc, u) => acc + (u.goldGrams || 0), holdings.goldGrams);
  const totalSilverSold = usersList.reduce((acc, u) => acc + (u.silverGrams || 0), holdings.silverGrams);

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateRates(newGold, newSilver);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Live Rate Editor Form */}
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '24px',
        border: '1px solid #2d2645',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Coins size={28} color="#ffd000" />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>Live Metal Rate Controls</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              Modifying these values updates the rate displayed across all user screens in real time
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveRates} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Gold Rate Input */}
            <div style={{
              backgroundColor: '#0f0d19',
              borderRadius: '16px',
              border: '1px solid #f59e0b40',
              padding: '20px'
            }}>
              <label style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b', display: 'block', marginBottom: '8px' }}>
                Current 24KT Gold Rate (per gram)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={newGold}
                  onChange={(e) => setNewGold(e.target.value)}
                  style={{
                    flex: 1, height: '48px', borderRadius: '12px', border: '1px solid #332d4f',
                    backgroundColor: '#171427', padding: '0 14px', fontSize: '18px', fontWeight: '800', color: '#ffffff', outline: 'none'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Total Gold Holdings Sold: <strong>{totalGoldSold.toFixed(4)} gm</strong>
              </div>
            </div>

            {/* Silver Rate Input */}
            <div style={{
              backgroundColor: '#0f0d19',
              borderRadius: '16px',
              border: '1px solid #94a3b840',
              padding: '20px'
            }}>
              <label style={{ fontSize: '14px', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Current 24KT Silver Rate (per gram)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={newSilver}
                  onChange={(e) => setNewSilver(e.target.value)}
                  style={{
                    flex: 1, height: '48px', borderRadius: '12px', border: '1px solid #332d4f',
                    backgroundColor: '#171427', padding: '0 14px', fontSize: '18px', fontWeight: '800', color: '#ffffff', outline: 'none'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Total Silver Holdings Sold: <strong>{totalSilverSold.toFixed(4)} gm</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#583cf5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(88, 60, 245, 0.4)'
              }}
            >
              <Save size={18} />
              <span>Update Live Asset Rates</span>
            </button>

            {savedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '14px', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>Rates updated live across user app!</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { RotateCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function HoldingsScreen({ onNavigate, onTogglePlus }) {
  const { holdings, goldRate, silverRate } = useApp();

  const goldValue = holdings.goldGrams * goldRate;
  const silverValue = holdings.silverGrams * silverRate;
  const totalValue = goldValue + silverValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{
        backgroundColor: 'var(--primary-purple)',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Holdings</h2>
        <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <RotateCw size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="screen-content" style={{ padding: '20px 18px 24px 18px', gap: '16px' }}>
        {/* Total Value Box */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#44386e', marginBottom: '6px' }}>
            Total Current Value
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-purple)' }}>
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Gold Holdings Card */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              backgroundColor: '#ffd000', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '18px' }}>🪙</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>Gold</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#55497c' }}>
            <span>Grams Held</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{holdings.goldGrams.toFixed(4)} gm</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: '600', color: '#55497c' }}>
            <span>Current Rate</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>
              ₹{goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#c5b6f0', margin: '12px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: '800' }}>
            <span style={{ color: '#1e1b2e' }}>Current Value</span>
            <span style={{ color: 'var(--primary-purple)', fontSize: '20px' }}>
              ₹{goldValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Silver Holdings Card */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '18px' }}>🥈</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>Silver</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#55497c' }}>
            <span>Grams Held</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{holdings.silverGrams.toFixed(4)} gm</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: '600', color: '#55497c' }}>
            <span>Current Rate</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>
              ₹{silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#c5b6f0', margin: '12px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: '800' }}>
            <span style={{ color: '#1e1b2e' }}>Current Value</span>
            <span style={{ color: 'var(--primary-purple)', fontSize: '20px' }}>
              ₹{silverValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Timestamp Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#736d85', fontWeight: '600', marginTop: '10px' }}>
          Last updated: 14 Aug 2026, 10:34 am<br />
          Based on successful transactions only
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab="holdings"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

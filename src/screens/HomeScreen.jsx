import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function HomeScreen({ onNavigate, onTogglePlus }) {
  const { currentUser, goldRate, silverRate, holdings } = useApp();
  // Default state: Gold must be selected when Home page loads
  const [metalTab, setMetalTab] = useState('gold'); // 'gold' or 'silver'

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header Banner */}
      <header style={{
        backgroundColor: 'var(--primary-purple)',
        padding: '24px 20px 36px 20px',
        color: 'white',
        flexShrink: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>Hello,</div>
            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '2px', letterSpacing: '-0.5px' }}>
              {currentUser.name} !
            </div>
          </div>

          {/* Rate Badge Box */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '16px',
            padding: '10px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            minWidth: '155px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                backgroundColor: '#ffd000',
                color: '#000',
                fontSize: '10px',
                fontWeight: '900',
                padding: '3px 6px',
                borderRadius: '10px'
              }}>24KT</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffb948' }}>
                {metalTab === 'gold' ? 'Gold Rate' : 'Silver Rate'}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
              {metalTab === 'gold'
                ? `Rs. ${goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm`
                : `Rs. ${silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm`}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Middle Scrollable Content Area (ONLY THIS SCROLLS) */}
      <main 
        className="app-scroll-content" 
        style={{ 
          padding: '0 16px 40px 16px', 
          marginTop: '-18px',
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Main Asset Card (Slightly compact & balanced) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px 18px 20px 18px',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
          overflow: 'visible'
        }}>
          {/* LOWEST PRICE Diagonal Corner Ribbon */}
          <div className="lowest-price-ribbon">
            LOWEST PRICE
          </div>

          {/* Gold / Silver Toggle Pills */}
          <div style={{
            backgroundColor: '#f1ecfe',
            borderRadius: '30px',
            padding: '4px',
            display: 'flex',
            margin: '6px auto 16px auto',
            width: '230px'
          }}>
            <button
              onClick={() => setMetalTab('gold')}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: metalTab === 'gold' ? 'var(--primary-purple)' : 'transparent',
                color: metalTab === 'gold' ? '#ffffff' : '#736d85',
                fontWeight: '700',
                fontSize: '14.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Gold
            </button>
            <button
              onClick={() => setMetalTab('silver')}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: metalTab === 'silver' ? 'var(--primary-purple)' : 'transparent',
                color: metalTab === 'silver' ? '#ffffff' : '#736d85',
                fontWeight: '700',
                fontSize: '14.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Silver
            </button>
          </div>

          {/* Balance Inner Card (Shows ONLY the selected asset balance) */}
          <div style={{
            backgroundColor: '#f6f2ff',
            borderRadius: '18px',
            padding: '18px 14px 20px 14px',
            textAlign: 'center',
            marginBottom: '16px',
            border: '1px solid #e8e2fa',
            boxShadow: '0 2px 8px rgba(88, 60, 245, 0.04)'
          }}>
            <div style={{ color: 'var(--primary-purple)', fontWeight: '700', fontSize: '13.5px', marginBottom: '10px' }}>
              Your balance
            </div>

            {metalTab === 'gold' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  backgroundColor: '#fde9b8', margin: '0 auto 8px auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#e5a415">
                    <circle cx="12" cy="7" r="5" />
                    <circle cx="12" cy="12" r="5" fill="#f5c242" />
                    <circle cx="12" cy="17" r="5" fill="#e5a415" />
                  </svg>
                </div>
                <div style={{ fontSize: '13.5px', color: '#736d85', fontWeight: '700' }}>Gold</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#1c1829', marginTop: '3px' }}>
                  {holdings.goldGrams.toFixed(4)} gm
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  backgroundColor: '#e2e6ea', margin: '0 auto 8px auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#a0aab4">
                    <circle cx="12" cy="7" r="5" />
                    <circle cx="12" cy="12" r="5" fill="#ccd3db" />
                    <circle cx="12" cy="17" r="5" fill="#a0aab4" />
                  </svg>
                </div>
                <div style={{ fontSize: '13.5px', color: '#736d85', fontWeight: '700' }}>Silver</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#1c1829', marginTop: '3px' }}>
                  {holdings.silverGrams.toFixed(4)} gm
                </div>
              </div>
            )}
          </div>

          {/* Subtitle Promo text */}
          <div style={{
            textAlign: 'center',
            fontSize: '13.5px',
            color: '#3d3852',
            fontWeight: '600',
            lineHeight: '1.4',
            margin: '0 10px 14px 10px'
          }}>
            Buy {metalTab} daily, at your<br />
            convenience price @ Salem Jewels
          </div>

          {/* Buy Now Primary CTA Button */}
          <button
            onClick={() => onNavigate(metalTab === 'gold' ? 'buy-gold' : 'buy-silver')}
            className="btn-primary"
            style={{
              width: '100%',
              height: '48px',
              margin: '0 auto',
              display: 'block',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-purple)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '15.5px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(88, 60, 245, 0.35)',
              border: 'none'
            }}
          >
            Buy Now
          </button>
        </div>

        {/* Shop Card */}
        <div style={{
          backgroundColor: 'var(--primary-purple)',
          borderRadius: '24px',
          padding: '24px 20px',
          marginTop: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '14px' }}>Shop</h2>

          <button style={{
            backgroundColor: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontWeight: '800',
            fontSize: '14px',
            color: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}>
            <span>Coins →</span>
          </button>

          <p style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500', maxWidth: '170px' }}>
            Turn your shopping into savings
          </p>

          {/* Coins graphic illustration right side */}
          <div style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.95 }}>
            <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
              <ellipse cx="65" cy="70" rx="25" ry="12" fill="#ffd000" />
              <ellipse cx="65" cy="62" rx="25" ry="12" fill="#ffe052" />
              <ellipse cx="65" cy="54" rx="25" ry="12" fill="#ffd000" />
              <ellipse cx="65" cy="46" rx="25" ry="12" fill="#fff194" />
              <circle cx="85" cy="30" r="10" stroke="#ffd000" strokeWidth="2" />
              <circle cx="45" cy="80" r="6" stroke="#ffd000" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Nav Bar */}
      <BottomNav
        activeTab="home"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

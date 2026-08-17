import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function HomeScreen({ onNavigate, onTogglePlus }) {
  const { currentUser, goldRate, silverRate } = useApp();
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
        {/* Shop Card */}
        <div style={{
          backgroundColor: 'var(--primary-purple)',
          borderRadius: '24px',
          padding: '24px 20px',
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

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { holdingsService } from '../services';
import BottomNav from '../components/BottomNav';

export default function HoldingsScreen({ onNavigate, fromScreen = 'home', onTogglePlus }) {
  const { holdings, setHoldings, goldRate, silverRate, fetchHoldings } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof fetchHoldings === 'function') {
        await fetchHoldings();
      } else {
        const res = await holdingsService.getHoldings();
        if (res?.data) {
          const { gold, silver } = res.data;
          setHoldings({
            goldGrams: gold?.quantity_grams || 0,
            silverGrams: silver?.quantity_grams || 0,
            goldInvested: gold?.total_invested || 0,
            silverInvested: silver?.total_invested || 0,
            goldCurrentValue: gold?.current_value || 0,
            silverCurrentValue: silver?.current_value || 0,
            totalInvested: res.data.total_invested || 0,
            totalCurrentValue: res.data.total_current_value || 0,
            totalProfitLoss: res.data.total_profit_loss || 0,
          });
        }
      }
      const now = new Date();
      setLastUpdated(`${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const goldGrams = Number(holdings?.goldGrams) || 0;
  const silverGrams = Number(holdings?.silverGrams) || 0;
  const currentGoldRate = Number(goldRate) || 0;
  const currentSilverRate = Number(silverRate) || 0;

  const goldValue = typeof holdings?.goldCurrentValue === 'number' && holdings.goldCurrentValue > 0
    ? holdings.goldCurrentValue
    : goldGrams * currentGoldRate;

  const silverValue = typeof holdings?.silverCurrentValue === 'number' && holdings.silverCurrentValue > 0
    ? holdings.silverCurrentValue
    : silverGrams * currentSilverRate;

  const totalValue = typeof holdings?.totalCurrentValue === 'number' && holdings.totalCurrentValue > 0
    ? holdings.totalCurrentValue
    : goldValue + silverValue;

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header with Back Button */}
      <header className="top-header-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="back-btn" onClick={() => onNavigate(fromScreen || 'home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Holdings</h2>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '20px 18px 24px 18px', gap: '16px' }}>
        {/* Total Value Box */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '22px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #c9b8fc'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b2e', marginBottom: '6px' }}>
            Total Current Value
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#e05252', letterSpacing: '-0.5px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <span style={{ color: '#1e1b2e', fontWeight: '700' }}>Grams Held</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{goldGrams.toFixed(4)} gm</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
            <span style={{ color: '#1e1b2e', fontWeight: '700' }}>Current Rate</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>
              ₹{currentGoldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <span style={{ color: '#1e1b2e', fontWeight: '700' }}>Grams Held</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>{silverGrams.toFixed(4)} gm</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
            <span style={{ color: '#1e1b2e', fontWeight: '700' }}>Current Rate</span>
            <span style={{ fontWeight: '800', color: '#1e1b2e' }}>
              ₹{currentSilverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
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
          Last updated: {lastUpdated}<br />
          Based on successful transactions only
        </div>
      </main>

      {/* 3. Fixed Bottom Nav */}
      <BottomNav
        activeTab="holdings"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

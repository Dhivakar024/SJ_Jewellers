import React from 'react';
import { Users, Coins, FileText, CheckCircle2, Clock, AlertTriangle, Hand, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboard({ onSelectTab }) {
  const { usersList, transactions, kycRequests, withdrawals, holdings, goldRate, silverRate } = useApp();

  const totalUsers = usersList.length;
  const totalGoldHoldings = usersList.reduce((acc, u) => acc + (u.goldGrams || 0), holdings.goldGrams);
  const totalSilverHoldings = usersList.reduce((acc, u) => acc + (u.silverGrams || 0), holdings.silverGrams);
  const totalTxns = transactions.length;
  const successPayments = transactions.filter((t) => t.status === 'Success').length;
  const pendingPayments = transactions.filter((t) => t.status === 'Pending').length;
  const pendingKyc = kycRequests.filter((k) => k.status === 'Pending' || k.status === 'Under Review').length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending' || w.status === 'Processing').length;

  const cards = [
    { label: 'Total Users', value: totalUsers, icon: <Users size={22} color="#60a5fa" />, bg: '#1e293b', border: '#3b82f6', link: 'users' },
    { label: 'Total Gold Sold', value: `${totalGoldHoldings.toFixed(4)} gm`, icon: <Coins size={22} color="#f59e0b" />, bg: '#1e293b', border: '#f59e0b', link: 'rates' },
    { label: 'Total Silver Sold', value: `${totalSilverHoldings.toFixed(4)} gm`, icon: <Coins size={22} color="#94a3b8" />, bg: '#1e293b', border: '#94a3b8', link: 'rates' },
    { label: 'Total Transactions', value: totalTxns, icon: <FileText size={22} color="#a78bfa" />, bg: '#1e293b', border: '#8b5cf6', link: 'transactions' },
    { label: 'Successful Payments', value: successPayments, icon: <CheckCircle2 size={22} color="#34d399" />, bg: '#1e293b', border: '#10b981', link: 'payments' },
    { label: 'Pending Payments', value: pendingPayments, icon: <Clock size={22} color="#fbbf24" />, bg: '#1e293b', border: '#f59e0b', link: 'payments' },
    { label: 'Pending KYC Review', value: pendingKyc, icon: <AlertTriangle size={22} color="#f87171" />, bg: '#1e293b', border: '#ef4444', link: 'kyc' },
    { label: 'Pending Withdrawals', value: pendingWithdrawals, icon: <Hand size={22} color="#c084fc" />, bg: '#1e293b', border: '#c084fc', link: 'withdrawals' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Overview Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px'
      }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onSelectTab(card.link)}
            style={{
              backgroundColor: '#171427',
              borderRadius: '18px',
              border: `1px solid ${card.border}40`,
              borderLeft: `5px solid ${card.border}`,
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>{card.label}</span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#0f0d19' }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Sales Volume Trend Bar Chart */}
        <div style={{
          backgroundColor: '#171427',
          borderRadius: '20px',
          border: '1px solid #2d2645',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>Gold & Silver Purchase Volume</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Monthly transaction volume distribution</p>
            </div>
            <TrendingUp size={20} color="#34d399" />
          </div>

          {/* SVG Bar Chart Visualization */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '10px 0', borderBottom: '1px solid #2d2645' }}>
            {[
              { month: 'May', gold: 40, silver: 70 },
              { month: 'Jun', gold: 65, silver: 85 },
              { month: 'Jul', gold: 50, silver: 90 },
              { month: 'Aug', gold: 95, silver: 120 }
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '140px' }}>
                  {/* Gold Bar */}
                  <div style={{
                    width: '18px',
                    height: `${d.gold}%`,
                    backgroundColor: '#ffd000',
                    borderRadius: '4px 4px 0 0'
                  }}></div>
                  {/* Silver Bar */}
                  <div style={{
                    width: '18px',
                    height: `${d.silver}%`,
                    backgroundColor: '#94a3b8',
                    borderRadius: '4px 4px 0 0'
                  }}></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{d.month}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '12px', fontWeight: '700' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd000' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ffd000' }}></div>
              <span>Gold Volume</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#94a3b8' }}></div>
              <span>Silver Volume</span>
            </div>
          </div>
        </div>

        {/* Live Market Rates Control Widget */}
        <div style={{
          backgroundColor: '#171427',
          borderRadius: '20px',
          border: '1px solid #2d2645',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            Active Market Asset Rates
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
            Live rates displayed to all users across the mobile app
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Gold Rate Card */}
            <div style={{
              backgroundColor: '#0f0d19',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #f59e0b40',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>24KT Gold Rate</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                  ₹ {goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / gm
                </div>
              </div>
              <button
                onClick={() => onSelectTab('rates')}
                style={{
                  backgroundColor: '#583cf5', color: '#ffffff', border: 'none',
                  borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Edit Rate
              </button>
            </div>

            {/* Silver Rate Card */}
            <div style={{
              backgroundColor: '#0f0d19',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #94a3b840',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>24KT Silver Rate</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                  ₹ {silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / gm
                </div>
              </div>
              <button
                onClick={() => onSelectTab('rates')}
                style={{
                  backgroundColor: '#583cf5', color: '#ffffff', border: 'none',
                  borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Edit Rate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

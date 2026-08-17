import React from 'react';
import { Users, ShieldCheck, Coins, FileText, ArrowUpRight, TrendingUp, Hand } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboard({ onSelectTab }) {
  const { usersList, kycRequests, transactions, holdings, goldRate, silverRate } = useApp();

  // Metrics calculations
  const totalUsersCount = usersList.length;
  const pendingKycCount = kycRequests.filter((k) => k.status === 'Pending' || k.status === 'Under Review').length;
  const totalGoldHoldings = usersList.reduce((acc, u) => acc + (parseFloat(u.goldGrams) || 0), 0) + holdings.goldGrams;
  const totalSilverHoldings = usersList.reduce((acc, u) => acc + (parseFloat(u.silverGrams) || 0), 0) + holdings.silverGrams;
  const pendingTxnCount = transactions.filter((t) => t.status === 'Pending').length;
  const todayTxnCount = transactions.length;

  const summaryCards = [
    {
      title: 'Total Users',
      value: totalUsersCount.toString(),
      sub: 'Registered Accounts',
      icon: <Users size={22} color="var(--primary-purple)" />,
      bg: '#ede7fc',
      actionTab: 'users'
    },
    {
      title: 'Pending KYC',
      value: pendingKycCount.toString(),
      sub: pendingKycCount > 0 ? 'Requires Review' : 'All Verified',
      icon: <ShieldCheck size={22} color="#d97706" />,
      bg: '#fef3c7',
      actionTab: 'kyc'
    },
    {
      title: 'Total Gold Holdings',
      value: `${totalGoldHoldings.toFixed(4)} g`,
      sub: `Live ₹${goldRate.toLocaleString('en-IN')}/g`,
      icon: <Coins size={22} color="#b45309" />,
      bg: '#fef3c7',
      actionTab: 'rates'
    },
    {
      title: 'Total Silver Holdings',
      value: `${totalSilverHoldings.toFixed(4)} g`,
      sub: `Live ₹${silverRate.toLocaleString('en-IN')}/g`,
      icon: <Coins size={22} color="#475569" />,
      bg: '#f1f5f9',
      actionTab: 'rates'
    },
    {
      title: 'Pending Txns',
      value: pendingTxnCount.toString(),
      sub: 'Awaiting Settlement',
      icon: <TrendingUp size={22} color="#dc2626" />,
      bg: '#fee2e2',
      actionTab: 'transactions'
    },
    {
      title: "Today's Activity",
      value: todayTxnCount.toString(),
      sub: 'Total Orders Placed',
      icon: <FileText size={22} color="var(--primary-purple)" />,
      bg: '#ede7fc',
      actionTab: 'transactions'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Quick Stats Grid (2 columns on mobile) */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px' }}>
          Overview Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onSelectTab && onSelectTab(card.actionTab)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '14px',
                border: '1px solid #e8e2fa',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon}
                </div>
                <ArrowUpRight size={16} color="#948fa8" />
              </div>

              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e1b2e', letterSpacing: '-0.3px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#3b3252', marginTop: '2px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7e7694', marginTop: '2px' }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quick Management Shortcuts */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b2e', marginBottom: '12px' }}>
          Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectTab('kyc')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 12px',
              borderRadius: '14px',
              backgroundColor: '#ede7fc',
              border: '1px solid var(--primary-purple)',
              color: 'var(--primary-purple)',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} />
            <span>Review KYC ({pendingKycCount})</span>
          </button>

          <button
            onClick={() => onSelectTab('rates')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 12px',
              borderRadius: '14px',
              backgroundColor: '#ede7fc',
              border: '1px solid var(--primary-purple)',
              color: 'var(--primary-purple)',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Coins size={16} />
            <span>Update Rates</span>
          </button>
        </div>
      </div>

      {/* 3. Recent Activity Preview */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b2e' }}>
            Recent Transactions
          </h4>
          <button
            onClick={() => onSelectTab('transactions')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-purple)',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            View All →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                backgroundColor: '#f9f7ff',
                borderRadius: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e1b2e' }}>
                  {item.asset} · {item.quantity}
                </div>
                <div style={{ fontSize: '11px', color: '#7e7694', fontWeight: '600', marginTop: '2px' }}>
                  {item.id} · {item.date}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e1b2e' }}>
                  ₹ {item.amount}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: item.status === 'Success' ? '#d1fae5' : item.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                  color: item.status === 'Success' ? '#059669' : item.status === 'Pending' ? '#d97706' : '#dc2626'
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

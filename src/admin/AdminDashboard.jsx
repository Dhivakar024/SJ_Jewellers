import React from 'react';
import { 
  Users, ShieldCheck, Coins, FileText, ArrowUpRight, 
  TrendingUp, Hand, CheckCircle2, Clock, XCircle, CreditCard, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboard({ onSelectTab }) {
  const { usersList, kycRequests, transactions, holdings, goldRate, silverRate, withdrawals } = useApp();

  // Metrics calculations
  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter((u) => u.status === 'Active').length;
  
  const totalGoldHoldings = usersList.reduce((acc, u) => acc + (parseFloat(u.goldGrams) || 0), 0) + holdings.goldGrams;
  const totalSilverHoldings = usersList.reduce((acc, u) => acc + (parseFloat(u.silverGrams) || 0), 0) + holdings.silverGrams;
  
  const pendingTxnCount = transactions.filter((t) => t.status === 'Pending' || t.status === 'Processing').length;
  const successTxnCount = transactions.filter((t) => t.status === 'Success').length;
  const failedTxnCount = transactions.filter((t) => t.status === 'Failed' || t.status === 'Cancelled').length;
  const todayTxnCount = transactions.length;

  const pendingWithdrawalCount = withdrawals.filter((w) => w.status === 'Pending' || w.status === 'Processing').length;
  const pendingKycCount = kycRequests.filter((k) => k.status === 'Pending' || k.status === 'Under Review').length;

  const summaryCards = [
    {
      title: 'Total Users',
      value: totalUsersCount.toString(),
      sub: `${activeUsersCount} Active Accounts`,
      icon: <Users size={22} color="var(--primary-purple)" />,
      bg: '#ede7fc',
      actionTab: 'users'
    },
    {
      title: 'Active Users',
      value: activeUsersCount.toString(),
      sub: 'Verified & Transacting',
      icon: <CheckCircle2 size={22} color="#059669" />,
      bg: '#d1fae5',
      actionTab: 'users'
    },
    {
      title: 'Total Gold Holdings',
      value: `${totalGoldHoldings.toFixed(4)} gm`,
      sub: `₹ ${(totalGoldHoldings * goldRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Value`,
      icon: <Coins size={22} color="#b45309" />,
      bg: '#fef3c7',
      actionTab: 'rates'
    },
    {
      title: 'Total Silver Holdings',
      value: `${totalSilverHoldings.toFixed(4)} gm`,
      sub: `₹ ${(totalSilverHoldings * silverRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Value`,
      icon: <Coins size={22} color="#475569" />,
      bg: '#f1f5f9',
      actionTab: 'rates'
    },
    {
      title: "Today's Transactions",
      value: todayTxnCount.toString(),
      sub: 'Total Orders Logged',
      icon: <FileText size={22} color="var(--primary-purple)" />,
      bg: '#ede7fc',
      actionTab: 'transactions'
    },
    {
      title: 'Pending Transactions',
      value: pendingTxnCount.toString(),
      sub: 'Awaiting Settlement',
      icon: <Clock size={22} color="#d97706" />,
      bg: '#fef3c7',
      actionTab: 'transactions'
    },
    {
      title: 'Successful Transactions',
      value: successTxnCount.toString(),
      sub: 'Fulfilled & Credited',
      icon: <TrendingUp size={22} color="#059669" />,
      bg: '#d1fae5',
      actionTab: 'transactions'
    },
    {
      title: 'Failed Transactions',
      value: failedTxnCount.toString(),
      sub: 'Cancelled or Declined',
      icon: <XCircle size={22} color="#dc2626" />,
      bg: '#fee2e2',
      actionTab: 'transactions'
    },
    {
      title: 'Pending Withdrawals',
      value: pendingWithdrawalCount.toString(),
      sub: 'Requires Admin Approval',
      icon: <Hand size={22} color="#7c3aed" />,
      bg: '#ede7fc',
      actionTab: 'withdrawals'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Live Market Rates Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '24px 28px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 4px 20px rgba(88, 60, 245, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#ede7fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-purple)'
          }}>
            <Coins size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>
              Live Platform Metal Rates
            </h3>
            <p style={{ fontSize: '13px', color: '#736d85', margin: '3px 0 0 0' }}>
              Broadcasted in real-time to all customer mobile clients
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>24KT Gold Rate</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-purple)' }}>
              ₹ {goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / gm
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', backgroundColor: '#e8e2fa' }}></div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>24KT Silver Rate</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-purple)' }}>
              ₹ {silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / gm
            </div>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('rates')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-purple)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(88, 60, 245, 0.3)'
            }}
          >
            Update Rates
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards Grid (3 columns on desktop) */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
          Executive Performance Summary
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onSelectTab && onSelectTab(card.actionTab)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #e8e2fa',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon}
                </div>
                <ArrowUpRight size={18} color="#948fa8" />
              </div>

              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e', letterSpacing: '-0.4px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#2c2540', marginTop: '4px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7e7694', marginTop: '2px' }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Quick Action Shortcuts & Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Quick Operations */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
            Quick Admin Operations
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <button
              onClick={() => onSelectTab('kyc')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#ede7fc',
                border: '1.5px solid var(--primary-purple)',
                color: 'var(--primary-purple)',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={22} />
              <span>Verify KYC ({pendingKycCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('withdrawals')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#fef3c7',
                border: '1.5px solid #d97706',
                color: '#b45309',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <Hand size={22} />
              <span>Process Withdrawals ({pendingWithdrawalCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('users')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#f1f5f9',
                border: '1.5px solid #64748b',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <Users size={22} />
              <span>Manage Users</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#ede7fc',
                border: '1.5px solid var(--primary-purple)',
                color: 'var(--primary-purple)',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <TrendingUp size={22} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions Table Preview */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>
              Recent Orders Log
            </h4>
            <button
              onClick={() => onSelectTab('transactions')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-purple)',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              View All ({transactions.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f9f7ff',
                  borderRadius: '14px',
                  border: '1px solid #f0eafc'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e1b2e' }}>
                    {item.asset} · {item.quantity}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7e7694', fontWeight: '600', marginTop: '2px' }}>
                    {item.id} · {item.date} · {item.paymentMethod || 'UPI'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e1b2e' }}>
                    ₹ {item.amount}
                  </div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '2px 8px',
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

    </div>
  );
}

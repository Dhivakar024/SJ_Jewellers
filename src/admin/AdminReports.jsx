import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, ArrowUpRight, 
  ArrowDownRight, Coins, Users, CreditCard, Download, Filter 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminReports() {
  const { transactions, usersList, withdrawals, goldRate, silverRate } = useApp();
  const [timeRange, setTimeRange] = useState('month'); // 'today', 'week', 'month', 'year'

  // Calculations
  const successTxns = transactions.filter((t) => t.status === 'Success');
  const failedTxns = transactions.filter((t) => t.status === 'Failed' || t.status === 'Cancelled');
  
  const goldTxns = successTxns.filter((t) => (t.asset || '').toLowerCase() === 'gold');
  const silverTxns = successTxns.filter((t) => (t.asset || '').toLowerCase() === 'silver');

  const totalRevenue = successTxns.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const totalGstCollected = totalRevenue * 0.03;
  const netSales = totalRevenue - totalGstCollected;

  const goldRevenue = goldTxns.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const silverRevenue = silverTxns.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const completedWithdrawals = withdrawals.filter((w) => w.status === 'Completed');
  const totalWithdrawalVolume = completedWithdrawals.reduce((acc, w) => {
    const val = parseFloat(w.amount.replace(/[^0-9.]/g, '')) || 0;
    return acc + val;
  }, 0);

  const newUsersCount = usersList.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Time Range Filter & Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b2e' }}>Analytics & Reports</h3>
          <p style={{ fontSize: '13.5px', color: '#736d85', marginTop: '2px' }}>
            Comprehensive sales, payments, user growth, and asset performance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e8e2fa',
            padding: '4px',
            display: 'flex',
            gap: '4px'
          }}>
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: timeRange === range ? 'var(--primary-purple)' : 'transparent',
                  color: timeRange === range ? '#ffffff' : '#736d85',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Exporting report as CSV/PDF...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ede7fc',
              border: '1.5px solid var(--primary-purple)',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'var(--primary-purple)',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Gross Volume */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#736d85' }}>Gross Sales Volume</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--primary-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e1b2e' }}>
            ₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
            <ArrowUpRight size={14} />
            <span>+14.8% vs last {timeRange}</span>
          </div>
        </div>

        {/* GST Collected */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#736d85' }}>GST Collected (3%)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e1b2e' }}>
            ₹ {totalGstCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600', marginTop: '6px' }}>
            Net Sales: ₹ {netSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Gold vs Silver Breakdown */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#736d85' }}>Gold / Silver Split</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} color="#b45309" />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b2e' }}>
            Gold: ₹ {goldRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', marginTop: '4px' }}>
            Silver: ₹ {silverRevenue.toFixed(2)}
          </div>
        </div>

        {/* Total Withdrawals */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#736d85' }}>Completed Withdrawals</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--primary-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e1b2e' }}>
            ₹ {totalWithdrawalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '6px' }}>
            {completedWithdrawals.length} Successful Payouts
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Transaction Success vs Failure Distribution */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
            Transaction Status Distribution
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Success */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                <span style={{ color: '#059669' }}>Successful ({successTxns.length})</span>
                <span style={{ color: '#1e1b2e' }}>{Math.round((successTxns.length / (transactions.length || 1)) * 100)}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(successTxns.length / (transactions.length || 1)) * 100}%`,
                  backgroundColor: '#10b981',
                  borderRadius: '6px'
                }}></div>
              </div>
            </div>

            {/* Pending */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                <span style={{ color: '#d97706' }}>Pending / Processing ({transactions.filter((t) => t.status === 'Pending' || t.status === 'Processing').length})</span>
                <span style={{ color: '#1e1b2e' }}>{Math.round((transactions.filter((t) => t.status === 'Pending' || t.status === 'Processing').length / (transactions.length || 1)) * 100)}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(transactions.filter((t) => t.status === 'Pending' || t.status === 'Processing').length / (transactions.length || 1)) * 100}%`,
                  backgroundColor: '#f59e0b',
                  borderRadius: '6px'
                }}></div>
              </div>
            </div>

            {/* Failed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                <span style={{ color: '#dc2626' }}>Failed / Cancelled ({failedTxns.length})</span>
                <span style={{ color: '#1e1b2e' }}>{Math.round((failedTxns.length / (transactions.length || 1)) * 100)}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(failedTxns.length / (transactions.length || 1)) * 100}%`,
                  backgroundColor: '#ef4444',
                  borderRadius: '6px'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth & Platform Health */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e8e2fa',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
            User Growth & KYC Verification
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ backgroundColor: '#f8f6fc', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>Total Users</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e', marginTop: '4px' }}>
                {usersList.length}
              </div>
              <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                100% Active Rate
              </div>
            </div>

            <div style={{ backgroundColor: '#f8f6fc', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>Verified KYC</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b2e', marginTop: '4px' }}>
                {usersList.filter((u) => u.kycStatus === 'Verified').length}
              </div>
              <div style={{ fontSize: '11.5px', color: '#6366f1', fontWeight: '700', marginTop: '2px' }}>
                {usersList.filter((u) => u.kycStatus === 'Under Review' || u.kycStatus === 'Pending').length} Pending Review
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

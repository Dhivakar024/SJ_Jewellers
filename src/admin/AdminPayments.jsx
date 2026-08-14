import React from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminPayments() {
  const { transactions } = useApp();

  const totalPayments = transactions.length;
  const successCount = transactions.filter((t) => t.status === 'Success').length;
  const pendingCount = transactions.filter((t) => t.status === 'Pending').length;
  const failedCount = transactions.filter((t) => t.status === 'Failed').length;
  const totalVolume = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#171427', border: '1px solid #2d2645', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Total Payment Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', marginTop: '6px' }}>
            ₹ {totalVolume.toFixed(2)}
          </div>
        </div>

        <div style={{ backgroundColor: '#171427', border: '1px solid #2d2645', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Total Transactions</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginTop: '6px' }}>
            {totalPayments}
          </div>
        </div>

        <div style={{ backgroundColor: '#171427', border: '1px solid #2d2645', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>Successful</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', marginTop: '6px' }}>
            {successCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#171427', border: '1px solid #2d2645', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: '700' }}>Pending</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#fbbf24', marginTop: '6px' }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Payments Log Table */}
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '20px',
        border: '1px solid #2d2645',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#100d1c', color: '#94a3b8', borderBottom: '1px solid #2d2645' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Payment ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>User</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Method</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #231e36', color: '#e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#a78bfa' }}>PAY-{t.id}</td>
                <td style={{ padding: '16px 20px', fontWeight: '700' }}>Demo User</td>
                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#ffffff' }}>₹ {t.amount}</td>
                <td style={{ padding: '16px 20px' }}>{t.paymentMethod || 'UPI'}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    backgroundColor: t.status === 'Success' ? '#064e3b' : t.status === 'Pending' ? '#78350f' : '#7f1d1d',
                    color: t.status === 'Success' ? '#34d399' : t.status === 'Pending' ? '#fbbf24' : '#f87171',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

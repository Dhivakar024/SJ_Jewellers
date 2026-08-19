import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, XCircle, DollarSign, 
  Search, X, Filter, Download, ArrowUpRight, TrendingUp 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminPayments() {
  const { transactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalPayments = transactions.length;
  const successCount = transactions.filter((t) => t.status === 'Success').length;
  const pendingCount = transactions.filter((t) => t.status === 'Pending' || t.status === 'Processing').length;
  const failedCount = transactions.filter((t) => t.status === 'Failed' || t.status === 'Cancelled').length;
  
  const totalVolume = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0) * 1.03, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter !== 'All' && (t.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.asset || '').toLowerCase().includes(q) ||
        (t.paymentMethod || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Payment Volume & Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e2fa', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '13px', color: '#736d85', fontWeight: '700' }}>Total Settled Volume</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669', marginTop: '6px' }}>
            ₹ {totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
            Includes 3% GST
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e2fa', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '13px', color: '#736d85', fontWeight: '700' }}>Total Payment Logs</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e1b2e', marginTop: '6px' }}>
            {totalPayments}
          </div>
          <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600', marginTop: '4px' }}>
            All Gateways / UPI
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e2fa', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '13px', color: '#059669', fontWeight: '700' }}>Successful Payments</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669', marginTop: '6px' }}>
            {successCount}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
            {Math.round((successCount / (totalPayments || 1)) * 100)}% Success Rate
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e2fa', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '13px', color: '#d97706', fontWeight: '700' }}>Pending / In-Process</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#d97706', marginTop: '6px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', marginTop: '4px' }}>
            Awaiting Confirmation
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by Payment ID, Asset, Gateway..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              border: '1px solid #dcd4fa',
              backgroundColor: '#f9f7ff',
              padding: '0 36px 0 42px',
              fontSize: '14px',
              color: '#1e1b2e',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={18} color="#7e7694" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#7e7694',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Success', 'Pending', 'Processing', 'Failed', 'Cancelled'].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: statusFilter === opt ? 'none' : '1px solid #e2d9fa',
                backgroundColor: statusFilter === opt ? 'var(--primary-purple)' : '#f6f2ff',
                color: statusFilter === opt ? '#ffffff' : '#5b5375',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Payments Monitoring Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f7ff', color: '#5b5375', borderBottom: '1px solid #e8e2fa' }}>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Payment ID / Txn</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Asset Purchased</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Base Amount</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>GST (3%)</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Total Paid</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Method</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#7e7694' }}>
                    No payment records match the filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const numAmt = parseFloat(t.amount) || 100;
                  const gst = (numAmt * 0.03).toFixed(2);
                  const total = (numAmt + parseFloat(gst)).toFixed(2);
                  const isSuccess = t.status === 'Success';
                  const isPending = t.status === 'Pending' || t.status === 'Processing';

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f0ebfa' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary-purple)' }}>PAY-{t.id}</div>
                        <div style={{ fontSize: '11px', color: '#7e7694' }}>{t.id}</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1e1b2e' }}>
                        Demo User
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ color: t.asset === 'Gold' ? '#b45309' : '#475569' }}>{t.asset}</strong> ({t.quantity})
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#5b5375' }}>
                        ₹ {numAmt.toFixed(2)}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#b45309' }}>
                        + ₹ {gst}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '900', color: '#1e1b2e', fontSize: '14.5px' }}>
                        ₹ {total}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ede7fc', color: 'var(--primary-purple)', fontSize: '11.5px', fontWeight: '800' }}>
                          {t.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          backgroundColor: isSuccess ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isSuccess ? '#059669' : isPending ? '#d97706' : '#dc2626'
                        }}>
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', color: '#736d85', fontSize: '12px' }}>
                        {t.date} · {t.time || '10:00 AM'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

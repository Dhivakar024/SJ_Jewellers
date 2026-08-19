import React, { useState } from 'react';
import { 
  Search, X, Filter, Download, CreditCard, Building2, 
  Smartphone, Eye, ArrowUpDown, Calendar, CheckCircle2, Clock, XCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminTransactions() {
  const { transactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filteredList = transactions.filter((t) => {
    // Asset filter
    if (assetFilter !== 'All' && (t.asset || '').toLowerCase() !== assetFilter.toLowerCase()) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'All' && (t.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Method filter
    if (methodFilter !== 'All' && (t.paymentMethod || 'UPI').toLowerCase() !== methodFilter.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const orderId = `ORD-${t.id.replace(/[^0-9]/g, '') || '102938'}`;
      return (
        t.id.toLowerCase().includes(q) ||
        orderId.toLowerCase().includes(q) ||
        (t.asset || '').toLowerCase().includes(q) ||
        (t.amount || '').includes(q) ||
        (t.paymentMethod || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Filter Bar & Search */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by Txn ID, Order ID, User, Amount..."
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

          {/* Export Action */}
          <button
            onClick={() => alert('Exporting filtered transactions...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ede7fc',
              border: '1.5px solid var(--primary-purple)',
              borderRadius: '12px',
              padding: '10px 16px',
              color: 'var(--primary-purple)',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Pills Rows */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Asset filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>Asset:</span>
            {['All', 'Gold', 'Silver'].map((opt) => (
              <button
                key={opt}
                onClick={() => setAssetFilter(opt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: assetFilter === opt ? 'none' : '1px solid #e2d9fa',
                  backgroundColor: assetFilter === opt ? 'var(--primary-purple)' : '#f6f2ff',
                  color: assetFilter === opt ? '#ffffff' : '#5b5375',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>Status:</span>
            {['All', 'Success', 'Pending', 'Processing', 'Failed', 'Cancelled'].map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: statusFilter === opt ? 'none' : '1px solid #e2d9fa',
                  backgroundColor: statusFilter === opt ? 'var(--primary-purple)' : '#f6f2ff',
                  color: statusFilter === opt ? '#ffffff' : '#5b5375',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Payment Method filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#736d85' }}>Method:</span>
            {['All', 'UPI', 'Card', 'NetBanking'].map((opt) => (
              <button
                key={opt}
                onClick={() => setMethodFilter(opt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: methodFilter === opt ? 'none' : '1px solid #e2d9fa',
                  backgroundColor: methodFilter === opt ? 'var(--primary-purple)' : '#f6f2ff',
                  color: methodFilter === opt ? '#ffffff' : '#5b5375',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Transactions Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e8e2fa',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f7ff', color: '#5b5375', borderBottom: '1px solid #e8e2fa' }}>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Txn ID / Order ID</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>User</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Asset & Quantity</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Base Amount</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>GST (3%)</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Total Amount</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Method</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Status</th>
                <th style={{ padding: '16px 18px', fontWeight: '800' }}>Date & Time</th>
                <th style={{ padding: '16px 18px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#7e7694' }}>
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((t) => {
                  const numAmt = parseFloat(t.amount) || 100;
                  const gst = (numAmt * 0.03).toFixed(2);
                  const total = (numAmt + parseFloat(gst)).toFixed(2);
                  const isSuccess = t.status === 'Success';
                  const isPending = t.status === 'Pending' || t.status === 'Processing';
                  const isFailed = t.status === 'Failed' || t.status === 'Cancelled';
                  const orderId = `ORD-${t.id.replace(/[^0-9]/g, '') || '91823'}`;

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f0ebfa' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary-purple)' }}>{t.id}</div>
                        <div style={{ fontSize: '11.5px', color: '#7e7694', fontWeight: '600' }}>{orderId}</div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: '800', color: '#1e1b2e' }}>Demo User</div>
                        <div style={{ fontSize: '11.5px', color: '#7e7694' }}>9999999999</div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: '800', color: t.asset === 'Gold' ? '#b45309' : '#475569' }}>
                          {t.asset}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e1b2e', fontWeight: '700' }}>{t.quantity}</div>
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: '700', color: '#5b5375' }}>
                        ₹ {numAmt.toFixed(2)}
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: '700', color: '#b45309' }}>
                        + ₹ {gst}
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: '900', color: '#1e1b2e', fontSize: '14px' }}>
                        ₹ {total}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1ecfe',
                          color: 'var(--primary-purple)',
                          fontSize: '11.5px',
                          fontWeight: '800'
                        }}>
                          {t.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
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

                      <td style={{ padding: '16px 18px', color: '#736d85', fontSize: '12px' }}>
                        <div>{t.date}</div>
                        <div style={{ fontSize: '11px', color: '#948fa8' }}>{t.time || '10:00 AM'}</div>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedTxn(t)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--primary-purple)',
                            backgroundColor: '#ede7fc',
                            color: 'var(--primary-purple)',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Transaction Details Modal */}
      {selectedTxn && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            boxSizing: 'border-box',
            color: '#1e1b2e'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Transaction Details</h3>
                <div style={{ fontSize: '13px', color: 'var(--primary-purple)', fontWeight: '800', marginTop: '2px' }}>
                  {selectedTxn.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                style={{ background: 'transparent', border: 'none', color: '#7e7694', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f8f6fc',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13.5px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Asset</span>
                <strong>24KT {selectedTxn.asset} ({selectedTxn.quantity})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Base Amount</span>
                <strong>₹ {parseFloat(selectedTxn.amount || '0').toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>GST (3%)</span>
                <strong style={{ color: 'var(--primary-purple)' }}>+ ₹ {(parseFloat(selectedTxn.amount || '0') * 0.03).toFixed(2)}</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2d9fa' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900' }}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--primary-purple)' }}>
                  ₹ {(parseFloat(selectedTxn.amount || '0') * 1.03).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Payment Method</span>
                <strong>{selectedTxn.paymentMethod || 'UPI'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Status</span>
                <strong style={{ color: selectedTxn.status === 'Success' ? '#059669' : '#d97706' }}>{selectedTxn.status}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Date & Time</span>
                <span>{selectedTxn.date} · {selectedTxn.time || '10:00 AM'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="btn-primary"
              style={{ width: '100%', height: '46px', fontSize: '15px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Hand, CheckCircle2, XCircle, Clock, CheckCheck, Coins, 
  Search, X, Filter, User, Calendar, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminWithdrawals() {
  const { withdrawals, updateWithdrawalStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const filteredList = withdrawals.filter((w) => {
    // Status filter
    if (statusFilter !== 'All' && (w.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        (w.userName || '').toLowerCase().includes(q) ||
        (w.asset || '').toLowerCase().includes(q) ||
        (w.amount || '').includes(q)
      );
    }

    return true;
  });

  const handleStatusChange = (id, newStatus) => {
    updateWithdrawalStatus(id, newStatus);
    if (selectedWithdrawal && selectedWithdrawal.id === id) {
      setSelectedWithdrawal((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Search & Filter Bar */}
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
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by Withdrawal ID, User Name, Asset..."
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

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Processing', 'Approved', 'Completed', 'Rejected'].map((opt) => (
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
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Withdrawals Data Table */}
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
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Request ID</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Asset & Quantity</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Estimated Value</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Request Date</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#7e7694' }}>
                    No withdrawal requests found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((w) => {
                  const isCompleted = w.status === 'Completed';
                  const isApproved = w.status === 'Approved';
                  const isPending = w.status === 'Pending' || w.status === 'Processing';
                  const isRejected = w.status === 'Rejected';

                  return (
                    <tr key={w.id} style={{ borderBottom: '1px solid #f0ebfa' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                        {w.id}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '800', color: '#1e1b2e' }}>{w.userName || 'Customer User'}</div>
                        <div style={{ fontSize: '11.5px', color: '#7e7694' }}>{w.userId || 'USR-8821'}</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '800', color: w.asset === 'Gold' ? '#b45309' : '#475569' }}>
                          {w.asset}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e1b2e', fontWeight: '700' }}>{w.quantity}</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#1e1b2e' }}>
                        {w.amount}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#736d85', fontSize: '12.5px' }}>
                        {w.date}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          backgroundColor: isCompleted ? '#d1fae5' : isApproved ? '#e0f2fe' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isCompleted ? '#059669' : isApproved ? '#0284c7' : isPending ? '#d97706' : '#dc2626'
                        }}>
                          {w.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedWithdrawal(w)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #dcd4fa',
                              backgroundColor: '#ffffff',
                              color: '#5b5375',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Details
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusChange(w.id, 'Approved')}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#e0f2fe',
                                  color: '#0284c7',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(w.id, 'Rejected')}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleStatusChange(w.id, 'Completed')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              Complete Payout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Withdrawal Details Modal */}
      {selectedWithdrawal && (
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
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Withdrawal Request</h3>
                <div style={{ fontSize: '13px', color: 'var(--primary-purple)', fontWeight: '800', marginTop: '2px' }}>
                  {selectedWithdrawal.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
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
                <span style={{ color: '#736d85' }}>Customer Name</span>
                <strong>{selectedWithdrawal.userName || 'Demo User'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Metal Asset</span>
                <strong>{selectedWithdrawal.asset}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Quantity</span>
                <strong>{selectedWithdrawal.quantity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Payout Amount</span>
                <strong style={{ color: 'var(--primary-purple)', fontSize: '15px' }}>{selectedWithdrawal.amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Status</span>
                <strong>{selectedWithdrawal.status}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Requested Date</span>
                <span>{selectedWithdrawal.date}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {(selectedWithdrawal.status === 'Pending' || selectedWithdrawal.status === 'Processing') && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedWithdrawal.id, 'Rejected');
                      setSelectedWithdrawal(null);
                    }}
                    style={{
                      flex: 1,
                      height: '46px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedWithdrawal.id, 'Approved');
                      setSelectedWithdrawal(null);
                    }}
                    style={{
                      flex: 1,
                      height: '46px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                </>
              )}

              {selectedWithdrawal.status === 'Approved' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedWithdrawal.id, 'Completed');
                    setSelectedWithdrawal(null);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', height: '46px', fontSize: '14px', backgroundColor: '#10b981' }}
                >
                  Mark as Completed
                </button>
              )}

              {(selectedWithdrawal.status === 'Completed' || selectedWithdrawal.status === 'Rejected') && (
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="btn-primary"
                  style={{ width: '100%', height: '46px', fontSize: '14px' }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

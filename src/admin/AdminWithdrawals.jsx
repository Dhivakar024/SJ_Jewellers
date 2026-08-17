import React, { useState } from 'react';
import { Hand, CheckCircle2, XCircle, Clock, CheckCheck, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminWithdrawals() {
  const { withdrawals, updateWithdrawalStatus } = useApp();
  const [filter, setFilter] = useState('All');

  const filteredList = withdrawals.filter((w) => {
    if (filter === 'All') return true;
    return w.status.toLowerCase() === filter.toLowerCase();
  });

  const handleStatusChange = (id, newStatus) => {
    updateWithdrawalStatus(id, newStatus);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', 'Pending', 'Processing', 'Approved', 'Completed', 'Rejected'].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`filter-chip ${filter === opt ? 'active' : ''}`}
            style={{ flexShrink: 0, padding: '5px 12px', fontSize: '12px' }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 2. Withdrawals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredList.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px 20px',
            textAlign: 'center',
            color: '#7e7694'
          }}>
            <Hand size={36} color="#c4b5fd" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '4px' }}>
              No withdrawal requests
            </h4>
            <p style={{ fontSize: '12.5px', color: '#736d85' }}>
              There are no {filter.toLowerCase()} withdrawal requests.
            </p>
          </div>
        ) : (
          filteredList.map((w) => {
            const isCompleted = w.status === 'Completed';
            const isPending = w.status === 'Pending' || w.status === 'Processing';
            const isApproved = w.status === 'Approved';
            const isRejected = w.status === 'Rejected';

            return (
              <div
                key={w.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '16px',
                  border: '1px solid #e8e2fa',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#1e1b2e' }}>
                      {w.userName || 'Customer'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600' }}>
                      {w.id} · {w.date}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: isCompleted ? '#d1fae5' : isApproved ? '#e0f2fe' : isPending ? '#fef3c7' : '#fee2e2',
                    color: isCompleted ? '#059669' : isApproved ? '#0284c7' : isPending ? '#d97706' : '#dc2626'
                  }}>
                    {w.status}
                  </span>
                </div>

                {/* Details Box */}
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f9f7ff',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#3b3252'
                }}>
                  <div>
                    <span style={{ color: '#736d85' }}>Asset: </span>
                    <strong>{w.asset} ({w.quantity})</strong>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary-purple)' }}>
                    {w.amount}
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(w.id, 'Rejected')}
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(w.id, 'Approved')}
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(w.id, 'Completed')}
                      style={{
                        flex: 1.2,
                        height: '38px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Complete
                    </button>
                  </div>
                )}

                {isApproved && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(w.id, 'Completed')}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AdminWithdrawal() {
  const { withdrawals, approveWithdrawal } = useApp();

  const [filterMetal, setFilterMetal] = useState('All');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterMetal === 'All') return true;
    return (w.metal || '').toLowerCase() === filterMetal.toLowerCase();
  });

  const totalAmount = filteredWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

  const handleConfirmApproval = () => {
    if (selectedWithdrawal) {
      approveWithdrawal(selectedWithdrawal.id);
      setSelectedWithdrawal(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Withdrawal</h1>
        <p className="admin-page-sub">
          All customer withdrawals. Filter by metal and see status, rate on withdrawal day, and total amount.
        </p>
      </div>

      {/* 2. Filter Pills - Enlarged & Comfortable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--admin-text-secondary-light)' }}>Show:</span>
        {['All', 'Gold', 'Silver'].map((opt) => {
          const isActive = filterMetal === opt;
          return (
            <button
              key={opt}
              onClick={() => setFilterMetal(opt)}
              style={{
                height: '40px',
                padding: '0 20px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid var(--admin-border-light)',
                backgroundColor: isActive 
                  ? (opt === 'All' ? 'var(--admin-orange)' : opt === 'Gold' ? '#d97706' : '#475569') 
                  : 'var(--admin-card-bg-light)',
                color: isActive ? '#ffffff' : 'var(--admin-text-secondary-light)',
                fontSize: '14.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--admin-border-subtle)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--admin-card-bg-light)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* 3. Summary Box Card */}
      <div className="admin-card">
        <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Total withdrawal amount</div>
        <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.2px', margin: '2px 0 1px 0' }}>
          ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
          {filterMetal === 'All' ? 'All metals' : `${filterMetal} only`} · {filteredWithdrawals.length} withdrawal(s)
        </div>
      </div>

      {/* 4. Withdrawals Data Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Metal</th>
              <th>Grams</th>
              <th>Rate (₹/gm)</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map((w) => {
              const isApproved = w.status === 'Approved';

              return (
                <tr key={w.id}>
                  <td style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {w.date}
                  </td>

                  <td>
                    <div style={{ fontWeight: '700' }}>{w.customer}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{w.mobile}</div>
                  </td>

                  <td style={{ fontWeight: '600' }}>
                    {w.metal}
                  </td>

                  <td style={{ fontWeight: '600' }}>
                    {w.grams}
                  </td>

                  <td style={{ fontWeight: '600' }}>
                    ₹{parseFloat(w.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td style={{ fontWeight: '800' }}>
                    ₹{parseFloat(w.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={isApproved ? 'admin-badge-green' : 'admin-badge-yellow'} style={{ width: 'fit-content' }}>
                        {w.status}
                      </span>
                      {w.paidDate && (
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                          Amount paid · {w.paidDate}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {!isApproved ? (
                      <button
                        className="admin-btn-green"
                        onClick={() => setSelectedWithdrawal(w)}
                        style={{ fontSize: '11.5px', padding: '5px 10px' }}
                      >
                        Approve & mark amount paid
                      </button>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Modal: Confirm Approval */}
      {selectedWithdrawal && (
        <div className="admin-modal-overlay" onClick={() => setSelectedWithdrawal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>
              Confirm approval
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Please confirm the details below. This will mark the withdrawal as approved and amount paid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Date</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Customer</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Mobile</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.mobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Metal</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.metal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Grams</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.grams} g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Rate (₹/gm)</span>
                <span style={{ fontWeight: '600' }}>₹{parseFloat(selectedWithdrawal.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: '#6b7280' }}>Amount (₹)</span>
                <span style={{ fontWeight: '800', color: 'var(--admin-orange)' }}>
                  ₹{parseFloat(selectedWithdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="admin-btn-secondary"
                onClick={() => setSelectedWithdrawal(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn-green"
                onClick={handleConfirmApproval}
              >
                Confirm & mark amount paid
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

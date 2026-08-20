import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AdminWithdrawal() {
  const { withdrawals, approveWithdrawal } = useApp();

  const [filterMetal, setFilterMetal] = useState('All'); // 'All', 'Gold', 'Silver'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Withdrawal</h1>
        <p className="admin-page-sub">
          All customer withdrawals. Filter by metal and see status, rate on withdrawal day, and total amount.
        </p>
      </div>

      {/* 2. Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Show:</span>
        {['All', 'Gold', 'Silver'].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterMetal(opt)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: filterMetal === opt ? 'var(--admin-orange)' : '#f1f5f9',
              color: filterMetal === opt ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 3. Summary Box Card */}
      <div className="admin-card">
        <div style={{ fontSize: '12px', color: '#64748b' }}>Total withdrawal amount</div>
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.3px', margin: '4px 0' }}>
          ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
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
                  <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                    {w.date}
                  </td>

                  <td>
                    <div style={{ fontWeight: '700' }}>{w.customer}</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{w.mobile}</div>
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
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
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
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Approve & mark amount paid
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
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
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>
              Confirm approval
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 18px 0', lineHeight: 1.4 }}>
              Please confirm the details below. This will mark the withdrawal as approved and amount paid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Date</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Customer</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Mobile</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.mobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Metal</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.metal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Grams</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.grams} g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Rate (₹/gm)</span>
                <span style={{ fontWeight: '700' }}>₹{parseFloat(selectedWithdrawal.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>Amount (₹)</span>
                <span style={{ fontWeight: '800' }}>₹{parseFloat(selectedWithdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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

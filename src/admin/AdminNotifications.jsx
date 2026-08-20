import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminNotifications() {
  const { withdrawals, pendingVerifications, approveWithdrawal, verifyCustomer } = useApp();

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');

  const handleConfirmPaid = () => {
    if (selectedWithdrawal) {
      approveWithdrawal(selectedWithdrawal.id);
      setSelectedWithdrawal(null);
    }
  };

  const handleVerifyAccount = () => {
    if (selectedVerification) {
      verifyCustomer(selectedVerification.id, selectedVerification.name);
      setSelectedVerification(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Notifications</h1>
        <p className="admin-page-sub">
          Withdrawal payments to confirm and new customer accounts to verify.
        </p>
      </div>

      {/* 2. Pending Withdrawal Payments Section */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Pending withdrawal payments</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Confirm when the amount has been paid to the customer.
            </p>
          </div>

          <span className="admin-badge-green">
            {pendingWithdrawals.length} pending
          </span>
        </div>

        {/* Withdrawal List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingWithdrawals.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px 0' }}>
              No pending withdrawal payments.
            </div>
          ) : (
            pendingWithdrawals.map((w) => (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border-light)',
                  backgroundColor: 'rgba(248, 250, 252, 0.6)'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                    {w.customer} · {w.metal}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '2px' }}>
                    {w.grams} · ₹{parseFloat(w.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    Mobile: {w.mobile} · {w.date}
                  </div>
                </div>

                <button
                  className="admin-btn-outline-green"
                  onClick={() => setSelectedWithdrawal(w)}
                >
                  Confirm paid
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Pending User Verifications Section */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Pending user verifications</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Click a user to view full details and verify their account.
            </p>
          </div>

          <span className="admin-badge-green">
            {pendingVerifications.length} pending
          </span>
        </div>

        {/* Verification List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingVerifications.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px 0' }}>
              No pending user verifications.
            </div>
          ) : (
            pendingVerifications.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border-light)',
                  backgroundColor: 'rgba(248, 250, 252, 0.6)'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Mobile: {v.mobile} · Role: {v.role}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    Created: {v.created}
                  </div>
                </div>

                <button
                  className="admin-btn-outline-green"
                  onClick={() => setSelectedVerification(v)}
                >
                  Tap to review
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Modal: Confirm Amount Paid */}
      {selectedWithdrawal && (
        <div className="admin-modal-overlay" onClick={() => setSelectedWithdrawal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>
              Confirm amount paid
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 18px 0', lineHeight: 1.4 }}>
              Confirm that you have paid this amount to the customer. The transaction will show as completed for the customer.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '22px' }}>
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
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.grams}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Amount (₹)</span>
                <span style={{ fontWeight: '800' }}>₹{parseFloat(selectedWithdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>Requested at</span>
                <span style={{ color: '#94a3b8' }}>{selectedWithdrawal.date}</span>
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
                onClick={handleConfirmPaid}
              >
                Confirm amount paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Verify Customer */}
      {selectedVerification && (
        <div className="admin-modal-overlay" onClick={() => setSelectedVerification(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>
              Verify customer
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 18px 0', lineHeight: 1.4 }}>
              Please confirm this customer's details before verifying their account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Name</span>
                <span style={{ fontWeight: '700' }}>{selectedVerification.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Mobile</span>
                <span style={{ fontWeight: '700' }}>{selectedVerification.mobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Role</span>
                <span style={{ fontWeight: '700' }}>{selectedVerification.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#64748b' }}>Mobile verified</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>{selectedVerification.mobileVerified}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>Created at</span>
                <span style={{ color: '#94a3b8' }}>{selectedVerification.created}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="admin-btn-secondary"
                onClick={() => setSelectedVerification(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn-green"
                onClick={handleVerifyAccount}
              >
                Verify account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Notifications</h1>
        <p className="admin-page-sub">
          Withdrawal payments to confirm and new customer accounts to verify.
        </p>
      </div>

      {/* 2. Pending Withdrawal Payments Section - Subtle Mint Green Tint */}
      <div className="admin-card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#065f46' }}>
              Pending withdrawal payments
            </h3>
            <p style={{ fontSize: '12.5px', color: '#047857', margin: '2px 0 0 0' }}>
              Confirm when the amount has been paid to the customer.
            </p>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: '700',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #86efac'
          }}>
            {pendingWithdrawals.length} pending
          </span>
        </div>

        {/* Withdrawal List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingWithdrawals.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#059669', padding: '8px 0' }}>
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
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                    {w.customer} · {w.metal}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', marginTop: '2px', color: '#111827' }}>
                    {w.grams} · ₹{parseFloat(w.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
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

      {/* 3. Pending User Verifications Section - Subtle Warm Gold Tint */}
      <div className="admin-card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#FFF9E6',
        border: '1px solid #F5D76E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#92400e' }}>
              Pending user verifications
            </h3>
            <p style={{ fontSize: '12.5px', color: '#b45309', margin: '2px 0 0 0' }}>
              Click a user to view full details and verify their account.
            </p>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: '700',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a'
          }}>
            {pendingVerifications.length} pending
          </span>
        </div>

        {/* Verification List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingVerifications.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#b45309', padding: '8px 0' }}>
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
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#b45309' }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Mobile: {v.mobile} · Role: {v.role}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '2px' }}>
                    Created: {v.created}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVerification(v)}
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fde68a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef3c7';
                  }}
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
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>
              Confirm amount paid
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Confirm that you have transferred the withdrawal amount to the customer.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginBottom: '20px' }}>
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
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.grams}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Amount</span>
                <span style={{ fontWeight: '700', color: 'var(--admin-orange)' }}>
                  ₹{parseFloat(selectedWithdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: '#6b7280' }}>Requested at</span>
                <span style={{ color: '#6b7280' }}>{selectedWithdrawal.date}</span>
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
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>
              Verify customer
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Review customer details and verify their account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Name</span>
                <span style={{ fontWeight: '600' }}>{selectedVerification.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Mobile</span>
                <span style={{ fontWeight: '600' }}>{selectedVerification.mobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Role</span>
                <span style={{ fontWeight: '600' }}>{selectedVerification.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <span style={{ color: '#6b7280' }}>Mobile verified</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>{selectedVerification.mobileVerified}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: '#6b7280' }}>Created at</span>
                <span style={{ color: '#6b7280' }}>{selectedVerification.created}</span>
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

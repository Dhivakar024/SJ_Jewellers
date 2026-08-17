import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Eye, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminKyc() {
  const { kycRequests, approveKyc, rejectKyc, usersList } = useApp();
  const [filter, setFilter] = useState('Pending'); // 'All', 'Pending', 'Verified', 'Rejected'
  const [selectedKyc, setSelectedKyc] = useState(null);

  const filteredRequests = kycRequests.filter((k) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return k.status === 'Pending' || k.status === 'Under Review';
    return k.status === filter;
  });

  const handleApprove = (kyc) => {
    approveKyc(kyc.id, kyc.userId);
    if (selectedKyc && selectedKyc.id === kyc.id) {
      setSelectedKyc({ ...selectedKyc, status: 'Verified' });
    }
  };

  const handleReject = (kyc) => {
    rejectKyc(kyc.id, kyc.userId);
    if (selectedKyc && selectedKyc.id === kyc.id) {
      setSelectedKyc({ ...selectedKyc, status: 'Rejected' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['Pending', 'All', 'Verified', 'Rejected'].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`filter-chip ${filter === opt ? 'active' : ''}`}
            style={{ flexShrink: 0, padding: '6px 14px', fontSize: '12.5px' }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 2. KYC Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRequests.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px 20px',
            textAlign: 'center',
            color: '#7e7694'
          }}>
            <ShieldCheck size={36} color="#c4b5fd" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e', marginBottom: '4px' }}>
              No KYC requests found
            </h4>
            <p style={{ fontSize: '12.5px', color: '#736d85' }}>
              There are no {filter.toLowerCase()} verification requests at this moment.
            </p>
          </div>
        ) : (
          filteredRequests.map((k) => {
            const isPending = k.status === 'Pending' || k.status === 'Under Review';
            const isVerified = k.status === 'Verified';

            return (
              <div
                key={k.id}
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
                {/* Top Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#1e1b2e' }}>
                      {k.userName || 'Customer'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600' }}>
                      +91 {k.mobile} · {k.submittedDate || 'Today'}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: isVerified ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2',
                    color: isVerified ? '#059669' : isPending ? '#d97706' : '#dc2626'
                  }}>
                    {k.status}
                  </span>
                </div>

                {/* ID Proof details */}
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f9f7ff',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#3b3252',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#736d85' }}>PAN Card:</span>
                    <strong>{k.pan || 'ABCDE1234F'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#736d85' }}>Aadhaar No:</span>
                    <strong>{k.aadhar || '1234-5678-9012'}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedKyc(k)}
                    style={{
                      flex: 1,
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #dcd4fa',
                      backgroundColor: '#ffffff',
                      color: '#4a3e68',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={15} />
                    <span>View</span>
                  </button>

                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(k)}
                        style={{
                          flex: 1,
                          height: '40px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <XCircle size={15} />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(k)}
                        style={{
                          flex: 1.2,
                          height: '40px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Detailed Document Preview Modal */}
      {selectedKyc && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedKyc(null)}
          style={{ zIndex: 100 }}
        >
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto', padding: '24px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>
                  KYC Verification
                </h3>
                <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600' }}>
                  {selectedKyc.userName} ({selectedKyc.userId})
                </div>
              </div>
              <button
                onClick={() => setSelectedKyc(null)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#ede7fc',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4a3e68'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f9f7ff',
              borderRadius: '18px',
              padding: '16px',
              border: '1px solid #e8e2fa',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#736d85' }}>Status:</span>
                <strong>{selectedKyc.status}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#736d85' }}>PAN Card No:</span>
                <strong>{selectedKyc.pan || 'ABCDE1234F'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#736d85' }}>Aadhaar No:</span>
                <strong>{selectedKyc.aadhar || '1234-5678-9012'}</strong>
              </div>
            </div>

            {/* Document Card Mock Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: '#ede7fc',
                border: '1px dashed var(--primary-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileText size={20} color="var(--primary-purple)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-purple)' }}>PAN Card Document</div>
                  <div style={{ fontSize: '11px', color: '#736d85' }}>Verified Format · Government of India</div>
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: '#ede7fc',
                border: '1px dashed var(--primary-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileText size={20} color="var(--primary-purple)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-purple)' }}>Aadhaar Card Document</div>
                  <div style={{ fontSize: '11px', color: '#736d85' }}>UIDAI Format Verified</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {(selectedKyc.status === 'Pending' || selectedKyc.status === 'Under Review') && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleReject(selectedKyc)}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Reject KYC
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedKyc)}
                  style={{
                    flex: 1.5,
                    height: '48px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Approve KYC
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

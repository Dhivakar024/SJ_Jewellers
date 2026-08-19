import React, { useState } from 'react';
import { 
  Search, User, ShieldCheck, ChevronRight, X, Phone, Mail, 
  MapPin, CreditCard, Building, Coins, History, CheckCircle2, Ban, Eye 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminUsers() {
  const { usersList, toggleBlockUser, transactions, withdrawals } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = usersList.filter((u) => {
    // Status filter
    if (statusFilter === 'Active' && u.status !== 'Active') return false;
    if (statusFilter === 'Blocked' && u.status !== 'Blocked') return false;
    if (statusFilter === 'Verified' && u.kycStatus !== 'Verified') return false;
    if (statusFilter === 'Pending KYC' && u.kycStatus === 'Verified') return false;

    // Search query
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.mobile || '').includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Toolbar (Search & Filter) */}
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
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by User ID, Name, Mobile, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '46px',
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
          <Search size={18} color="#7e7694" style={{ position: 'absolute', left: '14px', top: '14px' }} />
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Active', 'Blocked', 'Verified', 'Pending KYC'].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: statusFilter === opt ? 'none' : '1px solid #e2d9fa',
                backgroundColor: statusFilter === opt ? 'var(--primary-purple)' : '#f6f2ff',
                color: statusFilter === opt ? '#ffffff' : '#5b5375',
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
      </div>

      {/* 2. Users Table Container */}
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
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>User</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Contact</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Gold Balance</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Silver Balance</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>KYC Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>Account Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#7e7694' }}>
                    No users match the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVerified = u.kycStatus === 'Verified';
                  const isBlocked = u.status === 'Blocked';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f0ebfa' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-purple)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '15px'
                          }}>
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b2e' }}>{u.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#7e7694', fontWeight: '600' }}>{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#1e1b2e' }}>{u.mobile}</div>
                        <div style={{ fontSize: '12px', color: '#7e7694' }}>{u.email || 'No email provided'}</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#b45309' }}>
                        {(parseFloat(u.goldGrams) || 0).toFixed(4)} gm
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#475569' }}>
                        {(parseFloat(u.silverGrams) || 0).toFixed(4)} gm
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          backgroundColor: isVerified ? '#d1fae5' : u.kycStatus === 'Under Review' ? '#fef3c7' : '#fee2e2',
                          color: isVerified ? '#059669' : u.kycStatus === 'Under Review' ? '#d97706' : '#dc2626'
                        }}>
                          {u.kycStatus || 'Pending'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          backgroundColor: !isBlocked ? '#d1fae5' : '#fee2e2',
                          color: !isBlocked ? '#059669' : '#dc2626'
                        }}>
                          {u.status || 'Active'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedUser(u)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--primary-purple)',
                              backgroundColor: '#ede7fc',
                              color: 'var(--primary-purple)',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => toggleBlockUser(u.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: isBlocked ? '1px solid #10b981' : '1px solid #ef4444',
                              backgroundColor: isBlocked ? '#d1fae5' : '#fee2e2',
                              color: isBlocked ? '#059669' : '#dc2626',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {isBlocked ? 'Activate' : 'Block'}
                          </button>
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

      {/* 3. User Details Drawer Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 100
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            height: '100%',
            overflowY: 'auto',
            padding: '28px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.2)'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  backgroundColor: 'var(--primary-purple)', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '18px'
                }}>
                  {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#1e1b2e' }}>{selectedUser.name}</h3>
                  <div style={{ fontSize: '12px', color: '#7e7694', fontWeight: '600' }}>ID: {selectedUser.id}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7e7694',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Holdings Card */}
            <div style={{
              backgroundColor: '#f6f2ff',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #e8e2fa',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#b45309' }}>Gold Balance</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e1b2e', marginTop: '2px' }}>
                  {(parseFloat(selectedUser.goldGrams) || 0).toFixed(4)} gm
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Silver Balance</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e1b2e', marginTop: '2px' }}>
                  {(parseFloat(selectedUser.silverGrams) || 0).toFixed(4)} gm
                </div>
              </div>
            </div>

            {/* Profile Info Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>
                Profile & KYC Information
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Mobile Number</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.mobile}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Email Address</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.email || 'Not provided'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>PAN Card</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.pan || 'Not Submitted'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Aadhaar Number</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.aadhar || 'Not Submitted'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Bank Account</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.accountNumber || 'Not Linked'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>IFSC Code</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.ifsc || 'Not Linked'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Nominee Name</span>
                  <strong style={{ color: '#1e1b2e' }}>{selectedUser.nomineeName || 'None'} ({selectedUser.relationship || 'N/A'})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f6fc', borderRadius: '10px' }}>
                  <span style={{ color: '#736d85', fontWeight: '600' }}>Address</span>
                  <strong style={{ color: '#1e1b2e', maxWidth: '240px', textAlign: 'right' }}>{selectedUser.address || 'Salem, Tamil Nadu'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Toggle Status */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e8e2fa' }}>
              <button
                onClick={() => {
                  toggleBlockUser(selectedUser.id);
                  setSelectedUser((prev) => ({
                    ...prev,
                    status: prev.status === 'Active' ? 'Blocked' : 'Active'
                  }));
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: selectedUser.status === 'Active' ? '#fee2e2' : '#d1fae5',
                  color: selectedUser.status === 'Active' ? '#dc2626' : '#059669',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {selectedUser.status === 'Active' ? 'Deactivate / Block User' : 'Activate User'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

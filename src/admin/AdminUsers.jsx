import React, { useState } from 'react';
import { Search, User, ShieldCheck, ChevronRight, X, Phone, Mail, MapPin, CreditCard, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminUsers() {
  const { usersList } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.mobile || '').includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Search Bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name, mobile, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="profile-custom-input"
          style={{ paddingLeft: '40px', backgroundColor: '#ffffff' }}
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

      {/* 2. User Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            color: '#7e7694'
          }}>
            No users match your search.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isVerified = u.kycStatus === 'Verified';
            const isCompleted = u.profileCompleted === true;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '16px',
                  border: '1px solid #e8e2fa',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-purple)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '17px'
                    }}>
                      {(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#1e1b2e' }}>
                        {u.name || 'New Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600' }}>
                        +91 {u.mobile} · {u.id}
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={18} color="#948fa8" />
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: isVerified ? '#d1fae5' : '#fef3c7',
                    color: isVerified ? '#059669' : '#d97706'
                  }}>
                    KYC: {u.kycStatus || 'Pending'}
                  </span>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: isCompleted ? '#ede7fc' : '#fee2e2',
                    color: isCompleted ? 'var(--primary-purple)' : '#dc2626'
                  }}>
                    Profile: {isCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </div>

                {/* Holdings summary */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#f9f7ff',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#3b3252'
                }}>
                  <span>Gold: <strong>{(parseFloat(u.goldGrams) || 0).toFixed(4)} g</strong></span>
                  <span>Silver: <strong>{(parseFloat(u.silverGrams) || 0).toFixed(4)} g</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. User Details Bottom Sheet Modal */}
      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUser(null)}
          style={{ zIndex: 100 }}
        >
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto', padding: '24px 20px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>
                  {selectedUser.name || 'User Details'}
                </h3>
                <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600' }}>
                  User ID: {selectedUser.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
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

            {/* Account Details Box */}
            <div style={{
              backgroundColor: '#f9f7ff',
              borderRadius: '18px',
              padding: '16px',
              border: '1px solid #e8e2fa',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                Account Information
              </h4>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Mobile:</span>
                <strong>+91 {selectedUser.mobile}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Email:</span>
                <strong>{selectedUser.email || 'Not provided'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>PAN Card:</span>
                <strong>{selectedUser.pan || 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Aadhaar:</span>
                <strong>{selectedUser.aadhar || 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Bank A/C:</span>
                <strong>{selectedUser.accountNumber || 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>IFSC:</span>
                <strong>{selectedUser.ifsc || 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Address:</span>
                <strong style={{ maxWidth: '180px', textAlign: 'right' }}>{selectedUser.address || 'Pending'}</strong>
              </div>
            </div>

            {/* Nominee Details Box */}
            <div style={{
              backgroundColor: '#f9f7ff',
              borderRadius: '18px',
              padding: '16px',
              border: '1px solid #e8e2fa',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary-purple)' }}>
                Nominee Information
              </h4>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Nominee Name:</span>
                <strong>{selectedUser.nomineeName || 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Relationship:</span>
                <strong>{selectedUser.relationship === 'Other' && selectedUser.relationshipDetails ? `Other (${selectedUser.relationshipDetails})` : (selectedUser.relationship || 'Pending')}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Nominee Mobile:</span>
                <strong>{selectedUser.nomineeMobile ? `+91 ${selectedUser.nomineeMobile}` : 'Pending'}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#3b3252', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736d85' }}>Nominee DOB:</span>
                <strong>{selectedUser.nomineeDob || 'Pending'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

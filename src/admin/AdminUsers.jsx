import React, { useState } from 'react';
import { Search, ShieldCheck, Lock, Unlock, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminUsers() {
  const { usersList, toggleBlockUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = usersList.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile.includes(searchTerm) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Actions Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search users by name, mobile, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #2d2645',
              backgroundColor: '#171427', padding: '0 14px 0 40px', fontSize: '13px', color: '#ffffff', outline: 'none'
            }}
          />
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
        </div>

        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>
          Showing <strong>{filteredUsers.length}</strong> registered users
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '20px',
        border: '1px solid #2d2645',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#100d1c', color: '#94a3b8', borderBottom: '1px solid #2d2645' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>User ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Name</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Mobile</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Email</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Gold Bal</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Silver Bal</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>KYC Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #231e36', color: '#e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#a78bfa' }}>{u.id}</td>
                <td style={{ padding: '16px 20px', fontWeight: '700' }}>{u.name}</td>
                <td style={{ padding: '16px 20px' }}>{u.mobile}</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: '16px 20px', fontWeight: '700', color: '#ffd000' }}>{u.goldGrams.toFixed(4)} gm</td>
                <td style={{ padding: '16px 20px', fontWeight: '700', color: '#cbd5e1' }}>{u.silverGrams.toFixed(4)} gm</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    backgroundColor: u.kycStatus === 'Verified' ? '#064e3b' : u.kycStatus === 'Rejected' ? '#7f1d1d' : '#78350f',
                    color: u.kycStatus === 'Verified' ? '#34d399' : u.kycStatus === 'Rejected' ? '#f87171' : '#fbbf24',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {u.kycStatus}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    backgroundColor: u.status === 'Active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: u.status === 'Active' ? '#34d399' : '#f87171',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedUser(u)}
                      style={{
                        backgroundColor: '#2d2447', border: '1px solid #583cf5', color: '#ffffff',
                        padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => toggleBlockUser(u.id)}
                      style={{
                        backgroundColor: u.status === 'Active' ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)',
                        border: 'none',
                        color: u.status === 'Active' ? '#f87171' : '#34d399',
                        padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      {u.status === 'Active' ? <Lock size={14} /> : <Unlock size={14} />}
                      <span>{u.status === 'Active' ? 'Block' : 'Unblock'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal View */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div style={{
            backgroundColor: '#171427', borderRadius: '24px', border: '1px solid #2d2645',
            padding: '28px', width: '450px', color: '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>User Details: {selectedUser.name}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
              <div><strong>User ID:</strong> {selectedUser.id}</div>
              <div><strong>Mobile:</strong> {selectedUser.mobile}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Gold Balance:</strong> {selectedUser.goldGrams.toFixed(4)} gm</div>
              <div><strong>Silver Balance:</strong> {selectedUser.silverGrams.toFixed(4)} gm</div>
              <div><strong>KYC Status:</strong> {selectedUser.kycStatus}</div>
              <div><strong>Account Status:</strong> {selectedUser.status}</div>
              <div><strong>Joined Date:</strong> {selectedUser.createdAt}</div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              style={{
                width: '100%', height: '44px', borderRadius: '12px', border: 'none',
                backgroundColor: '#583cf5', color: '#ffffff', fontWeight: '800', marginTop: '20px', cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

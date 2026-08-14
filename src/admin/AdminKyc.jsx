import React, { useState } from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminKyc() {
  const { kycRequests, approveKyc, rejectKyc } = useApp();
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Verified', 'Rejected'

  const filteredKyc = kycRequests.filter((k) => {
    if (activeTab === 'Pending') return k.status === 'Pending' || k.status === 'Under Review';
    return k.status === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['Pending', 'Verified', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#583cf5' : '#171427',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {/* KYC Table */}
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '20px',
        border: '1px solid #2d2645',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#100d1c', color: '#94a3b8', borderBottom: '1px solid #2d2645' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>KYC ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>User</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Mobile</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>PAN Card</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Aadhaar No</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Submitted Date</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKyc.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No {activeTab.toLowerCase()} KYC requests found.
                </td>
              </tr>
            ) : (
              filteredKyc.map((k) => (
                <tr key={k.id} style={{ borderBottom: '1px solid #231e36', color: '#e2e8f0' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#a78bfa' }}>{k.id}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>{k.userName}</td>
                  <td style={{ padding: '16px 20px' }}>{k.mobile}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>{k.pan || 'ABCDE1234F'}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>{k.aadhar || '1234-5678-9012'}</td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{k.submittedDate}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      backgroundColor: k.status === 'Verified' ? '#064e3b' : k.status === 'Rejected' ? '#7f1d1d' : '#78350f',
                      color: k.status === 'Verified' ? '#34d399' : k.status === 'Rejected' ? '#f87171' : '#fbbf24',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                    }}>
                      {k.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {k.status !== 'Verified' && k.status !== 'Rejected' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => approveKyc(k.id, k.userId)}
                          style={{
                            backgroundColor: '#059669', border: 'none', color: '#ffffff',
                            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700'
                          }}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectKyc(k.id, k.userId)}
                          style={{
                            backgroundColor: '#dc2626', border: 'none', color: '#ffffff',
                            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700'
                          }}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

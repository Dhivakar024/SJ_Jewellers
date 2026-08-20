import React from 'react';
import { useApp } from '../context/AppContext';

export default function AdminMembers() {
  const { members } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Members</h1>
        <p className="admin-page-sub">
          All registered users ({members.length})
        </p>
      </div>

      {/* 2. Members Table Container */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USERNAME</th>
              <th>MOBILE</th>
              <th>ROLE</th>
              <th>VERIFIED</th>
              <th>MOBILE VERIFIED</th>
              <th>ACTIVE</th>
              <th>CREATED</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isVerified = m.verified === 'Yes';
              const isMobileVerified = m.mobileVerified === 'Yes';
              const isActive = m.active === 'Yes';

              return (
                <tr key={m.id}>
                  <td style={{ color: '#6b7280', fontWeight: '600' }}>{m.id}</td>
                  
                  {/* Username in orange/terracotta color */}
                  <td style={{ fontWeight: '700', color: 'var(--admin-orange)' }}>
                    {m.username}
                  </td>

                  <td style={{ fontWeight: '500' }}>
                    {m.mobile}
                  </td>

                  <td>
                    <span className="admin-badge-gray">
                      {m.role || 'customer'}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', color: isVerified ? '#10b981' : '#f59e0b' }}>
                      {m.verified || 'No'}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', color: isMobileVerified ? '#10b981' : '#f59e0b' }}>
                      {m.mobileVerified || 'Yes'}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', color: isActive ? '#10b981' : '#ef4444' }}>
                      {m.active || 'Yes'}
                    </span>
                  </td>

                  <td style={{ color: '#6b7280' }}>
                    {m.created}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

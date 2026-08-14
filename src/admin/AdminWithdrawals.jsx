import React from 'react';
import { Hand, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminWithdrawals() {
  const { withdrawals, updateWithdrawalStatus } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>
        Manage metal withdrawal requests submitted by users
      </div>

      <div style={{
        backgroundColor: '#171427',
        borderRadius: '20px',
        border: '1px solid #2d2645',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#100d1c', color: '#94a3b8', borderBottom: '1px solid #2d2645' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Withdrawal ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>User</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Asset</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Quantity</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Value</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Requested Date</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No withdrawal requests recorded.
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #231e36', color: '#e2e8f0' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#a78bfa' }}>{w.id}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>{w.userName}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>
                    <span style={{ color: w.asset === 'Gold' ? '#ffd000' : '#cbd5e1' }}>{w.asset}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>{w.quantity}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '800' }}>{w.amount}</td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{w.date}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      backgroundColor: w.status === 'Completed' ? '#064e3b' : w.status === 'Processing' ? '#0284c7' : w.status === 'Rejected' ? '#7f1d1d' : '#78350f',
                      color: w.status === 'Completed' ? '#34d399' : w.status === 'Processing' ? '#38bdf8' : w.status === 'Rejected' ? '#f87171' : '#fbbf24',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select
                      value={w.status}
                      onChange={(e) => updateWithdrawalStatus(w.id, e.target.value)}
                      style={{
                        backgroundColor: '#2d2447', color: '#ffffff', border: '1px solid #583cf5',
                        borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
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

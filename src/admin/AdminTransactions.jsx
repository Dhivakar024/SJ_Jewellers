import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminTransactions() {
  const { transactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.date.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = assetFilter === 'All' || t.asset === assetFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesAsset && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search Txn ID, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', height: '42px', borderRadius: '12px', border: '1px solid #2d2645',
              backgroundColor: '#171427', padding: '0 14px 0 38px', fontSize: '13px', color: '#ffffff', outline: 'none'
            }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
        </div>

        {/* Asset Filter */}
        <select
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
          style={{
            height: '42px', borderRadius: '12px', border: '1px solid #2d2645',
            backgroundColor: '#171427', color: '#ffffff', padding: '0 14px', fontSize: '13px', fontWeight: '700'
          }}
        >
          <option value="All">All Assets</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: '42px', borderRadius: '12px', border: '1px solid #2d2645',
            backgroundColor: '#171427', color: '#ffffff', padding: '0 14px', fontSize: '13px', fontWeight: '700'
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div style={{
        backgroundColor: '#171427',
        borderRadius: '20px',
        border: '1px solid #2d2645',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#100d1c', color: '#94a3b8', borderBottom: '1px solid #2d2645' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Txn ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Date & Time</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Asset</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Quantity</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Payment Method</th>
              <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #231e36', color: '#e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#a78bfa' }}>{t.id}</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{t.date} {t.time}</td>
                <td style={{ padding: '16px 20px', fontWeight: '700' }}>
                  <span style={{ color: t.asset === 'Gold' ? '#ffd000' : '#cbd5e1' }}>{t.asset}</span>
                </td>
                <td style={{ padding: '16px 20px', fontWeight: '700' }}>{t.quantity}</td>
                <td style={{ padding: '16px 20px', fontWeight: '800' }}>₹ {t.amount}</td>
                <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{t.paymentMethod || 'UPI'}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    backgroundColor: t.status === 'Success' ? '#064e3b' : t.status === 'Pending' ? '#78350f' : '#7f1d1d',
                    color: t.status === 'Success' ? '#34d399' : t.status === 'Pending' ? '#fbbf24' : '#f87171',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

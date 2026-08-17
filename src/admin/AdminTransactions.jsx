import React, { useState } from 'react';
import { Smartphone, CreditCard, Building2, SlidersHorizontal, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminTransactions() {
  const { transactions } = useApp();
  const [filterAsset, setFilterAsset] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = transactions.filter((item) => {
    // Asset filter
    if (filterAsset !== 'All' && item.asset.toLowerCase() !== filterAsset.toLowerCase()) {
      return false;
    }
    // Status filter
    if (filterStatus !== 'All' && item.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        (item.paymentMethod || '').toLowerCase().includes(q) ||
        (item.asset || '').toLowerCase().includes(q) ||
        (item.amount || '').includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Search Bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by Txn ID, amount, method..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="profile-custom-input"
          style={{ paddingLeft: '40px', backgroundColor: '#ffffff' }}
        />
        <Search size={18} color="#7e7694" style={{ position: 'absolute', left: '14px', top: '13px' }} />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
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

      {/* 2. Filter Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Asset Filter */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['All', 'Gold', 'Silver'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterAsset(opt)}
              className={`filter-chip ${filterAsset === opt ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '5px 12px', fontSize: '12px' }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['All', 'Success', 'Pending', 'Processing', 'Cancelled', 'Failed'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={`filter-chip ${filterStatus === opt ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '5px 12px', fontSize: '12px' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Transaction Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredList.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            color: '#7e7694'
          }}>
            No transactions match the selected filters.
          </div>
        ) : (
          filteredList.map((item) => {
            const isSuccess = item.status === 'Success';
            const isPending = item.status === 'Pending';
            const isFailed = item.status === 'Failed';

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  border: '1px solid #e8e2fa',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isSuccess ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.paymentMethod === 'Card' ? (
                      <CreditCard size={18} color={isFailed ? '#dc2626' : '#10b981'} />
                    ) : item.paymentMethod === 'NetBanking' ? (
                      <Building2 size={18} color={isFailed ? '#dc2626' : '#10b981'} />
                    ) : (
                      <Smartphone size={18} color={isFailed ? '#dc2626' : '#10b981'} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b2e' }}>
                        {item.asset} · {item.quantity}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: isSuccess ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isSuccess ? '#059669' : isPending ? '#d97706' : '#dc2626'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#827a9e', fontWeight: '600', marginTop: '2px' }}>
                      {item.id} · {item.date} · {item.paymentMethod || 'UPI'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e1b2e', textAlign: 'right', flexShrink: 0 }}>
                  ₹ {item.amount}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

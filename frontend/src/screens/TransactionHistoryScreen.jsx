import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, Smartphone, CreditCard, Building2, X, RotateCcw, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function TransactionHistoryScreen({ onNavigate, onTogglePlus }) {
  const { transactions, fetchTransactions, transactionsLoading } = useApp();

  useEffect(() => {
    if (typeof fetchTransactions === 'function') {
      fetchTransactions();
    }
  }, [fetchTransactions]);

  // Active committed filters
  const [activeAsset, setActiveAsset] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activePaymentMethod, setActivePaymentMethod] = useState('All');

  // Draft filters inside the modal
  const [draftAsset, setDraftAsset] = useState('All');
  const [draftStatus, setDraftStatus] = useState('All');
  const [draftPaymentMethod, setDraftPaymentMethod] = useState('All');

  // Modal open/close state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openFilterModal = () => {
    setDraftAsset(activeAsset);
    setDraftStatus(activeStatus);
    setDraftPaymentMethod(activePaymentMethod);
    setIsFilterOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setActiveAsset(draftAsset);
    setActiveStatus(draftStatus);
    setActivePaymentMethod(draftPaymentMethod);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftAsset('All');
    setDraftStatus('All');
    setDraftPaymentMethod('All');
    setActiveAsset('All');
    setActiveStatus('All');
    setActivePaymentMethod('All');
    setIsFilterOpen(false);
  };

  // Check if any filter is active
  const hasActiveFilters = activeAsset !== 'All' || activeStatus !== 'All' || activePaymentMethod !== 'All';

  // Dynamic Multi-Condition Filtering
  const filteredTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    return list.filter((item) => {
      // 1. Asset Filter
      if (activeAsset !== 'All' && (item.asset || '').toLowerCase() !== activeAsset.toLowerCase()) {
        return false;
      }
      // 2. Status Filter (Success, Pending, Processing, Cancelled, Failed)
      if (activeStatus !== 'All' && (item.status || '').toLowerCase() !== activeStatus.toLowerCase()) {
        return false;
      }
      // 3. Payment Method Filter
      if (activePaymentMethod !== 'All' && (item.paymentMethod || 'UPI').toLowerCase() !== activePaymentMethod.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [transactions, activeAsset, activeStatus, activePaymentMethod]);

  // Group filtered transactions by Date (TODAY, YESTERDAY, Older dates)
  const groupedTransactions = useMemo(() => {
    const getGroupHeader = (dateStr) => {
      const normalized = (dateStr || '').trim();
      const now = new Date();
      const todayFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      if (normalized === todayFormatted) {
        return {
          label: 'TODAY',
          sub: normalized
        };
      }
      if (normalized === yesterdayFormatted) {
        return {
          label: 'YESTERDAY',
          sub: normalized
        };
      }
      return {
        label: normalized ? normalized.toUpperCase() : 'OTHER',
        sub: null
      };
    };

    const groups = [];
    const dateMap = new Map();

    filteredTransactions.forEach((txn) => {
      const dateKey = txn.date || 'Other';
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey).push(txn);
    });

    dateMap.forEach((items, dateKey) => {
      groups.push({
        dateKey,
        header: getGroupHeader(dateKey),
        items
      });
    });

    return groups;
  }, [filteredTransactions]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span style={{
            backgroundColor: '#d1fae5', color: '#059669',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>Success</span>
        );
      case 'Pending':
        return (
          <span style={{
            backgroundColor: '#fef3c7', color: '#d97706',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>Pending</span>
        );
      case 'Processing':
        return (
          <span style={{
            backgroundColor: '#e0f2fe', color: '#0284c7',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>Processing</span>
        );
      case 'Cancelled':
        return (
          <span style={{
            backgroundColor: '#f1f5f9', color: '#64748b',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>Cancelled</span>
        );
      case 'Failed':
        return (
          <span style={{
            backgroundColor: '#fee2e2', color: '#dc2626',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>Failed</span>
        );
      default:
        return (
          <span style={{
            backgroundColor: '#ede7fc', color: 'var(--primary-purple)',
            fontSize: '11px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px'
          }}>{status}</span>
        );
    }
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header style={{
        backgroundColor: 'var(--primary-purple)',
        padding: '16px 18px 22px 18px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '21px', fontWeight: '800', letterSpacing: '-0.3px' }}>Transaction History</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>Your gold & silver activity</p>
          </div>
        </div>

        {/* Filter Button */}
        <button
          onClick={openFilterModal}
          style={{
            backgroundColor: hasActiveFilters ? '#ffd000' : '#ffffff',
            color: hasActiveFilters ? '#1e1b2e' : 'var(--primary-purple)',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease'
          }}
          aria-label="Filter Transactions"
        >
          <SlidersHorizontal size={15} />
          <span>Filter{hasActiveFilters ? ' •' : ''}</span>
        </button>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS, with padding for fixed bottom nav) */}
      <main className="app-scroll-content" style={{ padding: '18px 16px 85px 16px' }}>
        {/* Active Filter Chips Bar (shown if filtered) */}
        {hasActiveFilters && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e0d7fc',
            fontSize: '12px',
            fontWeight: '700',
            color: '#4a3e68'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>Filters:</span>
              {activeAsset !== 'All' && (
                <span style={{ backgroundColor: '#f0ebfd', padding: '2px 8px', borderRadius: '8px', color: 'var(--primary-purple)' }}>
                  {activeAsset}
                </span>
              )}
              {activeStatus !== 'All' && (
                <span style={{ backgroundColor: '#f0ebfd', padding: '2px 8px', borderRadius: '8px', color: 'var(--primary-purple)' }}>
                  {activeStatus}
                </span>
              )}
              {activePaymentMethod !== 'All' && (
                <span style={{ backgroundColor: '#f0ebfd', padding: '2px 8px', borderRadius: '8px', color: 'var(--primary-purple)' }}>
                  {activePaymentMethod}
                </span>
              )}
            </div>
            <button
              onClick={resetFilters}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '44px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            marginTop: '10px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f3eeff',
              color: 'var(--primary-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '6px' }}>
              No transactions found
            </h3>
            <p style={{ fontSize: '13px', color: '#736d85', fontWeight: '500', maxWidth: '240px', margin: '0 auto 20px auto', lineHeight: '1.4' }}>
              {hasActiveFilters ? 'Try adjusting or resetting your filter criteria to view your transactions.' : 'You have not made any gold or silver transactions yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{
                  backgroundColor: 'var(--primary-purple)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          /* Grouped Transactions List by Date */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {groupedTransactions.map((group, gIdx) => (
              <div key={group.dateKey || gIdx}>
                {/* Date Group Heading */}
                <div style={{ marginBottom: '10px', paddingLeft: '4px' }}>
                  {group.header.sub ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary-purple)', letterSpacing: '0.4px' }}>
                        {group.header.label}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#736d85', marginTop: '1px' }}>
                        {group.header.sub}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#4a3e68', letterSpacing: '0.4px' }}>
                      {group.header.label}
                    </div>
                  )}
                </div>

                {/* Group Card Container */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {group.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Icon Circle */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: item.status === 'Failed' ? '#fee2e2' : item.status === 'Cancelled' ? '#f1f5f9' : item.status === 'Processing' ? '#e0f2fe' : item.status === 'Pending' ? '#fef3c7' : '#e6f7ef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {item.paymentMethod === 'Card' ? (
                            <CreditCard size={20} color={item.status === 'Failed' ? '#dc2626' : item.status === 'Cancelled' ? '#64748b' : item.status === 'Processing' ? '#0284c7' : '#10b981'} />
                          ) : item.paymentMethod === 'NetBanking' ? (
                            <Building2 size={20} color={item.status === 'Failed' ? '#dc2626' : item.status === 'Cancelled' ? '#64748b' : item.status === 'Processing' ? '#0284c7' : '#10b981'} />
                          ) : (
                            <Smartphone size={20} color={item.status === 'Failed' ? '#dc2626' : item.status === 'Cancelled' ? '#64748b' : item.status === 'Processing' ? '#0284c7' : '#10b981'} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#1e1b2e' }}>
                              {item.type === 'withdrawal' ? 'Withdrawal' : (item.paymentMethod || 'UPI')}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#827a9e', fontWeight: '600', marginTop: '3px' }}>
                            {item.asset} · {item.quantity} · {item.time || item.id}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '17px', fontWeight: '900', color: item.direction === 'debit' ? '#dc2626' : '#1e1b2e', textAlign: 'right', flexShrink: 0 }}>
                        {item.direction === 'debit' ? '- ' : ''}₹ {item.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Filter Modal / Bottom Sheet */}
      {isFilterOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 13, 25, 0.65)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            padding: '24px 20px 30px 20px',
            boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.2)',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e' }}>Filter Transactions</h3>
                <p style={{ fontSize: '13px', color: '#736d85', fontWeight: '500', marginTop: '2px' }}>
                  Filter by asset, status, or payment method
                </p>
              </div>
              <button
                onClick={closeFilterModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f3eeff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4a3e68',
                  cursor: 'pointer'
                }}
                aria-label="Close Filter"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category 1: ASSET */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#2c2642', marginBottom: '10px' }}>
                ASSET
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['All', 'Gold', 'Silver'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDraftAsset(opt)}
                    className={`filter-chip ${draftAsset === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Category 2: STATUS (All, Success, Pending, Processing, Cancelled, Failed) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#2c2642', marginBottom: '10px' }}>
                STATUS
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Success', 'Pending', 'Processing', 'Cancelled', 'Failed'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDraftStatus(opt)}
                    className={`filter-chip ${draftStatus === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Category 3: PAYMENT METHOD */}
            <div style={{ marginBottom: '26px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#2c2642', marginBottom: '10px' }}>
                PAYMENT METHOD
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['All', 'UPI', 'Bank'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDraftPaymentMethod(opt)}
                    className={`filter-chip ${draftPaymentMethod === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '16px',
                  border: '1.5px solid #dcd4fa',
                  backgroundColor: 'transparent',
                  color: '#4a3e68',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Clear / Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
                style={{
                  flex: 1.4,
                  height: '48px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: 'var(--primary-purple)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(88, 60, 245, 0.35)'
                }}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Fixed Bottom Nav */}
      <BottomNav
        activeTab="home"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

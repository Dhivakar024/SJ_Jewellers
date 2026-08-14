import React from 'react';
import { ArrowLeft, SlidersHorizontal, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function TransactionHistoryScreen({ onNavigate, onTogglePlus }) {
  const { transactions } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{
        backgroundColor: 'var(--primary-purple)',
        padding: '16px 20px 24px 20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Transaction History</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>Your gold & silver activity</p>
          </div>
        </div>

        <button style={{
          backgroundColor: '#ffffff',
          color: 'var(--primary-purple)',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}>
          <SlidersHorizontal size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Content */}
      <div className="screen-content" style={{ padding: '20px 18px' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#736d85', fontWeight: '600' }}>
            No transactions found.
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {transactions.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Icon Circle */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: '#e6f7ef', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.paymentMethod === 'Card' ? (
                      <CreditCard size={20} color="#10b981" />
                    ) : item.paymentMethod === 'NetBanking' ? (
                      <Building2 size={20} color="#10b981" />
                    ) : (
                      <Smartphone size={20} color="#10b981" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b2e' }}>
                        {item.paymentMethod || 'UPI'}
                      </span>
                      {item.status === 'Success' && (
                        <span style={{
                          backgroundColor: '#d1fae5', color: '#059669',
                          fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '12px'
                        }}>Success</span>
                      )}
                      {item.status === 'Pending' && (
                        <span style={{
                          backgroundColor: '#fef3c7', color: '#d97706',
                          fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '12px'
                        }}>Pending</span>
                      )}
                      {item.status === 'Failed' && (
                        <span style={{
                          backgroundColor: '#fee2e2', color: '#dc2626',
                          fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '12px'
                        }}>Failed</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#827a9e', fontWeight: '500', marginTop: '2px' }}>
                      {item.date} · {item.asset} · {item.quantity}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b2e' }}>
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab="home"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}

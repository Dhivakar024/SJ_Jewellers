import React from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, FileText, CreditCard, 
  Hand, Coins, Settings, LogOut, ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout({ activeTab, onSelectTab, onSwitchToUserApp, children }) {
  const { adminAuth, setAdminAuth } = useApp();

  const handleLogout = () => {
    setAdminAuth({ isAuthenticated: false, email: '' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'kyc', label: 'KYC Management', icon: <ShieldCheck size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <FileText size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <Hand size={20} /> },
    { id: 'rates', label: 'Gold & Silver Rates', icon: <Coins size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f0d19',
      color: '#e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: '#171427',
        borderRight: '1px solid #2d2645',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0
      }}>
        <div>
          {/* Admin Header Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              backgroundColor: '#583cf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', color: '#ffd000', fontSize: '18px'
            }}>
              SJ
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>SJ Jewelers</div>
              <div style={{ fontSize: '11px', color: '#ffd000', fontWeight: '700', letterSpacing: '0.5px' }}>ADMIN DASHBOARD</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#583cf5' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onSwitchToUserApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '11px 0',
              borderRadius: '12px',
              border: '1px solid #583cf5',
              backgroundColor: 'rgba(88, 60, 245, 0.15)',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={16} />
            <span>Preview User Mobile App</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '11px 0',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Admin Logout</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <div style={{
          height: '64px',
          backgroundColor: '#171427',
          borderBottom: '1px solid #2d2645',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', textTransform: 'capitalize' }}>
            {activeTab} Management
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>
              Logged in as: <strong style={{ color: '#ffffff' }}>{adminAuth.email || 'admin@sjjewelers.com'}</strong>
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: '#583cf5', color: 'white', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
            }}>
              A
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

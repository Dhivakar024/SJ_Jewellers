import React from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, FileText, 
  Hand, Coins, LogOut, ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLayout({ activeTab, onSelectTab, onSwitchToUserApp, children }) {
  const { adminAuth, setAdminAuth } = useApp();

  const handleLogout = async () => {
    await authService.logoutAdmin();
    setAdminAuth({ isAuthenticated: false, email: '' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'kyc', label: 'KYC', icon: <ShieldCheck size={20} /> },
    { id: 'transactions', label: 'Txns', icon: <FileText size={20} /> },
    { id: 'withdrawals', label: 'Withdraw', icon: <Hand size={20} /> },
    { id: 'rates', label: 'Rates', icon: <Coins size={20} /> }
  ];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'users': return 'User Management';
      case 'kyc': return 'KYC Requests';
      case 'transactions': return 'Transactions';
      case 'withdrawals': return 'Withdrawals';
      case 'rates': return 'Asset Rates';
      default: return 'Admin Portal';
    }
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Mobile Fixed Top Header */}
      <header className="top-header-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '15px'
          }}>
            SJ
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{getHeaderTitle()}</h2>
            <div style={{ fontSize: '11px', color: '#e0d7fc', fontWeight: '600' }}>
              Super Admin · {adminAuth.username || 'admin'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Switch to Customer App preview */}
          <button
            onClick={onSwitchToUserApp}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 10px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="Customer App Preview"
          >
            <ExternalLink size={13} />
            <span>App</span>
          </button>

          {/* Admin Logout */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 10px',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="Admin Logout"
          >
            <LogOut size={13} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '16px 16px 72px 16px' }}>
        {children}
      </main>

      {/* 3. Mobile Fixed Admin Bottom Navigation */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5deff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 4px',
        zIndex: 40,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)'
      }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--primary-purple)' : '#8b849c',
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 10px',
                borderRadius: '14px',
                backgroundColor: isActive ? '#ede7fc' : 'transparent'
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? '800' : '600',
                letterSpacing: '-0.2px'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

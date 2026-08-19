import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, FileText, 
  Hand, Coins, CreditCard, BarChart3, Settings, LogOut, 
  Menu, X, Sparkles, User, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function AdminLayout({ activeTab, onSelectTab, children }) {
  const { adminAuth, setAdminAuth, kycRequests, withdrawals } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pendingKycCount = kycRequests.filter((k) => k.status === 'Pending' || k.status === 'Under Review').length;
  const pendingWithdrawalCount = withdrawals.filter((w) => w.status === 'Pending' || w.status === 'Processing').length;

  const handleLogout = async () => {
    await authService.logoutAdmin();
    setAdminAuth({ isAuthenticated: false, email: '' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'kyc', label: 'KYC Requests', icon: <ShieldCheck size={20} />, badge: pendingKycCount },
    { id: 'transactions', label: 'Transactions', icon: <FileText size={20} /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <Hand size={20} />, badge: pendingWithdrawalCount },
    { id: 'rates', label: 'Gold & Silver Rates', icon: <Coins size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const getHeaderTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Admin Portal';
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f8f6fc',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      color: '#1e1b2e',
      overflowX: 'hidden'
    }}>
      {/* 1. Desktop & Tablet Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#120f22',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #282240',
        zIndex: 50,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        transition: 'transform 0.25s ease',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(0)'
      }} className="admin-sidebar-desktop">
        {/* Brand Logo Header */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #231c38'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-purple) 0%, #7b5aff 100%)',
            color: '#ffd000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(88, 60, 245, 0.4)'
          }}>
            SJ
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.2px' }}>
              Salem Jewels
            </div>
            <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Admin Portal
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-purple)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: isActive ? '#ffffff' : '#a78bfa' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: isActive ? '#ffffff' : '#d97706',
                    color: isActive ? 'var(--primary-purple)' : '#ffffff',
                    fontSize: '10.5px',
                    fontWeight: '900',
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile & Logout Footer */}
        <div style={{
          padding: '16px 14px',
          borderTop: '1px solid #231c38',
          backgroundColor: '#0c0a17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-purple)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '14px'
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                {adminAuth.username || 'Administrator'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Super Admin
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. Main Desktop Content Container */}
      <div style={{
        flex: 1,
        marginLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: 'calc(100vw - 260px)'
      }} className="admin-main-wrapper">
        
        {/* Top Header Bar */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e8e2fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b2e', margin: 0 }}>
              {getHeaderTitle()}
            </h2>
            <div style={{ fontSize: '12px', color: '#736d85', fontWeight: '600', marginTop: '2px' }}>
              Salem Jewels Real-time Administration
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: '#f6f2ff',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--primary-purple)',
              border: '1px solid #e2d9fa'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>System Live</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Content Area */}
        <main style={{
          flex: 1,
          padding: '32px',
          boxSizing: 'border-box'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

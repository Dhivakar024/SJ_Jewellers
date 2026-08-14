import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MobileContainer from './components/MobileContainer';
import ActionSheet from './components/ActionSheet';

import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotUsernameScreen from './screens/ForgotUsernameScreen';
import HomeScreen from './screens/HomeScreen';
import BuyNowScreen from './screens/BuyNowScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import HoldingsScreen from './screens/HoldingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminKyc from './admin/AdminKyc';
import AdminTransactions from './admin/AdminTransactions';
import AdminPayments from './admin/AdminPayments';
import AdminWithdrawals from './admin/AdminWithdrawals';
import AdminRates from './admin/AdminRates';
import AdminSettings from './admin/AdminSettings';

import './styles/app.css';

function MainContent() {
  const { adminAuth } = useApp();
  const [viewMode, setViewMode] = useState('user'); // 'user' or 'admin'
  const [userScreen, setUserScreen] = useState('signin');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleUserNavigate = (screen) => {
    setUserScreen(screen);
    setIsActionSheetOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100vh', backgroundColor: '#0f0d19' }}>
      {/* Top Quick Mode Switcher Bar */}
      <div style={{
        backgroundColor: '#171427',
        color: '#b7a9ff',
        padding: '8px 20px',
        fontSize: '12px',
        fontWeight: '600',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 999,
        borderBottom: '1px solid #2d2645',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffd000', fontWeight: '900', fontSize: '13px' }}>✨ SJ JEWELERS PLATFORM:</span>
          
          <button
            onClick={() => setViewMode('user')}
            style={{
              backgroundColor: viewMode === 'user' ? '#583cf5' : '#0f0d19',
              color: '#ffffff',
              border: '1px solid #583cf5',
              borderRadius: '8px',
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            📱 User Mobile App View
          </button>

          <button
            onClick={() => setViewMode('admin')}
            style={{
              backgroundColor: viewMode === 'admin' ? '#583cf5' : '#0f0d19',
              color: '#ffffff',
              border: '1px solid #583cf5',
              borderRadius: '8px',
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            🖥️ Admin Dashboard View
          </button>
        </div>

        {viewMode === 'user' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Jump to screen:</span>
            <select
              value={userScreen}
              onChange={(e) => handleUserNavigate(e.target.value)}
              style={{
                backgroundColor: '#0f0d19',
                color: '#ffffff',
                border: '1px solid #583cf5',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <option value="signin">1. Sign In</option>
              <option value="signup">2. Create Account</option>
              <option value="forgot-username">3. Forgot Username</option>
              <option value="home">4. Home (Gold/Silver)</option>
              <option value="buy">5. Buy Gold</option>
              <option value="buy-silver">6. Buy Silver</option>
              <option value="withdraw">7. Withdraw & KYC Modal</option>
              <option value="transactions">8. Transaction History</option>
              <option value="contact">9. Contact Us & Form</option>
              <option value="holdings">10. Holdings Portfolio</option>
              <option value="profile">11. Profile View</option>
              <option value="create-profile">12. Create / Edit Profile</option>
            </select>
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>
            ADMIN MODE ACTIVE ({adminAuth.isAuthenticated ? 'Logged In' : 'Authentication Required'})
          </div>
        )}
      </div>

      {/* Main Body Rendering */}
      {viewMode === 'user' ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px' }}>
          <MobileContainer>
            {userScreen === 'signin' && <SignInScreen onNavigate={handleUserNavigate} />}
            {userScreen === 'signup' && <SignUpScreen onNavigate={handleUserNavigate} />}
            {userScreen === 'forgot-username' && <ForgotUsernameScreen onNavigate={handleUserNavigate} />}
            {userScreen === 'home' && <HomeScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
            {(userScreen === 'buy' || userScreen === 'buy-gold') && (
              <BuyNowScreen assetType="gold" onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />
            )}
            {userScreen === 'buy-silver' && (
              <BuyNowScreen assetType="silver" onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />
            )}
            {userScreen === 'withdraw' && <WithdrawScreen onNavigate={handleUserNavigate} />}
            {userScreen === 'transactions' && <TransactionHistoryScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
            {userScreen === 'contact' && <ContactUsScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
            {userScreen === 'holdings' && <HoldingsScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
            {userScreen === 'profile' && <ProfileScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
            {userScreen === 'create-profile' && <CreateProfileScreen onNavigate={handleUserNavigate} />}

            {/* Floating Action Menu (Page 9 overlay) */}
            <ActionSheet
              isOpen={isActionSheetOpen}
              onClose={() => setIsActionSheetOpen(false)}
              onNavigate={handleUserNavigate}
            />
          </MobileContainer>
        </div>
      ) : (
        !adminAuth.isAuthenticated ? (
          <AdminLogin onSwitchToUserApp={() => setViewMode('user')} />
        ) : (
          <AdminLayout activeTab={adminTab} onSelectTab={setAdminTab} onSwitchToUserApp={() => setViewMode('user')}>
            {adminTab === 'dashboard' && <AdminDashboard onSelectTab={setAdminTab} />}
            {adminTab === 'users' && <AdminUsers />}
            {adminTab === 'kyc' && <AdminKyc />}
            {adminTab === 'transactions' && <AdminTransactions />}
            {adminTab === 'payments' && <AdminPayments />}
            {adminTab === 'withdrawals' && <AdminWithdrawals />}
            {adminTab === 'rates' && <AdminRates />}
            {adminTab === 'settings' && <AdminSettings />}
          </AdminLayout>
        )
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

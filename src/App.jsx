import React, { useState, useEffect } from 'react';
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

  // Check URL hash for direct admin access e.g. #admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setViewMode('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleUserNavigate = (screen) => {
    setUserScreen(screen);
    setIsActionSheetOpen(false);
  };

  return (
    <div className="app-root-container">
      {/* Pure User Application Rendering */}
      {viewMode === 'user' ? (
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
      ) : (
        !adminAuth.isAuthenticated ? (
          <AdminLogin onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = ''; }} />
        ) : (
          <AdminLayout activeTab={adminTab} onSelectTab={setAdminTab} onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = ''; }}>
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

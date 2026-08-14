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
  const { currentUser, adminAuth } = useApp();
  const [viewMode, setViewMode] = useState(() => {
    return window.location.hash.startsWith('#admin') ? 'admin' : 'user';
  });
  
  // App startup MUST ALWAYS start at Sign In / Sign Up
  const [userScreen, setUserScreen] = useState(() => {
    const rawRoute = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (rawRoute === 'signup') return 'signup';
    if (rawRoute === 'forgot-username') return 'forgot-username';
    return 'signin';
  });

  const [adminTab, setAdminTab] = useState('dashboard');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Sync route on popstate / hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash.startsWith('admin')) {
        setViewMode('admin');
        return;
      }
      setViewMode('user');

      // Unauthenticated users can only view auth screens
      if (!currentUser || !currentUser.isAuthenticated) {
        if (hash === 'signup') {
          setUserScreen('signup');
        } else if (hash === 'forgot-username') {
          setUserScreen('forgot-username');
        } else {
          setUserScreen('signin');
          window.location.hash = 'signin';
        }
        return;
      }

      // Authenticated users
      const validScreens = [
        'home', 'buy', 'buy-gold', 'buy-silver', 'holdings',
        'profile', 'transactions', 'contact', 'withdraw', 'create-profile'
      ];
      if (validScreens.includes(hash)) {
        setUserScreen(hash === 'buy-gold' ? 'buy' : hash);
      } else {
        setUserScreen('home');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentUser]);

  // Auth Guard: Enforce Sign In on app open / unauthenticated state
  useEffect(() => {
    if (viewMode === 'user') {
      if (!currentUser || !currentUser.isAuthenticated) {
        if (userScreen !== 'signin' && userScreen !== 'signup' && userScreen !== 'forgot-username') {
          setUserScreen('signin');
          window.location.hash = 'signin';
        }
      }
    }
  }, [currentUser, viewMode, userScreen]);

  const handleUserNavigate = (screen) => {
    // If not authenticated, only allow auth screens
    if (!currentUser || !currentUser.isAuthenticated) {
      if (screen === 'signup' || screen === 'forgot-username' || screen === 'signin') {
        setUserScreen(screen);
        window.location.hash = screen;
      } else {
        setUserScreen('signin');
        window.location.hash = 'signin';
      }
      setIsActionSheetOpen(false);
      return;
    }

    setUserScreen(screen);
    window.location.hash = screen;
    setIsActionSheetOpen(false);
  };

  return (
    <div className="app-root-container">
      {/* User Mobile Application */}
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
          <AdminLogin onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = 'signin'; }} />
        ) : (
          <AdminLayout activeTab={adminTab} onSelectTab={setAdminTab} onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = 'signin'; }}>
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

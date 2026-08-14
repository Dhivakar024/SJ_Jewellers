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

// Route Helper to strictly enforce Authentication check before Profile Completion check
const resolveInitialRoute = (currentUser) => {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const rawRoute = hash || path;

  // 1. Admin route check
  if (rawRoute.startsWith('admin')) {
    return { mode: 'admin', screen: 'home' };
  }

  // 2. CHECK AUTHENTICATION FIRST! (Logged out users NEVER see Create Profile)
  if (!currentUser || !currentUser.isAuthenticated) {
    if (rawRoute === 'signup') return { mode: 'user', screen: 'signup' };
    if (rawRoute === 'forgot-username') return { mode: 'user', screen: 'forgot-username' };
    return { mode: 'user', screen: 'signin' };
  }

  // 3. User IS AUTHENTICATED -> NOW check profile completion status:
  const isSessionSkipped = sessionStorage.getItem('sj_session_skipped_profile') === 'true';

  if (!currentUser.profileCompleted && !isSessionSkipped) {
    return { mode: 'user', screen: 'create-profile' };
  }

  // 4. Authenticated and profile is completed (or skipped for session)
  const validScreens = [
    'home', 'buy', 'buy-gold', 'buy-silver', 'holdings',
    'profile', 'transactions', 'contact', 'withdraw', 'create-profile'
  ];

  if (validScreens.includes(rawRoute)) {
    return { mode: 'user', screen: rawRoute === 'buy-gold' ? 'buy' : rawRoute };
  }

  const savedScreen = sessionStorage.getItem('sj_activeScreen');
  if (savedScreen && validScreens.includes(savedScreen) && savedScreen !== 'signin' && savedScreen !== 'signup' && savedScreen !== 'forgot-username') {
    return { mode: 'user', screen: savedScreen };
  }

  return { mode: 'user', screen: 'home' };
};

function MainContent() {
  const { currentUser, adminAuth } = useApp();
  
  const initialRoute = resolveInitialRoute(currentUser);
  const [viewMode, setViewMode] = useState(initialRoute.mode); // 'user' or 'admin'
  const [userScreen, setUserScreen] = useState(initialRoute.screen);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Sync route on popstate / hashchange (browser back/forward/refresh)
  useEffect(() => {
    const handleUrlChange = () => {
      const routeInfo = resolveInitialRoute(currentUser);
      setViewMode(routeInfo.mode);
      setUserScreen(routeInfo.screen);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentUser]);

  // Persistent Auth & Route Guard (Enforces Auth First, Profile Second)
  useEffect(() => {
    if (viewMode === 'user') {
      // 1. If NOT authenticated: ALWAYS keep on auth screens
      if (!currentUser || !currentUser.isAuthenticated) {
        if (userScreen !== 'signin' && userScreen !== 'signup' && userScreen !== 'forgot-username') {
          setUserScreen('signin');
          window.location.hash = 'signin';
        }
        return;
      }

      // 2. If authenticated, now check profile completion:
      const isSessionSkipped = sessionStorage.getItem('sj_session_skipped_profile') === 'true';

      if (!currentUser.profileCompleted && !isSessionSkipped) {
        if (userScreen !== 'create-profile') {
          setUserScreen('create-profile');
          window.location.hash = 'create-profile';
        }
      } else {
        // Authenticated and (profile completed or skipped in this session)
        if (userScreen === 'signin' || userScreen === 'signup' || userScreen === 'forgot-username') {
          setUserScreen('home');
          window.location.hash = 'home';
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

    const isSessionSkipped = sessionStorage.getItem('sj_session_skipped_profile') === 'true';

    // If authenticated but profile incomplete and hasn't skipped for session
    if (!currentUser.profileCompleted && !isSessionSkipped && screen !== 'create-profile' && screen !== 'signin') {
      setUserScreen('create-profile');
      window.location.hash = 'create-profile';
      setIsActionSheetOpen(false);
      return;
    }

    setUserScreen(screen);
    sessionStorage.setItem('sj_activeScreen', screen);
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
          <AdminLogin onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = 'home'; }} />
        ) : (
          <AdminLayout activeTab={adminTab} onSelectTab={setAdminTab} onSwitchToUserApp={() => { setViewMode('user'); window.location.hash = 'home'; }}>
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

import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider, useApp } from './context/AppContext';
import MobileContainer from './components/MobileContainer';
import ActionSheet from './components/ActionSheet';

// Customer Mobile App Screens
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

// Screenshot-Accurate Admin Web Portal Components
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminNotifications from './admin/AdminNotifications';
import AdminRates from './admin/AdminRates';
import AdminMembers from './admin/AdminMembers';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminWithdrawal from './admin/AdminWithdrawal';
import AdminSettings from './admin/AdminSettings';

import './styles/app.css';

// Helper to determine if current URL is an admin route
function isAdminRoute() {
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();
  return hash.startsWith('#admin') || hash.startsWith('#/admin') || path.startsWith('/admin');
}

// Helper to extract the active admin tab from URL
function getAdminTabFromUrl() {
  const href = (window.location.href || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();
  const full = `${href} ${path} ${hash}`;
  if (full.includes('notifications')) return 'notifications';
  if (full.includes('rates')) return 'rates';
  if (full.includes('members')) return 'members';
  if (full.includes('analytics')) return 'analytics';
  if (full.includes('withdrawal')) return 'withdrawal';
  if (full.includes('settings')) return 'settings';
  return 'dashboard';
}

function MainContent() {
  const { currentUser, adminAuth, isAuthLoading } = useApp() || {};
  
  // Route separation: 'admin' vs 'user'
  const [isAdminMode, setIsAdminMode] = useState(() => isAdminRoute());

  // Customer Screen State
  const [userScreen, setUserScreen] = useState(() => {
    const rawRoute = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (rawRoute === 'signup') return 'signup';
    if (rawRoute === 'forgot-username') return 'forgot-username';
    return 'signin';
  });

  // Admin Tab State
  const [adminTab, setAdminTab] = useState(() => getAdminTabFromUrl());
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Sync route on popstate / hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm = isAdminRoute();
      setIsAdminMode(isAdm);

      if (isAdm) {
        setAdminTab(getAdminTabFromUrl());
        return;
      }

      if (isAuthLoading) return;

      // Customer App Routing
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

      // Unauthenticated users can only view auth screens
      if (!currentUser || !currentUser.isAuthenticated) {
        if (hash === 'signup') {
          setUserScreen('signup');
        } else {
          setUserScreen('signin');
          window.location.hash = 'signin';
        }
        return;
      }

      // Authenticated customer users
      const validScreens = [
        'home', 'buy', 'buy-gold', 'buy-silver', 'holdings',
        'profile', 'transactions', 'contact', 'withdraw', 'create-profile', 'edit-profile'
      ];

      const isSkipped = sessionStorage.getItem('sj_session_skipped_profile') === 'true';

      if (!currentUser.profileCompleted && !isSkipped && hash !== 'create-profile' && hash !== 'contact') {
        setUserScreen('create-profile');
        window.location.hash = 'create-profile';
        return;
      }

      if (validScreens.includes(hash)) {
        setUserScreen(hash);
      } else {
        setUserScreen((currentUser.profileCompleted || isSkipped) ? 'home' : 'create-profile');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentUser, isAuthLoading]);

  // Auth & Profile Guard: Sync userScreen upon auth state change
  useEffect(() => {
    if (isAdminRoute() || isAuthLoading) return;
    if (!currentUser || !currentUser.isAuthenticated) {
      if (userScreen !== 'signin' && userScreen !== 'signup') {
        setUserScreen('signin');
        window.location.hash = 'signin';
      }
    } else {
      const isSkipped = sessionStorage.getItem('sj_session_skipped_profile') === 'true';
      if (!currentUser.profileCompleted && !isSkipped && userScreen !== 'create-profile' && userScreen !== 'contact') {
        setUserScreen('create-profile');
        window.location.hash = 'create-profile';
      }
    }
  }, [currentUser, userScreen, isAuthLoading]);

  const [navSource, setNavSource] = useState({});

  const handleUserNavigate = (screen, options = {}) => {
    // If not authenticated, only allow auth screens
    if (!currentUser || !currentUser.isAuthenticated) {
      if (screen === 'signup' || screen === 'signin') {
        setUserScreen(screen);
        window.location.hash = screen;
      } else {
        setUserScreen('signin');
        window.location.hash = 'signin';
      }
      setIsActionSheetOpen(false);
      return;
    }

    // When skipping or navigating to home with incomplete profile, mark session as skipped
    if (screen === 'home' && !currentUser.profileCompleted) {
      sessionStorage.setItem('sj_session_skipped_profile', 'true');
    }

    // Track navigation source if provided (e.g. { from: 'buy' } or { from: 'profile' })
    if (options && options.from) {
      setNavSource((prev) => ({ ...prev, [screen]: options.from }));
    }

    setUserScreen(screen);
    window.location.hash = screen;
    setIsActionSheetOpen(false);
  };

  const handleAdminTabSelect = (tab) => {
    setAdminTab(tab);
    window.location.hash = `admin/${tab}`;
  };

  // ==========================================
  // 1. SEPARATE ADMIN WEB PORTAL (FULL SCREEN)
  // ==========================================
  if (isAdminMode) {
    if (!adminAuth.isAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            const targetTab = getAdminTabFromUrl();
            setAdminTab(targetTab);
            window.location.hash = `admin/${targetTab}`;
          }}
        />
      );
    }

    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={handleAdminTabSelect}
      >
        {adminTab === 'dashboard' && <AdminDashboard onSelectTab={handleAdminTabSelect} />}
        {adminTab === 'notifications' && <AdminNotifications />}
        {adminTab === 'rates' && <AdminRates />}
        {adminTab === 'members' && <AdminMembers />}
        {adminTab === 'analytics' && <AdminAnalytics />}
        {adminTab === 'withdrawal' && <AdminWithdrawal />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // ==========================================
  // 2. CUSTOMER MOBILE APP (MOBILE CONTAINER)
  // ==========================================
  if (isAuthLoading) {
    return (
      <div className="app-root-container">
        <MobileContainer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '400px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              border: '3.5px solid #e0d8fa',
              borderTopColor: 'var(--primary-purple)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        </MobileContainer>
      </div>
    );
  }

  return (
    <div className="app-root-container">
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
        {userScreen === 'withdraw' && (
          <WithdrawScreen fromScreen={navSource['withdraw'] || 'home'} onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />
        )}
        {userScreen === 'transactions' && (
          <TransactionHistoryScreen fromScreen={navSource['transactions'] || 'home'} onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />
        )}
        {userScreen === 'contact' && (
          <ContactUsScreen fromScreen={navSource['contact'] || 'profile'} onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />
        )}
        {userScreen === 'holdings' && <HoldingsScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'profile' && <ProfileScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'create-profile' && <CreateProfileScreen mode="create" onNavigate={handleUserNavigate} />}
        {userScreen === 'edit-profile' && <CreateProfileScreen mode="edit" onNavigate={handleUserNavigate} />}

        {/* Floating Action Menu */}
        <ActionSheet
          isOpen={isActionSheetOpen}
          onClose={() => setIsActionSheetOpen(false)}
          onNavigate={handleUserNavigate}
        />
      </MobileContainer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

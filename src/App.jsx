import React, { useState, useEffect } from 'react';
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

// Separate Admin Web Portal Components
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminKyc from './admin/AdminKyc';
import AdminTransactions from './admin/AdminTransactions';
import AdminWithdrawals from './admin/AdminWithdrawals';
import AdminRates from './admin/AdminRates';
import AdminPayments from './admin/AdminPayments';
import AdminReports from './admin/AdminReports';
import AdminSettings from './admin/AdminSettings';

import './styles/app.css';

// Helper to determine if current URL is an admin route
function isAdminRoute() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.startsWith('/admin') || hash.startsWith('#admin') || hash.startsWith('#/admin');
}

function MainContent() {
  const { currentUser, adminAuth } = useApp();
  
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
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Sync route on popstate / hashchange / pathname change
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm = isAdminRoute();
      setIsAdminMode(isAdm);

      if (isAdm) {
        // Extract admin subtab from hash if present, e.g. #admin/users
        const hash = window.location.hash.toLowerCase();
        if (hash.includes('users')) setAdminTab('users');
        else if (hash.includes('transactions')) setAdminTab('transactions');
        else if (hash.includes('withdrawals')) setAdminTab('withdrawals');
        else if (hash.includes('rates')) setAdminTab('rates');
        else if (hash.includes('payments')) setAdminTab('payments');
        else if (hash.includes('reports')) setAdminTab('reports');
        else if (hash.includes('settings')) setAdminTab('settings');
        else if (hash.includes('kyc')) setAdminTab('kyc');
        else setAdminTab('dashboard');
        return;
      }

      // Customer App Routing
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

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

      // Authenticated customer users
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

  // Auth Guard: Enforce Sign In on customer app unauthenticated state
  useEffect(() => {
    if (!isAdminMode) {
      if (!currentUser || !currentUser.isAuthenticated) {
        if (userScreen !== 'signin' && userScreen !== 'signup' && userScreen !== 'forgot-username') {
          setUserScreen('signin');
          window.location.hash = 'signin';
        }
      }
    }
  }, [currentUser, isAdminMode, userScreen]);

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
            setAdminTab('dashboard');
            window.location.hash = 'admin/dashboard';
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
        {adminTab === 'users' && <AdminUsers />}
        {adminTab === 'kyc' && <AdminKyc />}
        {adminTab === 'transactions' && <AdminTransactions />}
        {adminTab === 'withdrawals' && <AdminWithdrawals />}
        {adminTab === 'rates' && <AdminRates />}
        {adminTab === 'payments' && <AdminPayments />}
        {adminTab === 'reports' && <AdminReports />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // ==========================================
  // 2. CUSTOMER MOBILE APP (MOBILE CONTAINER)
  // ==========================================
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
        {userScreen === 'withdraw' && <WithdrawScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'transactions' && <TransactionHistoryScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'contact' && <ContactUsScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'holdings' && <HoldingsScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'profile' && <ProfileScreen onNavigate={handleUserNavigate} onTogglePlus={() => setIsActionSheetOpen(true)} />}
        {userScreen === 'create-profile' && <CreateProfileScreen onNavigate={handleUserNavigate} />}

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
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

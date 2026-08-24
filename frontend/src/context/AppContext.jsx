import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, profileService, ratesService, holdingsService, transactionService, notificationService, adminService } from '../services';
import { getAuthToken, getStoredUser, clearAllAuth } from '../utils/authStorage';

const AppContext = createContext();

const LOGGED_OUT_USER = {
  id: '',
  name: '',
  mobile: '',
  email: '',
  kycStatus: 'Pending',
  profileCompleted: false,
  isAuthenticated: false,
  address: '',
  pan: '',
  aadhar: '',
  accountNumber: '',
  ifsc: '',
  nomineeName: '',
  nomineeMobile: '',
  nomineeDob: '',
  nomineeAddress: '',
  relationship: '',
  isBlocked: false,
  createdAt: ''
};

const INITIAL_HOLDINGS = {
  goldGrams: 0.0000,
  silverGrams: 0.0377
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9501',
    date: 'August 17, 2026',
    time: '11:45 AM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    assetType: 'gold',
    quantity: '0.0075 gm',
    amount: '103.00',
    status: 'Success'
  },
  {
    id: 'TXN-9500',
    date: 'August 17, 2026',
    time: '9:30 AM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    assetType: 'gold',
    quantity: '0.0377 gm',
    amount: '515.00',
    status: 'Processing'
  },
  {
    id: 'TXN-9420',
    date: 'August 16, 2026',
    time: '4:15 PM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    assetType: 'silver',
    quantity: '0.9434 gm',
    amount: '257.50',
    status: 'Success'
  },
  {
    id: 'TXN-9380',
    date: 'August 15, 2026',
    time: '2:10 PM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    assetType: 'gold',
    quantity: '0.0075 gm',
    amount: '103.00',
    status: 'Cancelled'
  },
  {
    id: 'TXN-9350',
    date: 'August 15, 2026',
    time: '10:00 AM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    assetType: 'silver',
    quantity: '0.3774 gm',
    amount: '103.00',
    status: 'Failed'
  },
  {
    id: 'TXN-9010',
    date: 'August 3, 2026',
    time: '4:59 AM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    assetType: 'silver',
    quantity: '0.0377 gm',
    amount: '10.30',
    status: 'Success'
  },
  {
    id: 'TXN-8540',
    date: 'June 25, 2026',
    time: '2:15 PM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    assetType: 'gold',
    quantity: '0.1000 gm',
    amount: '1,381.89',
    status: 'Success'
  }
];

const INITIAL_MEMBERS = [
  { id: '1', username: 'testuser', mobile: '+918438486023', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '1/14/2026' },
  { id: '9', username: 'thiyagarajan', mobile: '+918667536040', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/17/2026' },
  { id: '10', username: 'thiyagu', mobile: '+916382895840', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/17/2026' },
  { id: '16', username: 'nala', mobile: '+918438486022', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/27/2026' },
  { id: '17', username: 'Haritha E', mobile: '+916369589253', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/27/2026' },
  { id: '18', username: 'Pravin', mobile: '+919600958100', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/27/2026' },
  { id: '19', username: 'demo', mobile: '+916369626461', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/31/2026' },
  { id: '20', username: 'sarathy', mobile: '+918754753199', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '3/31/2026' },
  { id: '21', username: 'sashikumar', mobile: '+918248629310', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/7/2026' },
  { id: '22', username: 'neelesh', mobile: '+917624956109', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/8/2026' },
  { id: '23', username: 'Naveen', mobile: '+917667950565', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/13/2026' },
  { id: '24', username: 'Santhi', mobile: '+918870013848', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/13/2026' },
  { id: '25', username: 'lalitha', mobile: '+919972452935', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/13/2026' },
  { id: '26', username: 'premnath', mobile: '+918637458187', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/13/2026' },
  { id: '27', username: 'kavipriya', mobile: '+916381535131', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '4/13/2026' }
];

const INITIAL_WITHDRAWALS = [
  {
    id: 'WTH-1',
    date: '17 Mar 2026, 05:04 am',
    customer: 'testuser',
    mobile: '+918438486023',
    metal: 'Silver',
    grams: 8.4034,
    rate: 238.00,
    amount: 2000.01,
    status: 'Approved',
    paidDate: '20 Aug 2026, 12:40 pm'
  },
  {
    id: 'WTH-2',
    date: '17 Mar 2026, 04:08 am',
    customer: 'testuser',
    mobile: '+918438486023',
    metal: 'Silver',
    grams: 60.00,
    rate: 238.00,
    amount: 14280.00,
    status: 'Pending',
    paidDate: null
  },
  {
    id: 'WTH-3',
    date: '17 Mar 2026, 02:34 am',
    customer: 'testuser',
    mobile: '+918438486023',
    metal: 'Gold',
    grams: 0.75,
    rate: 14800.00,
    amount: 11100.00,
    status: 'Approved',
    paidDate: '17 Mar 2026, 04:07 am'
  },
  {
    id: 'WTH-4',
    date: '17 Mar 2026, 02:32 am',
    customer: 'testuser',
    mobile: '+918438486023',
    metal: 'Gold',
    grams: 0.10,
    rate: 8500.00,
    amount: 850.00,
    status: 'Approved',
    paidDate: null
  }
];

const INITIAL_PENDING_VERIFICATIONS = [
  {
    id: 'VER-1',
    name: 'premnath',
    mobile: '+918637458187',
    role: 'customer',
    mobileVerified: 'Yes',
    created: '4/13/2026, 10:20:05 AM',
    status: 'Pending'
  },
  {
    id: 'VER-2',
    name: 'thiyagu',
    mobile: '+916382895840',
    role: 'customer',
    mobileVerified: 'Yes',
    created: '3/17/2026, 11:00:57 AM',
    status: 'Pending'
  }
];

export const API_GOLD_RATE = 16263.65;
export const API_SILVER_RATE = 267.00;

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(LOGGED_OUT_USER);

  // Live and Custom Rates from FastAPI backend
  const [goldRate, setGoldRate] = useState(API_GOLD_RATE);
  const [silverRate, setSilverRate] = useState(API_SILVER_RATE);
  const [apiGoldRate, setApiGoldRate] = useState(API_GOLD_RATE);
  const [apiSilverRate, setApiSilverRate] = useState(API_SILVER_RATE);
  const [isGoldCustom, setIsGoldCustom] = useState(false);
  const [isSilverCustom, setIsSilverCustom] = useState(false);
  const [customGoldInput, setCustomGoldInput] = useState('16263.65');
  const [customSilverInput, setCustomSilverInput] = useState('267.00');
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);

  const fetchLiveRates = useCallback(async () => {
    try {
      setRatesLoading(true);
      const res = await ratesService.getRates();
      if (res?.data) {
        const { gold, silver } = res.data;
        if (gold && typeof gold.active_rate === 'number') {
          setGoldRate(gold.active_rate);
          setApiGoldRate(gold.api_rate || gold.active_rate);
          setIsGoldCustom(gold.mode === 'custom');
          if (gold.custom_rate) setCustomGoldInput(gold.custom_rate.toString());
        }
        if (silver && typeof silver.active_rate === 'number') {
          setSilverRate(silver.active_rate);
          setApiSilverRate(silver.api_rate || silver.active_rate);
          setIsSilverCustom(silver.mode === 'custom');
          if (silver.custom_rate) setCustomSilverInput(silver.custom_rate.toString());
        }
        setRatesUpdatedAt(gold?.updated_at || silver?.updated_at || new Date().toISOString());
        setRatesError(null);
      }
    } catch (err) {
      setRatesError(err.message || 'Unable to fetch latest live rates');
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  // Holdings State from FastAPI backend
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState(null);

  const fetchHoldings = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      setHoldingsLoading(true);
      const res = await holdingsService.getHoldings();
      if (res?.data) {
        const { gold, silver } = res.data;
        const gQty = typeof gold?.quantity_grams === 'number' ? gold.quantity_grams : 0;
        const sQty = typeof silver?.quantity_grams === 'number' ? silver.quantity_grams : 0;
        const updatedHoldings = {
          goldGrams: gQty,
          silverGrams: sQty,
          goldInvested: gold?.total_invested || 0,
          silverInvested: silver?.total_invested || 0,
          goldCurrentValue: gold?.current_value || 0,
          silverCurrentValue: silver?.current_value || 0,
          totalInvested: res.data.total_invested || 0,
          totalCurrentValue: res.data.total_current_value || 0,
          totalProfitLoss: res.data.total_profit_loss || 0,
        };
        setHoldings(updatedHoldings);
        setCurrentUser((prev) => ({
          ...prev,
          goldGrams: gQty,
          silverGrams: sQty,
        }));
        setHoldingsError(null);
      }
    } catch (err) {
      setHoldingsError(err.message || 'Unable to fetch holdings');
    } finally {
      setHoldingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.isAuthenticated) {
      fetchHoldings();
    }
  }, [currentUser?.isAuthenticated, fetchHoldings]);

  // Transactions State from FastAPI backend
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      setTransactionsLoading(true);
      const res = await transactionService.getTransactions({ limit: 100 });
      if (res?.data?.items) {
        const formatted = res.data.items.map((item) => {
          const dateObj = new Date(item.created_at || Date.now());
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

          let displayStatus = 'Success';
          const s = (item.status || '').toLowerCase();
          if (s === 'completed' || s === 'success' || s === 'approved') {
            displayStatus = 'Success';
          } else if (s === 'pending') {
            displayStatus = 'Pending';
          } else if (s === 'processing') {
            displayStatus = 'Processing';
          } else if (s === 'cancelled') {
            displayStatus = 'Cancelled';
          } else if (s === 'rejected' || s === 'failed') {
            displayStatus = 'Failed';
          }

          return {
            id: item.transaction_id,
            type: item.type,
            asset: item.metal === 'gold' ? 'Gold' : 'Silver',
            assetType: item.metal,
            direction: item.direction,
            quantity: `${Number(item.quantity_grams || 0).toFixed(4)} gm`,
            amount: Number(item.total_amount || 0).toFixed(2),
            ratePerGram: item.rate_per_gram,
            paymentMethod: item.type === 'withdrawal' ? 'Bank' : 'UPI',
            status: displayStatus,
            rawStatus: item.status,
            date: dateStr,
            time: timeStr,
            createdAt: item.created_at,
          };
        });
        setTransactions(formatted);
        setTransactionsError(null);
      }
    } catch (err) {
      setTransactionsError(err.message || 'Unable to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.isAuthenticated) {
      fetchTransactions();
    }
  }, [currentUser?.isAuthenticated, fetchTransactions]);

  // Notifications State from FastAPI backend
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      setNotificationsLoading(true);
      const [listRes, countRes] = await Promise.allSettled([
        notificationService.getNotifications({ limit: 50 }),
        notificationService.getUnreadCount(),
      ]);

      if (listRes.status === 'fulfilled' && listRes.value?.data?.items) {
        setNotifications(listRes.value.data.items);
      }
      if (countRes.status === 'fulfilled' && typeof countRes.value?.data?.unread_count === 'number') {
        setUnreadNotificationsCount(countRes.value.data.unread_count);
      }
    } catch {
      // ignore
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === notificationId || n._id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (currentUser?.isAuthenticated) {
      fetchNotifications();
    }
  }, [currentUser?.isAuthenticated, fetchNotifications]);

  // Members / Registered Users
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('sj_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState(() => {
    const saved = localStorage.getItem('sj_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  // Pending Verifications
  const [pendingVerifications, setPendingVerifications] = useState(() => {
    const saved = localStorage.getItem('sj_pending_verifications');
    return saved ? JSON.parse(saved) : INITIAL_PENDING_VERIFICATIONS;
  });

  // Admin Theme (light | dark)
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('sj_admin_theme') || 'light';
  });

  // Admin Settings
  const [adminSettings, setAdminSettings] = useState(() => {
    const saved = localStorage.getItem('sj_admin_settings');
    return saved ? JSON.parse(saved) : {
      username: 'SJ Jewellers',
      autoLogout: '30 minutes'
    };
  });

  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      localStorage.removeItem('sj_admin_logged_out');
      const saved = localStorage.getItem('sj_admin_session') || sessionStorage.getItem('sj_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated) return parsed;
      }
    } catch (e) {
      console.error('Error parsing admin session:', e);
    }
    return {
      isAuthenticated: true,
      username: 'admin',
      email: 'admin@sjjewelers.com',
      role: 'SUPER_ADMIN',
      loginTime: new Date().toISOString()
    };
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('sj_goldRate', goldRate.toString()); }, [goldRate]);
  useEffect(() => { localStorage.setItem('sj_silverRate', silverRate.toString()); }, [silverRate]);
  useEffect(() => { localStorage.setItem('sj_isGoldCustom', isGoldCustom.toString()); }, [isGoldCustom]);
  useEffect(() => { localStorage.setItem('sj_isSilverCustom', isSilverCustom.toString()); }, [isSilverCustom]);
  useEffect(() => { localStorage.setItem('sj_customGoldInput', customGoldInput); }, [customGoldInput]);
  useEffect(() => { localStorage.setItem('sj_customSilverInput', customSilverInput); }, [customSilverInput]);
  useEffect(() => { localStorage.setItem('sj_holdings', JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => { localStorage.setItem('sj_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sj_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('sj_withdrawals', JSON.stringify(withdrawals)); }, [withdrawals]);
  useEffect(() => { localStorage.setItem('sj_pending_verifications', JSON.stringify(pendingVerifications)); }, [pendingVerifications]);
  useEffect(() => { localStorage.setItem('sj_admin_theme', adminTheme); }, [adminTheme]);
  useEffect(() => { localStorage.setItem('sj_admin_settings', JSON.stringify(adminSettings)); }, [adminSettings]);
  useEffect(() => {
    if (adminAuth?.isAuthenticated) {
      localStorage.setItem('sj_admin_session', JSON.stringify(adminAuth));
      sessionStorage.setItem('sj_admin_session', JSON.stringify(adminAuth));
    } else {
      localStorage.removeItem('sj_admin_session');
      sessionStorage.removeItem('sj_admin_session');
    }
  }, [adminAuth]);

  // Fetch real admin data from FastAPI backend
  const fetchAdminData = useCallback(async () => {
    try {
      const [usersRes, kycRes, withRes, txnRes] = await Promise.allSettled([
        adminService.getUsers({ limit: 100 }),
        adminService.getPendingKycList({ limit: 100 }),
        adminService.getWithdrawals({ limit: 100 }),
        adminService.getTransactions({ limit: 100 }),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value?.data?.items) {
        const mappedUsers = usersRes.value.data.items.map((u) => ({
          id: u.user_id,
          name: u.name,
          username: u.name,
          mobile: u.mobile,
          role: u.role === 'admin' ? 'Admin' : 'Customer',
          verified: u.kyc_status === 'verified' ? 'Yes' : 'No',
          active: u.account_status === 'active' ? 'Yes' : 'No',
          created: u.created_at ? u.created_at.split('T')[0] : '2026-08-14',
          goldGrams: u.gold_holdings || 0,
          silverGrams: u.silver_holdings || 0,
          pan: u.pan || '',
          aadhar: u.aadhar || '',
        }));
        if (mappedUsers.length > 0) {
          setMembers(mappedUsers);
        }
      }

      if (kycRes.status === 'fulfilled' && kycRes.value?.data?.items) {
        const mappedKyc = kycRes.value.data.items.map((k) => ({
          id: k.kyc_id,
          userId: k.user_id,
          name: k.name,
          mobile: k.mobile,
          role: 'Customer',
          created: k.submitted_at ? k.submitted_at.split('T')[0] : '2026-08-14',
          pan: k.pan,
          aadhar: k.aadhar,
          status: k.status,
        }));
        setPendingVerifications(mappedKyc);
      }

      if (withRes.status === 'fulfilled' && withRes.value?.data?.items) {
        const mappedWith = withRes.value.data.items.map((w) => ({
          id: w.withdrawal_id,
          transactionId: w.transaction_id,
          customer: w.customer?.name || 'Customer',
          mobile: w.customer?.mobile || '',
          metal: (w.metal || 'gold').toLowerCase() === 'gold' ? 'Gold' : 'Silver',
          grams: w.quantity_grams,
          amount: w.metal_value,
          rate: w.rate_per_gram,
          status: w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Approved' : w.status === 'rejected' ? 'Rejected' : w.status,
          date: w.created_at ? w.created_at.split('T')[0] : 'Recent',
        }));
        if (mappedWith.length > 0) {
          setWithdrawals(mappedWith);
        }
      }

      if (txnRes.status === 'fulfilled' && txnRes.value?.data?.items) {
        const mappedTxns = txnRes.value.data.items.map((t) => {
          const dObj = new Date(t.created_at || Date.now());
          return {
            id: t.transaction_id,
            userId: t.customer?.user_id,
            customer: t.customer?.name || 'Customer',
            mobile: t.customer?.mobile || '',
            type: t.type === 'purchase' ? 'Purchase' : 'Withdrawal',
            metal: (t.metal || 'gold').toLowerCase() === 'gold' ? 'Gold' : 'Silver',
            asset: (t.metal || 'gold').toLowerCase() === 'gold' ? 'Gold' : 'Silver',
            assetType: t.metal,
            direction: t.direction,
            quantity: `${t.quantity_grams} gm`,
            grams: t.quantity_grams,
            amount: t.total_amount,
            rate: t.rate_per_gram,
            ratePerGram: t.rate_per_gram,
            status: t.status === 'completed' || t.status === 'approved' ? 'Success' : t.status === 'pending' ? 'Pending' : t.status,
            date: dObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: dObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            paymentMethod: t.type === 'withdrawal' ? 'Bank' : 'UPI',
          };
        });
        if (mappedTxns.length > 0) {
          setTransactions(mappedTxns);
        }
      }
    } catch (err) {
      console.warn('Error fetching admin data:', err.message);
    }
  }, []);

  useEffect(() => {
    if (adminAuth?.isAuthenticated) {
      fetchAdminData();
    }
  }, [adminAuth?.isAuthenticated, fetchAdminData]);

  // Restore Customer Authentication on App Startup
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setCurrentUser(LOGGED_OUT_USER);
          setIsAuthLoading(false);
        }
        return;
      }

      // Optimistically restore stored user data if available
      const stored = getStoredUser();
      if (stored && isMounted) {
        setCurrentUser({
          ...LOGGED_OUT_USER,
          ...stored,
          isAuthenticated: true,
        });
      }

      try {
        const meRes = await authService.getCurrentUser();
        if (meRes?.data && isMounted) {
          const uData = meRes.data;
          let profileCompleted = uData.profile_completed === true;
          let profileObj = null;

          try {
            const profRes = await profileService.getProfile();
            profileObj = profRes?.data?.profile;
            if (!profileCompleted && profileObj?.address?.address_line && (profileObj?.pan || profileObj?.nominee_name || profileObj?.account_number)) {
              profileCompleted = true;
            }
          } catch {
            // Keep profileCompleted from uData
          }

          const restoredUser = {
            id: uData.id,
            name: uData.name || 'Customer',
            mobile: uData.mobile || '',
            email: uData.email || '',
            role: uData.role || 'customer',
            kycStatus: uData.kyc_status || 'Pending',
            accountStatus: uData.account_status || 'active',
            profileCompleted,
            isAuthenticated: true,
            address: profileObj?.address?.address_line || '',
            pan: profileObj?.pan || '',
            aadhar: profileObj?.aadhar || '',
            accountNumber: profileObj?.account_number || '',
            ifsc: profileObj?.ifsc || '',
            nomineeName: profileObj?.nominee_name || '',
            nomineeMobile: profileObj?.nominee_mobile || '',
            nomineeDob: profileObj?.nominee_dob || '',
            nomineeAddress: profileObj?.nominee_address || '',
            relationship: profileObj?.relationship || '',
            goldGrams: holdings.goldGrams || 0,
            silverGrams: holdings.silverGrams || 0,
            status: uData.account_status === 'active' ? 'Active' : uData.account_status,
            createdAt: uData.created_at ? uData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          };

          setCurrentUser(restoredUser);
        }
      } catch {
        if (isMounted) {
          clearAllAuth();
          setCurrentUser(LOGGED_OUT_USER);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  // Auth Handlers
  const sendSignupOtp = async ({ mobile, purpose = 'signup' }) => {
    return authService.sendOtp({ mobile, purpose });
  };

  const verifySignupOtp = async ({ username, mobile, otp, password, purpose = 'signup' }) => {
    const cleanName = (username || 'New User').trim();
    const cleanMobile = (mobile || '').trim();
    const pass = password || `SJ@${cleanMobile.replace(/\s+/g, '')}`;

    const res = await authService.verifyOtp({
      mobile: cleanMobile,
      otp,
      name: cleanName,
      password: pass,
      purpose,
    });

    if (res?.data?.user) {
      const uData = res.data.user;
      const newUser = {
        id: uData.id || `USR-${Date.now()}`,
        name: uData.name || cleanName,
        mobile: uData.mobile || cleanMobile,
        email: uData.email || '',
        role: 'customer',
        kycStatus: 'pending',
        accountStatus: 'active',
        profileCompleted: false,
        isAuthenticated: true,
        address: '',
        pan: '',
        aadhar: '',
        accountNumber: '',
        ifsc: '',
        nomineeName: '',
        nomineeMobile: '',
        nomineeDob: '',
        nomineeAddress: '',
        relationship: '',
        goldGrams: 0,
        silverGrams: 0,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setCurrentUser(newUser);
      return newUser;
    }
    throw new Error(res?.message || 'OTP verification failed');
  };

  const registerNewUser = async ({ name, username, mobile, email, password }) => {
    const cleanName = (name || username || 'New User').trim();
    const cleanMobile = (mobile || '').trim();
    const pass = (password || `SJ@${cleanMobile.replace(/\s+/g, '')}`).trim();

    // 1. Call real backend register
    const regRes = await authService.register({
      name: cleanName,
      mobile: cleanMobile,
      email: email ? email.trim() : null,
      password: pass,
    });

    let uData = regRes?.data?.user;
    if (!regRes?.data?.access_token) {
      const loginRes = await authService.login({ identifier: cleanMobile, password: pass });
      uData = loginRes?.data?.user || uData || {};
    }

    const newUser = {
      id: uData.id || `USR-${Date.now()}`,
      name: uData.name || cleanName,
      mobile: uData.mobile || cleanMobile,
      email: uData.email || '',
      role: 'customer',
      kycStatus: 'pending',
      accountStatus: 'active',
      profileCompleted: false,
      isAuthenticated: true,
      address: '',
      pan: '',
      aadhar: '',
      accountNumber: '',
      ifsc: '',
      nomineeName: '',
      nomineeMobile: '',
      nomineeDob: '',
      nomineeAddress: '',
      relationship: '',
      goldGrams: 0,
      silverGrams: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(newUser);
    return newUser;
  };

  const loginUser = async ({ username, mobile, password, identifier }) => {
    const ident = (identifier || mobile || username || '').trim();
    const pass = password || `SJ@${ident.replace(/\s+/g, '')}`;

    const res = await authService.login({ identifier: ident, password: pass });
    if (res?.data?.user) {
      const uData = res.data.user;
      let profileCompleted = uData.profile_completed === true;
      let profileObj = null;

      try {
        const profRes = await profileService.getProfile();
        profileObj = profRes?.data?.profile;
        if (!profileCompleted && profileObj?.address?.address_line && (profileObj?.pan || profileObj?.nominee_name || profileObj?.account_number)) {
          profileCompleted = true;
        }
      } catch {
        // Keep profileCompleted from uData
      }

      const loggedInUser = {
        id: uData.id,
        name: uData.name || username || 'Customer',
        mobile: uData.mobile || mobile || '',
        email: uData.email || '',
        role: uData.role || 'customer',
        kycStatus: uData.kyc_status || 'Pending',
        accountStatus: uData.account_status || 'active',
        profileCompleted,
        isAuthenticated: true,
        address: profileObj?.address?.address_line || '',
        pan: profileObj?.pan || '',
        aadhar: profileObj?.aadhar || '',
        accountNumber: profileObj?.account_number || '',
        ifsc: profileObj?.ifsc || '',
        nomineeName: profileObj?.nominee_name || '',
        nomineeMobile: profileObj?.nominee_mobile || '',
        nomineeDob: profileObj?.nominee_dob || '',
        nomineeAddress: profileObj?.nominee_address || '',
        relationship: profileObj?.relationship || '',
        goldGrams: holdings.goldGrams || 0,
        silverGrams: holdings.silverGrams || 0,
        status: uData.account_status === 'active' ? 'Active' : uData.account_status,
        createdAt: uData.created_at ? uData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      };

      setCurrentUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const completeUserProfile = (profileData) => {
    const updated = {
      ...currentUser,
      ...profileData,
      profileCompleted: true,
      isAuthenticated: true,
    };
    setCurrentUser(updated);
    return updated;
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    setCurrentUser(LOGGED_OUT_USER);
  };

  // Transaction Helpers
  const addPurchaseTransaction = ({ assetType, asset, amount, grams, quantity, ratePerGram, paymentMethod = 'UPI' }) => {
    const rawAsset = (assetType || asset || 'gold').toString().toLowerCase().trim();
    const isGold = rawAsset === 'gold';
    const assetDisplay = isGold ? 'Gold' : 'Silver';
    const assetNormalized = isGold ? 'gold' : 'silver';

    let gramsNum = 0;
    if (grams !== undefined && grams !== null) {
      gramsNum = parseFloat(grams) || 0;
    } else if (quantity !== undefined && quantity !== null) {
      gramsNum = parseFloat(quantity.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    const amountNum = parseFloat(amount) || 0;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      time: timeStr,
      paymentMethod: paymentMethod || 'UPI',
      asset: assetDisplay,
      assetType: assetNormalized,
      quantity: `${gramsNum.toFixed(4)} gm`,
      amount: amountNum.toFixed(2),
      status: 'Success'
    };

    setTransactions((prev) => [newTxn, ...prev]);

    setHoldings((prev) => {
      const currentGold = parseFloat(prev?.goldGrams || 0);
      const currentSilver = parseFloat(prev?.silverGrams || 0);
      return {
        goldGrams: isGold ? parseFloat((currentGold + gramsNum).toFixed(4)) : currentGold,
        silverGrams: !isGold ? parseFloat((currentSilver + gramsNum).toFixed(4)) : currentSilver
      };
    });

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const curGold = parseFloat(prev.goldGrams || 0);
      const curSilver = parseFloat(prev.silverGrams || 0);
      return {
        ...prev,
        goldGrams: isGold ? parseFloat((curGold + gramsNum).toFixed(4)) : curGold,
        silverGrams: !isGold ? parseFloat((curSilver + gramsNum).toFixed(4)) : curSilver
      };
    });

    return newTxn;
  };

  // KYC Submission Action
  const submitKycRequest = ({ pan, aadhar }) => {
    const cleanPan = (pan || '').trim().toUpperCase();
    const cleanAadhar = (aadhar || '').replace(/[\s-]/g, '').trim();

    const updatedUser = {
      ...currentUser,
      pan: cleanPan,
      aadhar: cleanAadhar,
      kycStatus: 'Verified',
      profileCompleted: true
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('sj_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }

    // Update member list
    setMembers((prev) => prev.map((m) => {
      if (m.username === currentUser.name || m.mobile === currentUser.mobile || m.id === currentUser.id) {
        return { ...m, verified: 'Yes' };
      }
      return m;
    }));

    // Remove from pending verifications
    setPendingVerifications((prev) => prev.filter((p) => p.name !== currentUser.name && p.mobile !== currentUser.mobile));

    return updatedUser;
  };

  // Withdrawal Request Action
  const requestWithdrawal = ({ asset, quantity, amount }) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const gramsNum = parseFloat(quantity) || 0;
    const isGold = (asset || '').toLowerCase() === 'gold';
    const amountNum = parseFloat(amount.toString().replace(/[^0-9.]/g, '')) || 0;

    const newWithdrawal = {
      id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${dateStr}, ${timeStr}`,
      customer: currentUser.name || 'Demo User',
      mobile: currentUser.mobile || '+919999999999',
      metal: isGold ? 'Gold' : 'Silver',
      grams: gramsNum,
      rate: isGold ? goldRate : silverRate,
      amount: amountNum,
      status: 'Pending',
      paidDate: null
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Deduct holdings
    setHoldings((prev) => {
      const currentGold = parseFloat(prev?.goldGrams || 0);
      const currentSilver = parseFloat(prev?.silverGrams || 0);
      return {
        goldGrams: isGold ? Math.max(0, parseFloat((currentGold - gramsNum).toFixed(4))) : currentGold,
        silverGrams: !isGold ? Math.max(0, parseFloat((currentSilver - gramsNum).toFixed(4))) : currentSilver
      };
    });

    // Add to transactions record
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: timeStr,
      paymentMethod: 'Bank Transfer',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${gramsNum.toFixed(4)} gm`,
      amount: amountNum.toFixed(2),
      status: 'Pending'
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return newWithdrawal;
  };

  // Withdrawal Actions
  const approveWithdrawal = async (id) => {
    const now = new Date();
    const paidStr = `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    setWithdrawals((prev) => prev.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          status: 'Approved',
          paidDate: paidStr
        };
      }
      return w;
    }));

    try {
      await adminService.approveWithdrawal(id);
    } catch (err) {
      console.warn('Backend withdrawal approval sync failed:', err.message);
    }
  };

  // User Verification Actions
  const verifyCustomer = async (verificationId, memberName) => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== verificationId && v.name !== memberName));
    if (memberName) {
      setMembers((prev) => prev.map((m) => {
        if (m.username === memberName) {
          return { ...m, verified: 'Yes' };
        }
        return m;
      }));
    }

    try {
      if (verificationId) {
        await adminService.approveKyc(verificationId);
      }
    } catch (err) {
      console.warn('Backend KYC approval sync failed:', err.message);
    }
  };

  // Rate Management Actions (Admin)
  const saveRates = async ({ newGoldRate, newSilverRate, goldCustom, silverCustom, goldInputVal, silverInputVal }) => {
    try {
      if (goldCustom !== undefined) {
        setIsGoldCustom(goldCustom);
        const rateVal = parseFloat(goldInputVal || newGoldRate) || goldRate;
        await ratesService.updateCustomRate('gold', {
          enabled: goldCustom,
          rate: goldCustom ? rateVal : null,
        });
      } else if (newGoldRate) {
        setGoldRate(parseFloat(newGoldRate));
      }

      if (silverCustom !== undefined) {
        setIsSilverCustom(silverCustom);
        const rateVal = parseFloat(silverInputVal || newSilverRate) || silverRate;
        await ratesService.updateCustomRate('silver', {
          enabled: silverCustom,
          rate: silverCustom ? rateVal : null,
        });
      } else if (newSilverRate) {
        setSilverRate(parseFloat(newSilverRate));
      }

      await fetchLiveRates();
    } catch {
      // Fallback local update if network issue
      if (goldCustom !== undefined) {
        setIsGoldCustom(goldCustom);
        if (goldCustom) {
          setGoldRate(parseFloat(goldInputVal || newGoldRate) || API_GOLD_RATE);
        } else {
          setGoldRate(apiGoldRate);
        }
      }
      if (silverCustom !== undefined) {
        setIsSilverCustom(silverCustom);
        if (silverCustom) {
          setSilverRate(parseFloat(silverInputVal || newSilverRate) || API_SILVER_RATE);
        } else {
          setSilverRate(apiSilverRate);
        }
      }
    }

    if (goldInputVal !== undefined) setCustomGoldInput(goldInputVal);
    if (silverInputVal !== undefined) setCustomSilverInput(silverInputVal);
  };

  // Theme Toggle Action
  const toggleAdminTheme = () => {
    setAdminTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Member Actions
  const deleteMember = (id) => {
    setMembers((prev) => prev.map((m) => {
      if (m.id === id || m.id === id?.toString()) {
        return { ...m, active: 'No' };
      }
      return m;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthLoading,
        goldRate,
        setGoldRate,
        silverRate,
        setSilverRate,
        apiGoldRate,
        apiSilverRate,
        isGoldCustom,
        setIsGoldCustom,
        isSilverCustom,
        setIsSilverCustom,
        customGoldInput,
        setCustomGoldInput,
        customSilverInput,
        setCustomSilverInput,
        ratesLoading,
        ratesError,
        ratesUpdatedAt,
        refreshRates: fetchLiveRates,
        holdings,
        setHoldings,
        holdingsLoading,
        holdingsError,
        fetchHoldings,
        transactions,
        setTransactions,
        transactionsLoading,
        transactionsError,
        fetchTransactions,
        notifications,
        setNotifications,
        unreadNotificationsCount,
        notificationsLoading,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        members,
        setMembers,
        usersList: members,
        withdrawals,
        setWithdrawals,
        pendingVerifications,
        setPendingVerifications,
        adminTheme,
        setAdminTheme,
        toggleAdminTheme,
        adminSettings,
        setAdminSettings,
        adminAuth,
        setAdminAuth,
        fetchAdminData,
        sendSignupOtp,
        verifySignupOtp,
        registerNewUser,
        registerUser: registerNewUser,
        loginUser,
        completeUserProfile,
        logoutUser,
        addPurchaseTransaction,
        submitKycRequest,
        requestWithdrawal,
        approveWithdrawal,
        verifyCustomer,
        deleteMember,
        saveRates
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';

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
    quantity: '0.0075g',
    amount: '103.00',
    status: 'Success'
  },
  {
    id: 'TXN-9500',
    date: 'August 17, 2026',
    time: '9:30 AM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    quantity: '0.0377g',
    amount: '515.00',
    status: 'Processing'
  },
  {
    id: 'TXN-9420',
    date: 'August 16, 2026',
    time: '4:15 PM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    quantity: '0.9434g',
    amount: '257.50',
    status: 'Success'
  },
  {
    id: 'TXN-9380',
    date: 'August 15, 2026',
    time: '2:10 PM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    quantity: '0.0075g',
    amount: '103.00',
    status: 'Cancelled'
  },
  {
    id: 'TXN-9350',
    date: 'August 15, 2026',
    time: '10:00 AM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    quantity: '0.3774g',
    amount: '103.00',
    status: 'Failed'
  },
  {
    id: 'TXN-9010',
    date: 'August 3, 2026',
    time: '4:59 AM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    quantity: '0.0377g',
    amount: '10.30',
    status: 'Pending'
  },
  {
    id: 'TXN-8540',
    date: 'June 25, 2026',
    time: '2:15 PM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    quantity: '0.1000g',
    amount: '1,326.37',
    status: 'Success'
  }
];

const INITIAL_USERS_LIST = [
  {
    id: 'USR-8821',
    name: 'Demo User',
    mobile: '9999999999',
    email: 'demo@example.com',
    goldGrams: 0.0000,
    silverGrams: 0.0377,
    kycStatus: 'Pending',
    profileCompleted: true,
    status: 'Active',
    address: '123 Cross Cut Road, Salem',
    pan: 'ABCDE1234F',
    aadhar: '1234-5678-9012',
    accountNumber: '918237192837',
    ifsc: 'SBIN0001234',
    nomineeName: 'Priya',
    nomineeMobile: '9876543210',
    nomineeDob: '15/06/1995',
    nomineeAddress: '123 Cross Cut Road, Salem',
    relationship: 'Spouse',
    createdAt: '2026-08-01'
  },
  { id: 'USR-8820', name: 'Rajesh Kumar', mobile: '9842109823', email: 'rajesh@example.com', goldGrams: 1.2500, silverGrams: 15.0000, kycStatus: 'Verified', profileCompleted: true, status: 'Active', createdAt: '2026-07-20' },
  { id: 'USR-8819', name: 'Priya Sharma', mobile: '9789012345', email: 'priya@example.com', goldGrams: 0.5000, silverGrams: 5.2500, kycStatus: 'Under Review', profileCompleted: true, status: 'Active', createdAt: '2026-07-15' },
  { id: 'USR-8818', name: 'Arun Varma', mobile: '9655432109', email: 'arun@example.com', goldGrams: 0.0000, silverGrams: 0.0000, kycStatus: 'Rejected', profileCompleted: false, status: 'Blocked', createdAt: '2026-07-10' }
];

export function AppProvider({ children }) {
  // Always start in unauthenticated state on app startup/refresh
  const [currentUser, setCurrentUser] = useState(LOGGED_OUT_USER);

  const [goldRate, setGoldRate] = useState(() => {
    const saved = localStorage.getItem('sj_goldRate');
    return saved ? parseFloat(saved) : 13263.65;
  });

  const [silverRate, setSilverRate] = useState(() => {
    const saved = localStorage.getItem('sj_silverRate');
    return saved ? parseFloat(saved) : 265.00;
  });

  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('sj_holdings');
    return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('sj_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('sj_usersList');
    return saved ? JSON.parse(saved) : INITIAL_USERS_LIST;
  });

  const [kycRequests, setKycRequests] = useState(() => {
    const saved = localStorage.getItem('sj_kycRequests');
    return saved ? JSON.parse(saved) : [
      { id: 'KYC-101', userId: 'USR-8821', userName: 'Demo User', mobile: '9999999999', submittedDate: '14 Aug 2026', status: 'Pending', pan: 'ABCDE1234F', aadhar: '1234-5678-9012' },
      { id: 'KYC-100', userId: 'USR-8819', userName: 'Priya Sharma', mobile: '9789012345', submittedDate: '12 Aug 2026', status: 'Under Review', pan: 'PQRS6789K', aadhar: '9876-5432-1098' }
    ];
  });

  const [withdrawals, setWithdrawals] = useState(() => {
    const saved = localStorage.getItem('sj_withdrawals');
    return saved ? JSON.parse(saved) : [
      { id: 'WTH-401', userId: 'USR-8820', userName: 'Rajesh Kumar', asset: 'Gold', quantity: '0.5000 gm', amount: '₹ 6,631.83', status: 'Completed', date: '10 Aug 2026' },
      { id: 'WTH-402', userId: 'USR-8819', userName: 'Priya Sharma', asset: 'Silver', quantity: '2.0000 gm', amount: '₹ 530.00', status: 'Processing', date: '13 Aug 2026' }
    ];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sj_settings');
    return saved ? JSON.parse(saved) : {
      appName: 'SJ Jewelers',
      supportEmail: 'goldhouse@gmail.com',
      supportPhone: '94562-84829',
      maintenanceMode: false
    };
  });

  const [adminAuth, setAdminAuth] = useState({ isAuthenticated: false, email: '' });

  // Sync persistent datasets to localStorage
  useEffect(() => { localStorage.setItem('sj_goldRate', goldRate.toString()); }, [goldRate]);
  useEffect(() => { localStorage.setItem('sj_silverRate', silverRate.toString()); }, [silverRate]);
  useEffect(() => { localStorage.setItem('sj_holdings', JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => { localStorage.setItem('sj_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sj_usersList', JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem('sj_kycRequests', JSON.stringify(kycRequests)); }, [kycRequests]);
  useEffect(() => { localStorage.setItem('sj_withdrawals', JSON.stringify(withdrawals)); }, [withdrawals]);
  useEffect(() => { localStorage.setItem('sj_settings', JSON.stringify(settings)); }, [settings]);

  // Auth & Profile Lifecycle Handlers
  const registerNewUser = ({ username, mobile }) => {
    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: username || 'New User',
      mobile: mobile || '9876543210',
      email: '',
      kycStatus: 'Pending',
      profileCompleted: false, // Must complete profile
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
      goldGrams: 0.0000,
      silverGrams: 0.0000,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCurrentUser(newUser);
    setUsersList((prev) => [newUser, ...prev]);
    return newUser;
  };

  const loginUser = ({ username, mobile }) => {
    const existing = usersList.find((u) => 
      (username && u.name.toLowerCase() === username.toLowerCase()) ||
      (mobile && u.mobile === mobile)
    );

    let loggedInUser;
    if (existing) {
      loggedInUser = {
        ...existing,
        isAuthenticated: true
      };
    } else {
      // Demo fallback user
      loggedInUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: username || 'Demo User',
        mobile: mobile || '9999999999',
        email: 'demo@example.com',
        kycStatus: 'Pending',
        profileCompleted: true,
        isAuthenticated: true,
        address: '123 Cross Cut Road, Salem',
        pan: 'ABCDE1234F',
        aadhar: '1234-5678-9012',
        accountNumber: '918237192837',
        ifsc: 'SBIN0001234',
        nomineeName: 'Priya',
        nomineeMobile: '9876543210',
        nomineeDob: '15/06/1995',
        nomineeAddress: '123 Cross Cut Road, Salem',
        relationship: 'Spouse',
        goldGrams: 0.0000,
        silverGrams: 0.0377,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    setCurrentUser(loggedInUser);
    return loggedInUser;
  };

  const completeUserProfile = (profileData) => {
    const updated = {
      ...currentUser,
      ...profileData,
      profileCompleted: true,
      isAuthenticated: true
    };

    setCurrentUser(updated);
    setUsersList((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, ...updated, profileCompleted: true } : u));
    return updated;
  };

  const logoutUser = () => {
    setCurrentUser(LOGGED_OUT_USER);
    sessionStorage.removeItem('sj_session_skipped_profile');
    sessionStorage.removeItem('sj_activeScreen');
  };

  // Transaction & KYC Action Helpers
  const addPurchaseTransaction = ({ assetType, asset, amount, grams, quantity, ratePerGram, paymentMethod = 'UPI' }) => {
    // 1. Determine asset strictly (case-insensitive)
    const rawAsset = (assetType || asset || 'gold').toString().toLowerCase().trim();
    const isGold = rawAsset === 'gold';
    const assetDisplay = isGold ? 'Gold' : 'Silver';
    const assetNormalized = isGold ? 'gold' : 'silver';

    // 2. Parse grams strictly
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

    // 3. Single source of truth transaction object
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      time: timeStr,
      paymentMethod: paymentMethod || 'UPI',
      asset: assetDisplay, // 'Gold' or 'Silver'
      assetType: assetNormalized, // 'gold' or 'silver'
      quantity: `${gramsNum.toFixed(4)} gm`,
      amount: amountNum.toFixed(2),
      status: 'Success'
    };

    // Update transactions list
    setTransactions((prev) => {
      const updated = [newTxn, ...prev];
      localStorage.setItem('sj_transactions', JSON.stringify(updated));
      return updated;
    });

    // Update holdings (single source of truth for Home, Holdings, Withdraw screens)
    setHoldings((prev) => {
      const currentGold = parseFloat(prev?.goldGrams || 0);
      const currentSilver = parseFloat(prev?.silverGrams || 0);

      const updated = {
        goldGrams: isGold ? parseFloat((currentGold + gramsNum).toFixed(4)) : currentGold,
        silverGrams: !isGold ? parseFloat((currentSilver + gramsNum).toFixed(4)) : currentSilver
      };
      localStorage.setItem('sj_holdings', JSON.stringify(updated));
      return updated;
    });

    // Update currentUser state
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

    // Update usersList entry
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.id === currentUser.id) {
          const uGold = parseFloat(u.goldGrams || 0);
          const uSilver = parseFloat(u.silverGrams || 0);
          return {
            ...u,
            goldGrams: isGold ? parseFloat((uGold + gramsNum).toFixed(4)) : uGold,
            silverGrams: !isGold ? parseFloat((uSilver + gramsNum).toFixed(4)) : uSilver
          };
        }
        return u;
      });
      localStorage.setItem('sj_usersList', JSON.stringify(updated));
      return updated;
    });

    return newTxn;
  };

  const submitKycRequest = ({ pan, aadhar }) => {
    setCurrentUser((prev) => ({ ...prev, kycStatus: 'Under Review' }));
    
    const newKyc = {
      id: `KYC-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      mobile: currentUser.mobile,
      submittedDate: 'Today',
      status: 'Under Review',
      pan,
      aadhar
    };

    setKycRequests((prev) => [newKyc, ...prev]);
  };

  const approveKyc = (kycId, userId) => {
    setKycRequests((prev) => prev.map((k) => k.id === kycId ? { ...k, status: 'Verified' } : k));
    setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: 'Verified' } : u));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, kycStatus: 'Verified' }));
    }
  };

  const rejectKyc = (kycId, userId) => {
    setKycRequests((prev) => prev.map((k) => k.id === kycId ? { ...k, status: 'Rejected' } : k));
    setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: 'Rejected' } : u));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, kycStatus: 'Rejected' }));
    }
  };

  const toggleBlockUser = (userId) => {
    setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const updateRates = (newGold, newSilver) => {
    if (newGold) setGoldRate(parseFloat(newGold));
    if (newSilver) setSilverRate(parseFloat(newSilver));
  };

  const requestWithdrawal = ({ asset, quantity, amount }) => {
    const newWth = {
      id: `WTH-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      asset,
      quantity,
      amount,
      status: 'Pending',
      date: 'Today'
    };
    setWithdrawals((prev) => [newWth, ...prev]);
  };

  const updateWithdrawalStatus = (wthId, status) => {
    setWithdrawals((prev) => prev.map((w) => w.id === wthId ? { ...w, status } : w));
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      goldRate, setGoldRate,
      silverRate, setSilverRate,
      holdings, setHoldings,
      transactions, setTransactions,
      usersList, setUsersList,
      kycRequests, setKycRequests,
      withdrawals, setWithdrawals,
      settings, setSettings,
      adminAuth, setAdminAuth,
      registerNewUser,
      loginUser,
      completeUserProfile,
      logoutUser,
      addPurchaseTransaction,
      submitKycRequest,
      approveKyc,
      rejectKyc,
      toggleBlockUser,
      updateRates,
      requestWithdrawal,
      updateWithdrawalStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

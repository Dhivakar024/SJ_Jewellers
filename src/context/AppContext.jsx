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

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(LOGGED_OUT_USER);

  // Live and Custom Rates
  const [goldRate, setGoldRate] = useState(() => {
    const saved = localStorage.getItem('sj_goldRate');
    return saved ? parseFloat(saved) : 13818.88;
  });

  const [silverRate, setSilverRate] = useState(() => {
    const saved = localStorage.getItem('sj_silverRate');
    return saved ? parseFloat(saved) : 206.17;
  });

  const [isGoldCustom, setIsGoldCustom] = useState(() => {
    return localStorage.getItem('sj_isGoldCustom') === 'true';
  });

  const [isSilverCustom, setIsSilverCustom] = useState(() => {
    return localStorage.getItem('sj_isSilverCustom') === 'true';
  });

  const [customGoldInput, setCustomGoldInput] = useState(() => {
    return localStorage.getItem('sj_customGoldInput') || '13818.88';
  });

  const [customSilverInput, setCustomSilverInput] = useState(() => {
    return localStorage.getItem('sj_customSilverInput') || '206.17';
  });

  // Holdings & Transactions
  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('sj_holdings');
    return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('sj_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

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
      if (localStorage.getItem('sj_admin_logged_out') === 'true') {
        return { isAuthenticated: false, email: '' };
      }
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

  // Auth Handlers
  const registerNewUser = ({ username, mobile }) => {
    const newMember = {
      id: (members.length + 1).toString(),
      username: username || 'New User',
      mobile: mobile ? (mobile.startsWith('+91') ? mobile : `+91${mobile}`) : '+919876543210',
      role: 'customer',
      verified: 'No',
      mobileVerified: 'Yes',
      active: 'Yes',
      created: new Date().toLocaleDateString('en-US')
    };

    setMembers((prev) => [newMember, ...prev]);

    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: username || 'New User',
      mobile: mobile || '9876543210',
      email: '',
      kycStatus: 'Pending',
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
      goldGrams: 0.0000,
      silverGrams: 0.0000,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCurrentUser(newUser);
    return newUser;
  };

  const loginUser = ({ username, mobile }) => {
    const loggedInUser = {
      id: 'USR-8821',
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
      goldGrams: holdings.goldGrams,
      silverGrams: holdings.silverGrams,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

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
    return updated;
  };

  const logoutUser = () => {
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

  // Withdrawal Actions
  const approveWithdrawal = (id) => {
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
  };

  // User Verification Actions
  const verifyCustomer = (verificationId, memberName) => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== verificationId && v.name !== memberName));
    if (memberName) {
      setMembers((prev) => prev.map((m) => {
        if (m.username === memberName) {
          return { ...m, verified: 'Yes' };
        }
        return m;
      }));
    }
  };

  // Rate Management Actions
  const saveRates = ({ newGoldRate, newSilverRate, goldCustom, silverCustom, goldInputVal, silverInputVal }) => {
    if (newGoldRate) setGoldRate(parseFloat(newGoldRate));
    if (newSilverRate) setSilverRate(parseFloat(newSilverRate));
    if (goldCustom !== undefined) setIsGoldCustom(goldCustom);
    if (silverCustom !== undefined) setIsSilverCustom(silverCustom);
    if (goldInputVal !== undefined) setCustomGoldInput(goldInputVal);
    if (silverInputVal !== undefined) setCustomSilverInput(silverInputVal);
  };

  // Theme Toggle Action
  const toggleAdminTheme = () => {
    setAdminTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        goldRate,
        setGoldRate,
        silverRate,
        setSilverRate,
        isGoldCustom,
        setIsGoldCustom,
        isSilverCustom,
        setIsSilverCustom,
        customGoldInput,
        setCustomGoldInput,
        customSilverInput,
        setCustomSilverInput,
        holdings,
        setHoldings,
        transactions,
        setTransactions,
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
        registerNewUser,
        loginUser,
        completeUserProfile,
        logoutUser,
        addPurchaseTransaction,
        approveWithdrawal,
        verifyCustomer,
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

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_USER = {
  id: 'USR-8821',
  name: 'Demo User',
  mobile: '9999999999',
  email: 'demo@example.com',
  kycStatus: 'Pending', // 'Pending', 'Under Review', 'Verified', 'Rejected'
  accountDetails: null,
  nomineeDetails: null,
  isBlocked: false,
  createdAt: '2026-08-01'
};

const INITIAL_HOLDINGS = {
  goldGrams: 0.0000,
  silverGrams: 0.0377
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9011',
    date: 'August 3, 2026',
    time: '5:00 AM',
    paymentMethod: 'UPI',
    asset: 'Silver',
    quantity: '0.0377g',
    amount: '10.30',
    status: 'Success'
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
    id: 'TXN-8542',
    date: 'June 27, 2026',
    time: '10:55 AM',
    paymentMethod: 'UPI',
    asset: 'Gold',
    quantity: '0.0040g',
    amount: '51.50',
    status: 'Pending'
  }
];

const INITIAL_USERS_LIST = [
  { id: 'USR-8821', name: 'Demo User', mobile: '9999999999', email: 'demo@example.com', goldGrams: 0.0000, silverGrams: 0.0377, kycStatus: 'Pending', status: 'Active', createdAt: '2026-08-01' },
  { id: 'USR-8820', name: 'Rajesh Kumar', mobile: '9842109823', email: 'rajesh@example.com', goldGrams: 1.2500, silverGrams: 15.0000, kycStatus: 'Verified', status: 'Active', createdAt: '2026-07-20' },
  { id: 'USR-8819', name: 'Priya Sharma', mobile: '9789012345', email: 'priya@example.com', goldGrams: 0.5000, silverGrams: 5.2500, kycStatus: 'Under Review', status: 'Active', createdAt: '2026-07-15' },
  { id: 'USR-8818', name: 'Arun Varma', mobile: '9655432109', email: 'arun@example.com', goldGrams: 0.0000, silverGrams: 0.0000, kycStatus: 'Rejected', status: 'Blocked', createdAt: '2026-07-10' }
];

export function AppProvider({ children }) {
  // Load initial states from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sj_currentUser');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

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

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('sj_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('sj_goldRate', goldRate.toString()); }, [goldRate]);
  useEffect(() => { localStorage.setItem('sj_silverRate', silverRate.toString()); }, [silverRate]);
  useEffect(() => { localStorage.setItem('sj_holdings', JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => { localStorage.setItem('sj_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sj_usersList', JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem('sj_kycRequests', JSON.stringify(kycRequests)); }, [kycRequests]);
  useEffect(() => { localStorage.setItem('sj_withdrawals', JSON.stringify(withdrawals)); }, [withdrawals]);
  useEffect(() => { localStorage.setItem('sj_settings', JSON.stringify(settings)); }, [settings]);

  // Action Helpers
  const addPurchaseTransaction = ({ asset, amount, grams, paymentMethod }) => {
    const gramsNum = parseFloat(grams) || 0;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      time: timeStr,
      paymentMethod,
      asset: asset === 'gold' ? 'Gold' : 'Silver',
      quantity: `${gramsNum.toFixed(4)}g`,
      amount: parseFloat(amount).toFixed(2),
      status: 'Success'
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update holdings
    setHoldings((prev) => {
      if (asset === 'gold') {
        return { ...prev, goldGrams: parseFloat((prev.goldGrams + gramsNum).toFixed(4)) };
      } else {
        return { ...prev, silverGrams: parseFloat((prev.silverGrams + gramsNum).toFixed(4)) };
      }
    });

    // Update Demo User entry in usersList
    setUsersList((prev) => prev.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          goldGrams: asset === 'gold' ? parseFloat((u.goldGrams + gramsNum).toFixed(4)) : u.goldGrams,
          silverGrams: asset === 'silver' ? parseFloat((u.silverGrams + gramsNum).toFixed(4)) : u.silverGrams,
        };
      }
      return u;
    }));
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

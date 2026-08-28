/**
 * AppContext for React Native
 * Centralized state management for user authentication, live rates, holdings,
 * transactions, withdrawals, and profile management with AsyncStorage persistence.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  setAuthToken,
  clearAllAuth,
  getSkippedProfile,
  setSkippedProfile,
} from '../utils/authStorage';
import { ratesService } from '../services/ratesService';
import { holdingsService } from '../services/holdingsService';
import { purchaseService } from '../services/purchaseService';
import { withdrawalService } from '../services/withdrawalService';

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
  relationshipDetails: '',
  isBlocked: false,
  createdAt: '',
};

const INITIAL_HOLDINGS = {
  goldGrams: 4.8500,
  silverGrams: 145.2000,
  goldInvested: 78878.70,
  silverInvested: 38768.40,
  goldCurrentValue: 78878.70,
  silverCurrentValue: 38768.40,
  totalInvested: 117647.10,
  totalCurrentValue: 117647.10,
  totalProfitLoss: 0,
};

const INITIAL_TRANSACTIONS = [
  { id: 'TXN-9850', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'August 26, 2026', time: '11:45 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16263.65, amount: '8131.83', status: 'Success', createdAt: '2026-08-26T11:45:00Z' },
  { id: 'TXN-9849', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'August 26, 2026', time: '10:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '25.0000 gm', grams: 25, rate: 267.00, amount: '6675.00', status: 'Success', createdAt: '2026-08-26T10:15:00Z' },
  { id: 'TXN-9848', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'August 25, 2026', time: '04:30 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 16263.65, amount: '16263.65', status: 'Success', createdAt: '2026-08-25T16:30:00Z' },
  { id: 'TXN-9847', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'August 25, 2026', time: '02:10 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 267.00, amount: '13350.00', status: 'Success', createdAt: '2026-08-25T14:10:00Z' },
  { id: 'TXN-9846', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'August 24, 2026', time: '05:00 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.7500 gm', grams: 0.75, rate: 16250.00, amount: '12187.50', status: 'Success', createdAt: '2026-08-24T17:00:00Z' },
  { id: 'TXN-9845', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'August 24, 2026', time: '11:20 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 266.50, amount: '10660.00', status: 'Success', createdAt: '2026-08-24T11:20:00Z' },
  { id: 'TXN-9844', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: 'August 23, 2026', time: '03:45 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.2500 gm', grams: 0.25, rate: 16240.00, amount: '4060.00', status: 'Success', createdAt: '2026-08-23T15:45:00Z' },
  { id: 'TXN-9843', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: 'August 22, 2026', time: '01:30 PM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 266.00, amount: '9310.00', status: 'Success', createdAt: '2026-08-22T13:30:00Z' },
  { id: 'TXN-9842', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: 'August 21, 2026', time: '04:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.2500 gm', grams: 1.25, rate: 16220.00, amount: '20275.00', status: 'Success', createdAt: '2026-08-21T16:15:00Z' },
  { id: 'TXN-9841', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: 'August 20, 2026', time: '10:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 265.50, amount: '15930.00', status: 'Success', createdAt: '2026-08-20T10:00:00Z' },
  { id: 'TXN-9840', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: 'August 19, 2026', time: '12:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16200.00, amount: '8100.00', status: 'Success', createdAt: '2026-08-19T12:15:00Z' },
  { id: 'TXN-9839', customer: 'Sarathy M', userId: '7', mobile: '+918754753199', date: 'August 18, 2026', time: '09:40 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '20.0000 gm', grams: 20, rate: 265.00, amount: '5300.00', status: 'Success', createdAt: '2026-08-18T09:40:00Z' },
  { id: 'TXN-9838', customer: 'Thiyagarajan N', userId: '4', mobile: '+918667536040', date: 'August 17, 2026', time: '03:10 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.8000 gm', grams: 0.8, rate: 16180.00, amount: '12944.00', status: 'Success', createdAt: '2026-08-17T15:10:00Z' },
  { id: 'TXN-9837', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'August 16, 2026', time: '02:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '45.0000 gm', grams: 45, rate: 264.50, amount: '11902.50', status: 'Success', createdAt: '2026-08-16T14:00:00Z' },
  { id: 'TXN-9836', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'August 15, 2026', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 16150.00, amount: '24225.00', status: 'Success', createdAt: '2026-08-15T11:00:00Z' },
];

const INITIAL_WITHDRAWALS = [
  { id: 'WTH-101', date: '24 Aug 2026, 11:30 am', customer: 'Dhivakar M', mobile: '+919840123456', metal: 'Gold', grams: 1.5000, rate: 16263.65, amount: 24395.48, status: 'Approved', paidDate: '25 Aug 2026, 02:30 pm' },
  { id: 'WTH-102', date: '22 Aug 2026, 04:15 pm', customer: 'Siva Kumar', mobile: '+919876543210', metal: 'Silver', grams: 25.0000, rate: 267.00, amount: 6675.00, status: 'Pending', paidDate: null },
  { id: 'WTH-103', date: '18 Aug 2026, 10:00 am', customer: 'Priya R', mobile: '+919789012345', metal: 'Gold', grams: 0.7500, rate: 16150.00, amount: 12112.50, status: 'Approved', paidDate: '19 Aug 2026, 11:45 am' },
  { id: 'WTH-104', date: '14 Aug 2026, 02:45 pm', customer: 'Haritha E', mobile: '+916369589253', metal: 'Silver', grams: 60.0000, rate: 260.00, amount: 15600.00, status: 'Pending', paidDate: null },
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(LOGGED_OUT_USER);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasSkippedProfile, setHasSkippedProfile] = useState(false);

  const [goldRate, setGoldRate] = useState(16263.65);
  const [silverRate, setSilverRate] = useState(267.00);
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);

  // Buy Now screen preserved draft state
  const [buyNowState, setBuyNowState] = useState({
    assetType: 'gold',
    mode: 'rupees',
    rupeesVal: '100',
    gramsVal: (100 / 16263.65).toFixed(4),
    selectedQuickOption: '100',
  });

  // Recompute holdings current value dynamically whenever rates change
  useEffect(() => {
    setHoldings((prev) => {
      const gGrams = Number(prev.goldGrams) || 0;
      const sGrams = Number(prev.silverGrams) || 0;
      const gVal = gGrams * goldRate;
      const sVal = sGrams * silverRate;
      const totVal = gVal + sVal;
      const totInv = Number(prev.totalInvested) || totVal;
      return {
        ...prev,
        goldCurrentValue: gVal,
        silverCurrentValue: sVal,
        totalCurrentValue: totVal,
        totalProfitLoss: totVal - totInv,
      };
    });
  }, [goldRate, silverRate]);

  // Load stored user & AsyncStorage state on mount
  useEffect(() => {
    const initializeAppState = async () => {
      try {
        const storedUser = await getStoredUser();
        const skipped = await getSkippedProfile();
        setHasSkippedProfile(skipped);

        if (storedUser && storedUser.isAuthenticated) {
          setCurrentUser(storedUser);
        }

        // Restore custom holdings if previously saved
        const savedHoldings = await AsyncStorage.getItem('@sj_holdings');
        if (savedHoldings) {
          try {
            setHoldings(JSON.parse(savedHoldings));
          } catch {}
        }

        // Restore transactions if saved
        const savedTxns = await AsyncStorage.getItem('@sj_transactions');
        if (savedTxns) {
          try {
            setTransactions(JSON.parse(savedTxns));
          } catch {}
        }

        // Restore withdrawals if saved
        const savedWths = await AsyncStorage.getItem('@sj_withdrawals');
        if (savedWths) {
          try {
            setWithdrawals(JSON.parse(savedWths));
          } catch {}
        }
      } catch (err) {
        console.error('Error initializing app state:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAppState();
  }, []);

  // Save holdings changes to AsyncStorage
  const saveHoldings = async (newHoldings) => {
    setHoldings(newHoldings);
    try {
      await AsyncStorage.setItem('@sj_holdings', JSON.stringify(newHoldings));
    } catch {}
  };

  // Save transactions changes to AsyncStorage
  const saveTransactions = async (newTxns) => {
    setTransactions(newTxns);
    try {
      await AsyncStorage.setItem('@sj_transactions', JSON.stringify(newTxns));
    } catch {}
  };

  // Save withdrawals changes to AsyncStorage
  const saveWithdrawals = async (newWths) => {
    setWithdrawals(newWths);
    try {
      await AsyncStorage.setItem('@sj_withdrawals', JSON.stringify(newWths));
    } catch {}
  };

  // Login handler
  const loginUser = async ({ identifier, mobile, password }) => {
    const cleanMob = (mobile || identifier || '').replace(/[^\d+]/g, '');

    // Default test user credentials or dynamic login
    const userObj = {
      id: 'USER-' + Date.now().toString().slice(-4),
      name: 'Dhivakar M',
      mobile: cleanMob.startsWith('+91') ? cleanMob : `+91${cleanMob.slice(-10)}`,
      email: 'dhivakar.m@gmail.com',
      kycStatus: 'Verified',
      profileCompleted: true,
      isAuthenticated: true,
      address: '124, Gandhi Road, Salem - 636001',
      pan: 'ABCDE1234F',
      aadhar: '123456789012',
      accountNumber: '987654321012',
      ifsc: 'SBIN0001234',
      nomineeName: 'Priya D',
      nomineeMobile: '+919789012345',
      nomineeDob: '15/06/1995',
      nomineeAddress: '124, Gandhi Road, Salem - 636001',
      relationship: 'Spouse',
      relationshipDetails: '',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    };

    await setAuthToken('jwt-token-' + Date.now());
    await setStoredUser(userObj);
    setCurrentUser(userObj);
    return userObj;
  };

  // Register handler
  const registerUser = async ({ name, mobile, email, password }) => {
    const cleanMob = (mobile || '').replace(/[^\d+]/g, '');
    const userObj = {
      ...LOGGED_OUT_USER,
      id: 'USER-' + Date.now().toString().slice(-4),
      name: (name || '').trim(),
      mobile: cleanMob.startsWith('+91') ? cleanMob : `+91${cleanMob.slice(-10)}`,
      email: (email || '').trim() || null,
      kycStatus: 'Pending',
      profileCompleted: false,
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
    };

    await setAuthToken('jwt-token-' + Date.now());
    await setStoredUser(userObj);
    await setSkippedProfile(false);
    setHasSkippedProfile(false);
    setCurrentUser(userObj);
    return userObj;
  };

  // Complete/Update User Profile
  const completeUserProfile = async (updatedFields) => {
    const updated = {
      ...currentUser,
      ...updatedFields,
      profileCompleted: true,
      isAuthenticated: true,
    };
    await setStoredUser(updated);
    await setSkippedProfile(false);
    setHasSkippedProfile(false);
    setCurrentUser(updated);
    return updated;
  };

  // Skip profile handler
  const skipProfile = async () => {
    await setSkippedProfile(true);
    setHasSkippedProfile(true);
  };

  // Logout handler
  const logoutUser = async () => {
    await clearAllAuth();
    setCurrentUser(LOGGED_OUT_USER);
    setHasSkippedProfile(false);
  };

  // Submit KYC Request
  const submitKycRequest = async ({ pan, aadhar }) => {
    const updated = {
      ...currentUser,
      pan: (pan || '').trim().toUpperCase(),
      aadhar: (aadhar || '').replace(/\D/g, ''),
      kycStatus: 'Verified',
    };
    await setStoredUser(updated);
    setCurrentUser(updated);
    return updated;
  };

  // Add Purchase Transaction & Update User Holdings Balance
  const addPurchaseTransaction = (txnData) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const isGold = (txnData.assetType || 'gold').toLowerCase() === 'gold';
    const grams = parseFloat(txnData.grams) || 0;
    const amount = parseFloat(txnData.amount) || 0;
    const rate = parseFloat(txnData.ratePerGram) || (isGold ? goldRate : silverRate);

    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      customer: currentUser.name || 'Dhivakar M',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '+919840123456',
      date: formattedDate,
      time: formattedTime,
      paymentMethod: txnData.paymentMethod || 'UPI',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${grams.toFixed(4)} gm`,
      grams: grams,
      rate: rate,
      amount: amount.toFixed(2),
      status: 'Success',
      createdAt: now.toISOString(),
    };

    // Update transactions
    const updatedTxns = [newTxn, ...transactions];
    saveTransactions(updatedTxns);

    // Update user balance & portfolio
    const updatedHoldings = {
      ...holdings,
      goldGrams: isGold ? (holdings.goldGrams || 0) + grams : (holdings.goldGrams || 0),
      silverGrams: !isGold ? (holdings.silverGrams || 0) + grams : (holdings.silverGrams || 0),
      goldInvested: isGold ? (holdings.goldInvested || 0) + amount : (holdings.goldInvested || 0),
      silverInvested: !isGold ? (holdings.silverInvested || 0) + amount : (holdings.silverInvested || 0),
      totalInvested: (holdings.totalInvested || 0) + amount,
    };
    saveHoldings(updatedHoldings);

    return newTxn;
  };

  // Request Withdrawal & Deduct Grams from Holdings
  const requestWithdrawal = (wData) => {
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    const isGold = (wData.asset || 'Gold').toLowerCase() === 'gold';
    const grams = parseFloat(wData.quantity) || 0;
    const rate = isGold ? goldRate : silverRate;
    const amount = parseFloat(wData.amount) || grams * rate;

    const newWithdrawal = {
      id: 'WTH-' + Math.floor(100 + Math.random() * 900),
      date: dateFormatted,
      customer: currentUser.name || 'Dhivakar M',
      mobile: currentUser.mobile || '+919840123456',
      metal: isGold ? 'Gold' : 'Silver',
      grams: grams,
      rate: rate,
      amount: amount,
      status: 'Pending',
      paidDate: null,
      pickupLocation: 'Salem Shop',
    };

    const updatedWths = [newWithdrawal, ...withdrawals];
    saveWithdrawals(updatedWths);

    // Deduct grams from holdings
    const updatedHoldings = {
      ...holdings,
      goldGrams: isGold ? Math.max(0, (holdings.goldGrams || 0) - grams) : (holdings.goldGrams || 0),
      silverGrams: !isGold ? Math.max(0, (holdings.silverGrams || 0) - grams) : (holdings.silverGrams || 0),
    };
    saveHoldings(updatedHoldings);

    // Also add to transactions list as Pending withdrawal
    const newTxn = {
      id: 'TXN-W' + Math.floor(1000 + Math.random() * 9000),
      customer: currentUser.name || 'Dhivakar M',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '+919840123456',
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      paymentMethod: 'Shop Pickup',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${grams.toFixed(4)} gm (Withdrawal)`,
      grams: grams,
      rate: rate,
      amount: amount.toFixed(2),
      status: 'Pending',
      createdAt: now.toISOString(),
    };
    saveTransactions([newTxn, ...transactions]);

    return newWithdrawal;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        hasSkippedProfile,
        goldRate,
        silverRate,
        holdings,
        transactions,
        withdrawals,
        buyNowState,
        setBuyNowState,
        loginUser,
        registerUser,
        logoutUser,
        completeUserProfile,
        skipProfile,
        submitKycRequest,
        addPurchaseTransaction,
        requestWithdrawal,
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

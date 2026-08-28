/**
 * AppContext for React Native (Frontend-Only Architecture)
 * Fully standalone state management for user authentication, live rates, holdings,
 * transactions, withdrawals, and profile management with AsyncStorage local persistence.
 * Zero backend or database dependencies.
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
  goldGrams: 0,
  silverGrams: 0,
  goldInvested: 0,
  silverInvested: 0,
  goldCurrentValue: 0,
  silverCurrentValue: 0,
  totalInvested: 0,
  totalCurrentValue: 0,
  totalProfitLoss: 0,
};

const INITIAL_TRANSACTIONS = [];
const INITIAL_WITHDRAWALS = [];

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

  // Recompute holdings current value dynamically whenever rates or gram balances change
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
        const savedWithdrawals = await AsyncStorage.getItem('@sj_withdrawals');
        if (savedWithdrawals) {
          try {
            setWithdrawals(JSON.parse(savedWithdrawals));
          } catch {}
        }
      } catch (err) {
        console.warn('Error loading stored app state:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAppState();
  }, []);

  // Save holdings to AsyncStorage whenever changed
  const updateAndPersistHoldings = useCallback(async (newHoldings) => {
    setHoldings(newHoldings);
    try {
      await AsyncStorage.setItem('@sj_holdings', JSON.stringify(newHoldings));
    } catch (e) {
      console.warn('Failed to save holdings to storage:', e);
    }
  }, []);

  // Save transactions to AsyncStorage whenever changed
  const updateAndPersistTransactions = useCallback(async (newTransactions) => {
    setTransactions(newTransactions);
    try {
      await AsyncStorage.setItem('@sj_transactions', JSON.stringify(newTransactions));
    } catch (e) {
      console.warn('Failed to save transactions to storage:', e);
    }
  }, []);

  // Save withdrawals to AsyncStorage whenever changed
  const updateAndPersistWithdrawals = useCallback(async (newWithdrawals) => {
    setWithdrawals(newWithdrawals);
    try {
      await AsyncStorage.setItem('@sj_withdrawals', JSON.stringify(newWithdrawals));
    } catch (e) {
      console.warn('Failed to save withdrawals to storage:', e);
    }
  }, []);

  // Login handler
  const loginUser = useCallback(async (mobile, password) => {
    try {
      const usersDbRaw = await AsyncStorage.getItem('@sj_users_db');
      const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};
      const existing = usersDb[mobile];

      const userSession = existing || {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: '',
        mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
        email: '',
        kycStatus: 'Pending',
        profileCompleted: false,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
      };

      userSession.isAuthenticated = true;
      await setStoredUser(userSession);
      await setAuthToken(`token_${Date.now()}`);
      setCurrentUser(userSession);
      return userSession;
    } catch (err) {
      console.warn('Login error:', err);
      return null;
    }
  }, []);

  // Register handler
  const registerUser = useCallback(async (name, mobile, password) => {
    try {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
        email: '',
        kycStatus: 'Pending',
        profileCompleted: false,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
      };

      const usersDbRaw = await AsyncStorage.getItem('@sj_users_db');
      const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};
      usersDb[mobile] = newUser;
      await AsyncStorage.setItem('@sj_users_db', JSON.stringify(usersDb));

      await setStoredUser(newUser);
      await setAuthToken(`token_${Date.now()}`);
      setCurrentUser(newUser);
      return newUser;
    } catch (err) {
      console.warn('Registration error:', err);
      return null;
    }
  }, []);

  // Reset Password handler
  const resetUserPassword = useCallback(async (mobile, newPassword) => {
    try {
      const usersDbRaw = await AsyncStorage.getItem('@sj_users_db');
      const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};
      if (usersDb[mobile]) {
        usersDb[mobile].password = newPassword;
        await AsyncStorage.setItem('@sj_users_db', JSON.stringify(usersDb));
      }
      return true;
    } catch (err) {
      console.warn('Reset password error:', err);
      return false;
    }
  }, []);

  // Complete User Profile
  const completeUserProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = {
        ...currentUser,
        ...profileData,
        profileCompleted: true,
        isAuthenticated: true,
      };

      await setStoredUser(updatedUser);
      setCurrentUser(updatedUser);

      // Save to users DB
      const cleanMobile = profileData.mobile || currentUser.mobile;
      if (cleanMobile) {
        const usersDbRaw = await AsyncStorage.getItem('@sj_users_db');
        const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};
        usersDb[cleanMobile] = updatedUser;
        await AsyncStorage.setItem('@sj_users_db', JSON.stringify(usersDb));
      }

      return updatedUser;
    } catch (err) {
      console.warn('Error updating profile:', err);
      return null;
    }
  }, [currentUser]);

  // Skip Profile
  const skipProfile = useCallback(async () => {
    await setSkippedProfile(true);
    setHasSkippedProfile(true);
  }, []);

  // Logout handler
  const logoutUser = useCallback(async () => {
    await clearAllAuth();
    setCurrentUser(LOGGED_OUT_USER);
  }, []);

  // Submit KYC Request
  const submitKycRequest = useCallback(async ({ pan, aadhar }) => {
    try {
      const updated = {
        ...currentUser,
        pan,
        aadhar,
        kycStatus: 'Verified',
      };
      await setStoredUser(updated);
      setCurrentUser(updated);
      return { success: true };
    } catch (err) {
      console.warn('KYC submission error:', err);
      return { success: false };
    }
  }, [currentUser]);

  // Add Purchase Transaction & update holdings
  const addPurchaseTransaction = useCallback((txnData) => {
    const isGold = (txnData.assetType || txnData.asset || '').toLowerCase() === 'gold';
    const gramsNum = parseFloat(txnData.grams || txnData.quantity) || 0;
    const amountNum = parseFloat(txnData.amount) || 0;
    const rateNum = parseFloat(txnData.ratePerGram || txnData.rate) || (isGold ? goldRate : silverRate);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: currentUser.name || 'Customer',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '',
      date: formattedDate,
      time: formattedTime,
      paymentMethod: txnData.paymentMethod || 'UPI',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${gramsNum.toFixed(4)} gm`,
      grams: gramsNum,
      rate: rateNum,
      amount: amountNum.toFixed(2),
      status: 'Success',
      createdAt: now.toISOString(),
    };

    const updatedTxns = [newTxn, ...transactions];
    updateAndPersistTransactions(updatedTxns);

    // Update holdings
    const currentGoldGrams = Number(holdings.goldGrams) || 0;
    const currentSilverGrams = Number(holdings.silverGrams) || 0;
    const currentGoldInv = Number(holdings.goldInvested) || 0;
    const currentSilverInv = Number(holdings.silverInvested) || 0;

    const newGoldGrams = isGold ? currentGoldGrams + gramsNum : currentGoldGrams;
    const newSilverGrams = !isGold ? currentSilverGrams + gramsNum : currentSilverGrams;
    const newGoldInv = isGold ? currentGoldInv + amountNum : currentGoldInv;
    const newSilverInv = !isGold ? currentSilverInv + amountNum : currentSilverInv;

    const newGoldVal = newGoldGrams * goldRate;
    const newSilverVal = newSilverGrams * silverRate;
    const newTotalVal = newGoldVal + newSilverVal;
    const newTotalInv = newGoldInv + newSilverInv;

    const updatedHoldings = {
      goldGrams: newGoldGrams,
      silverGrams: newSilverGrams,
      goldInvested: newGoldInv,
      silverInvested: newSilverInv,
      goldCurrentValue: newGoldVal,
      silverCurrentValue: newSilverVal,
      totalInvested: newTotalInv,
      totalCurrentValue: newTotalVal,
      totalProfitLoss: newTotalVal - newTotalInv,
    };

    updateAndPersistHoldings(updatedHoldings);
    return newTxn;
  }, [currentUser, transactions, holdings, goldRate, silverRate, updateAndPersistTransactions, updateAndPersistHoldings]);

  // Request Withdrawal & deduct from holdings
  const requestWithdrawal = useCallback((wthData) => {
    const isGold = (wthData.asset || '').toLowerCase() === 'gold';
    const gramsNum = parseFloat(wthData.quantity || wthData.grams) || 0;
    const rateNum = isGold ? goldRate : silverRate;
    const amountNum = parseFloat(wthData.amount) || (gramsNum * rateNum);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newWth = {
      id: `WTH-${Math.floor(100 + Math.random() * 900)}`,
      date: formattedDate,
      customer: currentUser.name || 'Customer',
      mobile: currentUser.mobile || '',
      metal: isGold ? 'Gold' : 'Silver',
      grams: gramsNum,
      rate: rateNum,
      amount: amountNum,
      status: 'Approved',
      paidDate: formattedDate,
    };

    const updatedWths = [newWth, ...withdrawals];
    updateAndPersistWithdrawals(updatedWths);

    // Also add to transactions log as a completed withdrawal
    const formattedTxnDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTxnTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: currentUser.name || 'Customer',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '',
      date: formattedTxnDate,
      time: formattedTxnTime,
      paymentMethod: 'Vault Withdrawal',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${gramsNum.toFixed(4)} gm`,
      grams: gramsNum,
      rate: rateNum,
      amount: amountNum.toFixed(2),
      status: 'Success',
      createdAt: now.toISOString(),
    };

    const updatedTxns = [newTxn, ...transactions];
    updateAndPersistTransactions(updatedTxns);

    // Deduct grams from holdings
    const currentGoldGrams = Number(holdings.goldGrams) || 0;
    const currentSilverGrams = Number(holdings.silverGrams) || 0;

    const newGoldGrams = isGold ? Math.max(0, currentGoldGrams - gramsNum) : currentGoldGrams;
    const newSilverGrams = !isGold ? Math.max(0, currentSilverGrams - gramsNum) : currentSilverGrams;

    const newGoldVal = newGoldGrams * goldRate;
    const newSilverVal = newSilverGrams * silverRate;
    const newTotalVal = newGoldVal + newSilverVal;

    const updatedHoldings = {
      ...holdings,
      goldGrams: newGoldGrams,
      silverGrams: newSilverGrams,
      goldCurrentValue: newGoldVal,
      silverCurrentValue: newSilverVal,
      totalCurrentValue: newTotalVal,
    };

    updateAndPersistHoldings(updatedHoldings);
    return newWth;
  }, [currentUser, withdrawals, transactions, holdings, goldRate, silverRate, updateAndPersistWithdrawals, updateAndPersistTransactions, updateAndPersistHoldings]);

  const value = {
    currentUser,
    isAuthLoading,
    hasSkippedProfile,
    goldRate,
    silverRate,
    setGoldRate,
    setSilverRate,
    holdings,
    transactions,
    withdrawals,
    buyNowState,
    setBuyNowState,
    loginUser,
    registerUser,
    resetUserPassword,
    completeUserProfile,
    skipProfile,
    logoutUser,
    submitKycRequest,
    addPurchaseTransaction,
    requestWithdrawal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

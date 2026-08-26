import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, profileService, ratesService, holdingsService, transactionService, notificationService, adminService } from '../services';
import { getAuthToken, getStoredUser, setStoredUser, clearStoredUser, clearAllAuth } from '../utils/authStorage';

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
  goldGrams: 4.8500,
  silverGrams: 145.2000
};

// Generate realistic multi-year demo transactions (2022-2026, 12 months, 30 days)
const generateDemoTransactions = () => {
  const txns = [
    // --- 2026 August (Recent Daily Transactions) ---
    { id: 'TXN-9850', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2026-08-26', time: '11:45 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16263.65, amount: '8131.83', status: 'Success' },
    { id: 'TXN-9849', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2026-08-26', time: '10:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '25.0000 gm', grams: 25, rate: 267.00, amount: '6675.00', status: 'Success' },
    { id: 'TXN-9848', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2026-08-25', time: '04:30 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 16263.65, amount: '16263.65', status: 'Success' },
    { id: 'TXN-9847', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2026-08-25', time: '02:10 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 267.00, amount: '13350.00', status: 'Success' },
    { id: 'TXN-9846', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2026-08-24', time: '05:00 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.7500 gm', grams: 0.75, rate: 16250.00, amount: '12187.50', status: 'Success' },
    { id: 'TXN-9845', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: '2026-08-24', time: '11:20 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 266.50, amount: '10660.00', status: 'Success' },
    { id: 'TXN-9844', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: '2026-08-23', time: '03:45 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.2500 gm', grams: 0.25, rate: 16240.00, amount: '4060.00', status: 'Success' },
    { id: 'TXN-9843', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: '2026-08-22', time: '01:30 PM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 266.00, amount: '9310.00', status: 'Success' },
    { id: 'TXN-9842', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: '2026-08-21', time: '04:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.2500 gm', grams: 1.25, rate: 16220.00, amount: '20275.00', status: 'Success' },
    { id: 'TXN-9841', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: '2026-08-20', time: '10:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 265.50, amount: '15930.00', status: 'Success' },
    { id: 'TXN-9840', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: '2026-08-19', time: '12:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16200.00, amount: '8100.00', status: 'Success' },
    { id: 'TXN-9839', customer: 'Sarathy M', userId: '7', mobile: '+918754753199', date: '2026-08-18', time: '09:40 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '20.0000 gm', grams: 20, rate: 265.00, amount: '5300.00', status: 'Success' },
    { id: 'TXN-9838', customer: 'Thiyagarajan N', userId: '4', mobile: '+918667536040', date: '2026-08-17', time: '03:10 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.8000 gm', grams: 0.8, rate: 16180.00, amount: '12944.00', status: 'Success' },
    { id: 'TXN-9837', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2026-08-16', time: '02:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '45.0000 gm', grams: 45, rate: 264.50, amount: '11902.50', status: 'Success' },
    { id: 'TXN-9836', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2026-08-15', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 16150.00, amount: '24225.00', status: 'Success' },
    { id: 'TXN-9835', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2026-08-14', time: '04:50 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '30.0000 gm', grams: 30, rate: 264.00, amount: '7920.00', status: 'Success' },
    { id: 'TXN-9834', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2026-08-13', time: '01:25 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '0.6000 gm', grams: 0.6, rate: 16120.00, amount: '9672.00', status: 'Success' },
    { id: 'TXN-9833', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2026-08-12', time: '10:35 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '25.0000 gm', grams: 25, rate: 263.50, amount: '6587.50', status: 'Success' },
    { id: 'TXN-9832', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: '2026-08-11', time: '05:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 16100.00, amount: '32200.00', status: 'Success' },
    { id: 'TXN-9831', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: '2026-08-10', time: '12:40 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '55.0000 gm', grams: 55, rate: 263.00, amount: '14465.00', status: 'Success' },
    { id: 'TXN-9830', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: '2026-08-09', time: '03:30 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.4000 gm', grams: 0.4, rate: 16080.00, amount: '6432.00', status: 'Success' },
    { id: 'TXN-9829', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: '2026-08-08', time: '11:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 262.50, amount: '9187.50', status: 'Success' },
    { id: 'TXN-9828', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: '2026-08-07', time: '04:00 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 16050.00, amount: '16050.00', status: 'Success' },
    { id: 'TXN-9827', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: '2026-08-06', time: '09:50 AM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 262.00, amount: '10480.00', status: 'Success' },
    { id: 'TXN-9826', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2026-08-05', time: '02:20 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16020.00, amount: '8010.00', status: 'Success' },
    { id: 'TXN-9825', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2026-08-04', time: '10:45 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '20.0000 gm', grams: 20, rate: 261.50, amount: '5230.00', status: 'Success' },
    { id: 'TXN-9824', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2026-08-03', time: '04:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.8500 gm', grams: 0.85, rate: 16000.00, amount: '13600.00', status: 'Success' },
    { id: 'TXN-9823', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2026-08-02', time: '01:15 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 261.00, amount: '13050.00', status: 'Success' },
    { id: 'TXN-9822', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2026-08-01', time: '11:30 AM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '0.6500 gm', grams: 0.65, rate: 15980.00, amount: '10387.00', status: 'Success' },
    { id: 'TXN-9821', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: '2026-07-30', time: '03:45 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '45.0000 gm', grams: 45, rate: 260.00, amount: '11700.00', status: 'Success' },

    // --- 2026 Monthly Distribution (July 2026 to Jan 2026) ---
    { id: 'TXN-9750', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2026-07-22', time: '02:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.5000 gm', grams: 2.5, rate: 15850.00, amount: '39625.00', status: 'Success' },
    { id: 'TXN-9749', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2026-07-15', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '100.0000 gm', grams: 100, rate: 258.00, amount: '25800.00', status: 'Success' },
    { id: 'TXN-9720', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2026-06-25', time: '04:30 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 15600.00, amount: '31200.00', status: 'Success' },
    { id: 'TXN-9719', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: '2026-06-18', time: '01:10 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '80.0000 gm', grams: 80, rate: 255.00, amount: '20400.00', status: 'Success' },
    { id: 'TXN-9680', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: '2026-05-20', time: '10:45 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '3.0000 gm', grams: 3.0, rate: 15400.00, amount: '46200.00', status: 'Success' },
    { id: 'TXN-9679', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: '2026-05-12', time: '03:20 PM', paymentMethod: 'Debit Card', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 250.00, amount: '15000.00', status: 'Success' },
    { id: 'TXN-9640', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2026-04-24', time: '11:30 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 15150.00, amount: '22725.00', status: 'Success' },
    { id: 'TXN-9639', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2026-04-14', time: '04:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '70.0000 gm', grams: 70, rate: 246.00, amount: '17220.00', status: 'Success' },
    { id: 'TXN-9600', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2026-03-28', time: '02:40 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 14900.00, amount: '29800.00', status: 'Success' },
    { id: 'TXN-9599', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2026-03-15', time: '09:25 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '90.0000 gm', grams: 90, rate: 242.00, amount: '21780.00', status: 'Success' },
    { id: 'TXN-9560', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2026-02-22', time: '03:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.8000 gm', grams: 1.8, rate: 14700.00, amount: '26460.00', status: 'Success' },
    { id: 'TXN-9559', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: '2026-02-10', time: '01:50 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 238.00, amount: '11900.00', status: 'Success' },
    { id: 'TXN-9520', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: '2026-01-26', time: '11:10 AM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '2.2000 gm', grams: 2.2, rate: 14500.00, amount: '31900.00', status: 'Success' },
    { id: 'TXN-9519', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: '2026-01-14', time: '04:20 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '75.0000 gm', grams: 75, rate: 235.00, amount: '17625.00', status: 'Success' },

    // --- 2025 Monthly Distribution (Dec 2025 to Sep 2025) ---
    { id: 'TXN-9480', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: '2025-12-20', time: '02:30 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 14200.00, amount: '28400.00', status: 'Success' },
    { id: 'TXN-9479', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: '2025-12-11', time: '10:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 230.00, amount: '13800.00', status: 'Success' },
    { id: 'TXN-9440', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2025-11-25', time: '04:00 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 13950.00, amount: '20925.00', status: 'Success' },
    { id: 'TXN-9439', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2025-11-14', time: '11:45 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '80.0000 gm', grams: 80, rate: 226.00, amount: '18080.00', status: 'Success' },
    { id: 'TXN-9400', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2025-10-28', time: '01:20 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.4000 gm', grams: 2.4, rate: 13700.00, amount: '32880.00', status: 'Success' },
    { id: 'TXN-9399', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2025-10-16', time: '09:50 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 222.00, amount: '11100.00', status: 'Success' },
    { id: 'TXN-9360', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2025-09-22', time: '03:40 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '1.2000 gm', grams: 1.2, rate: 13450.00, amount: '16140.00', status: 'Success' },
    { id: 'TXN-9359', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: '2025-09-08', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 218.00, amount: '8720.00', status: 'Success' },

    // --- 2024 Multi-Year Historical ---
    { id: 'TXN-9200', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2024-11-18', time: '02:15 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '3.0000 gm', grams: 3.0, rate: 12200.00, amount: '36600.00', status: 'Success' },
    { id: 'TXN-9199', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2024-08-14', time: '10:30 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '120.0000 gm', grams: 120, rate: 195.00, amount: '23400.00', status: 'Success' },
    { id: 'TXN-9150', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: '2024-05-20', time: '04:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.5000 gm', grams: 2.5, rate: 11800.00, amount: '29500.00', status: 'Success' },
    { id: 'TXN-9149', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: '2024-02-12', time: '01:45 PM', paymentMethod: 'Debit Card', asset: 'Silver', assetType: 'silver', quantity: '90.0000 gm', grams: 90, rate: 188.00, amount: '16920.00', status: 'Success' },

    // --- 2023 Multi-Year Historical ---
    { id: 'TXN-9050', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2023-10-15', time: '11:20 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 10400.00, amount: '20800.00', status: 'Success' },
    { id: 'TXN-9049', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2023-07-25', time: '03:50 PM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '100.0000 gm', grams: 100, rate: 165.00, amount: '16500.00', status: 'Success' },
    { id: 'TXN-9010', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2023-04-18', time: '09:30 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 9800.00, amount: '14700.00', status: 'Success' },

    // --- 2022 Multi-Year Historical ---
    { id: 'TXN-8950', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: '2022-11-10', time: '02:45 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.8000 gm', grams: 1.8, rate: 8600.00, amount: '15480.00', status: 'Success' },
    { id: 'TXN-8949', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: '2022-08-22', time: '01:15 PM', paymentMethod: 'Debit Card', asset: 'Silver', assetType: 'silver', quantity: '80.0000 gm', grams: 80, rate: 142.00, amount: '11360.00', status: 'Success' },
    { id: 'TXN-8910', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: '2022-05-15', time: '10:00 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.2000 gm', grams: 1.2, rate: 8200.00, amount: '9840.00', status: 'Success' }
  ];
  return txns;
};

const INITIAL_TRANSACTIONS = generateDemoTransactions();

const INITIAL_MEMBERS = [
  { id: '1', name: 'Dhivakar M', username: 'dhivakar_m', mobile: '+919840123456', email: 'dhivakar.m@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '1/14/2023', goldGrams: 4.8500, silverGrams: 145.2000, transactionCount: 18 },
  { id: '2', name: 'Siva Kumar', username: 'sivakumar', mobile: '+919876543210', email: 'siva.kumar@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '3/22/2023', goldGrams: 2.1500, silverGrams: 85.0000, transactionCount: 11 },
  { id: '3', name: 'Priya R', username: 'priya_r', mobile: '+919789012345', email: 'priya.ram@yahoo.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '6/15/2023', goldGrams: 6.4000, silverGrams: 220.5000, transactionCount: 24 },
  { id: '4', name: 'Thiyagarajan N', username: 'thiyagarajan', mobile: '+918667536040', email: 'thiyagu.n@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '9/08/2023', goldGrams: 1.2000, silverGrams: 45.0000, transactionCount: 7 },
  { id: '5', name: 'Haritha E', username: 'haritha_e', mobile: '+916369589253', email: 'haritha.e@outlook.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '11/30/2023', goldGrams: 3.7500, silverGrams: 90.0000, transactionCount: 14 },
  { id: '6', name: 'Pravin K', username: 'pravin_k', mobile: '+919600958100', email: 'pravin.k@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '2/14/2024', goldGrams: 5.5000, silverGrams: 175.0000, transactionCount: 19 },
  { id: '7', name: 'Sarathy M', username: 'sarathy_m', mobile: '+918754753199', email: 'sarathy.m@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '4/25/2024', goldGrams: 0.8500, silverGrams: 60.0000, transactionCount: 6 },
  { id: '8', name: 'Sashikumar V', username: 'sashikumar_v', mobile: '+918248629310', email: 'sashi.v@gmail.com', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '7/19/2024', goldGrams: 0.0000, silverGrams: 15.0000, transactionCount: 2 },
  { id: '9', name: 'Neelesh R', username: 'neelesh_r', mobile: '+917624956109', email: 'neelesh.r@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '10/05/2024', goldGrams: 8.2000, silverGrams: 310.0000, transactionCount: 28 },
  { id: '10', name: 'Naveen S', username: 'naveen_s', mobile: '+917667950565', email: 'naveen.s@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '1/12/2025', goldGrams: 1.8000, silverGrams: 50.0000, transactionCount: 8 },
  { id: '11', name: 'Santhi V', username: 'santhi_v', mobile: '+918870013848', email: 'santhi.v@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '3/18/2025', goldGrams: 4.1000, silverGrams: 120.0000, transactionCount: 15 },
  { id: '12', name: 'Lalitha P', username: 'lalitha_p', mobile: '+919972452935', email: 'lalitha.p@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '5/22/2025', goldGrams: 2.9000, silverGrams: 95.0000, transactionCount: 10 },
  { id: '13', name: 'Premnath K', username: 'premnath_k', mobile: '+918637458187', email: 'prem.k@gmail.com', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'Yes', created: '8/14/2025', goldGrams: 0.5000, silverGrams: 30.0000, transactionCount: 4 },
  { id: '14', name: 'Kavipriya T', username: 'kavipriya_t', mobile: '+916381535131', email: 'kavi.priya@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '11/03/2025', goldGrams: 7.3000, silverGrams: 240.0000, transactionCount: 22 },
  { id: '15', name: 'Arunachalam S', username: 'arunachalam', mobile: '+919443210987', email: 'arun.s@gmail.com', role: 'customer', verified: 'Yes', mobileVerified: 'Yes', active: 'Yes', created: '1/20/2026', goldGrams: 3.2500, silverGrams: 110.0000, transactionCount: 12 },
  { id: '16', name: 'Meenakshi S', username: 'meenakshi_s', mobile: '+919842109876', email: 'meena.s@gmail.com', role: 'customer', verified: 'No', mobileVerified: 'Yes', active: 'No', created: '3/15/2026', goldGrams: 0.0000, silverGrams: 0.0000, transactionCount: 0 }
];

const INITIAL_WITHDRAWALS = [
  {
    id: 'WTH-101',
    date: '24 Aug 2026, 11:30 am',
    customer: 'Dhivakar M',
    mobile: '+919840123456',
    metal: 'Gold',
    grams: 1.5000,
    rate: 16263.65,
    amount: 24395.48,
    status: 'Approved',
    paidDate: '25 Aug 2026, 02:30 pm'
  },
  {
    id: 'WTH-102',
    date: '22 Aug 2026, 04:15 pm',
    customer: 'Siva Kumar',
    mobile: '+919876543210',
    metal: 'Silver',
    grams: 25.0000,
    rate: 267.00,
    amount: 6675.00,
    status: 'Pending',
    paidDate: null
  },
  {
    id: 'WTH-103',
    date: '18 Aug 2026, 10:00 am',
    customer: 'Priya R',
    mobile: '+919789012345',
    metal: 'Gold',
    grams: 0.7500,
    rate: 16150.00,
    amount: 12112.50,
    status: 'Approved',
    paidDate: '19 Aug 2026, 11:45 am'
  },
  {
    id: 'WTH-104',
    date: '14 Aug 2026, 02:45 pm',
    customer: 'Haritha E',
    mobile: '+916369589253',
    metal: 'Silver',
    grams: 60.0000,
    rate: 260.00,
    amount: 15600.00,
    status: 'Pending',
    paidDate: null
  },
  {
    id: 'WTH-105',
    date: '08 Aug 2026, 09:20 am',
    customer: 'Pravin K',
    mobile: '+919600958100',
    metal: 'Gold',
    grams: 2.0000,
    rate: 16250.00,
    amount: 32500.00,
    status: 'Approved',
    paidDate: '09 Aug 2026, 01:15 pm'
  },
  {
    id: 'WTH-106',
    date: '01 Aug 2026, 03:10 pm',
    customer: 'Neelesh R',
    mobile: '+917624956109',
    metal: 'Silver',
    grams: 100.0000,
    rate: 255.00,
    amount: 25500.00,
    status: 'Approved',
    paidDate: '02 Aug 2026, 10:30 am'
  }
];

const INITIAL_PENDING_VERIFICATIONS = [
  {
    id: 'VER-101',
    name: 'Sashikumar V',
    mobile: '+918248629310',
    role: 'customer',
    documentType: 'Aadhaar & PAN',
    mobileVerified: 'Yes',
    created: '8/25/2026, 10:20:05 AM',
    status: 'Pending'
  },
  {
    id: 'VER-102',
    name: 'Premnath K',
    mobile: '+918637458187',
    role: 'customer',
    documentType: 'PAN Card',
    mobileVerified: 'Yes',
    created: '8/23/2026, 02:40:15 PM',
    status: 'Pending'
  },
  {
    id: 'VER-103',
    name: 'Meenakshi S',
    mobile: '+919842109876',
    role: 'customer',
    documentType: 'Aadhaar Card',
    mobileVerified: 'Yes',
    created: '8/20/2026, 11:15:30 AM',
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

  // Buy Now screen state preservation
  const [buyNowState, setBuyNowState] = useState({
    assetType: 'gold',
    mode: 'rupees',
    rupeesVal: '100',
    gramsVal: '',
    selectedQuickOption: '100',
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
        return { isAuthenticated: false, username: '', email: '', role: null };
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
      isAuthenticated: false,
      username: '',
      email: '',
      role: null,
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
            goldGrams: holdings?.goldGrams || 0,
            silverGrams: holdings?.silverGrams || 0,
            status: uData.account_status === 'active' ? 'Active' : uData.account_status,
            createdAt: uData.created_at ? uData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          };

          setCurrentUser(restoredUser);
          setStoredUser(restoredUser);
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

  // Customer Registration (Direct Password Authentication)
  const registerNewUser = async ({ name, username, mobile, email, password }) => {
    const cleanName = (name || username || 'New User').trim();
    const cleanMobile = (mobile || '').trim();
    const pass = (password || '').trim();

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
      id: uData?.id || `USR-${Date.now()}`,
      name: uData?.name || cleanName,
      mobile: uData?.mobile || cleanMobile,
      email: uData?.email || (email ? email.trim() : ''),
      role: 'customer',
      kycStatus: 'Pending',
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
    setStoredUser(newUser);
    return newUser;
  };

  // Customer Login
  const loginUser = async ({ username, mobile, password, identifier }) => {
    const ident = (identifier || mobile || username || '').trim();
    const pass = (password || '').trim();

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
        goldGrams: holdings?.goldGrams || 0,
        silverGrams: holdings?.silverGrams || 0,
        status: uData.account_status === 'active' ? 'Active' : uData.account_status,
        createdAt: uData.created_at ? uData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      };

      setCurrentUser(loggedInUser);
      setStoredUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const completeUserProfile = (profileData) => {
    let updatedUser;
    setCurrentUser((prev) => {
      updatedUser = {
        ...prev,
        ...profileData,
        profileCompleted: true,
        isAuthenticated: true,
      };
      setStoredUser(updatedUser);
      return updatedUser;
    });
    return updatedUser;
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearAllAuth();
    sessionStorage.removeItem('sj_session_skipped_profile');
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
        saveRates,
        buyNowState,
        setBuyNowState,
        getAuthToken,
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

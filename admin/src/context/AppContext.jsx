import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, setStoredUser, clearStoredUser, clearAllAuth } from '../utils/authStorage';

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
  createdAt: ''
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

// Generate realistic multi-year demo transactions (2022-2026, 12 months, 30 days)
const generateDemoTransactions = () => {
  const txns = [
    // --- 2026 August (Recent Daily Transactions) ---
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
    { id: 'TXN-9835', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'August 14, 2026', time: '04:50 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '30.0000 gm', grams: 30, rate: 264.00, amount: '7920.00', status: 'Success', createdAt: '2026-08-14T16:50:00Z' },
    { id: 'TXN-9834', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'August 13, 2026', time: '01:25 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '0.6000 gm', grams: 0.6, rate: 16120.00, amount: '9672.00', status: 'Success', createdAt: '2026-08-13T13:25:00Z' },
    { id: 'TXN-9833', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'August 12, 2026', time: '10:35 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '25.0000 gm', grams: 25, rate: 263.50, amount: '6587.50', status: 'Success', createdAt: '2026-08-12T10:35:00Z' },
    { id: 'TXN-9832', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'August 11, 2026', time: '05:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 16100.00, amount: '32200.00', status: 'Success', createdAt: '2026-08-11T17:15:00Z' },
    { id: 'TXN-9831', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: 'August 10, 2026', time: '12:40 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '55.0000 gm', grams: 55, rate: 263.00, amount: '14465.00', status: 'Success', createdAt: '2026-08-10T12:40:00Z' },
    { id: 'TXN-9830', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: 'August 9, 2026', time: '03:30 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '0.4000 gm', grams: 0.4, rate: 16080.00, amount: '6432.00', status: 'Success', createdAt: '2026-08-09T15:30:00Z' },
    { id: 'TXN-9829', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: 'August 8, 2026', time: '11:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 262.50, amount: '9187.50', status: 'Success', createdAt: '2026-08-08T11:15:00Z' },
    { id: 'TXN-9828', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: 'August 7, 2026', time: '04:00 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 16050.00, amount: '16050.00', status: 'Success', createdAt: '2026-08-07T16:00:00Z' },
    { id: 'TXN-9827', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: 'August 6, 2026', time: '09:50 AM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 262.00, amount: '10480.00', status: 'Success', createdAt: '2026-08-06T09:50:00Z' },
    { id: 'TXN-9826', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'August 5, 2026', time: '02:20 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 16020.00, amount: '8010.00', status: 'Success', createdAt: '2026-08-05T14:20:00Z' },
    { id: 'TXN-9825', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'August 4, 2026', time: '10:45 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '20.0000 gm', grams: 20, rate: 261.50, amount: '5230.00', status: 'Success', createdAt: '2026-08-04T10:45:00Z' },
    { id: 'TXN-9824', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'August 3, 2026', time: '04:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.8500 gm', grams: 0.85, rate: 16000.00, amount: '13600.00', status: 'Success', createdAt: '2026-08-03T16:10:00Z' },
    { id: 'TXN-9823', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'August 2, 2026', time: '01:15 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 261.00, amount: '13050.00', status: 'Success', createdAt: '2026-08-02T13:15:00Z' },
    { id: 'TXN-9822', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'August 1, 2026', time: '11:30 AM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '0.6500 gm', grams: 0.65, rate: 15980.00, amount: '10387.00', status: 'Success', createdAt: '2026-08-01T11:30:00Z' },
    { id: 'TXN-9821', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'July 31, 2026', time: '03:45 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 260.00, amount: '9100.00', status: 'Success', createdAt: '2026-07-31T15:45:00Z' },
    { id: 'TXN-9820', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: 'July 30, 2026', time: '04:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.5000 gm', grams: 0.5, rate: 15950.00, amount: '7975.00', status: 'Success', createdAt: '2026-07-30T16:15:00Z' },
    { id: 'TXN-9819', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'July 29, 2026', time: '01:20 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '30.0000 gm', grams: 30, rate: 260.00, amount: '7800.00', status: 'Success', createdAt: '2026-07-29T13:20:00Z' },
    { id: 'TXN-9818', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'July 28, 2026', time: '10:50 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 15900.00, amount: '15900.00', status: 'Success', createdAt: '2026-07-28T10:50:00Z' },

    // --- 2026 Previous Months (Jan - Jul 2026) ---
    { id: 'TXN-9815', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: 'July 15, 2026', time: '02:30 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '2.5000 gm', grams: 2.5, rate: 15800.00, amount: '39500.00', status: 'Success', createdAt: '2026-07-15T14:30:00Z' },
    { id: 'TXN-9814', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'July 10, 2026', time: '11:15 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 260.00, amount: '15600.00', status: 'Success', createdAt: '2026-07-10T11:15:00Z' },
    { id: 'TXN-9810', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'June 22, 2026', time: '04:40 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.8000 gm', grams: 1.8, rate: 15600.00, amount: '28080.00', status: 'Success', createdAt: '2026-06-22T16:40:00Z' },
    { id: 'TXN-9809', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'June 12, 2026', time: '01:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 255.00, amount: '10200.00', status: 'Success', createdAt: '2026-06-12T13:00:00Z' },
    { id: 'TXN-9805', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'May 20, 2026', time: '03:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '3.0000 gm', grams: 3.0, rate: 15400.00, amount: '46200.00', status: 'Success', createdAt: '2026-05-20T15:15:00Z' },
    { id: 'TXN-9804', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'May 08, 2026', time: '10:45 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 250.00, amount: '12500.00', status: 'Success', createdAt: '2026-05-08T10:45:00Z' },
    { id: 'TXN-9800', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'April 25, 2026', time: '05:20 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '1.2000 gm', grams: 1.2, rate: 15200.00, amount: '18240.00', status: 'Success', createdAt: '2026-04-25T17:20:00Z' },
    { id: 'TXN-9799', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: 'April 14, 2026', time: '09:30 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '45.0000 gm', grams: 45, rate: 245.00, amount: '11025.00', status: 'Success', createdAt: '2026-04-14T09:30:00Z' },
    { id: 'TXN-9795', customer: 'Arunachalam S', userId: '15', mobile: '+919443210987', date: 'March 18, 2026', time: '02:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 14900.00, amount: '29800.00', status: 'Success', createdAt: '2026-03-18T14:10:00Z' },
    { id: 'TXN-9794', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: 'March 05, 2026', time: '11:40 AM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '30.0000 gm', grams: 30, rate: 240.00, amount: '7200.00', status: 'Success', createdAt: '2026-03-05T11:40:00Z' },
    { id: 'TXN-9790', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: 'February 22, 2026', time: '04:00 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 14700.00, amount: '22050.00', status: 'Success', createdAt: '2026-02-22T16:00:00Z' },
    { id: 'TXN-9789', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'February 10, 2026', time: '10:20 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '70.0000 gm', grams: 70, rate: 235.00, amount: '16450.00', status: 'Success', createdAt: '2026-02-10T10:20:00Z' },
    { id: 'TXN-9785', customer: 'Thiyagarajan N', userId: '4', mobile: '+918667536040', date: 'January 28, 2026', time: '03:30 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.4000 gm', grams: 0.4, rate: 14500.00, amount: '5800.00', status: 'Success', createdAt: '2026-01-28T15:30:00Z' },
    { id: 'TXN-9784', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'January 15, 2026', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 230.00, amount: '11500.00', status: 'Success', createdAt: '2026-01-15T11:00:00Z' },

    // --- 2025 Historical Transactions ---
    { id: 'TXN-9770', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'December 20, 2025', time: '02:45 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.2000 gm', grams: 2.2, rate: 14200.00, amount: '31240.00', status: 'Success', createdAt: '2025-12-20T14:45:00Z' },
    { id: 'TXN-9765', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'November 14, 2025', time: '11:15 AM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '80.0000 gm', grams: 80, rate: 220.00, amount: '17600.00', status: 'Success', createdAt: '2025-11-14T11:15:00Z' },
    { id: 'TXN-9760', customer: 'Kavipriya T', userId: '14', mobile: '+916381535131', date: 'October 22, 2025', time: '04:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 13900.00, amount: '27800.00', status: 'Success', createdAt: '2025-10-22T16:10:00Z' },
    { id: 'TXN-9755', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'September 15, 2025', time: '01:30 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 215.00, amount: '10750.00', status: 'Success', createdAt: '2025-09-15T13:30:00Z' },
    { id: 'TXN-9750', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'August 18, 2025', time: '10:00 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 13600.00, amount: '20400.00', status: 'Success', createdAt: '2025-08-18T10:00:00Z' },
    { id: 'TXN-9745', customer: 'Santhi V', userId: '11', mobile: '+918870013848', date: 'July 12, 2025', time: '03:20 PM', paymentMethod: 'Debit Card', asset: 'Silver', assetType: 'silver', quantity: '60.0000 gm', grams: 60, rate: 210.00, amount: '12600.00', status: 'Success', createdAt: '2025-07-12T15:20:00Z' },
    { id: 'TXN-9740', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'June 25, 2025', time: '11:45 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.8000 gm', grams: 1.8, rate: 13400.00, amount: '24120.00', status: 'Success', createdAt: '2025-06-25T11:45:00Z' },
    { id: 'TXN-9735', customer: 'Lalitha P', userId: '12', mobile: '+919972452935', date: 'May 10, 2025', time: '02:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 205.00, amount: '8200.00', status: 'Success', createdAt: '2025-05-10T14:00:00Z' },
    { id: 'TXN-9730', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'April 16, 2025', time: '04:30 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 13200.00, amount: '26400.00', status: 'Success', createdAt: '2025-04-16T16:30:00Z' },
    { id: 'TXN-9725', customer: 'Naveen S', userId: '10', mobile: '+917667950565', date: 'March 20, 2025', time: '09:50 AM', paymentMethod: 'Net Banking', asset: 'Silver', assetType: 'silver', quantity: '35.0000 gm', grams: 35, rate: 200.00, amount: '7000.00', status: 'Success', createdAt: '2025-03-20T09:50:00Z' },
    { id: 'TXN-9720', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'February 14, 2025', time: '01:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 13000.00, amount: '13000.00', status: 'Success', createdAt: '2025-02-14T13:15:00Z' },
    { id: 'TXN-9715', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'January 18, 2025', time: '10:30 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 195.00, amount: '9750.00', status: 'Success', createdAt: '2025-01-18T10:30:00Z' },

    // --- 2024 Historical Transactions ---
    { id: 'TXN-9700', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'November 28, 2024', time: '03:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 12500.00, amount: '18750.00', status: 'Success', createdAt: '2024-11-28T15:15:00Z' },
    { id: 'TXN-9695', customer: 'Pravin K', userId: '6', mobile: '+919600958100', date: 'September 12, 2024', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '65.0000 gm', grams: 65, rate: 185.00, amount: '12025.00', status: 'Success', createdAt: '2024-09-12T11:00:00Z' },
    { id: 'TXN-9690', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'July 05, 2024', time: '04:45 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 12200.00, amount: '24400.00', status: 'Success', createdAt: '2024-07-05T16:45:00Z' },
    { id: 'TXN-9685', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'May 18, 2024', time: '01:20 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 180.00, amount: '9000.00', status: 'Success', createdAt: '2024-05-18T13:20:00Z' },
    { id: 'TXN-9680', customer: 'Haritha E', userId: '5', mobile: '+916369589253', date: 'March 22, 2024', time: '10:30 AM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.2000 gm', grams: 1.2, rate: 11900.00, amount: '14280.00', status: 'Success', createdAt: '2024-03-22T10:30:00Z' },
    { id: 'TXN-9675', customer: 'Sarathy M', userId: '7', mobile: '+918754753199', date: 'January 15, 2024', time: '02:00 PM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 175.00, amount: '7000.00', status: 'Success', createdAt: '2024-01-15T14:00:00Z' },

    // --- 2023 Historical Transactions ---
    { id: 'TXN-9650', customer: 'Neelesh R', userId: '9', mobile: '+917624956109', date: 'October 15, 2023', time: '04:10 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '2.0000 gm', grams: 2.0, rate: 11400.00, amount: '22800.00', status: 'Success', createdAt: '2023-10-15T16:10:00Z' },
    { id: 'TXN-9645', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'August 20, 2023', time: '11:25 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '75.0000 gm', grams: 75, rate: 160.00, amount: '12000.00', status: 'Success', createdAt: '2023-08-20T11:25:00Z' },
    { id: 'TXN-9640', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'June 10, 2023', time: '01:45 PM', paymentMethod: 'Net Banking', asset: 'Gold', assetType: 'gold', quantity: '1.2000 gm', grams: 1.2, rate: 11200.00, amount: '13440.00', status: 'Success', createdAt: '2023-06-10T13:45:00Z' },
    { id: 'TXN-9635', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'March 15, 2023', time: '10:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 155.00, amount: '7750.00', status: 'Success', createdAt: '2023-03-15T10:00:00Z' },
    { id: 'TXN-9630', customer: 'Thiyagarajan N', userId: '4', mobile: '+918667536040', date: 'January 25, 2023', time: '03:15 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '0.8000 gm', grams: 0.8, rate: 11000.00, amount: '8800.00', status: 'Success', createdAt: '2023-01-25T15:15:00Z' },

    // --- 2022 Historical Transactions ---
    { id: 'TXN-9610', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'November 18, 2022', time: '02:30 PM', paymentMethod: 'UPI', asset: 'Gold', assetType: 'gold', quantity: '1.0000 gm', grams: 1.0, rate: 10200.00, amount: '10200.00', status: 'Success', createdAt: '2022-11-18T14:30:00Z' },
    { id: 'TXN-9605', customer: 'Siva Kumar', userId: '2', mobile: '+919876543210', date: 'August 14, 2022', time: '11:00 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '50.0000 gm', grams: 50, rate: 145.00, amount: '7250.00', status: 'Success', createdAt: '2022-08-14T11:00:00Z' },
    { id: 'TXN-9600', customer: 'Priya R', userId: '3', mobile: '+919789012345', date: 'May 20, 2022', time: '04:15 PM', paymentMethod: 'Debit Card', asset: 'Gold', assetType: 'gold', quantity: '1.5000 gm', grams: 1.5, rate: 10000.00, amount: '15000.00', status: 'Success', createdAt: '2022-05-20T16:15:00Z' },
    { id: 'TXN-9595', customer: 'Dhivakar M', userId: '1', mobile: '+919840123456', date: 'February 10, 2022', time: '09:45 AM', paymentMethod: 'UPI', asset: 'Silver', assetType: 'silver', quantity: '40.0000 gm', grams: 40, rate: 140.00, amount: '5600.00', status: 'Success', createdAt: '2022-02-10T09:45:00Z' }
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

const INITIAL_NOTIFICATIONS = [
  {
    notification_id: 'notif-1',
    id: 'notif-1',
    type: 'purchase_success',
    title: 'Gold Purchase Successful',
    message: 'You have successfully purchased 0.5000 gm of 24K Gold.',
    is_read: false,
    created_at: '2026-08-26T11:45:00Z',
  },
  {
    notification_id: 'notif-2',
    id: 'notif-2',
    type: 'system',
    title: 'Welcome to SJ Jewellers',
    message: 'Start investing in digital 24K Gold & 999 Pure Silver with instant liquidity.',
    is_read: true,
    created_at: '2026-08-25T09:00:00Z',
  }
];

export const API_GOLD_RATE = 16263.65;
export const API_SILVER_RATE = 267.00;

export function AppProvider({ children }) {
  // Restore Customer Authentication on App Startup
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = getStoredUser();
      if (stored && (stored.name || stored.mobile)) {
        return {
          ...LOGGED_OUT_USER,
          ...stored,
          isAuthenticated: true,
        };
      }
    } catch {
      // ignore
    }
    return LOGGED_OUT_USER;
  });

  const [isAuthLoading] = useState(false);

  // Live and Custom Rates
  const [goldRate, setGoldRate] = useState(() => {
    const saved = localStorage.getItem('sj_goldRate');
    return saved ? parseFloat(saved) : API_GOLD_RATE;
  });
  const [silverRate, setSilverRate] = useState(() => {
    const saved = localStorage.getItem('sj_silverRate');
    return saved ? parseFloat(saved) : API_SILVER_RATE;
  });
  const [apiGoldRate] = useState(API_GOLD_RATE);
  const [apiSilverRate] = useState(API_SILVER_RATE);
  const [isGoldCustom, setIsGoldCustom] = useState(() => {
    return localStorage.getItem('sj_isGoldCustom') === 'true';
  });
  const [isSilverCustom, setIsSilverCustom] = useState(() => {
    return localStorage.getItem('sj_isSilverCustom') === 'true';
  });
  const [customGoldInput, setCustomGoldInput] = useState(() => {
    return localStorage.getItem('sj_customGoldInput') || '16263.65';
  });
  const [customSilverInput, setCustomSilverInput] = useState(() => {
    return localStorage.getItem('sj_customSilverInput') || '267.00';
  });
  const [ratesLoading] = useState(false);
  const [ratesError] = useState(null);
  const [ratesUpdatedAt] = useState(() => new Date().toISOString());

  // Holdings State
  const [holdings, setHoldings] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_holdings');
      return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
    } catch {
      return INITIAL_HOLDINGS;
    }
  });
  const [holdingsLoading] = useState(false);
  const [holdingsError] = useState(null);

  // Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_TRANSACTIONS.length) {
          return parsed;
        }
      }
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });
  const [transactionsLoading] = useState(false);
  const [transactionsError] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_notifications');
      const list = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
      return list.filter((n) => !n.is_read).length;
    } catch {
      return 1;
    }
  });
  const [notificationsLoading] = useState(false);

  // Members / Registered Users
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_MEMBERS.length) {
          return parsed;
        }
      }
      return INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_withdrawals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_WITHDRAWALS.length) {
          return parsed;
        }
      }
      return INITIAL_WITHDRAWALS;
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  });

  // Pending Verifications
  const [pendingVerifications, setPendingVerifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sj_pending_verifications');
      return saved ? JSON.parse(saved) : INITIAL_PENDING_VERIFICATIONS;
    } catch {
      return INITIAL_PENDING_VERIFICATIONS;
    }
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
    try {
      const saved = localStorage.getItem('sj_admin_settings');
      return saved ? JSON.parse(saved) : {
        username: 'SJ Jewellers',
        autoLogout: '30 minutes'
      };
    } catch {
      return { username: 'SJ Jewellers', autoLogout: '30 minutes' };
    }
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
  useEffect(() => { localStorage.setItem('sj_notifications', JSON.stringify(notifications)); }, [notifications]);
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

  // Notifications Handlers
  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.notification_id === notificationId || n.id === notificationId ? { ...n, is_read: true } : n
      );
      setUnreadNotificationsCount(updated.filter((item) => !item.is_read).length);
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotificationsCount(0);
  }, []);

  // Customer Registration
  const registerNewUser = async ({ name, username, mobile, email }) => {
    const cleanName = (name || username || 'New User').trim();
    const cleanMobile = (mobile || '').trim();

    const newUser = {
      id: `USR-${Date.now()}`,
      name: cleanName,
      mobile: cleanMobile,
      email: email ? email.trim() : '',
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
      relationshipDetails: '',
      goldGrams: 0.0000,
      silverGrams: 0.0000,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(newUser);
    setStoredUser(newUser);

    // Add to members list
    setMembers((prev) => [
      {
        id: newUser.id,
        name: cleanName,
        username: cleanName.toLowerCase().replace(/\s+/g, '_'),
        mobile: cleanMobile,
        email: newUser.email,
        role: 'customer',
        verified: 'No',
        mobileVerified: 'Yes',
        active: 'Yes',
        created: new Date().toLocaleDateString('en-US'),
        goldGrams: 0.0000,
        silverGrams: 0.0000,
        transactionCount: 0,
      },
      ...prev,
    ]);

    return newUser;
  };

  // Customer Login
  const loginUser = async ({ identifier, mobile }) => {
    const cleanIdent = (mobile || identifier || '').trim().replace(/\D/g, '').slice(-10);

    // Look for matching user in members list or create logged in session
    const existing = members.find((m) => m.mobile && m.mobile.replace(/\D/g, '').slice(-10) === cleanIdent);

    const loggedInUser = {
      id: existing?.id || `USR-${Date.now()}`,
      name: existing?.name || 'Customer',
      mobile: existing?.mobile || mobile || identifier || '+919840123456',
      email: existing?.email || 'customer@example.com',
      role: 'customer',
      kycStatus: existing?.verified === 'Yes' ? 'Verified' : 'Pending',
      accountStatus: 'active',
      profileCompleted: true,
      isAuthenticated: true,
      address: '123 Main Street, Salem, Tamil Nadu - 636001',
      pan: 'ABCDE1234F',
      aadhar: '123456789012',
      accountNumber: '987654321000',
      ifsc: 'SBIN0001234',
      nomineeName: 'Priya M',
      nomineeMobile: '+919876543210',
      nomineeDob: '1998-05-15',
      nomineeAddress: '123 Main Street, Salem, Tamil Nadu - 636001',
      relationship: 'Spouse',
      relationshipDetails: '',
      goldGrams: existing?.goldGrams || holdings?.goldGrams || 4.8500,
      silverGrams: existing?.silverGrams || holdings?.silverGrams || 145.2000,
      status: 'Active',
      createdAt: existing?.created || new Date().toISOString().split('T')[0],
    };

    setCurrentUser(loggedInUser);
    setStoredUser(loggedInUser);
    return loggedInUser;
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

    // Update in members list as well
    if (updatedUser) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === updatedUser.id || m.mobile === updatedUser.mobile
            ? { ...m, name: updatedUser.name || m.name, email: updatedUser.email || m.email }
            : m
        )
      );
    }
    return updatedUser;
  };

  const logoutUser = async () => {
    clearAllAuth();
    clearStoredUser();
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
      customer: currentUser.name || 'Customer',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '+919840123456',
      date: dateStr,
      time: timeStr,
      paymentMethod: paymentMethod || 'UPI',
      asset: assetDisplay,
      assetType: assetNormalized,
      quantity: `${gramsNum.toFixed(4)} gm`,
      grams: gramsNum,
      rate: ratePerGram || (isGold ? goldRate : silverRate),
      amount: amountNum.toFixed(2),
      status: 'Success',
      createdAt: now.toISOString(),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    setHoldings((prev) => {
      const currentGold = parseFloat(prev?.goldGrams || 0);
      const currentSilver = parseFloat(prev?.silverGrams || 0);
      const updatedGold = isGold ? parseFloat((currentGold + gramsNum).toFixed(4)) : currentGold;
      const updatedSilver = !isGold ? parseFloat((currentSilver + gramsNum).toFixed(4)) : currentSilver;
      const gInv = updatedGold * (isGold ? (ratePerGram || goldRate) : (prev?.goldInvested / currentGold || goldRate));
      const sInv = updatedSilver * (!isGold ? (ratePerGram || silverRate) : (prev?.silverInvested / currentSilver || silverRate));

      return {
        ...prev,
        goldGrams: updatedGold,
        silverGrams: updatedSilver,
        goldInvested: gInv,
        silverInvested: sInv,
        goldCurrentValue: updatedGold * goldRate,
        silverCurrentValue: updatedSilver * silverRate,
        totalInvested: gInv + sInv,
        totalCurrentValue: updatedGold * goldRate + updatedSilver * silverRate,
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
    setStoredUser(updatedUser);

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
      customer: currentUser.name || 'Dhivakar M',
      mobile: currentUser.mobile || '+919840123456',
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
        ...prev,
        goldGrams: isGold ? Math.max(0, parseFloat((currentGold - gramsNum).toFixed(4))) : currentGold,
        silverGrams: !isGold ? Math.max(0, parseFloat((currentSilver - gramsNum).toFixed(4))) : currentSilver
      };
    });

    // Add to transactions record
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: currentUser.name || 'Customer',
      userId: currentUser.id || '1',
      mobile: currentUser.mobile || '+919840123456',
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: timeStr,
      paymentMethod: 'Bank Transfer',
      asset: isGold ? 'Gold' : 'Silver',
      assetType: isGold ? 'gold' : 'silver',
      quantity: `${gramsNum.toFixed(4)} gm`,
      grams: gramsNum,
      rate: isGold ? goldRate : silverRate,
      amount: amountNum.toFixed(2),
      status: 'Pending',
      createdAt: now.toISOString(),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return newWithdrawal;
  };

  // Withdrawal Actions (Admin)
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

  // User Verification Actions (Admin)
  const verifyCustomer = (verificationId, memberName) => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== verificationId && v.name !== memberName));
    if (memberName) {
      setMembers((prev) => prev.map((m) => {
        if (m.username === memberName || m.name === memberName) {
          return { ...m, verified: 'Yes' };
        }
        return m;
      }));
    }
  };

  // Rate Management Actions (Admin)
  const saveRates = ({ newGoldRate, newSilverRate, goldCustom, silverCustom, goldInputVal, silverInputVal }) => {
    if (goldCustom !== undefined) {
      setIsGoldCustom(goldCustom);
      if (goldCustom) {
        setGoldRate(parseFloat(goldInputVal || newGoldRate) || API_GOLD_RATE);
      } else {
        setGoldRate(API_GOLD_RATE);
      }
    } else if (newGoldRate) {
      setGoldRate(parseFloat(newGoldRate));
    }

    if (silverCustom !== undefined) {
      setIsSilverCustom(silverCustom);
      if (silverCustom) {
        setSilverRate(parseFloat(silverInputVal || newSilverRate) || API_SILVER_RATE);
      } else {
        setSilverRate(API_SILVER_RATE);
      }
    } else if (newSilverRate) {
      setSilverRate(parseFloat(newSilverRate));
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
        refreshRates: () => {},
        holdings,
        setHoldings,
        holdingsLoading,
        holdingsError,
        fetchHoldings: () => {},
        transactions,
        setTransactions,
        transactionsLoading,
        transactionsError,
        fetchTransactions: () => {},
        notifications,
        setNotifications,
        unreadNotificationsCount,
        notificationsLoading,
        fetchNotifications: () => {},
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
        fetchAdminData: () => {},
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

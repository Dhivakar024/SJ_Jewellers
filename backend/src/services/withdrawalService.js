import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import config from '../config/env.js';
import { cleanRate, cleanGrams, generateTransactionId } from '../utils/formatters.js';
import { getRatesPublic } from './metalRatesService.js';
import { getOrCreateHoldings } from './holdingsService.js';
import {
  notifyWithdrawalSubmitted,
  notifyWithdrawalApproved,
  notifyWithdrawalRejected,
  notifyWithdrawalCancelled,
} from './notificationService.js';

export function formatWithdrawalResponse(doc) {
  return {
    withdrawal_id: doc.id,
    transaction_id: doc.transaction_id,
    metal: doc.metal,
    quantity_grams: cleanGrams(doc.quantity_grams),
    rate_per_gram: cleanRate(doc.rate_per_gram),
    metal_value: cleanRate(doc.metal_value),
    withdrawal_mode: doc.withdrawal_mode || 'physical',
    status: doc.status || 'pending',
    rejection_reason: doc.rejection_reason || null,
    admin_note: doc.admin_note || null,
    created_at: doc.created_at,
    approved_at: doc.approved_at || null,
    rejected_at: doc.rejected_at || null,
  };
}

export async function createWithdrawalRequest(user, data) {
  // 1. Verify KYC
  if (user.kyc_status !== 'verified') {
    const error = new Error('KYC verification is required before withdrawal');
    error.status = 403;
    throw error;
  }

  if (user.account_status !== 'active') {
    const error = new Error(`Account is ${user.account_status}. Please contact support.`);
    error.status = 403;
    throw error;
  }

  const metal = (data.metal || '').toLowerCase().trim();
  if (!['gold', 'silver'].includes(metal)) {
    const error = new Error("Metal must be either 'gold' or 'silver'");
    error.status = 400;
    throw error;
  }

  const quantityGrams = cleanGrams(data.quantity_grams);

  if (metal === 'gold' && quantityGrams < config.minGoldWithdrawalGrams) {
    const error = new Error(`Minimum gold withdrawal quantity is ${config.minGoldWithdrawalGrams} grams`);
    error.status = 400;
    throw error;
  }
  if (metal === 'silver' && quantityGrams < config.minSilverWithdrawalGrams) {
    const error = new Error(`Minimum silver withdrawal quantity is ${config.minSilverWithdrawalGrams} grams`);
    error.status = 400;
    throw error;
  }

  // 2. Check holding balance
  const holding = await getOrCreateHoldings(user.id);
  const totalQty = cleanGrams(holding[`${metal}_quantity`]);
  const reservedQty = cleanGrams(holding[`${metal}_reserved`]);
  const availableQty = cleanGrams(totalQty - reservedQty);

  if (quantityGrams > availableQty) {
    const error = new Error(`Insufficient ${metal} balance`);
    error.status = 400;
    throw error;
  }

  // 3. Rate snapshot
  const rates = await getRatesPublic();
  const activeRate = cleanRate(rates[metal]?.active_rate || (metal === 'gold' ? config.defaultGoldRate : config.defaultSilverRate));
  const metalValue = cleanRate(quantityGrams * activeRate);
  const transactionId = generateTransactionId('WD');
  const withdrawalId = uuidv4();

  // 4. Reserve quantity in holdings
  const newReserved = cleanGrams(reservedQty + quantityGrams);
  await query(
    `UPDATE holdings SET ${metal}_reserved = ?, updated_at = NOW() WHERE user_id = ?`,
    [newReserved, user.id]
  );

  // 5. Insert withdrawal record
  await query(
    `INSERT INTO withdrawals 
      (id, transaction_id, user_id, metal, quantity_grams, rate_per_gram, metal_value, withdrawal_mode, status, rejection_reason, admin_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, NOW(), NOW())`,
    [
      withdrawalId,
      transactionId,
      user.id,
      metal,
      quantityGrams,
      activeRate,
      metalValue,
      data.withdrawal_mode || 'physical',
    ]
  );

  const withdrawalDoc = {
    id: withdrawalId,
    transaction_id: transactionId,
    user_id: user.id,
    metal,
    quantity_grams: quantityGrams,
    rate_per_gram: activeRate,
    metal_value: metalValue,
    withdrawal_mode: data.withdrawal_mode || 'physical',
    status: 'pending',
    rejection_reason: null,
    admin_note: null,
    created_at: new Date().toISOString(),
    approved_at: null,
    rejected_at: null,
  };

  try {
    await notifyWithdrawalSubmitted(withdrawalDoc);
  } catch (err) {
    console.error('Error sending withdrawal submission notification:', err);
  }

  return formatWithdrawalResponse(withdrawalDoc);
}

export async function approveWithdrawal(withdrawalId, adminUser) {
  const rows = await query('SELECT * FROM withdrawals WHERE id = ? OR transaction_id = ? LIMIT 1', [
    withdrawalId,
    withdrawalId,
  ]);
  if (rows.length === 0) {
    const error = new Error('Withdrawal request not found');
    error.status = 404;
    throw error;
  }

  const w = rows[0];
  if (w.status !== 'pending') {
    const error = new Error(`Cannot approve withdrawal with status '${w.status}'`);
    error.status = 400;
    throw error;
  }

  const userRows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [w.user_id]);
  if (userRows.length === 0 || userRows[0].kyc_status !== 'verified') {
    const error = new Error('Customer KYC must be verified before approval');
    error.status = 400;
    throw error;
  }

  const metal = w.metal;
  const wQty = cleanGrams(w.quantity_grams);
  const holding = await getOrCreateHoldings(w.user_id);

  const curQty = cleanGrams(holding[`${metal}_quantity`]);
  const curRes = cleanGrams(holding[`${metal}_reserved`]);
  const curAvg = cleanRate(holding[`${metal}_average_rate`]);

  if (wQty > curQty || wQty > curRes) {
    const error = new Error('Holding balance inconsistency detected');
    error.status = 400;
    throw error;
  }

  const newQty = Math.max(0, cleanGrams(curQty - wQty));
  const newRes = Math.max(0, cleanGrams(curRes - wQty));

  const newAvg = newQty > 0 ? curAvg : 0;
  const newInv = newQty > 0 ? cleanRate(newQty * newAvg) : 0;
  // Deduct from holdings
  await query(
    `UPDATE holdings 
     SET ${metal}_quantity = ?, ${metal}_reserved = ?, ${metal}_invested = ?, ${metal}_average_rate = ?, updated_at = NOW() 
     WHERE user_id = ?`,
    [newQty, newRes, newInv, newAvg,w.user_id]
  );

  // Update withdrawal status
  await query(
    `UPDATE withdrawals 
     SET status = 'approved', approved_at = NOW(), updated_at = NOW() 
     WHERE id = ?`,
    [w.id]
  );

  try {
    w.status = 'approved';
    await notifyWithdrawalApproved(w);
  } catch (err) {
    console.error('Error sending withdrawal approved notification:', err);
  }

  return {
    message: 'Withdrawal request approved successfully',
    withdrawal_id: w.id,
    status: 'approved',
  };
}

export async function rejectWithdrawal(withdrawalId, adminUser, reason) {
  const rows = await query('SELECT * FROM withdrawals WHERE id = ? OR transaction_id = ? LIMIT 1', [
    withdrawalId,
    withdrawalId,
  ]);
  if (rows.length === 0) {
    const error = new Error('Withdrawal request not found');
    error.status = 404;
    throw error;
  }

  const w = rows[0];
  if (w.status !== 'pending') {
    const error = new Error(`Cannot reject withdrawal with status '${w.status}'`);
    error.status = 400;
    throw error;
  }

  const metal = w.metal;
  const wQty = cleanGrams(w.quantity_grams);
  const holding = await getOrCreateHoldings(w.user_id);
  const curRes = cleanGrams(holding[`${metal}_reserved`]);
  const newRes = Math.max(0, cleanGrams(curRes - wQty));

  // Release reserved quantity
  await query(
    `UPDATE holdings SET ${metal}_reserved = ?, updated_at = NOW() WHERE user_id = ?`,
    [newRes, w.user_id]
  );

  // Update withdrawal status
  await query(
    `UPDATE withdrawals 
     SET status = 'rejected', rejection_reason = ?, rejected_at = NOW(), updated_at = NOW() 
     WHERE id = ?`,
    [reason, w.id]
  );

  try {
    w.status = 'rejected';
    await notifyWithdrawalRejected(w, reason);
  } catch (err) {
    console.error('Error sending withdrawal rejected notification:', err);
  }

  return {
    message: 'Withdrawal request rejected',
    withdrawal_id: w.id,
    status: 'rejected',
  };
}

export async function cancelCustomerWithdrawal(user, withdrawalId) {
  const rows = await query(
    'SELECT * FROM withdrawals WHERE (id = ? OR transaction_id = ?) AND user_id = ? LIMIT 1',
    [withdrawalId, withdrawalId, user.id]
  );
  if (rows.length === 0) {
    const error = new Error('Withdrawal request not found');
    error.status = 404;
    throw error;
  }

  const w = rows[0];
  if (w.status !== 'pending') {
    const error = new Error('Only pending withdrawal requests can be cancelled');
    error.status = 400;
    throw error;
  }

  const metal = w.metal;
  const wQty = cleanGrams(w.quantity_grams);
  const holding = await getOrCreateHoldings(w.user_id);
  const curRes = cleanGrams(holding[`${metal}_reserved`]);
  const newRes = Math.max(0, cleanGrams(curRes - wQty));

  // Release reserved balance
  await query(
    `UPDATE holdings SET ${metal}_reserved = ?, updated_at = NOW() WHERE user_id = ?`,
    [newRes, w.user_id]
  );

  await query('UPDATE withdrawals SET status = \'cancelled\', updated_at = NOW() WHERE id = ?', [w.id]);

  try {
    w.status = 'cancelled';
    await notifyWithdrawalCancelled(w);
  } catch (err) {
    console.error('Error sending withdrawal cancelled notification:', err);
  }

  return {
    message: 'Withdrawal request cancelled successfully',
    withdrawal_id: w.id,
    status: 'cancelled',
  };
}

export async function getCustomerWithdrawals(user, { metal, status_filter, page = 1, limit = 20 }) {
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const whereClauses = ['user_id = ?'];
  const params = [user.id];

  if (metal && ['gold', 'silver'].includes(metal.toLowerCase().trim())) {
    whereClauses.push('metal = ?');
    params.push(metal.toLowerCase().trim());
  }

  if (status_filter) {
    whereClauses.push('status = ?');
    params.push(status_filter.toLowerCase().trim());
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
  const countRows = await query(`SELECT COUNT(*) as total FROM withdrawals ${whereSql}`, params);
  const total = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const rows = await query(
    `SELECT * FROM withdrawals 
     ${whereSql} 
     ORDER BY created_at DESC 
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  const items = rows.map(formatWithdrawalResponse);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    total_pages: totalPages,
  };
}

export async function getCustomerWithdrawalById(user, withdrawalId) {
  const rows = await query(
    'SELECT * FROM withdrawals WHERE (id = ? OR transaction_id = ?) AND user_id = ? LIMIT 1',
    [withdrawalId, withdrawalId, user.id]
  );
  if (rows.length === 0) {
    const error = new Error('Withdrawal request not found');
    error.status = 404;
    throw error;
  }
  return formatWithdrawalResponse(rows[0]);
}

export async function getAdminWithdrawals({ page = 1, limit = 20, search, metal, status_filter, withdrawal_mode }) {
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const whereClauses = [];
  const params = [];

  if (metal && ['gold', 'silver'].includes(metal.toLowerCase().trim())) {
    whereClauses.push('w.metal = ?');
    params.push(metal.toLowerCase().trim());
  }

  if (status_filter) {
    whereClauses.push('w.status = ?');
    params.push(status_filter.toLowerCase().trim());
  }

  if (withdrawal_mode) {
    whereClauses.push('w.withdrawal_mode = ?');
    params.push(withdrawal_mode.toLowerCase().trim());
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClauses.push('(w.transaction_id LIKE ? OR u.name LIKE ? OR u.mobile LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await query(
    `SELECT COUNT(*) as total 
     FROM withdrawals w 
     JOIN users u ON w.user_id = u.id 
     ${whereSql}`,
    params
  );
  const total = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const rows = await query(
    `SELECT w.*, u.name as customer_name, u.mobile as customer_mobile, u.email as customer_email, u.kyc_status as customer_kyc
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     ${whereSql}
     ORDER BY w.created_at DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  const items = rows.map((r) => ({
    withdrawal_id: r.id,
    transaction_id: r.transaction_id,
    customer: {
      user_id: r.user_id,
      name: r.customer_name || 'Unknown',
      mobile: r.customer_mobile || '',
      email: r.customer_email || null,
      kyc_status: r.customer_kyc || 'pending',
    },
    metal: r.metal,
    quantity_grams: cleanGrams(r.quantity_grams),
    rate_per_gram: cleanRate(r.rate_per_gram),
    metal_value: cleanRate(r.metal_value),
    withdrawal_mode: r.withdrawal_mode,
    status: r.status,
    created_at: r.created_at,
  }));

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    total_pages: totalPages,
  };
}

export async function getAdminWithdrawalById(withdrawalId) {
  const rows = await query(
    `SELECT w.*, u.name as customer_name, u.mobile as customer_mobile, u.email as customer_email, u.kyc_status as customer_kyc
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     WHERE w.id = ? OR w.transaction_id = ?
     LIMIT 1`,
    [withdrawalId, withdrawalId]
  );

  if (rows.length === 0) {
    const error = new Error('Withdrawal request not found');
    error.status = 404;
    throw error;
  }

  const r = rows[0];
  return {
    withdrawal_id: r.id,
    transaction_id: r.transaction_id,
    customer: {
      user_id: r.user_id,
      name: r.customer_name || 'Unknown',
      mobile: r.customer_mobile || '',
      email: r.customer_email || null,
      kyc_status: r.customer_kyc || 'pending',
    },
    metal: r.metal,
    quantity_grams: cleanGrams(r.quantity_grams),
    rate_per_gram: cleanRate(r.rate_per_gram),
    metal_value: cleanRate(r.metal_value),
    withdrawal_mode: r.withdrawal_mode,
    status: r.status,
    rejection_reason: r.rejection_reason || null,
    admin_note: r.admin_note || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    approved_at: r.approved_at || null,
    rejected_at: r.rejected_at || null,
  };
}

export default {
  createWithdrawalRequest,
  approveWithdrawal,
  rejectWithdrawal,
  cancelCustomerWithdrawal,
  getCustomerWithdrawals,
  getCustomerWithdrawalById,
  getAdminWithdrawals,
  getAdminWithdrawalById,
};

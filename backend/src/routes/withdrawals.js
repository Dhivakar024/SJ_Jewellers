import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createWithdrawalRequest,
  getCustomerWithdrawals,
  getCustomerWithdrawalById,
  cancelCustomerWithdrawal,
} from '../services/withdrawalService.js';

const router = express.Router();

// POST /api/withdrawals
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const withdrawal = await createWithdrawalRequest(req.user, req.body);
    res.status(201).json(withdrawal);
  } catch (err) {
    next(err);
  }
});

// GET /api/withdrawals
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { metal, status: status_filter, page, limit } = req.query;
    const withdrawals = await getCustomerWithdrawals(req.user, {
      metal,
      status_filter,
      page,
      limit,
    });
    res.json(withdrawals);
  } catch (err) {
    next(err);
  }
});

// GET /api/withdrawals/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const withdrawal = await getCustomerWithdrawalById(req.user, req.params.id);
    res.json(withdrawal);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/withdrawals/:id/cancel
router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const result = await cancelCustomerWithdrawal(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import { getRatesPublic } from '../services/metalRatesService.js';

const router = express.Router();

// GET /api/rates
router.get('/', async (req, res, next) => {
  try {
    const rates = await getRatesPublic();
    res.json(rates);
  } catch (err) {
    next(err);
  }
});

export default router;

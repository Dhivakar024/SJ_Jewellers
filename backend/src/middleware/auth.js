import { verifyAccessToken } from '../utils/security.js';
import { query } from '../config/db.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      detail: 'Not authenticated',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      detail: 'Not authenticated',
    });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.sub) {
    return res.status(401).json({
      detail: 'Invalid or expired access token',
    });
  }

  try {
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.sub]);
    if (users.length === 0) {
      return res.status(401).json({
        detail: 'User not found',
      });
    }

    const user = users[0];
    if (user.account_status === 'banned') {
      return res.status(403).json({
        detail: 'Your account has been banned',
      });
    }
    if (user.account_status === 'suspended') {
      return res.status(403).json({
        detail: 'Your account is currently suspended',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      detail: 'Internal authentication error',
    });
  }
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        detail: 'Administrator access required',
      });
    }
    next();
  });
}

export default {
  requireAuth,
  requireAdmin,
};

import crypto from 'crypto';

export function normalizeMobile(rawMobile) {
  const clean = (rawMobile || '').toString().trim();
  let digits = clean.replace(/\D/g, '');

  while (digits.length > 10) {
    if (digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
      digits = digits.slice(1);
    } else {
      break;
    }
  }

  const normalized = digits.length === 10 ? digits : clean;
  const variants = Array.from(
    new Set([normalized, `+91${normalized}`, `91${normalized}`, clean].filter(Boolean))
  );

  return {
    mobile: normalized,
    variants,
  };
}

export function cleanRate(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : Math.round(num * 100) / 100;
}

export function cleanGrams(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : Math.round(num * 10000) / 10000;
}

export function generateTransactionId(prefix = 'TXN') {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix.toUpperCase()}-${dateStr}-${randomHex}`;
}

export function getEndOfDayExpiryUTC() {
  // 23:59:59 in Asia/Kolkata (UTC+5:30)
  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utcNow + istOffset);

  istDate.setHours(23, 59, 59, 0);
  const expiryUtc = new Date(istDate.getTime() - istOffset);
  return expiryUtc;
}

export default {
  normalizeMobile,
  cleanRate,
  cleanGrams,
  generateTransactionId,
  getEndOfDayExpiryUTC,
};

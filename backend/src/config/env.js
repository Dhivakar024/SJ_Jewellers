import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Gold & Silver API',
  appVersion: process.env.APP_VERSION || '1.0.0',
  appTimezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',

  // MySQL Settings
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : 'root',
    database: process.env.MYSQL_DATABASE || 'gold_silver',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    timezone: '+05:30',
  },

  // Security Settings
  jwtSecret: process.env.JWT_SECRET || '1cc918a36c68d479e94635f8f4628af44eef55fe1a267b4fd0cbf013c141e5b7',
  jwtExpiresInMinutes: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || '60', 10),
  devOtp: process.env.DEV_OTP || '123456',

  // External Rates API
  metalRatesApiUrl: process.env.METAL_RATES_API_URL || null,
  metalRatesApiKey: process.env.METAL_RATES_API_KEY || null,

  // Financial Rules
  minGoldPurchaseGrams: 0.001,
  minSilverPurchaseGrams: 0.001,
  minGoldWithdrawalGrams: 0.001,
  minSilverWithdrawalGrams: 0.001,
  gstRatePercent: 3.0,

  // Default Baseline Rates
  defaultGoldRate: 16263.65,
  defaultSilverRate: 267.00,
};

export default config;

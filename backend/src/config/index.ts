import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'path';

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../backend/.env'),
];
const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
if (envPath) dotenv.config({ path: envPath });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'ebookhub_jwt_super_secret_dev_key_2026';

if (nodeEnv === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Production requires a JWT_SECRET of at least 32 characters.');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: '7d',
  sessionSecret: process.env.SESSION_SECRET || 'ebookhub_session_secret_dev_2026',
  storageProvider: process.env.STORAGE_PROVIDER || 'LOCAL',
  storageLocalDir: path.resolve(__dirname, '../../../uploads'),
  paymentProvider: process.env.PAYMENT_PROVIDER || 'DEMO',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_placeholder',
  platformCommissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '15'),
  minimumPayoutAmount: parseInt(process.env.MINIMUM_PAYOUT_AMOUNT || '1000', 10),
};

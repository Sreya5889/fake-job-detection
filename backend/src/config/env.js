import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fakejobdetect_dev_jwt_secret_key_9941_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)
};

// Log warning if Supabase keys are default/missing
export function validateEnv() {
  const missing = [];
  if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) {
    missing.push('SUPABASE_URL');
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0 && env.NODE_ENV !== 'test') {
    console.warn(`[CONFIG WARNING] Missing or placeholder Supabase credentials: ${missing.join(', ')}.`);
    console.warn('[CONFIG WARNING] The backend will operate with local fallback data until valid Supabase credentials are configured in .env.');
  }
}

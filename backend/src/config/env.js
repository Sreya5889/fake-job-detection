import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Robustly normalize the Supabase Project URL.
 * Strips wrapping quotes, whitespace, trailing slashes, and any appended subpaths (like /rest/v1 or /auth/v1)
 * to ensure @supabase/supabase-js createClient() receives strictly the project origin (e.g., https://xyz.supabase.co).
 */
export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch {
    return cleaned.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/auth\/v1\/?.*$/i, '').replace(/\/+$/, '');
  }
}

export function sanitizeEnvValue(val, fallback = '') {
  if (!val || typeof val !== 'string') return fallback;
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

const rawSupabaseUrl = process.env.SUPABASE_URL || '';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SUPABASE_URL: normalizeSupabaseUrl(rawSupabaseUrl),
  RAW_SUPABASE_URL: rawSupabaseUrl,
  SUPABASE_ANON_KEY: sanitizeEnvValue(process.env.SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  JWT_SECRET: sanitizeEnvValue(process.env.JWT_SECRET, 'fakejobdetect_dev_jwt_secret_key_9941_secure'),
  JWT_EXPIRES_IN: sanitizeEnvValue(process.env.JWT_EXPIRES_IN, '7d'),
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

import { createClient } from '@supabase/supabase-js';
import { env, normalizeSupabaseUrl } from './env.js';
import { logger } from '../utils/logger.js';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Normalize URL to project origin (e.g. https://xyz.supabase.co) to avoid PGRST125 path duplication
  const targetUrl = normalizeSupabaseUrl(env.SUPABASE_URL || process.env.SUPABASE_URL);
  const apiKey = (env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

  const hasUrl = Boolean(targetUrl);
  const hasServiceRoleKey = Boolean(env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

  let hostname = 'none';
  try {
    if (targetUrl) {
      hostname = new URL(targetUrl).hostname;
    }
  } catch {
    hostname = 'invalid-url';
  }

  const isConfigured = Boolean(
    targetUrl &&
    !targetUrl.includes('placeholder') &&
    apiKey &&
    !apiKey.includes('placeholder')
  );

  // Safe diagnostic log without exposing secret keys
  logger.info(
    `[SUPABASE] URL exists: ${hasUrl}, host: ${hostname}, service_role_key exists: ${hasServiceRoleKey}, anon_key exists: ${hasAnonKey}, configured: ${isConfigured}`
  );

  if (!isConfigured) {
    logger.warn('[SUPABASE] Credentials not configured or using placeholders. Client not created.');
    return null;
  }

  supabaseClient = createClient(targetUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  logger.info(`[SUPABASE] Client created successfully for host: ${hostname}`);
  return supabaseClient;
}

export function isSupabaseConnected() {
  return Boolean(getSupabaseClient());
}

export const supabase = getSupabaseClient();

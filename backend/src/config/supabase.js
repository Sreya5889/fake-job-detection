import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const isConfigured = Boolean(
    env.SUPABASE_URL &&
    !env.SUPABASE_URL.includes('placeholder') &&
    (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY) &&
    !env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  );

  if (!isConfigured) {
    // Return dummy or null client when unconfigured
    return null;
  }

  // Use the service-role key on the backend to allow administrative queries
  const apiKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  supabaseClient = createClient(env.SUPABASE_URL, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
}

export function isSupabaseConnected() {
  return Boolean(getSupabaseClient());
}

export const supabase = getSupabaseClient();

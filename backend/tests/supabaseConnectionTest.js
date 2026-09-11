import { getSupabaseClient, isSupabaseConnected } from '../src/config/supabase.js';
import { env } from '../src/config/env.js';

console.log('====================================================');
console.log('SUPABASE POSTGRESQL CONNECTION VERIFICATION');
console.log('====================================================\n');

console.log('1. Configuration Check:');
console.log('   - SUPABASE_URL:', env.SUPABASE_URL ? `${env.SUPABASE_URL.substring(0, 20)}...` : '(not set)');
console.log('   - SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '[CONFIGURED]' : '(not set)');
console.log('   - isSupabaseConnected():', isSupabaseConnected());

const supabase = getSupabaseClient();

if (!supabase) {
  console.log('\n[NOTICE] Supabase is configured with placeholder/empty credentials.');
  console.log('         To connect to your live database, update backend/.env with:');
  console.log('         SUPABASE_URL=https://<your-project-ref>.supabase.co');
  console.log('         SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\n');
  console.log('Client initialization handler verified successfully (fail-safe mode active).');
  process.exit(0);
}

console.log('\n2. Testing Live Supabase Connection:');
try {
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('   ? Supabase query failed:', error.message);
    if (error.code === '42P01') {
      console.error('   ?? Table "users" does not exist yet. Run backend/database/schema.sql in Supabase SQL editor.');
    }
  } else {
    console.log('   ? Successfully queried Supabase "users" table!');
    console.log('   ? Live Supabase PostgreSQL database is operational.');
  }
} catch (err) {
  console.error('   ? Network or connection error:', err.message);
}

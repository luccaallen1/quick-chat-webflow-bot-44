import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bihobuvkshnzwkwbezrf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaG9idXZrc2huentrvndvrXpyZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MjA3MjIyMDUsImV4cCI6MjAzNjI5ODIwNX0.vZ4HdOlVh9WMiYyU3lKqrBV6W-KIkKWPYpRO1sUoGXQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function debugAccounts() {
  console.log('=== Debug Account Mappings ===');
  
  // Check mapping table
  const { data: mappings, error: mappingError } = await supabase
    .from('unipile_account_mappings')
    .select('*');
  
  console.log('Account Mappings:', mappings);
  if (mappingError) console.log('Mapping Error:', mappingError);
  
  // Check main accounts table
  const { data: accounts, error: accountError } = await supabase
    .from('unipile_accounts')
    .select('*');
  
  console.log('Main Accounts:', accounts);
  if (accountError) console.log('Account Error:', accountError);
  
  // Check users table to see what user IDs exist
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email');
  
  console.log('Users:', users);
  if (userError) console.log('User Error:', userError);
}

debugAccounts().catch(console.error);
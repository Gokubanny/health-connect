// integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the correct environment variable names that match your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Add validation to check if environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  throw new Error('Missing Supabase environment variables. Please check your .env file');
}

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Supabase Key present:', SUPABASE_PUBLISHABLE_KEY ? 'Yes' : 'No');

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivopmtabogvgrptipiwo.supabase.co';
const supabaseKey = 'sb_publishable_NRjWLUw9w1iG5au5xMT_7A_BJe5X3pZ';
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: window.sessionStorage,
    storageKey: 'mp-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});
export const supabaseAdmin = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BtdGFib2d2Z3JwdGlwaXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3NzUwOCwiZXhwIjoyMDg3MTUzNTA4fQ.1L2LwZLuDTeBia9W1FO9JeXWo8zh-rIUxXu0hUXLKYg');
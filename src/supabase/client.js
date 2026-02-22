// src/supabase/client.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivopmtabogvgrptipiwo.supabase.co';
const supabaseKey = 'sb_publishable_NRjWLUw9w1iG5au5xMT_7A_BJe5X3pZ';

export const supabase = createClient(supabaseUrl, supabaseKey);

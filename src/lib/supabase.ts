import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key-here') {
  // Demo mode - use localStorage for data persistence
  supabase = null;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
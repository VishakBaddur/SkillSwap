import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Fallback to hardcoded values for backward compatibility (should be removed in production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zeysyrbxiifrxgwxxdgi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpleXN5cmJ4aWlmcnhnd3h4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTY1NDcsImV4cCI6MjA2NzAzMjU0N30.D1iZ_q5CWob8Ne3m9Gx8Ktc3KfdwV06xoUTd7jBg5wQ';

// Validate that we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
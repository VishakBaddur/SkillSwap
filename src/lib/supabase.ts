import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Fallback values for development (should be set via environment variables in production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zeysyrbxiifrxgwxxdgi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpleXN5cmJ4aWlmcnhnd3h4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTY1NDcsImV4cCI6MjA2NzAzMjU0N30.D1iZ_q5CWob8Ne3m9Gx8Ktc3KfdwV06xoUTd7jBg5wQ';

// Validate that we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing',
  });
  throw new Error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. URL must start with http:// or https://');
}

// Log initialization (without exposing sensitive data)
if (import.meta.env.DEV) {
  console.log('Supabase client initialized:', {
    url: supabaseUrl.replace(/\/$/, ''),
    hasKey: !!supabaseAnonKey,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}); 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zeysyrbxiifrxgwxxdgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpleXN5cmJ4aWlmcnhnd3h4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTY1NDcsImV4cCI6MjA2NzAzMjU0N30.D1iZ_q5CWob8Ne3m9Gx8Ktc3KfdwV06xoUTd7jBg5wQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
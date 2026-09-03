import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlalyoyazlgsimzudtxw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWx5b3lhemxnc2ltenVkdHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjI3MTEsImV4cCI6MjEwMzg5ODcxMX0.u1XILt3xFd3FM9ZZhRRz6b2G0ckGOYabwumjDEC9F08';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
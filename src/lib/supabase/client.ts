import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://nlalyoyazlgsimzudtxw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWx5b3lhemxnc2ltenVkdHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjI3MTEsImV4cCI6MjEwMzg5ODcxMX0.u1XILt3xFd3FM9ZZhRRz6b2G0ckGOYabwumjDEC9F08';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  );
}

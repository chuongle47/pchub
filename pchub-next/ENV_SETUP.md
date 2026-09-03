# Environment Variables for Vercel Deployment

Add these environment variables to your Vercel project settings:

## Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://nlalyoyazlgsimzudtxw.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWx5b3lhemxnc2ltenVkdHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjI3MTEsImV4cCI6MjEwMzg5ODcxMX0.u1XILt3xFd3FM9ZZhRRz6b2G0ckGOYabwumjDEC9F08
   ```

3. **DATABASE_URL**
   ```
   postgresql://postgres:LeChuong1810@db.nlalyoyazlgsimzudtxw.supabase.co:5432/postgres
   ```

## Setup Instructions

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each of the variables above with their corresponding values
4. Redeploy your project after adding the variables

## Alternative: Using Vercel CLI

You can also set these variables using the Vercel CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add DATABASE_URL
```

Then redeploy:
```bash
vercel --prod
```
# Supabase Setup Instructions

## 1. Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" or "Sign Up"
3. Create account with GitHub/Google/Email

## 2. Create New Project
1. Click "New Project"
2. Choose organization or create new one
3. Enter project details:
   - **Name**: islomiy-kundalik
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## 3. Get API Credentials
1. Go to Project Settings (gear icon) -> API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## 4. Setup Local Environment
1. Open `/vercel-app/.env` file
2. Replace values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 5. Setup Database Schema
1. Go to Supabase Dashboard -> SQL Editor
2. Click "New Query"
3. Copy all content from `supabase-schema.sql` file
4. Paste into query editor
5. Click "Run" button
6. Verify tables created in Table Editor

## 6. Enable Email Authentication
1. Go to Authentication -> Providers
2. Enable "Email" provider
3. Configure email templates (optional)

## 7. Create Admin User
1. Go to Authentication -> Users
2. Click "Add user" -> "Create new user"
3. Email: `admin@gmail.com`
4. Password: `admin123` (or your choice)
5. After creating, go to SQL Editor and run:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
   ```

## 8. Setup Vercel Environment Variables
1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables
2. Add same variables from `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy project

## Done! 🎉
Your app now uses real database instead of localStorage.

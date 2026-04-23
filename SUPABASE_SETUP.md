# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for the NexaLearn LMS.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed

## Setup Steps

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `nexalearn-lms`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Project API Key (anon, public)

### 3. Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor and run it
4. This will create:
   - `profiles` table for user data
   - `courses` table for course information
   - `enrollments` table for user course enrollments
   - Row Level Security policies
   - Sample course data

### 5. Configure Authentication

1. In Supabase dashboard, go to Authentication → Settings
2. Configure the following:
   - Site URL: `http://localhost:8080` (for development)
   - Redirect URLs: `http://localhost:8080/**`
3. Enable email confirmation if desired (optional for development)

### 6. Install Dependencies and Run

```bash
npm install
npm run dev
```

## Features Included

- ✅ User registration and login
- ✅ Email/password authentication
- ✅ User profiles with roles (student, instructor, admin)
- ✅ Course enrollment system
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on signup
- ✅ Real-time authentication state management

## Database Schema

### Tables

1. **profiles**: User profile information
   - Links to Supabase auth.users
   - Stores role, full name, avatar URL

2. **courses**: Course information
   - Title, description, category, level
   - Instructor reference, pricing, duration

3. **enrollments**: User course enrollments
   - Links users to courses
   - Tracks progress and completion

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Instructors can manage their own courses
- Public read access to courses

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure `.env` file is in the root directory
   - Restart the development server after changing `.env`

2. **Database connection errors**
   - Verify your Supabase URL and API key
   - Check that your project is active in Supabase dashboard

3. **Authentication not working**
   - Ensure Site URL is configured correctly in Supabase
   - Check browser console for error messages

4. **RLS policy errors**
   - Make sure the SQL schema was executed completely
   - Check Supabase logs for policy violations

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Check the Supabase dashboard logs

## Production Deployment

When deploying to production:

1. Update environment variables with production Supabase credentials
2. Configure proper Site URL and Redirect URLs in Supabase
3. Enable email confirmation for security
4. Set up proper domain and SSL certificates
5. Review and adjust RLS policies as needed
# Supabase Setup Guide

This guide will help you set up Supabase for the AI Arcade to enable shared game storage across all users.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your Supabase project credentials

## Setup Steps

### 1. Create Supabase Project (if not already done)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project
4. Note your project URL and anon/public API key

### 2. Configure Environment Variables

The `.env.local` file should already be in the root directory with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** The `.env.local` file is already in `.gitignore` and will not be committed to version control.

### 3. Create the Games Table

#### Option A: Starting Fresh (Recommended if you have existing tables)

If you already have tables in Supabase that you want to remove:

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Run this cleanup script first:

```sql
-- Drop existing tables and functions
DROP FUNCTION IF EXISTS public.increment_play_count(UUID);
DROP TABLE IF EXISTS public.games CASCADE;
```

5. Click **Run** to execute
6. Now proceed to Option B below

#### Option B: Run the Full Setup Script

1. Go to your Supabase project dashboard (if not already there)
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase-setup.sql` from the root directory
5. If you want to start completely fresh, **uncomment** the DROP statements at the top of the file
6. Paste into the SQL Editor
7. Click **Run** to execute the script

This will:
- Create the `games` table with proper schema
- Add indexes for better performance
- Set up Row Level Security (RLS) policies for public access
- Create the `increment_play_count()` function
- Optionally add 3 sample games (Snake, Pong, Tetris)

### 4. Verify the Setup

After running the SQL script, verify in the Supabase dashboard:

1. Go to **Table Editor**
2. You should see the `games` table
3. If you included the sample data, you should see 3 games listed

### 5. Deploy to Vercel

Add the environment variables to your Vercel project:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Or add them in the Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add both variables for Production, Preview, and Development

### 6. Test the Integration

1. Build and run locally: `npm run dev`
2. Submit a test game
3. Open the gallery in a different browser or incognito window
4. You should see the game you just submitted!

## Database Schema

### games table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| title | TEXT | Game title (1-100 chars) |
| url | TEXT | Game URL |
| description | TEXT | Optional description (max 500 chars) |
| author | TEXT | Optional author name (max 50 chars) |
| tags | TEXT[] | Array of tags |
| submitted_at | TIMESTAMPTZ | Submission timestamp |
| featured | BOOLEAN | Featured status |
| play_count | INTEGER | Number of plays |
| status | TEXT | 'active' or 'hidden' |

## Row Level Security (RLS)

The setup script enables RLS with permissive policies:
- ✅ Anyone can view all games
- ✅ Anyone can submit games
- ✅ Anyone can update games (useful for play counts)
- ✅ Anyone can delete games

**Note:** For a production app, you may want to restrict update/delete operations to authenticated users or admins.

## Troubleshooting

### Need to start over?

If you want to completely reset your database:

```sql
-- Drop everything and start fresh
DROP FUNCTION IF EXISTS public.increment_play_count(UUID);
DROP TABLE IF EXISTS public.games CASCADE;
```

Then re-run the full `supabase-setup.sql` script.

### "Missing Supabase environment variables" error
- Ensure `.env.local` exists in the root directory
- Verify the variables start with `VITE_` prefix
- Restart your dev server after adding environment variables

### RPC function not found
- The `increment_play_count` function is optional
- The app will fall back to a manual update if the function doesn't exist

### CORS issues
- Supabase allows all origins by default for public APIs
- If you encounter CORS issues, check your Supabase project settings

### Games not appearing
- Check the browser console for errors
- Verify the SQL script ran successfully
- Check that RLS policies are enabled

## Migration from localStorage

If you have games in localStorage that you want to migrate:

1. Export games from the old system: Click "Export Data" in Admin panel
2. The games are now in Supabase and will be shared across all users
3. localStorage is no longer used for game storage

## Next Steps

- Consider adding user authentication to track who submitted each game
- Implement moderation features for admin users
- Add reporting functionality for inappropriate content
- Set up database backups in Supabase settings

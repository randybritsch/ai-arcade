-- ============================================
-- AI ARCADE - COMPLETE DATABASE RESET & SETUP
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- This will drop existing tables and create everything fresh

-- Step 1: Drop existing tables and functions (if any)
DROP FUNCTION IF EXISTS public.increment_play_count(UUID);
DROP TABLE IF EXISTS public.games CASCADE;

-- Step 2: Create the games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
    url TEXT NOT NULL,
    description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
    author TEXT CHECK (author IS NULL OR char_length(author) <= 50),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    play_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden'))
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_games_submitted_at ON public.games(submitted_at DESC);
CREATE INDEX idx_games_featured ON public.games(featured) WHERE featured = TRUE;
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_tags ON public.games USING GIN(tags);

-- Step 4: Create function to increment play count atomically
CREATE FUNCTION public.increment_play_count(game_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.games
    SET play_count = play_count + 1
    WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for public access
CREATE POLICY "Games are viewable by everyone"
    ON public.games FOR SELECT
    USING (true);

CREATE POLICY "Anyone can submit games"
    ON public.games FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update games"
    ON public.games FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete games"
    ON public.games FOR DELETE
    USING (true);

-- Step 7: Insert sample games
INSERT INTO public.games (title, url, description, author, tags, featured) VALUES
    ('Snake Game', 'https://codepen.io/jdsteinbach/pen/oByKgL', 'Classic snake game built with HTML5 Canvas', 'Demo User', ARRAY['classic', 'arcade', 'snake'], true),
    ('Pong', 'https://codepen.io/gdube/pen/JybxxZ', 'Two-player Pong game', 'Demo User', ARRAY['classic', 'multiplayer', 'pong'], true),
    ('Tetris', 'https://codepen.io/Lewitje/pen/KKVJJxP', 'Classic Tetris game', 'Demo User', ARRAY['classic', 'puzzle', 'tetris'], false);

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Your database is ready. You should see 3 sample games in the Table Editor.

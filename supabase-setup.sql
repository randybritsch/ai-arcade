-- AI Arcade Games Table
-- Run this SQL in your Supabase SQL Editor to create the games table

-- Create the games table
CREATE TABLE IF NOT EXISTS public.games (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_submitted_at ON public.games(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_tags ON public.games USING GIN(tags);

-- Create a function to increment play count atomically
CREATE OR REPLACE FUNCTION public.increment_play_count(game_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.games
    SET play_count = play_count + 1
    WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Allow anyone to read all games
CREATE POLICY "Games are viewable by everyone"
    ON public.games FOR SELECT
    USING (true);

-- Allow anyone to insert games (for submissions)
CREATE POLICY "Anyone can submit games"
    ON public.games FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update their own games or play counts
-- Note: For a public arcade, we allow all updates. Adjust as needed for admin-only features.
CREATE POLICY "Anyone can update games"
    ON public.games FOR UPDATE
    USING (true);

-- Allow deletions (adjust permissions as needed for your use case)
CREATE POLICY "Anyone can delete games"
    ON public.games FOR DELETE
    USING (true);

-- Add some sample games (optional - remove if not wanted)
INSERT INTO public.games (title, url, description, author, tags, featured) VALUES
    ('Snake Game', 'https://codepen.io/jdsteinbach/pen/oByKgL', 'Classic snake game built with HTML5 Canvas', 'Demo User', ARRAY['classic', 'arcade', 'snake'], true),
    ('Pong', 'https://codepen.io/gdube/pen/JybxxZ', 'Two-player Pong game', 'Demo User', ARRAY['classic', 'multiplayer', 'pong'], true),
    ('Tetris', 'https://codepen.io/Lewitje/pen/KKVJJxP', 'Classic Tetris game', 'Demo User', ARRAY['classic', 'puzzle', 'tetris'], false)
ON CONFLICT (id) DO NOTHING;

-- Done! Your games table is ready to use.

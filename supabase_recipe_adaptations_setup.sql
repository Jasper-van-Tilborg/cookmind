-- CookMind AI - User Recipe Adaptations Table Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create user_recipe_adaptations table
CREATE TABLE IF NOT EXISTS public.user_recipe_adaptations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL, -- array van stappen
  ingredients JSONB NOT NULL, -- array van {name, amount, unit, ingredient_tag}
  ai_prompt TEXT NOT NULL, -- De prompt die gebruikt werd voor de aanpassing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, original_recipe_id) -- Eén aangepaste versie per gebruiker per recept
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_recipe_adaptations ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_recipe_adaptations table
-- Users can view their own recipe adaptations
CREATE POLICY "Users can view own recipe adaptations"
  ON public.user_recipe_adaptations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recipe adaptations
CREATE POLICY "Users can insert own recipe adaptations"
  ON public.user_recipe_adaptations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipe adaptations
CREATE POLICY "Users can update own recipe adaptations"
  ON public.user_recipe_adaptations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipe adaptations
CREATE POLICY "Users can delete own recipe adaptations"
  ON public.user_recipe_adaptations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_recipe_adaptations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update updated_at on recipe adaptations updates
DROP TRIGGER IF EXISTS set_recipe_adaptations_updated_at ON public.user_recipe_adaptations;
CREATE TRIGGER set_recipe_adaptations_updated_at
  BEFORE UPDATE ON public.user_recipe_adaptations
  FOR EACH ROW EXECUTE FUNCTION public.handle_recipe_adaptations_updated_at();

-- 6. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_recipe_adaptations_user_id_idx ON public.user_recipe_adaptations(user_id);
CREATE INDEX IF NOT EXISTS user_recipe_adaptations_original_recipe_id_idx ON public.user_recipe_adaptations(original_recipe_id);
CREATE INDEX IF NOT EXISTS user_recipe_adaptations_created_at_idx ON public.user_recipe_adaptations(created_at DESC);

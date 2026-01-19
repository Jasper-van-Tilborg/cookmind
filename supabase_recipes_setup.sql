-- CookMind AI - Recipes Table Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER NOT NULL, -- in minuten
  servings INTEGER, -- aantal personen
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')), -- 'easy', 'medium', 'hard'
  instructions JSONB NOT NULL, -- array van stappen
  ingredients JSONB NOT NULL, -- array van {name, amount, unit, ingredient_tag}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for recipes table
-- Recipes are public (all authenticated users can view them)
CREATE POLICY "Anyone can view recipes"
  ON public.recipes
  FOR SELECT
  USING (true);

-- Only authenticated users can insert recipes (for future admin functionality)
CREATE POLICY "Authenticated users can insert recipes"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update recipes (for future admin functionality)
CREATE POLICY "Authenticated users can update recipes"
  ON public.recipes
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete recipes (for future admin functionality)
CREATE POLICY "Authenticated users can delete recipes"
  ON public.recipes
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update updated_at on recipes updates
DROP TRIGGER IF EXISTS set_recipes_updated_at ON public.recipes;
CREATE TRIGGER set_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_recipes_updated_at();

-- 6. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS recipes_title_idx ON public.recipes(title);
CREATE INDEX IF NOT EXISTS recipes_prep_time_idx ON public.recipes(prep_time);
CREATE INDEX IF NOT EXISTS recipes_difficulty_idx ON public.recipes(difficulty);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON public.recipes(created_at DESC);

-- 7. Create GIN index for JSONB ingredients (for ingredient_tag searches)
CREATE INDEX IF NOT EXISTS recipes_ingredients_gin_idx ON public.recipes USING GIN (ingredients);

-- CookMind AI - Inventory Tag Migration
-- Add ingredient_tag column to inventory table for recipe matching

-- 1. Add ingredient_tag column to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS ingredient_tag TEXT;

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS inventory_ingredient_tag_idx 
ON public.inventory(ingredient_tag);

-- 3. Update existing records (set to NULL, users can add tags later)
UPDATE public.inventory 
SET ingredient_tag = NULL 
WHERE ingredient_tag IS NULL;

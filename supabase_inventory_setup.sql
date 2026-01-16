-- CookMind AI - Inventory/Stock Table Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- kg, gram, stuks, etc.
  details TEXT, -- bijv. "1x Één pak (1 kg)"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for inventory table
-- Users can view their own inventory
CREATE POLICY "Users can view own inventory"
  ON public.inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own inventory items
CREATE POLICY "Users can insert own inventory"
  ON public.inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own inventory items
CREATE POLICY "Users can update own inventory"
  ON public.inventory
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own inventory items
CREATE POLICY "Users can delete own inventory"
  ON public.inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update updated_at on inventory updates
DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;
CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_inventory_updated_at();

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS inventory_created_at_idx ON public.inventory(created_at DESC);

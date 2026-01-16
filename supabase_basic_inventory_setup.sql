-- Create basic_inventory table for storing user's basic pantry items
-- These items are used for AI recipe matching but NOT displayed on the inventory page
-- They represent items that users "always have" like salt, pepper, butter, etc.

CREATE TABLE IF NOT EXISTS public.basic_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- ID of the basic inventory product (e.g., "zout", "peper")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.basic_inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own basic inventory" ON public.basic_inventory;
DROP POLICY IF EXISTS "Users can insert their own basic inventory" ON public.basic_inventory;
DROP POLICY IF EXISTS "Users can delete their own basic inventory" ON public.basic_inventory;

-- Create policies
-- Users can only see their own basic inventory items
CREATE POLICY "Users can view their own basic inventory"
  ON public.basic_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own basic inventory items
CREATE POLICY "Users can insert their own basic inventory"
  ON public.basic_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own basic inventory items
CREATE POLICY "Users can delete their own basic inventory"
  ON public.basic_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_basic_inventory_user_id ON public.basic_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_basic_inventory_product_id ON public.basic_inventory(product_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_basic_inventory_updated_at ON public.basic_inventory;
CREATE TRIGGER update_basic_inventory_updated_at
  BEFORE UPDATE ON public.basic_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

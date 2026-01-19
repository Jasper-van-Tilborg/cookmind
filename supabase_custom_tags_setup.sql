-- CookMind AI - Custom Tags Setup
-- Create user_custom_tags table for storing user-specific ingredient tags
-- These tags are only visible to the user who created them

-- 1. Create user_custom_tags table
CREATE TABLE IF NOT EXISTS public.user_custom_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, tag_name)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_custom_tags ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_custom_tags table
-- Users can view their own custom tags
CREATE POLICY "Users can view own custom tags"
  ON public.user_custom_tags
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own custom tags
CREATE POLICY "Users can insert own custom tags"
  ON public.user_custom_tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom tags
CREATE POLICY "Users can update own custom tags"
  ON public.user_custom_tags
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own custom tags
CREATE POLICY "Users can delete own custom tags"
  ON public.user_custom_tags
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_custom_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update updated_at on custom tags updates
DROP TRIGGER IF EXISTS set_custom_tags_updated_at ON public.user_custom_tags;
CREATE TRIGGER set_custom_tags_updated_at
  BEFORE UPDATE ON public.user_custom_tags
  FOR EACH ROW EXECUTE FUNCTION public.handle_custom_tags_updated_at();

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS user_custom_tags_user_id_idx ON public.user_custom_tags(user_id);
CREATE INDEX IF NOT EXISTS user_custom_tags_tag_name_idx ON public.user_custom_tags(tag_name);

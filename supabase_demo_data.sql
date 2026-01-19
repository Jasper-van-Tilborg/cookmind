-- CookMind AI - Demo Data Setup
-- Run this SQL in your Supabase SQL Editor
-- This script adds demo data for the demo account (demo@cookmind.ai)
-- 
-- IMPORTANT: Make sure the demo account exists and is verified before running this script
-- You can create the demo account via: Authentication → Users → Add user
--
-- NOTE: This script will automatically add the expiry_date column if it doesn't exist.
-- The ingredient_tag column should exist from supabase_inventory_tag_migration.sql

-- Step 0: Ensure expiry_date column exists (add if missing)
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Step 1: Get the demo user ID
-- Replace 'demo@cookmind.ai' with the actual demo email if different
DO $$
DECLARE
  demo_user_id UUID;
  first_recipe_id UUID;
BEGIN
  -- Get the user ID for demo@cookmind.ai
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'demo@cookmind.ai'
  LIMIT 1;

  -- Check if user exists
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user (demo@cookmind.ai) not found. Please create the demo account first in Authentication → Users.';
  END IF;

  -- Step 2: Clear existing demo data (if any)
  DELETE FROM public.inventory WHERE user_id = demo_user_id;
  DELETE FROM public.basic_inventory WHERE user_id = demo_user_id;
  DELETE FROM public.user_recipe_adaptations WHERE user_id = demo_user_id;
  DELETE FROM public.user_custom_tags WHERE user_id = demo_user_id;

  -- Step 3: Add demo inventory items
  INSERT INTO public.inventory (user_id, product_name, product_image, quantity, unit, details, ingredient_tag, expiry_date)
  VALUES
    -- Groenten
    (demo_user_id, 'Tomaat', 'https://images.openfoodfacts.org/images/products/20000000/20000000.jpg', 6, 'stuks', 'Roma tomaten', 'tomaat', (CURRENT_DATE + INTERVAL '5 days')::date),
    (demo_user_id, 'Ui', 'https://images.openfoodfacts.org/images/products/20000001/20000001.jpg', 3, 'stuks', 'Gele uien', 'ui', (CURRENT_DATE + INTERVAL '14 days')::date),
    (demo_user_id, 'Knoflook', 'https://images.openfoodfacts.org/images/products/20000002/20000002.jpg', 1, 'stuks', 'Verse knoflook', 'knoflook', (CURRENT_DATE + INTERVAL '30 days')::date),
    (demo_user_id, 'Wortel', 'https://images.openfoodfacts.org/images/products/20000003/20000003.jpg', 500, 'gram', 'Verse wortelen', 'wortel', (CURRENT_DATE + INTERVAL '7 days')::date),
    (demo_user_id, 'Paprika', 'https://images.openfoodfacts.org/images/products/20000004/20000004.jpg', 2, 'stuks', 'Rode paprika', 'paprika', (CURRENT_DATE + INTERVAL '3 days')::date),
    
    -- Vlees & Vis
    (demo_user_id, 'Kipfilet', 'https://images.openfoodfacts.org/images/products/20000005/20000005.jpg', 500, 'gram', 'Verse kipfilet', 'kip', (CURRENT_DATE + INTERVAL '2 days')::date),
    (demo_user_id, 'Rundvlees', 'https://images.openfoodfacts.org/images/products/20000006/20000006.jpg', 300, 'gram', 'Rundergehakt', 'rundvlees', (CURRENT_DATE + INTERVAL '1 day')::date),
    (demo_user_id, 'Zalm', 'https://images.openfoodfacts.org/images/products/20000007/20000007.jpg', 250, 'gram', 'Verse zalmfilet', 'zalm', (CURRENT_DATE + INTERVAL '1 day')::date),
    
    -- Zuivel
    (demo_user_id, 'Melk', 'https://images.openfoodfacts.org/images/products/20000008/20000008.jpg', 1, 'liter', 'Volle melk', 'melk', (CURRENT_DATE + INTERVAL '5 days')::date),
    (demo_user_id, 'Eieren', 'https://images.openfoodfacts.org/images/products/20000009/20000009.jpg', 6, 'stuks', 'Vrije uitloop eieren', 'eieren', (CURRENT_DATE + INTERVAL '14 days')::date),
    (demo_user_id, 'Kaas', 'https://images.openfoodfacts.org/images/products/20000010/20000010.jpg', 200, 'gram', 'Goudse kaas 48+', 'kaas', (CURRENT_DATE + INTERVAL '10 days')::date),
    (demo_user_id, 'Boter', 'https://images.openfoodfacts.org/images/products/20000011/20000011.jpg', 250, 'gram', 'Roomboter', 'boter', (CURRENT_DATE + INTERVAL '30 days')::date),
    
    -- Droge producten
    (demo_user_id, 'Spaghetti', 'https://images.openfoodfacts.org/images/products/20000012/20000012.jpg', 500, 'gram', 'Volkoren spaghetti', 'spaghetti', NULL),
    (demo_user_id, 'Rijst', 'https://images.openfoodfacts.org/images/products/20000013/20000013.jpg', 1, 'kg', 'Basmati rijst', 'rijst', NULL),
    (demo_user_id, 'Pasta', 'https://images.openfoodfacts.org/images/products/20000014/20000014.jpg', 500, 'gram', 'Penne pasta', 'pasta', NULL),
    
    -- Kruiden & Specerijen
    (demo_user_id, 'Peterselie', 'https://images.openfoodfacts.org/images/products/20000015/20000015.jpg', 1, 'bosje', 'Verse peterselie', 'peterselie', (CURRENT_DATE + INTERVAL '4 days')::date),
    (demo_user_id, 'Basilicum', 'https://images.openfoodfacts.org/images/products/20000016/20000016.jpg', 1, 'potje', 'Verse basilicum', 'basilicum', (CURRENT_DATE + INTERVAL '5 days')::date),
    
    -- Overig
    (demo_user_id, 'Olijfolie', 'https://images.openfoodfacts.org/images/products/20000017/20000017.jpg', 500, 'ml', 'Extra vierge olijfolie', 'olijfolie', NULL),
    (demo_user_id, 'Tomatenpuree', 'https://images.openfoodfacts.org/images/products/20000018/20000018.jpg', 200, 'gram', 'Tomatenpuree in blik', 'tomaat', NULL),
    (demo_user_id, 'Knoflookpoeder', 'https://images.openfoodfacts.org/images/products/20000019/20000019.jpg', 50, 'gram', 'Knoflookpoeder', 'knoflook', NULL);

  -- Step 4: Add basic inventory items (items that are always available)
  INSERT INTO public.basic_inventory (user_id, product_id)
  VALUES
    (demo_user_id, 'zout'),
    (demo_user_id, 'peper'),
    (demo_user_id, 'suiker'),
    (demo_user_id, 'bloem'),
    (demo_user_id, 'olijfolie'),
    (demo_user_id, 'azijn'),
    (demo_user_id, 'mosterd'),
    (demo_user_id, 'ketchup'),
    (demo_user_id, 'mayonaise'),
    (demo_user_id, 'boter')
  ON CONFLICT (user_id, product_id) DO NOTHING;

  -- Step 5: Add a demo recipe adaptation (optional - only if there are recipes)
  -- Get the first recipe ID
  SELECT id INTO first_recipe_id
  FROM public.recipes
  LIMIT 1;

  -- If a recipe exists, create a demo adaptation
  IF first_recipe_id IS NOT NULL THEN
      INSERT INTO public.user_recipe_adaptations (
        user_id,
        original_recipe_id,
        title,
        description,
        instructions,
        ingredients,
        ai_prompt
      )
      VALUES (
        demo_user_id,
        first_recipe_id,
        'Pasta Carbonara (Vegetarische Versie)',
        'Een vegetarische variant van de klassieke pasta carbonara, aangepast door AI.',
        '[
          "Bak de vegetarische spekvervanger in een grote koekenpan op middelhoog vuur tot ze krokant zijn.",
          "Kook de spaghetti in een grote pan met gezouten water volgens de aanwijzingen op de verpakking tot al dente.",
          "Doe de afgegoten spaghetti terug in de pan met de vegetarische spekvervanger. Zet het vuur uit.",
          "Kluts de eieren in een kom. Voeg de geraspte Parmezaanse kaas, peper en zout toe en meng goed.",
          "Roer het eiermengsel langzaam door de warme pasta. Blijf roeren tot er een romige saus ontstaat.",
          "Garneer met extra Parmezaanse kaas, verse peterselie en versgemalen peper. Serveer direct."
        ]'::jsonb,
        '[
          {"name": "Spaghetti", "amount": 400, "unit": "gram", "ingredient_tag": "spaghetti"},
          {"name": "Vegetarische spekvervanger", "amount": 200, "unit": "gram", "ingredient_tag": null},
          {"name": "Eieren", "amount": 3, "unit": "stuks", "ingredient_tag": "eieren"},
          {"name": "Parmezaanse kaas", "amount": 100, "unit": "gram", "ingredient_tag": "parmezaan"},
          {"name": "Verse peterselie", "amount": 1, "unit": "bosje", "ingredient_tag": "peterselie"},
          {"name": "Zwarte peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
          {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
        ]'::jsonb,
        'Maak een vegetarische versie van dit recept door het spek te vervangen met een vegetarische alternatief.'
      )
      ON CONFLICT (user_id, original_recipe_id) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        ingredients = EXCLUDED.ingredients,
        ai_prompt = EXCLUDED.ai_prompt,
        updated_at = NOW();
  END IF;

  RAISE NOTICE 'Demo data successfully added for user: %', demo_user_id;
END $$;

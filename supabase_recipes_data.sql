-- CookMind AI - Recipes Data
-- Run this SQL in your Supabase SQL Editor after running supabase_recipes_setup.sql

-- 1. Pasta Carbonara
INSERT INTO public.recipes (title, description, image_url, prep_time, servings, difficulty, instructions, ingredients)
VALUES (
  'Pasta Carbonara',
  'Romige klassieke pasta carbonara met spek, eieren en Parmezaanse kaas. Een heerlijk Italiaans gerecht dat perfect is voor een doordeweekse avond.',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  30,
  4,
  'medium',
  '[
    "Bak de spekblokjes in een grote koekenpan op middelhoog vuur tot ze krokant zijn. Laat ze uitlekken op keukenpapier.",
    "Kook de spaghetti in een grote pan met gezouten water volgens de aanwijzingen op de verpakking tot al dente. Bewaar een kopje pastawater voordat je de pasta afgiet.",
    "Doe de afgegoten spaghetti terug in de pan met de spekblokjes. Zet het vuur uit.",
    "Kluts de eieren in een kom. Voeg de geraspte Parmezaanse kaas, peper en zout toe en meng goed.",
    "Roer het eiermengsel langzaam door de warme pasta. Blijf roeren tot er een romige saus ontstaat. Voeg eventueel wat pastawater toe voor extra romigheid.",
    "Garneer met extra Parmezaanse kaas, verse peterselie en versgemalen peper. Serveer direct."
  ]'::jsonb,
  '[
    {"name": "Spaghetti", "amount": 400, "unit": "gram", "ingredient_tag": "spaghetti"},
    {"name": "Gerookte spekblokjes", "amount": 200, "unit": "gram", "ingredient_tag": "spek"},
    {"name": "Eieren", "amount": 3, "unit": "stuks", "ingredient_tag": "eieren"},
    {"name": "Parmezaanse kaas", "amount": 100, "unit": "gram", "ingredient_tag": "parmezaan"},
    {"name": "Verse peterselie", "amount": 1, "unit": "bosje", "ingredient_tag": "peterselie"},
    {"name": "Zwarte peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
    {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
  ]'::jsonb
);

-- 2. Nasi Goreng
INSERT INTO public.recipes (title, description, image_url, prep_time, servings, difficulty, instructions, ingredients)
VALUES (
  'Nasi Goreng',
  'Klassieke Indonesische nasi goreng met kip, ei en groenten. Een smaakvol gerecht dat perfect is voor lunch of diner.',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  25,
  4,
  'easy',
  '[
    "Kook de rijst volgens de aanwijzingen op de verpakking. Laat afkoelen (bij voorkeur een dag van tevoren gekookt).",
    "Snijd de kipfilet in kleine blokjes. Marineer met sojasaus en laat 10 minuten staan.",
    "Verhit olie in een wok of grote koekenpan. Bak de kipblokjes tot ze gaar zijn. Haal uit de pan.",
    "Bak de ui en knoflook in dezelfde pan tot ze glazig zijn. Voeg eventueel sambal toe voor extra pit.",
    "Voeg de gekookte rijst toe en bak alles goed door. Duw de rijst naar de zijkant en bak een ei in het midden.",
    "Meng het ei door de rijst. Voeg de kip terug toe en bak alles nog 2-3 minuten door.",
    "Breng op smaak met sojasaus, peper en zout. Serveer met kroepoek en eventueel een gebakken ei."
  ]'::jsonb,
  '[
    {"name": "Rijst", "amount": 300, "unit": "gram", "ingredient_tag": "rijst"},
    {"name": "Kipfilet", "amount": 300, "unit": "gram", "ingredient_tag": "kipfilet"},
    {"name": "Ui", "amount": 1, "unit": "stuk", "ingredient_tag": "ui"},
    {"name": "Knoflook", "amount": 2, "unit": "tenen", "ingredient_tag": "knoflook"},
    {"name": "Eieren", "amount": 2, "unit": "stuks", "ingredient_tag": "eieren"},
    {"name": "Sojasaus", "amount": 3, "unit": "eetlepels", "ingredient_tag": "sojasaus"},
    {"name": "Sambal oelek", "amount": 1, "unit": "theelepel", "ingredient_tag": null},
    {"name": "Zonnebloemolie", "amount": 2, "unit": "eetlepels", "ingredient_tag": "zonnebloemolie"},
    {"name": "Peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
    {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
  ]'::jsonb
);

-- 3. Boerenkool Stamppot
INSERT INTO public.recipes (title, description, image_url, prep_time, servings, difficulty, instructions, ingredients)
VALUES (
  'Boerenkool Stamppot',
  'Traditionele Nederlandse boerenkool stamppot met rookworst. Een stevige maaltijd die perfect is voor koude winterdagen.',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  45,
  4,
  'easy',
  '[
    "Schil de aardappelen en snijd ze in gelijke stukken. Was de boerenkool en verwijder de harde stelen.",
    "Kook de aardappelen in een grote pan met water en zout in ongeveer 20 minuten gaar.",
    "Voeg de laatste 5 minuten de boerenkool toe aan de aardappelen.",
    "Kook de rookworst mee in een apart pannetje met water of leg deze op de aardappelen en boerenkool.",
    "Giet alles af, maar bewaar een kopje kookvocht. Voeg de boter en melk toe.",
    "Stamp alles goed fijn met een stamper. Voeg eventueel wat kookvocht toe voor de juiste consistentie.",
    "Breng op smaak met peper, zout en nootmuskaat. Serveer met de rookworst en eventueel mosterd."
  ]'::jsonb,
  '[
    {"name": "Boerenkool", "amount": 500, "unit": "gram", "ingredient_tag": null},
    {"name": "Aardappelen", "amount": 1, "unit": "kg", "ingredient_tag": null},
    {"name": "Rookworst", "amount": 4, "unit": "stuks", "ingredient_tag": "worst"},
    {"name": "Ui", "amount": 1, "unit": "stuk", "ingredient_tag": "ui"},
    {"name": "Boter", "amount": 50, "unit": "gram", "ingredient_tag": "boter"},
    {"name": "Melk", "amount": 100, "unit": "ml", "ingredient_tag": "melk"},
    {"name": "Nootmuskaat", "amount": 1, "unit": "snuf", "ingredient_tag": "nootmuskaat"},
    {"name": "Peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
    {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
  ]'::jsonb
);

-- 4. Erwtensoep
INSERT INTO public.recipes (title, description, image_url, prep_time, servings, difficulty, instructions, ingredients)
VALUES (
  'Erwtensoep',
  'Hollandse erwtensoep met rookworst. Een stevige, traditionele soep die perfect is voor koude dagen. Traditioneel Nederlands gerecht.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  90,
  6,
  'easy',
  '[
    "Week de spliterwten een nacht van tevoren in water, of gebruik direct (dan duurt het koken iets langer).",
    "Snijd de prei, wortel, ui en selderij in kleine stukjes. Snijd de aardappelen in blokjes.",
    "Doe de spliterwten in een grote soeppan met 2 liter water. Breng aan de kook en laat 30 minuten koken.",
    "Voeg de gesneden groenten en aardappelen toe. Laat nog 30-40 minuten zachtjes koken tot de erwten zacht zijn.",
    "Voeg de rookworst toe en laat deze 10 minuten meekoken.",
    "Haal de rookworst uit de pan en snijd in plakjes. Pureer de soep met een staafmixer tot een gladde massa.",
    "Voeg de rookworst terug toe. Breng op smaak met peper en zout. Laat nog 5 minuten doorkoken.",
    "Serveer de erwtensoep warm met roggebrood en boter."
  ]'::jsonb,
  '[
    {"name": "Spliterwten", "amount": 500, "unit": "gram", "ingredient_tag": "erwten"},
    {"name": "Rookworst", "amount": 1, "unit": "stuk", "ingredient_tag": "worst"},
    {"name": "Prei", "amount": 2, "unit": "stengels", "ingredient_tag": "prei"},
    {"name": "Wortel", "amount": 2, "unit": "stuks", "ingredient_tag": "wortel"},
    {"name": "Ui", "amount": 1, "unit": "stuk", "ingredient_tag": "ui"},
    {"name": "Selderij", "amount": 2, "unit": "stengels", "ingredient_tag": "selderij"},
    {"name": "Aardappelen", "amount": 2, "unit": "stuks", "ingredient_tag": null},
    {"name": "Bouillonblokjes", "amount": 2, "unit": "stuks", "ingredient_tag": "bouillonblokjes"},
    {"name": "Peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
    {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
  ]'::jsonb
);

-- 5. Tomatensoep
INSERT INTO public.recipes (title, description, image_url, prep_time, servings, difficulty, instructions, ingredients)
VALUES (
  'Tomatensoep',
  'Rijke en romige tomatensoep met verse tomaten en basilicum. Een klassieke soep die perfect is als voorgerecht of lichte maaltijd.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  30,
  4,
  'easy',
  '[
    "Was de tomaten en snijd ze in kwarten. Snijd de ui en knoflook fijn.",
    "Verhit de olijfolie in een grote soeppan. Fruit de ui en knoflook 2-3 minuten tot ze glazig zijn.",
    "Voeg de tomaten toe en bak ze 5 minuten mee. Voeg de bouillon toe en breng aan de kook.",
    "Laat de soep 15-20 minuten zachtjes koken tot de tomaten zacht zijn.",
    "Pureer de soep met een staafmixer tot een gladde massa. Zeef eventueel door een zeef voor extra gladheid.",
    "Voeg de room toe en verwarm nog 2 minuten. Breng op smaak met peper, zout en verse basilicum.",
    "Serveer de tomatensoep warm, gegarneerd met verse basilicum en eventueel croutons."
  ]'::jsonb,
  '[
    {"name": "Tomaten", "amount": 800, "unit": "gram", "ingredient_tag": "tomaat"},
    {"name": "Ui", "amount": 1, "unit": "stuk", "ingredient_tag": "ui"},
    {"name": "Knoflook", "amount": 2, "unit": "tenen", "ingredient_tag": "knoflook"},
    {"name": "Bouillon", "amount": 500, "unit": "ml", "ingredient_tag": "bouillon"},
    {"name": "Room", "amount": 100, "unit": "ml", "ingredient_tag": "room"},
    {"name": "Olijfolie", "amount": 2, "unit": "eetlepels", "ingredient_tag": "olijfolie"},
    {"name": "Verse basilicum", "amount": 1, "unit": "handje", "ingredient_tag": "basilicum"},
    {"name": "Peper", "amount": 1, "unit": "snuf", "ingredient_tag": "peper"},
    {"name": "Zout", "amount": 1, "unit": "snuf", "ingredient_tag": "zout"}
  ]'::jsonb
);

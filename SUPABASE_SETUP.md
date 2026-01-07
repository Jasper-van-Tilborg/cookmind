# Supabase Setup Instructies

## Stap 1: Environment Variables

Maak een `.env.local` bestand aan in de root van het project met de volgende inhoud:

```
NEXT_PUBLIC_SUPABASE_URL=https://hszcdetpxpmmhhtrtnnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Yr7sPucakUlrk9UXPsiz4g_NEcUgLi4
```

## Stap 2: Database Schema

1. Ga naar je Supabase dashboard: https://supabase.com/dashboard
2. Selecteer je project
3. Ga naar **SQL Editor** in het menu
4. Kopieer de inhoud van `supabase-schema.sql`
5. Plak het in de SQL Editor en klik op **Run**

Dit maakt de `inventory` tabel aan met:

- Row Level Security (RLS) enabled
- Automatische timestamp updates
- Indexes voor snellere queries

## Stap 3: Test de Connectie

Start de development server:

```bash
npm run dev
```

Ga naar de inventory pagina en voeg een item toe. Het zou nu opgeslagen moeten worden in Supabase!

## Notities

- De app gebruikt nu Supabase als primaire storage
- Als Supabase niet beschikbaar is, valt de app terug op LocalStorage
- Wanneer je later authenticatie toevoegt, moet je de RLS policies aanpassen om per gebruiker te filteren





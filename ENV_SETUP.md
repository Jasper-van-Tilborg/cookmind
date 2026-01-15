# Environment Variables Setup voor CookMind AI

## Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan (of gebruik een bestaand project)
3. Wacht tot het project volledig is opgezet

## Stap 2: Supabase Credentials Ophalen

1. Ga naar je Supabase project dashboard
2. Klik op **Settings** (tandwiel icoon) in de linker sidebar
3. Klik op **API** in de settings menu
4. Je ziet hier twee belangrijke waarden:

### Project URL
- Dit is je `NEXT_PUBLIC_SUPABASE_URL`
- Staat onder "Project URL"
- Ziet eruit als: `https://xxxxxxxxxxxxx.supabase.co`

### Anon/Public Key
- Dit is je `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Staat onder "Project API keys" → "anon" → "public"
- Dit is een lange JWT token string

## Stap 3: .env.local Bestand Aanmaken

Maak een bestand genaamd `.env.local` in de root van je project (naast `package.json`) met de volgende inhoud:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

**Vervang:**
- `https://jouw-project-id.supabase.co` met je echte Project URL
- `jouw-anon-key-hier` met je echte anon/public key

## Stap 4: SQL Query Uitvoeren

1. Ga naar je Supabase project dashboard
2. Klik op **SQL Editor** in de linker sidebar
3. Klik op **New Query**
4. Kopieer en plak de inhoud van `supabase_setup.sql`
5. Klik op **Run** (of druk op Ctrl+Enter)

Dit maakt:
- Een `profiles` tabel voor extra user data
- Row Level Security policies
- Automatische profile creatie bij signup
- Timestamp updates

## Stap 5: Auth Instellingen Controleren

1. Ga naar **Authentication** → **Settings** in je Supabase dashboard
2. Controleer dat **Email** auth provider is ingeschakeld
3. Optioneel: Configureer **Google** en **Apple** providers voor social login (later)

## Stap 6: Email Templates (Optioneel)

Voor password reset emails:
1. Ga naar **Authentication** → **Email Templates**
2. Pas de "Reset Password" template aan naar wens
3. De redirect URL moet zijn: `https://jouw-domein.com/reset-password`

## Belangrijk

- **Zet `.env.local` NOOIT in git** - dit bestand staat al in `.gitignore`
- De `anon` key is veilig om in de frontend te gebruiken (heeft beperkte rechten)
- Voor productie: gebruik environment variables in je hosting platform (Vercel, etc.)

## Testen

Na het instellen:
1. Start je dev server: `npm run dev`
2. Ga naar `/signup` en maak een test account
3. Check in Supabase **Authentication** → **Users** of de user is aangemaakt
4. Check in **Table Editor** → **profiles** of het profiel is aangemaakt

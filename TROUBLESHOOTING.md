# Troubleshooting: Supabase Environment Variables

## Probleem: "Your project's URL and API key are required"

Als je deze foutmelding krijgt, volg deze stappen:

### Stap 1: Controleer .env.local Bestand

1. **Locatie**: Het `.env.local` bestand moet in de **root** van je project staan (naast `package.json`)

2. **Inhoud**: Het bestand moet er precies zo uitzien (zonder quotes rond de waarden):
```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

3. **Belangrijk**:
   - ❌ GEEN quotes: `NEXT_PUBLIC_SUPABASE_URL="https://..."` (FOUT)
   - ✅ Zonder quotes: `NEXT_PUBLIC_SUPABASE_URL=https://...` (GOED)
   - ❌ GEEN spaties rond de `=`: `NEXT_PUBLIC_SUPABASE_URL = https://...` (FOUT)
   - ✅ Geen spaties: `NEXT_PUBLIC_SUPABASE_URL=https://...` (GOED)

### Stap 2: Restart Dev Server

**Next.js laadt environment variables alleen bij startup!**

1. Stop je dev server (Ctrl+C in de terminal)
2. Start opnieuw: `npm run dev`

### Stap 3: Verifieer de Waarden

Controleer in je Supabase dashboard:
- **Settings** → **API**
- **Project URL**: Moet beginnen met `https://` en eindigen met `.supabase.co`
- **anon public key**: Moet een lange string zijn (meestal begint met `eyJ...`)

### Stap 4: Test de Variabelen

Voeg tijdelijk dit toe aan `app/page.tsx` om te testen:

```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

Als je `undefined` ziet, zijn de variabelen niet geladen.

### Stap 5: Alternatieve Oplossing

Als het nog steeds niet werkt, maak een `.env` bestand (zonder `.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

**Let op**: `.env` wordt wel in git getracked, dus gebruik dit alleen voor development!

## Veelvoorkomende Fouten

1. **Bestand heet `.env` in plaats van `.env.local`**
   - ✅ Gebruik `.env.local`

2. **Variabelen hebben quotes**
   - ❌ `NEXT_PUBLIC_SUPABASE_URL="https://..."`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL=https://...`

3. **Spaties rond de `=`**
   - ❌ `NEXT_PUBLIC_SUPABASE_URL = https://...`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL=https://...`

4. **Server niet herstart na toevoegen variabelen**
   - ✅ Altijd herstarten: `npm run dev`

5. **Bestand staat in verkeerde map**
   - ✅ Moet in root staan (naast `package.json`)

## Voorbeeld .env.local

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

**Let op**: Dit zijn voorbeeldwaarden, gebruik je eigen credentials!

# Email Verificatie Setup voor CookMind AI

## Overzicht

Email verificatie is nu geïmplementeerd. Gebruikers moeten hun e-mailadres verifiëren voordat ze kunnen inloggen.

## Stap 1: Supabase Dashboard Configuratie

### Email Verificatie Inschakelen

1. Ga naar je Supabase project dashboard
2. Klik op **Authentication** → **Settings**
3. Scroll naar **Email Auth** sectie
4. Zorg dat de volgende instellingen zijn:
   - ✅ **Enable Email Signup**: Aan
   - ✅ **Confirm email**: Aan (dit is belangrijk!)
   - ✅ **Secure email change**: Aan (aanbevolen)

### Email Template Aanpassen

1. Ga naar **Authentication** → **Email Templates**
2. Klik op **Confirm signup** template
3. Pas de redirect URL aan naar:
   ```
   {{ .SiteURL }}/verify-email?token_hash={{ .TokenHash }}&type=email
   ```
4. Pas de template aan naar wens (optioneel)
5. Klik op **Save**

## Stap 2: SQL Query Uitvoeren

1. Ga naar **SQL Editor** in je Supabase dashboard
2. Kopieer de inhoud van `supabase_email_verification_setup.sql`
3. Plak en klik op **Run**

Dit zorgt ervoor dat:

- Profiles alleen worden aangemaakt voor geverifieerde gebruikers
- Automatische profile creatie bij email verificatie

## Stap 3: Site URL Configureren

1. Ga naar **Authentication** → **URL Configuration**
2. Zet **Site URL** naar je app URL:
   - Development: `http://localhost:3000`
   - Production: `https://jouw-domein.com`
3. Voeg toe aan **Redirect URLs**:
   - `http://localhost:3000/verify-email`
   - `https://jouw-domein.com/verify-email` (voor productie)

## Flow Overzicht

### Signup Flow:

1. Gebruiker vult signup form in
2. Account wordt aangemaakt in Supabase (maar nog niet geverifieerd)
3. Gebruiker wordt doorgestuurd naar `/check-email`
4. Supabase stuurt verificatie email
5. Gebruiker klikt op link in email
6. Gebruiker wordt doorgestuurd naar `/verify-email`
7. Email wordt geverifieerd
8. Profile wordt automatisch aangemaakt (via trigger)
9. Gebruiker wordt doorgestuurd naar `/login`

### Login Flow:

1. Gebruiker probeert in te loggen
2. Systeem checkt of email geverifieerd is
3. Als niet geverifieerd: error message
4. Als wel geverifieerd: login succesvol → onboarding of home

## Testen

### Development Testing:

1. Maak een test account aan op `/signup`
2. Check je email (of Supabase logs voor development)
3. Klik op verificatielink
4. Je wordt doorgestuurd naar `/verify-email`
5. Na verificatie kun je inloggen

### Email Testing in Development:

- Supabase stuurt emails naar echte email adressen
- Voor development kun je ook de email logs bekijken in Supabase dashboard
- Ga naar **Authentication** → **Users** om de status te zien

## Troubleshooting

### Email komt niet aan:

- Check spam folder
- Check Supabase email logs (Authentication → Users)
- Controleer dat email provider niet geblokkeerd is
- Check Site URL configuratie

### Verificatie link werkt niet:

- Controleer dat redirect URL correct is geconfigureerd
- Check dat `/verify-email` route bestaat
- Controleer token_hash parameter

### Profile wordt niet aangemaakt:

- Check of SQL trigger correct is uitgevoerd
- Controleer Supabase logs voor errors
- Check dat email_confirmed_at is gezet

## Belangrijke Notities

- **Email verificatie is verplicht**: Gebruikers kunnen niet inloggen zonder verificatie
- **Profiles worden automatisch aangemaakt**: Na email verificatie via trigger
- **Development vs Production**: Zorg dat Site URL correct is voor elke omgeving

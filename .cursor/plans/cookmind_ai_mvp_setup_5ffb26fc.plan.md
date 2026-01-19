---
name: CookMind AI MVP Setup
overview: Voeg barcode scanning functionaliteit toe aan de inventory pagina. Gebruiker kan op een barcode icon klikken, camera wordt geopend, en barcode kan worden gescand om producten toe te voegen.
todos:
  - id: todo-1767698041017-0m7q9fl30
    content: OnboardingContainer en OnboardingStep componenten bouwen met progress bar
    status: pending
  - id: todo-1767698041017-mzgvj42qk
    content: Onboarding pagina maken met 3 uitlegstappen (voorraad, recepten, koken)
    status: pending
  - id: todo-1767698041017-rjtauaj1n
    content: Supabase auth configureren en auth utilities maken (signUp, signIn, signOut, getSession)
    status: pending
  - id: todo-1767698041017-s6nrw1cw3
    content: AuthContext provider maken voor globale auth state management
    status: pending
  - id: todo-1767698041017-gb1azc83u
    content: Login/Registratie pagina bouwen met forms en email verificatie flow
    status: pending
  - id: todo-1767698041017-y4uhp46x8
    content: Email verificatie pagina maken met instructies en verificatie status
    status: pending
  - id: todo-1767698041017-zhmq8x3uq
    content: Route protection implementeren - check auth state en redirect logica in root page en layout
    status: pending
  - id: todo-1767698041017-42pbus0cq
    content: Session persistence implementeren - check session bij app start, auto-login functionaliteit
    status: pending
  - id: todo-1767698041017-ouwsza1zi
    content: Inventory storage aanpassen om user_id te gebruiken bij queries en inserts
    status: pending
  - id: todo-1767698041017-24xoziy5h
    content: BottomNav conditioneel tonen - alleen zichtbaar voor ingelogde gebruikers
    status: pending
---

# Barcode Scanner Functionaliteit

## Overzicht

Implementeer barcode scanning op de inventory pagina zodat gebruikers producten kunnen toevoegen door barcodes te scannen met hun camera.

## Implementatie Details

### 1. Barcode Scanner Library

- **html5-qrcode** of **@zxing/library** gebruiken voor barcode scanning
- Ondersteuning voor verschillende barcode formaten (EAN-13, UPC-A, etc.)
- Camera access via browser API

### 2. Barcode Scanner Component

- **BarcodeScanner** component met:
- Camera preview
- Scanning functionaliteit
- Success/error feedback
- Close button om te stoppen
- Fullscreen overlay modal

### 3. Product Lookup

- **Barcode API integratie** (bijv. Open Food Facts API of Barcode Lookup API)
- Fallback: Als product niet gevonden wordt, toon formulier om handmatig toe te voegen
- Product informatie ophalen (naam, categorie, etc.)

### 4. UI Integratie

- **Barcode icon knop** naast de "Item toevoegen" knop op inventory pagina
- Icon: ScanLine of Barcode van lucide-react
- Click handler opent scanner modal

### 5. Flow

1. Gebruiker klikt op barcode icon
2. Camera permissions vragen
3. Camera opent in modal
4. Barcode scannen
5. Product lookup via API
6. Product toevoegen aan inventory (of handmatig formulier als niet gevonden)

## Bestanden om te maken/wijzigen

### Nieuwe bestanden:

- `src/components/inventory/BarcodeScanner.tsx` - Scanner component met camera
- `src/lib/barcode.ts` - Barcode API utilities en product lookup

### Te wijzigen bestanden:

- `app/(tabs)/inventory/page.tsx` - Barcode icon knop toevoegen
- `package.json` - Barcode scanner library toevoegen

## Technische Notities

- Camera permissions vereist (getUserMedia API)
- HTTPS vereist voor camera access (of localhost)
- Error handling voor camera niet beschikbaar
- Mobile-first design voor camera interface
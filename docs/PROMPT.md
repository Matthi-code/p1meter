# p1Meter Installatie Management App

## Project Context

Webapp voor het beheren van p1Meter installaties bij huiseigenaren. De p1Meter is een specifiek apparaat van HomeWizard dat op de slimme meter wordt aangesloten om energieverbruik te monitoren.

**Productinformatie**: https://www.homewizard.com/p1-meter/
**Helpdesk**: https://helpdesk.homewizard.com/

## Doelgroep

| Rol | Beschrijving |
|-----|--------------|
| **Admin** | Volledige toegang, beheert team en systeem |
| **Planner** | Plant installaties en taken, beheert klanten |
| **Energie Buddy** | Voert installaties uit, ziet eigen taken |
| **Huiseigenaar** | Ziet eigen afspraak, vult intake/evaluatie in |

## Kernfunctionaliteit

### 1. Kalender (Outlook-stijl)
- Dag/Week/Maand weergaven
- Installaties en taken visueel weergeven
- Drag & drop voor herplannen
- Filtering per Energie Buddy

### 2. Installatiebeheer
- Inplannen bij klant
- Toewijzen aan Energie Buddy
- Status tracking: Gepland → Onderweg → Bezig → Voltooid
- Koppeling met klantgegevens

### 3. Takenbeheer
- Eenmalige en terugkerende taken
- Recurrence: dagelijks, wekelijks, maandelijks
- Toewijzen aan teamleden
- Zowel klantgerelateerd als intern

### 4. Teambeheer
- Teamleden toevoegen/verwijderen
- Rollen toewijzen
- Actief/inactief status

### 5. Klantbeheer
- NAW-gegevens
- Contactinformatie
- Notities
- Installatiehistorie

### 6. Huiseigenaar Portal
- Eigen afspraak inzien
- Afspraak verzetten
- Intake formulier invullen (pre-installatie)
- Foto's uploaden (meterkast)
- Evaluatie na installatie
- Issues melden

### 7. Instructiepagina's
- **Installateur**: Meter herkenning, USB-adapter beslisboom, checklist
- **Huiseigenaar**: HomeWizard app setup, FAQ, troubleshooting

### 8. Slimme Meter Herkenning
- Installateur maakt/uploadt foto van slimme meter
- App herkent metertype automatisch (image recognition)
- Toont direct of USB-C adapter nodig is
- Ondersteunde merken: Landis+Gyr, Kaifa, Iskra, Sagemcom, Kamstrup

**USB-C Adapter Regel (bron: HomeWizard)**
| Meterversie | Adapter nodig? |
|-------------|----------------|
| SMR 5.0+ (DSMR 5.0) | Nee, P1-poort levert stroom |
| SMR 4.x en ouder | Ja, USB-C adapter vereist |

## Technische Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Kalender | FullCalendar |
| Recurring | rrule |
| Icons | Lucide React |

## Ontwerpprincipes

1. **Eenvoud** - Minimale complexiteit, geen overbodige features
2. **Mobiel-vriendelijk** - Energie Buddies gebruiken app op locatie
3. **Offline-capable** - Instructiepagina's werken zonder internet
4. **Snelheid** - Geen onnodige laadtijden

## Beveiliging

- Row Level Security (RLS) per rol
- Token-based toegang voor huiseigenaren (geen login nodig)
- Geen gevoelige data in client-side code
- Environment variables voor API keys

## Niet in scope

- Facturatie/betalingen
- Push notificaties (mogelijk later)
- Native mobile app
- Integratie met externe systemen

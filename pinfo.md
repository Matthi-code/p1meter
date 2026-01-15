# p1Meter Installaties - Project Overzicht

## Wat is p1Meter?

p1Meter Installaties is een complete webapplicatie voor het plannen, uitvoeren en evalueren van p1Meter installaties bij huiseigenaren. De applicatie digitaliseert het volledige proces: van eerste klantcontact en intake, via planning en installatie door Energie Buddies, tot nazorg en evaluatie.

De p1Meter is een slimme energiemeter die huiseigenaren inzicht geeft in hun energieverbruik. Dit project ondersteunt een lokaal initiatief (Zevenbergschen Hoek) om bewoners te helpen met energiebesparing.

---

## Gebruikersrollen & Rechten

### Administrator
Volledige beheerderstoegang tot het complete systeem.

**Mogelijkheden:**
- Alle functies van Planner en Energie Buddy
- Teamleden uitnodigen via email met activatielink
- Teamleden verwijderen (inclusief login account)
- Wachtwoorden resetten voor teamleden
- Rollen toewijzen en wijzigen (admin, planner, energiebuddy)
- Toegang tot alle rapportages en statistieken
- Systeeminstellingen beheren

### Planner
Verantwoordelijk voor klantbeheer en planning van installaties.

**Mogelijkheden:**
- Nieuwe klanten registreren met NAW-gegevens
- Klantdossiers bewerken en beheren
- Zoeken en filteren op klanten (naam, adres, status)
- Installaties inplannen met datum en tijdslot
- Installaties toewijzen aan beschikbare Energie Buddies
- Kalenderoverzicht van alle geplande installaties
- Status van installaties volgen (gepland, bevestigd, voltooid)
- Klantcommunicatie coördineren

### Energie Buddy
De installateur die bij klanten thuis de p1Meter installeert.

**Mogelijkheden:**
- "Mijn Dag" overzicht met eigen planning
- Route en adressen van dagelijkse installaties
- Installatie checklist per klant afwerken:
  - Meter geïnstalleerd
  - WiFi geconfigureerd
  - App uitgelegd aan klant
  - Klant akkoord
- Status bijwerken (onderweg, bezig, voltooid)
- Notities toevoegen aan installatie
- Alleen eigen toegewezen installaties zichtbaar

### Huiseigenaar (Klant Portal)
Aparte ingang voor klanten om hun eigen gegevens te beheren.

**Mogelijkheden:**
- Inloggen met eigen portal account
- Persoonlijk dossier inzien:
  - Contactgegevens
  - Woninggegevens (bouwjaar, type, oppervlakte)
  - Geplande installatiedatum
- Intake formulier invullen:
  - Woningkenmerken
  - Huidige energiesituatie
  - Verwachtingen
- Energieverbruik invoeren:
  - Maandelijkse meterstanden
  - Vergelijking met referentiehuishoudens
- Foto's uploaden (bijv. van slimme meter)
- Evaluatieformulier invullen na installatie:
  - Sterren rating (1-5)
  - Tevredenheid over installateur
  - Verbeterpunten
- Subsidie informatie bekijken

---

## Modules & Functies

### Dashboard
Het startscherm na inloggen met een overzicht van belangrijke cijfers.

- Totaal aantal klanten
- Installaties deze week/maand
- Voltooide vs. geplande installaties
- Recente activiteit feed
- Snelkoppelingen naar veelgebruikte functies

### Klantenbeheer
Complete CRUD-functionaliteit voor klantgegevens.

- Klantenlijst met zoeken en filteren
- Detailweergave per klant
- Klantgegevens bewerken:
  - Naam, email, telefoon
  - Adres (met automatische geocoding)
  - Woningtype en bouwjaar
  - Notities
- Klant aanmaken met portal account
- Klantgeschiedenis en timeline
- Koppeling naar installaties

### Installatiebeheer
Planning en uitvoering van installaties.

- Overzicht alle installaties met filters:
  - Status (gepland, bevestigd, bezig, voltooid, geannuleerd)
  - Datum range
  - Toegewezen Energie Buddy
- Nieuwe installatie inplannen:
  - Klant selecteren
  - Datum en tijdslot kiezen
  - Energie Buddy toewijzen
- Installatie details:
  - Klantgegevens en adres
  - Checklist voortgang
  - Notities en opmerkingen
- Bulk acties mogelijk

### Kalender
Visuele planning van alle installaties.

- Maand-, week- en dagweergave
- Kleurcodering per status
- Drag & drop om te herplannen
- Filter per Energie Buddy
- Klikken voor details

### Teambeheer
Beheer van alle gebruikers in het systeem.

- Teamleden overzicht met zoeken
- Filter op rol (admin, planner, energiebuddy)
- Teamlid toevoegen:
  - Email uitnodiging met HTML template
  - Activatielink voor wachtwoord instellen
- Teamlid bewerken:
  - Naam en email wijzigen
  - Rol aanpassen
  - Account activeren/deactiveren
- Wachtwoord reset:
  - Genereert reset link
  - Stuurt HTML email met knop
- Teamlid verwijderen:
  - Verwijdert uit team_members tabel
  - Optioneel: verwijdert ook Supabase auth account
- Per Energie Buddy: overzicht van toegewezen installaties

### Klant Portal
Aparte omgeving voor huiseigenaren.

- Eigen login pagina (/portal-login)
- Persoonlijk dashboard
- Tabs:
  - **Dossier:** Eigen gegevens inzien
  - **Intake:** Vragenlijst invullen
  - **Verbruik:** Energiedata invoeren
  - **Upload:** Documenten/foto's uploaden
  - **Evaluatie:** Feedback na installatie
  - **Subsidies:** Informatie over beschikbare subsidies
  - **Actieplan:** Persoonlijke energiebesparingstips

---

## Technische Specificaties

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Taal:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Componenten:** Custom component library
- **Icons:** Lucide React
- **State Management:** React hooks + SWR voor data fetching

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authenticatie:** Supabase Auth
- **Autorisatie:** Row Level Security (RLS) policies
- **File Storage:** Supabase Storage

### Externe Services
- **Email:** Resend (HTML templates)
  - Domein: jmtest.nl
  - Uitnodigings- en reset emails
- **Maps:** Google Maps API
  - Geocoding van adressen
  - Kaartweergave van installaties
- **Hosting:** Vercel
  - Automatische deployments
  - Edge functions

### Database Tabellen
- `customers` - Klantgegevens
- `installations` - Installatie records
- `team_members` - Teamleden en rollen
- `evaluations` - Klant evaluaties
- `checklist_items` - Installatie checklist
- `portal_users` - Klant portal accounts

---

## Installatie & Development

```bash
# Clone repository
git clone https://github.com/Matthi-code/p1meter.git

# Installeer dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=
```

---

## URLs

| Omgeving | URL |
|----------|-----|
| Productie | https://p1meter.jmtest.nl |
| Admin Login | https://p1meter.jmtest.nl/login |
| Klant Portal | https://p1meter.jmtest.nl/portal-login |
| GitHub | https://github.com/Matthi-code/p1meter |

---

## Roadmap / Toekomstige Features

### Voltooid
- [x] CMS voor FAQ en Over ons pagina's
- [x] Rapportages en dashboard analytics
- [x] Voorraad beheer (meters, adapters)
- [x] Route optimalisatie voor Energie Buddies
- [x] Foto's bij installatie (voor/na)
- [x] Reviews/testimonials op website
- [x] Excel import/export
- [x] Multi-select taken met bulk verwijderen
- [x] Drag & drop in kalender

### Open
- [ ] SMS notificaties (Twilio)
- [ ] Factuur generatie
- [ ] HomeWizard API koppeling

---

*Laatst bijgewerkt: 13 januari 2026*
*Ontwikkeld met Claude Code*

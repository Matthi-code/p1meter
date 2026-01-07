# Functioneel Ontwerp - p1Meter App

## 1. Systeemoverzicht

```
┌─────────────────────────────────────────────────────────────┐
│                      p1Meter App                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Dashboard     │   Portal        │   Instructies           │
│   (Intern)      │   (Huiseigenaar)│   (Publiek)             │
├─────────────────┴─────────────────┴─────────────────────────┤
│                    Supabase Backend                         │
│              (Auth + Database + Storage)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Gebruikersrollen & Rechten

### 2.1 Admin
- Volledige CRUD op alle entiteiten
- Teambeheer (toevoegen/verwijderen leden)
- Rollentoewijzing
- Systeeminstellingen

### 2.2 Planner
- CRUD klanten
- CRUD installaties
- CRUD taken
- Toewijzen aan monteurs
- Kalender beheer

### 2.3 Monteur
- Lezen klantgegevens
- Eigen taken/installaties zien
- Status updaten (eigen werk)
- Foto's uploaden bij installatie

### 2.4 Huiseigenaar
- Eigen afspraak inzien
- Afspraak verzetten (binnen regels)
- Intake formulier invullen
- Foto's uploaden
- Evaluatie invullen
- Issue melden

---

## 3. Functionele Modules

### 3.1 Authenticatie

**LoginFlow (Intern)**
```
1. Gebruiker opent /login
2. Voert email + wachtwoord in
3. Supabase Auth valideert
4. Redirect naar /dashboard
5. Middleware checkt rol voor elke pagina
```

**Huiseigenaar Toegang**
```
1. Systeem genereert unieke token per klant
2. Link: /portal?token=abc123
3. Token valideert tegen database
4. Geen wachtwoord nodig
```

### 3.2 Dashboard

**Componenten**
| Component | Beschrijving |
|-----------|--------------|
| Statistieken | Installaties vandaag, deze week, openstaand |
| Agenda widget | Komende 5 afspraken |
| Team status | Wie is waar bezig |
| Recente activiteit | Laatste acties in systeem |

### 3.3 Kalender

**Weergaven**
- **Dag**: Tijdslots per uur, alle monteurs naast elkaar
- **Week**: 7 dagen, compacte weergave
- **Maand**: Overzicht, alleen aantal items per dag

**Interacties**
| Actie | Gedrag |
|-------|--------|
| Klik op lege slot | Nieuwe installatie/taak modal |
| Klik op item | Detail modal |
| Drag & drop | Herplannen (met bevestiging) |
| Filter dropdown | Toon alleen specifieke monteur |

**Kleurcodes**
| Kleur | Betekenis |
|-------|-----------|
| Blauw | Geplande installatie |
| Groen | Voltooide installatie |
| Oranje | Taak |
| Rood | Geannuleerd/probleem |
| Grijs | Interne taak |

### 3.4 Installatiebeheer

**Installatie Lifecycle**
```
Gepland → Bevestigd → Onderweg → Bezig → Voltooid
                                    ↓
                              Geannuleerd
```

**Formulier Velden**
| Veld | Type | Verplicht |
|------|------|-----------|
| Klant | Selectie | Ja |
| Datum/tijd | Datetime | Ja |
| Duur (minuten) | Nummer | Ja (default: 60) |
| Monteur | Selectie | Ja |
| Notities | Tekst | Nee |

**Acties**
- Aanmaken
- Bewerken
- Annuleren (met reden)
- Status wijzigen
- Herplannen

### 3.5 Takenbeheer

**Taak Types**
1. **Eenmalig** - Specifieke datum/tijd
2. **Terugkerend** - Op basis van regel

**Recurrence Regels**
| Patroon | Voorbeeld |
|---------|-----------|
| Dagelijks | Elke dag om 09:00 |
| Wekelijks | Elke maandag |
| Maandelijks | 1e van de maand |
| Aangepast | Elke 2 weken op di+do |

**Formulier Velden**
| Veld | Type | Verplicht |
|------|------|-----------|
| Titel | Tekst | Ja |
| Beschrijving | Tekst | Nee |
| Datum/tijd | Datetime | Ja |
| Duur | Nummer | Nee |
| Toegewezen aan | Selectie | Nee |
| Klant | Selectie | Nee |
| Terugkerend | Toggle | Nee |
| Recurrence regel | Selectie | Als terugkerend |

### 3.6 Klantbeheer

**Formulier Velden**
| Veld | Type | Verplicht |
|------|------|-----------|
| Naam | Tekst | Ja |
| Email | Email | Ja |
| Telefoon | Telefoon | Ja |
| Adres | Tekst | Ja |
| Postcode | Tekst | Ja |
| Plaats | Tekst | Ja |
| Notities | Tekst | Nee |

**Klant Detail Pagina**
- Contactgegevens
- Installatiehistorie
- Openstaande issues
- Intake formulier status
- Link naar portal genereren

### 3.7 Teambeheer

**Formulier Velden**
| Veld | Type | Verplicht |
|------|------|-----------|
| Naam | Tekst | Ja |
| Email | Email | Ja |
| Rol | Selectie | Ja |
| Actief | Toggle | Ja |

**Acties**
- Uitnodigen (stuurt email met login link)
- Rol wijzigen
- Deactiveren (behoudt historie)
- Verwijderen (alleen als geen data gekoppeld)

---

## 4. Huiseigenaar Portal

### 4.1 Toegang
- Via unieke link met token
- Geen registratie/login nodig
- Token gekoppeld aan klant record

### 4.2 Overzicht Pagina
```
┌────────────────────────────────────┐
│  Welkom [Naam]                     │
├────────────────────────────────────┤
│  Uw afspraak                       │
│  📅 15 januari 2026, 10:00-11:00   │
│  📍 [Adres]                        │
│  👤 Monteur: Jan                   │
│  Status: Gepland                   │
│                                    │
│  [Verzetten] [Annuleren]           │
├────────────────────────────────────┤
│  Acties                            │
│  • Intake formulier invullen       │
│  • Foto's uploaden                 │
│  • Handleiding bekijken            │
└────────────────────────────────────┘
```

### 4.3 Intake Formulier

**Velden**
| Veld | Type | Toelichting |
|------|------|-------------|
| Type meterkast | Selectie | Groepenkast / Oude zekeringkast |
| Bereikbaarheid | Selectie | Goed / Matig / Slecht |
| Locatie meter | Tekst | Bijv. "Hal, achter voordeur" |
| Parkeren | Selectie | Oprit / Straat / Betaald |
| Huisdieren | Tekst | Bijv. "Hond, niet agressief" |
| Opmerkingen | Tekst | Vrij veld |

### 4.4 Foto Upload

**Gevraagde Foto's**
1. Overzicht meterkast (gesloten)
2. Meterkast open
3. Close-up slimme meter
4. P1-poort (indien zichtbaar)

**Specificaties**
- Max 5 foto's
- Max 10MB per foto
- Automatisch comprimeren
- Preview voor verzenden

### 4.5 Evaluatie Formulier

**Velden**
| Veld | Type |
|------|------|
| Algemene beoordeling | 1-5 sterren |
| Punctualiteit | 1-5 sterren |
| Vriendelijkheid | 1-5 sterren |
| Kwaliteit werk | 1-5 sterren |
| Opmerkingen | Tekst |
| Bevestiging oplevering | Checkbox |

### 4.6 Issue Melden

**Formulier**
| Veld | Type |
|------|------|
| Categorie | Selectie (Storing / Vraag / Klacht) |
| Beschrijving | Tekst |
| Foto | Upload (optioneel) |

---

## 5. Instructiepagina's

### 5.1 Installateur Instructies

**Bron**: https://www.homewizard.com/p1-meter/ | https://helpdesk.homewizard.com/

**Automatische Meter Herkenning via Foto**
```
┌─────────────────────────────────────────┐
│  Slimme Meter Herkenning                │
├─────────────────────────────────────────┤
│                                         │
│  [📷 Maak foto] of [📁 Upload foto]     │
│                                         │
├─────────────────────────────────────────┤
│  ✓ Meter herkend: Landis+Gyr E360      │
│  ✓ Versie: SMR 5.0                      │
│  ✓ USB-C adapter: NIET NODIG            │
│                                         │
│  [Doorgaan met installatie]             │
└─────────────────────────────────────────┘
```

**Ondersteunde Meters**
| Merk | Modellen | Opmerkingen |
|------|----------|-------------|
| Landis+Gyr | E350, E360 | E350 volledig compatibel bij SMR 5.0 |
| Kaifa | MA105, MA304 | Standaard ondersteund |
| Iskra | ME382, AM550 | Iskra M382: geen fase-informatie |
| Sagemcom | T210-D | Standaard ondersteund |
| Kamstrup | 382JxC, OMNIPOWER | 382JxC: geen fase-informatie |

**USB-C Adapter Regel**
| Meterversie | Adapter nodig? | Gasdata |
|-------------|----------------|---------|
| SMR 5.0+ (DSMR 5.0) | ❌ Nee | Elke 5 min |
| SMR 4.x en ouder | ✅ Ja, USB-C | Per uur |

**Image Recognition Flow**
1. Installateur opent meter herkenning
2. Maakt foto of uploadt bestaande foto
3. AI analyseert foto en identificeert meter
4. App toont: merk, model, SMR versie
5. App geeft advies: wel/geen USB-C adapter
6. Bij twijfel: handmatige selectie mogelijk

**Installatie Checklist**
- [ ] P1-poort gelokaliseerd
- [ ] P1Meter aangesloten (met/zonder adapter)
- [ ] LED knippert groen
- [ ] WiFi verbonden met klant netwerk
- [ ] HomeWizard app geïnstalleerd bij klant
- [ ] App toont actueel verbruik
- [ ] Uitleg gegeven aan klant
- [ ] Oplevering bevestigd

### 5.2 Huiseigenaar Instructies

**HomeWizard App Setup**
```
Stap 1: Download de app
        [App Store] [Play Store]

Stap 2: Maak account aan
        → Open app → Registreren → Bevestig email

Stap 3: Voeg P1Meter toe
        → + knop → P1 Meter → Volg instructies
        → Verbind met uw WiFi netwerk

Stap 4: Bekijk uw verbruik
        → Dashboard toont actueel verbruik
        → Historisch verbruik per dag/week/maand
```

**FAQ**
| Vraag | Antwoord |
|-------|----------|
| Geen data zichtbaar? | Controleer of LED groen knippert. Zo niet: stekker eruit/erin. |
| WiFi verbinding kwijt? | Reset P1Meter door 10 sec knop ingedrukt te houden. |
| App toont 0 verbruik? | Controleer of uw slimme meter actief is bij netbeheerder. |

---

## 6. Database Structuur

### 6.1 Entity Relationship Diagram

```
team_members ─────┐
                  │
customers ────────┼──── installations ──── evaluations
    │             │           │
    │             │           │
intake_forms      │     customer_photos
    │             │
issues ───────────┘
                  │
            tasks ┘
```

### 6.2 Tabellen

**team_members**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| user_id | UUID | FK naar Supabase Auth |
| name | TEXT | Volledige naam |
| email | TEXT | Email adres |
| role | ENUM | admin, planner, monteur |
| active | BOOLEAN | Account actief |
| created_at | TIMESTAMP | Aanmaakdatum |

**customers**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| name | TEXT | Naam klant |
| email | TEXT | Email |
| phone | TEXT | Telefoonnummer |
| address | TEXT | Straat + huisnummer |
| postal_code | TEXT | Postcode |
| city | TEXT | Plaats |
| portal_token | TEXT | Unieke token voor portal |
| notes | TEXT | Notities |
| created_at | TIMESTAMP | Aanmaakdatum |

**installations**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| customer_id | UUID | FK naar customers |
| scheduled_at | TIMESTAMP | Geplande datum/tijd |
| duration_minutes | INTEGER | Duur in minuten |
| status | ENUM | scheduled, confirmed, traveling, in_progress, completed, cancelled |
| assigned_to | UUID | FK naar team_members |
| notes | TEXT | Notities |
| created_at | TIMESTAMP | Aanmaakdatum |

**tasks**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| title | TEXT | Titel |
| description | TEXT | Beschrijving |
| scheduled_at | TIMESTAMP | Datum/tijd |
| duration_minutes | INTEGER | Duur (optioneel) |
| assigned_to | UUID | FK naar team_members |
| customer_id | UUID | FK naar customers (optioneel) |
| is_recurring | BOOLEAN | Terugkerend ja/nee |
| recurrence_rule | TEXT | RRULE string |
| status | ENUM | pending, in_progress, completed |
| created_at | TIMESTAMP | Aanmaakdatum |

**intake_forms**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| customer_id | UUID | FK naar customers |
| meter_type | TEXT | Type meterkast |
| accessibility | TEXT | Bereikbaarheid |
| location | TEXT | Locatie meter |
| parking_info | TEXT | Parkeerinformatie |
| pets | TEXT | Huisdieren |
| notes | TEXT | Opmerkingen |
| created_at | TIMESTAMP | Aanmaakdatum |

**customer_photos**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| customer_id | UUID | FK naar customers |
| installation_id | UUID | FK naar installations |
| type | ENUM | pre, post, issue |
| url | TEXT | URL naar Supabase Storage |
| uploaded_at | TIMESTAMP | Upload datum |

**evaluations**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| installation_id | UUID | FK naar installations |
| customer_id | UUID | FK naar customers |
| rating_overall | INTEGER | 1-5 |
| rating_punctuality | INTEGER | 1-5 |
| rating_friendliness | INTEGER | 1-5 |
| rating_quality | INTEGER | 1-5 |
| feedback | TEXT | Opmerkingen |
| confirmed_at | TIMESTAMP | Bevestiging oplevering |
| created_at | TIMESTAMP | Aanmaakdatum |

**issues**
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| customer_id | UUID | FK naar customers |
| installation_id | UUID | FK naar installations |
| category | ENUM | malfunction, question, complaint |
| description | TEXT | Beschrijving |
| photo_url | TEXT | Foto URL (optioneel) |
| status | ENUM | open, in_progress, resolved |
| created_at | TIMESTAMP | Aanmaakdatum |

**smart_meters** (referentiedata)
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| brand | TEXT | Merk (Landis+Gyr, Kaifa, etc.) |
| model | TEXT | Model (E360, MA304, etc.) |
| smr_version | TEXT | SMR versie (4.0, 5.0, etc.) |
| needs_adapter | BOOLEAN | USB-C adapter nodig |
| reference_image_url | TEXT | Referentiefoto voor matching |
| notes | TEXT | Bijzonderheden (bijv. "geen fase-info") |

---

## 7. Navigatiestructuur

### 7.1 Dashboard (Intern)

```
Sidebar:
├── Dashboard (/)
├── Kalender (/calendar)
├── Installaties (/installations)
├── Taken (/tasks)
├── Klanten (/customers)
├── Team (/team) [alleen Admin]
└── Uitloggen
```

### 7.2 Portal (Huiseigenaar)

```
Header:
├── Mijn Afspraak (/)
├── Intake (/intake)
├── Foto's (/upload)
├── Evaluatie (/evaluate) [na installatie]
└── Hulp nodig? (/issues)
```

---

## 8. Niet-functionele Eisen

| Eis | Specificatie |
|-----|--------------|
| Performance | Pagina laadt < 2 seconden |
| Responsive | Werkt op desktop, tablet, mobiel |
| Browser support | Chrome, Safari, Firefox, Edge (laatste 2 versies) |
| Offline | Instructiepagina's cachen als PWA |
| Toegankelijkheid | WCAG 2.1 niveau A |

# p1Meter App - Development Context

> Context document voor AI-assistenten. Lees dit eerst.

## Coderichtlijnen

### Taal
- Code: Engels (variabelen, functies, types)
- UI teksten: Nederlands
- Comments: Nederlands, alleen waar nodig

### Stijl
```typescript
// Functionele componenten, geen classes
export function ComponentName({ prop }: Props) { }

// Named exports, geen default
export { ComponentName }

// Types boven implementatie
type Props = { ... }

// Early returns voor guard clauses
if (!data) return null
```

### Comments
```typescript
/** Haalt klantgegevens op basis van ID */
async function getCustomer(id: string): Promise<Customer>
```
Geen commentaar bij zelfverklarende code.

### Foutafhandeling
- Try-catch bij async operaties
- Gebruikersvriendelijke foutmeldingen
- Log errors server-side, toon generieke melding client-side

---

## Security Richtlijnen

### Authenticatie & Autorisatie
- Supabase Auth voor alle gebruikers
- RLS policies op elke tabel
- Server-side role check bij mutations
- Token-validatie voor portal toegang

### Input Validatie
```typescript
// Altijd valideren met Zod schema
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})
```
- Valideer client-side (UX) én server-side (security)
- Sanitize alle user input voor database queries
- Geen raw SQL, gebruik Supabase query builder

### Environment Variables
```
NEXT_PUBLIC_*  → Alleen publieke waarden (Supabase URL)
Zonder prefix  → Server-only secrets (service keys)
```
- Nooit secrets in client code
- `.env.local` in `.gitignore`

### File Uploads
- Valideer bestandstype (alleen images)
- Max bestandsgrootte: 10MB
- Supabase Storage met RLS
- Genereer unieke bestandsnamen (UUID)

### XSS & Injection
- React escaped standaard JSX
- Geen `dangerouslySetInnerHTML`
- Parameterized queries via Supabase

### Rate Limiting & Abuse Prevention
- Supabase heeft ingebouwde rate limits
- Portal tokens: max 100 requests/uur per token
- File uploads: max 10 per sessie

---

## Project Specificaties

### Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 16, App Router |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Validation | Zod |
| Calendar | FullCalendar |
| Dates | date-fns |
| Recurring | rrule |
| Icons | Lucide React |

### Rollen
| Rol | Scope |
|-----|-------|
| admin | Volledig beheer |
| planner | Klanten, planning |
| energiebuddy | Eigen werk |
| huiseigenaar | Eigen afspraak |

### Database Tabellen
```
team_members    → Interne gebruikers
customers       → Klantgegevens + portal_token
installations   → Geplande installaties
tasks           → Taken (recurring via rrule)
intake_forms    → Pre-installatie info
evaluations     → Post-installatie feedback
issues          → Klant meldingen
customer_photos → Uploads
smart_meters    → Referentie meters
```

### Routes
```
/login              → Auth
/                   → Dashboard
/calendar           → Kalender
/customers          → Klantbeheer
/installations      → Installaties
/tasks              → Taken
/team               → Teambeheer (admin)
/portal?token=x     → Huiseigenaar portal
/instructions/*     → Publieke instructies
```

### Slimme Meter Herkenning
```
Upload foto → Identify meter → Return adapter advice

SMR 5.0+     → Geen adapter
SMR <5.0     → USB-C adapter nodig

Merken: Landis+Gyr, Kaifa, Iskra, Sagemcom, Kamstrup
```

### Externe Bronnen
- https://www.homewizard.com/p1-meter/
- https://helpdesk.homewizard.com/

---

## Architectuur Beslissingen

### Server vs Client Components
```
Server (default): Data fetching, auth checks
Client ('use client'): Interactie, forms, state
```

### Data Fetching
```typescript
// Server Component
const data = await supabase.from('table').select()

// Client: React Query of SWR voor caching
```

### State Management
- URL state voor filters/pagination
- React state voor UI
- Geen globale state library nodig

### Error Boundaries
- Layout-level error boundaries
- Fallback UI bij crashes

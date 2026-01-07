-- Testdata voor p1Meter Installatie App
-- Voer dit uit in Supabase SQL Editor

-- ============================================
-- 1. Extra Team Members (naast admin Matthi)
-- ============================================
INSERT INTO team_members (name, email, role, active) VALUES
  ('Jan de Vries', 'jan@p1meter.nl', 'monteur', true),
  ('Pieter Bakker', 'pieter@p1meter.nl', 'monteur', true),
  ('Lisa van Dijk', 'lisa@p1meter.nl', 'planner', true),
  ('Karin Smit', 'karin@p1meter.nl', 'planner', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. Smart Meters (referentie data)
-- ============================================
INSERT INTO smart_meters (brand, model, smr_version, needs_adapter, notes) VALUES
  ('Landis+Gyr', 'E350', '5.0', false, 'Meest voorkomende meter, directe aansluiting'),
  ('Landis+Gyr', 'E360', '5.0', false, 'Nieuwer model, directe aansluiting'),
  ('Kaifa', 'MA105', '4.2', true, 'USB-C adapter vereist'),
  ('Kaifa', 'MA304', '5.0', false, 'Directe aansluiting mogelijk'),
  ('Iskra', 'AM550', '5.0', false, 'Directe aansluiting'),
  ('Sagemcom', 'T210-D', '5.0', false, 'Directe aansluiting'),
  ('Sagemcom', 'XS210', '4.0', true, 'USB-C adapter vereist'),
  ('Kamstrup', '162', '4.2', true, 'USB-C adapter vereist');

-- ============================================
-- 3. Klanten (Customers)
-- ============================================
INSERT INTO customers (name, email, phone, address, postal_code, city, latitude, longitude, notes) VALUES
  ('Familie Jansen', 'jansen@email.nl', '06-12345678', 'Hoofdstraat 12', '1234 AB', 'Amsterdam', 52.3676, 4.9041, 'Appartement 3e verdieping'),
  ('De heer Pietersen', 'pietersen@email.nl', '06-23456789', 'Kerkweg 45', '5678 CD', 'Rotterdam', 51.9225, 4.4792, 'Hond aanwezig'),
  ('Mevrouw de Boer', 'deboer@email.nl', '06-34567890', 'Stationsplein 8', '9012 EF', 'Utrecht', 52.0907, 5.1214, NULL),
  ('Familie van den Berg', 'vandenberg@email.nl', '06-45678901', 'Dorpsstraat 23', '3456 GH', 'Den Haag', 52.0705, 4.3007, 'Graag bellen voor aankomst'),
  ('De heer Visser', 'visser@email.nl', '06-56789012', 'Marktplein 5', '7890 IJ', 'Eindhoven', 51.4416, 5.4697, 'Meterkast in garage'),
  ('Mevrouw Bakker', 'mbakker@email.nl', '06-67890123', 'Parkweg 67', '2345 KL', 'Groningen', 53.2194, 6.5665, NULL),
  ('Familie Mulder', 'mulder@email.nl', '06-78901234', 'Langestraat 89', '6789 MN', 'Tilburg', 51.5555, 5.0913, 'Sleutel bij buren nr 87'),
  ('De heer de Groot', 'degroot@email.nl', '06-89012345', 'Nieuwstraat 34', '0123 OP', 'Almere', 52.3508, 5.2647, NULL),
  ('Mevrouw Hendriks', 'hendriks@email.nl', '06-90123456', 'Molenweg 56', '4567 QR', 'Breda', 51.5719, 4.7683, 'Meterkast moeilijk bereikbaar'),
  ('Familie Dekker', 'dekker@email.nl', '06-01234567', 'Schoolstraat 78', '8901 ST', 'Nijmegen', 51.8126, 5.8372, NULL)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. Installaties
-- ============================================
INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, smart_meter_id, notes)
SELECT
  c.id,
  CURRENT_DATE + TIME '09:00',
  45,
  'scheduled',
  t.id,
  m.id,
  'Eerste installatie van de dag'
FROM customers c, team_members t, smart_meters m
WHERE c.email = 'jansen@email.nl'
  AND t.email = 'jan@p1meter.nl'
  AND m.model = 'E350'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, smart_meter_id, notes)
SELECT
  c.id,
  CURRENT_DATE + TIME '10:30',
  60,
  'scheduled',
  t.id,
  m.id,
  'Adapter meenemen'
FROM customers c, team_members t, smart_meters m
WHERE c.email = 'pietersen@email.nl'
  AND t.email = 'jan@p1meter.nl'
  AND m.model = 'MA105'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + TIME '09:30',
  45,
  'scheduled',
  t.id,
  NULL
FROM customers c, team_members t
WHERE c.email = 'deboer@email.nl'
  AND t.email = 'pieter@p1meter.nl'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + TIME '11:00',
  45,
  'confirmed',
  t.id,
  'Klant heeft bevestigd'
FROM customers c, team_members t
WHERE c.email = 'vandenberg@email.nl'
  AND t.email = 'pieter@p1meter.nl'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
  45,
  'scheduled',
  t.id,
  NULL
FROM customers c, team_members t
WHERE c.email = 'visser@email.nl'
  AND t.email = 'jan@p1meter.nl'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + INTERVAL '1 day' + TIME '10:30',
  60,
  'confirmed',
  t.id,
  'Klant heeft bevestigd via telefoon'
FROM customers c, team_members t
WHERE c.email = 'mbakker@email.nl'
  AND t.email = 'jan@p1meter.nl'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + INTERVAL '1 day' + TIME '13:00',
  45,
  'scheduled',
  t.id,
  NULL
FROM customers c, team_members t
WHERE c.email = 'mulder@email.nl'
  AND t.email = 'pieter@p1meter.nl'
LIMIT 1;

INSERT INTO installations (customer_id, scheduled_at, duration_minutes, status, assigned_to, notes)
SELECT
  c.id,
  CURRENT_DATE + INTERVAL '2 days' + TIME '09:00',
  45,
  'scheduled',
  t.id,
  NULL
FROM customers c, team_members t
WHERE c.email = 'degroot@email.nl'
  AND t.email = 'jan@p1meter.nl'
LIMIT 1;

-- ============================================
-- 5. Taken (Tasks)
-- ============================================
INSERT INTO tasks (title, description, scheduled_at, duration_minutes, assigned_to, status, is_recurring)
SELECT
  'Voorraad controleren',
  'P1 meters en adapters tellen',
  CURRENT_DATE + TIME '08:00',
  30,
  t.id,
  'pending',
  true
FROM team_members t WHERE t.email = 'jan@p1meter.nl';

INSERT INTO tasks (title, description, scheduled_at, duration_minutes, assigned_to, status, is_recurring)
SELECT
  'Busje tanken',
  NULL,
  CURRENT_DATE + TIME '17:00',
  15,
  t.id,
  'pending',
  false
FROM team_members t WHERE t.email = 'pieter@p1meter.nl';

INSERT INTO tasks (title, description, scheduled_at, duration_minutes, assigned_to, status, is_recurring)
SELECT
  'Weekplanning maken',
  'Installaties voor volgende week inplannen',
  CURRENT_DATE + INTERVAL '4 days' + TIME '09:00',
  120,
  t.id,
  'pending',
  true
FROM team_members t WHERE t.email = 'lisa@p1meter.nl';

INSERT INTO tasks (title, description, scheduled_at, duration_minutes, assigned_to, status, is_recurring)
SELECT
  'Klantcontact nabellen',
  'Openstaande vragen beantwoorden',
  CURRENT_DATE + INTERVAL '1 day' + TIME '14:00',
  60,
  t.id,
  'pending',
  false
FROM team_members t WHERE t.email = 'lisa@p1meter.nl';

-- ============================================
-- Resultaat tonen
-- ============================================
SELECT
  (SELECT COUNT(*) FROM team_members) as team_members,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM smart_meters) as smart_meters,
  (SELECT COUNT(*) FROM installations) as installations,
  (SELECT COUNT(*) FROM tasks) as tasks;

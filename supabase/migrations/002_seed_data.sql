-- ============================================
-- Klantportaal 2.0 - Seed Data
-- Subsidies, Maatregelen, Referentiedata
-- ============================================

-- ============================================
-- SUBSIDIE PROGRAMMA'S
-- ============================================

INSERT INTO subsidy_programs (name, slug, description, amount_min, amount_max, amount_fixed, max_woz_value, max_build_year, valid_from, valid_until, info_url, application_url, active) VALUES

-- Waarde Check Bon A16
(
  'Waarde Check Bon A16',
  'waarde-check',
  'Gratis tegoed van €2000 voor bewoners in de regio van de Windmolens A16. Te besteden aan energiebesparende maatregelen.',
  NULL,
  NULL,
  2000,
  NULL,
  NULL,
  '2024-01-01',
  '2026-12-31',
  'https://www.waardecheck.nl',
  NULL,
  true
),

-- NIP Subsidie
(
  'NIP Subsidie',
  'nip',
  'Nationaal Isolatieprogramma - subsidie voor isolatie van woningen gebouwd vóór 1993. Bedrag afhankelijk van WOZ-waarde.',
  1000,
  2000,
  NULL,
  477000,
  1992,
  '2024-01-01',
  '2026-12-31',
  'https://www.rvo.nl/subsidies-financiering/nip',
  'https://mijn.rvo.nl/',
  true
),

-- ISDE
(
  'ISDE Subsidie',
  'isde',
  'Investeringssubsidie Duurzame Energie - subsidie voor warmtepompen, zonneboilers en isolatie.',
  500,
  5600,
  NULL,
  NULL,
  NULL,
  '2024-01-01',
  NULL,
  'https://www.rvo.nl/subsidies-financiering/isde',
  'https://mijn.rvo.nl/isde',
  true
),

-- Stimuleringslening
(
  'Stimuleringslening Moerdijk',
  'stimuleringslening',
  'Voordelige lening tegen 1,7% rente voor energiebesparende maatregelen. Gemeente Moerdijk.',
  2500,
  35000,
  NULL,
  NULL,
  NULL,
  '2024-01-01',
  NULL,
  'https://www.moerdijk.nl/stimuleringslening',
  'https://www.moerdijk.nl/stimuleringslening',
  true
);

-- ============================================
-- ENERGIE MAATREGELEN
-- ============================================

INSERT INTO energy_measures (name, slug, category, description, cost_indication_min, cost_indication_max, saving_gas_m3_year, saving_euro_year, payback_years_min, payback_years_max, co2_reduction_kg_year, eligible_subsidies, priority_order, active) VALUES

-- Isolatie
(
  'Spouwmuurisolatie',
  'spouwmuurisolatie',
  'isolatie',
  'Isolatie van de spouwmuur door het inspuiten van isolatiemateriaal. Geschikt voor woningen met een lege spouw (meestal 1920-1980).',
  1200,
  2500,
  300,
  450,
  3,
  6,
  570,
  ARRAY['nip', 'waarde-check'],
  1,
  true
),

(
  'Dakisolatie',
  'dakisolatie',
  'isolatie',
  'Isolatie van het dak aan de binnen- of buitenzijde. Zeer effectief voor warmtebehoud.',
  2500,
  6000,
  250,
  375,
  7,
  16,
  475,
  ARRAY['nip', 'waarde-check', 'isde'],
  2,
  true
),

(
  'Vloerisolatie',
  'vloerisolatie',
  'isolatie',
  'Isolatie van de vloer aan de onderzijde (kruipruimte) of bovenzijde.',
  1000,
  2500,
  120,
  180,
  6,
  14,
  230,
  ARRAY['nip', 'waarde-check', 'isde'],
  3,
  true
),

(
  'HR++ Glas',
  'hr-plus-plus-glas',
  'isolatie',
  'Hoogrendementsglas met zeer goede isolatiewaarde (U-waarde 1.1 of lager).',
  3000,
  8000,
  150,
  225,
  13,
  35,
  285,
  ARRAY['isde', 'waarde-check'],
  4,
  true
),

(
  'Triple Glas',
  'triple-glas',
  'isolatie',
  'Driedubbel glas met de beste isolatiewaarde (U-waarde 0.6 of lager).',
  5000,
  12000,
  200,
  300,
  17,
  40,
  380,
  ARRAY['isde', 'waarde-check'],
  5,
  true
),

-- Installaties
(
  'Hybride Warmtepomp',
  'hybride-warmtepomp',
  'installatie',
  'Combinatie van warmtepomp en CV-ketel. Ideaal voor bestaande woningen met beperkte isolatie.',
  4000,
  7000,
  500,
  750,
  5,
  9,
  950,
  ARRAY['isde', 'waarde-check'],
  6,
  true
),

(
  'Lucht-water Warmtepomp',
  'lucht-water-warmtepomp',
  'installatie',
  'Volledige warmtepomp die warmte uit de buitenlucht haalt. Vervangt de CV-ketel volledig.',
  8000,
  15000,
  1200,
  1800,
  4,
  8,
  2280,
  ARRAY['isde', 'waarde-check'],
  7,
  true
),

(
  'Grond-water Warmtepomp',
  'grond-water-warmtepomp',
  'installatie',
  'Warmtepomp die warmte uit de bodem haalt. Meest efficiënt maar hogere installatiekosten.',
  15000,
  25000,
  1400,
  2100,
  7,
  12,
  2660,
  ARRAY['isde'],
  8,
  true
),

(
  'Zonneboiler',
  'zonneboiler',
  'installatie',
  'Verwarmt tapwater met zonne-energie. Bespaart 50-70% op warmwaterkosten.',
  2000,
  4000,
  150,
  225,
  9,
  18,
  285,
  ARRAY['isde'],
  9,
  true
),

-- Opwek
(
  'Zonnepanelen',
  'zonnepanelen',
  'opwek',
  'Opwekken van eigen elektriciteit. Gemiddeld 8-12 panelen voor gemiddeld huishouden.',
  4000,
  10000,
  NULL,
  700,
  6,
  10,
  1500,
  ARRAY['waarde-check'],
  10,
  true
),

(
  'Thuisbatterij',
  'thuisbatterij',
  'opwek',
  'Opslag van zelf opgewekte energie. Maakt je minder afhankelijk van het net.',
  5000,
  12000,
  NULL,
  300,
  15,
  40,
  200,
  ARRAY[]::TEXT[],
  11,
  true
);

-- ============================================
-- BOUWPERIODE KENMERKEN
-- ============================================

INSERT INTO building_period_characteristics (period_name, period_slug, year_from, year_to, wall_type, wall_insulation_cm, roof_insulation_cm, floor_insulation, floor_type, glass_type, has_gas_connection, typical_heating, improvement_potential, description) VALUES

(
  'Tot 1925 - Massieve muren',
  'tot_1925',
  0,
  1924,
  'massief',
  NULL,
  NULL,
  false,
  'hout',
  'enkel',
  true,
  'cv_ketel',
  'zeer_hoog',
  'Massieve muren (steens/anderhalfsteens), vochtdoorslag, geen isolatie'
),

(
  '1925-1945 - Begin spouwmuren',
  '1925_1945',
  1925,
  1945,
  'spouw_leeg',
  NULL,
  NULL,
  false,
  'hout',
  'enkel',
  true,
  'cv_ketel',
  'zeer_hoog',
  'Begin spouwmuren (jaren 30), nog geen isolatie'
),

(
  '1945-1975 - Spouwmuren standaard',
  '1945_1975',
  1945,
  1975,
  'spouw_leeg',
  NULL,
  NULL,
  false,
  'beton',
  'enkel',
  true,
  'cv_ketel',
  'zeer_hoog',
  'Standaard spouwmuren, beton vloeren (60s), geen isolatie'
),

(
  '1975-1987 - Eerste isolatie',
  '1975_1987',
  1975,
  1987,
  'spouw_gedeeltelijk',
  2,
  3,
  false,
  'beton',
  'dubbel',
  true,
  'cv_ketel',
  'hoog',
  'Eerste isolatiemaatregelen: ~2cm spouw, variërende dakisolatie, dubbel glas BG'
),

(
  '1987-1992 - Redelijke isolatie',
  '1987_1992',
  1987,
  1992,
  'spouw_vol',
  5,
  8,
  true,
  'beton',
  'dubbel',
  true,
  'cv_ketel',
  'gemiddeld',
  'Volledig geïsoleerde spouw, redelijke dak/vloer isolatie'
),

(
  '1992-2014 - Bouwbesluit isolatie',
  '1992_2014',
  1992,
  2014,
  'spouw_vol',
  8,
  12,
  true,
  'beton',
  'hr_plus_plus',
  true,
  'cv_ketel',
  'laag',
  'Goede isolatie door Bouwbesluit 1992, HR++ glas standaard vanaf 2000'
),

(
  '2015-2018 - Hoge isolatie',
  '2015_2018',
  2015,
  2018,
  'spouw_vol',
  12,
  18,
  true,
  'beton',
  'hr_plus_plus',
  true,
  'cv_ketel',
  'zeer_laag',
  'Zeer hoge isolatiewaardes (Bouwbesluit 2012), triple glas introductie'
),

(
  '2019-2023 - BENG',
  '2019_2023',
  2019,
  2023,
  'spouw_vol',
  15,
  20,
  true,
  'beton',
  'triple',
  false,
  'warmtepomp',
  'minimaal',
  'BENG-eisen, geen gas, warmtepomp standaard, triple glas'
),

(
  'Vanaf 2024 - Nul-op-de-Meter',
  'vanaf_2024',
  2024,
  NULL,
  'spouw_vol',
  18,
  25,
  true,
  'beton',
  'triple',
  false,
  'warmtepomp',
  'geen',
  'Energieneutraal (NOM), zeer luchtdicht, thuisbatterij'
);

-- ============================================
-- REFERENTIE VERBRUIK
-- ============================================

INSERT INTO reference_households (property_type, build_period, size_category, gas_m3_min, gas_m3_max, gas_m3_avg, electricity_kwh_min, electricity_kwh_max, electricity_kwh_avg, source, year, notes) VALUES

-- Vrijstaand
('vrijstaand', 'voor_1975', 'groot', 2800, 3500, 3150, 4000, 5000, 4500, 'CBS/Milieu Centraal', 2024, 'Slechte isolatie, groot woonoppervlak'),
('vrijstaand', '1975_1995', 'groot', 2000, 2600, 2300, 3500, 4500, 4000, 'CBS/Milieu Centraal', 2024, 'Enige isolatie aanwezig'),
('vrijstaand', '1995_2015', 'groot', 1400, 1800, 1600, 3200, 4000, 3600, 'CBS/Milieu Centraal', 2024, 'Goede isolatie'),

-- Twee-onder-een-kap
('twee_onder_een_kap', 'voor_1975', 'middelgroot', 2200, 2800, 2500, 3500, 4500, 4000, 'CBS/Milieu Centraal', 2024, 'Beperkte isolatie'),
('twee_onder_een_kap', '1975_1995', 'middelgroot', 1600, 2100, 1850, 3000, 4000, 3500, 'CBS/Milieu Centraal', 2024, 'Matige isolatie'),
('twee_onder_een_kap', '1995_2015', 'middelgroot', 1100, 1500, 1300, 2800, 3600, 3200, 'CBS/Milieu Centraal', 2024, 'Goede isolatie'),

-- Rijtjeswoning / Tussenwoning
('tussenwoning', 'voor_1975', 'middelgroot', 1600, 2000, 1800, 3000, 4000, 3500, 'CBS/Milieu Centraal', 2024, 'Voordeel van aangrenzende woningen'),
('tussenwoning', '1975_1995', 'middelgroot', 1200, 1600, 1400, 2800, 3600, 3200, 'CBS/Milieu Centraal', 2024, 'Gemiddeld verbruik'),
('tussenwoning', '1995_2015', 'middelgroot', 900, 1200, 1050, 2600, 3400, 3000, 'CBS/Milieu Centraal', 2024, 'Goede isolatie'),

-- Hoekwoning
('hoekwoning', 'voor_1975', 'middelgroot', 1800, 2200, 2000, 3200, 4200, 3700, 'CBS/Milieu Centraal', 2024, 'Extra buitenmuur, beperkte isolatie'),
('hoekwoning', '1975_1995', 'middelgroot', 1400, 1800, 1600, 2900, 3700, 3300, 'CBS/Milieu Centraal', 2024, 'Extra buitenmuur, matige isolatie'),
('hoekwoning', '1995_2015', 'middelgroot', 1000, 1300, 1150, 2700, 3500, 3100, 'CBS/Milieu Centraal', 2024, 'Goede isolatie'),

-- Appartement
('appartement', 'voor_1975', 'klein', 1000, 1400, 1200, 2500, 3500, 3000, 'CBS/Milieu Centraal', 2024, 'Kleinere warmtevraag'),
('appartement', '1975_1995', 'klein', 800, 1100, 950, 2300, 3200, 2750, 'CBS/Milieu Centraal', 2024, 'Relatief zuinig'),
('appartement', '1995_2015', 'klein', 600, 900, 750, 2100, 2900, 2500, 'CBS/Milieu Centraal', 2024, 'Goede isolatie, compact');

-- ============================================
-- ACHIEVEMENTS / BADGES
-- ============================================

INSERT INTO achievements (name, slug, description, icon, points, active) VALUES

('P1 Pionier', 'p1-pionier', 'P1 meter geïnstalleerd en actief', '🔌', 100, true),
('Energie Bewust', 'energie-bewust', 'Eerste maand verbruiksdata verzameld', '📊', 50, true),
('Dossier Compleet', 'dossier-compleet', 'Huisdossier volledig ingevuld', '📋', 75, true),
('Eerste Stap', 'eerste-stap', 'Eerste energiebesparende maatregel uitgevoerd', '🌱', 150, true),
('Isolatie Kampioen', 'isolatie-kampioen', 'Alle isolatiemaatregelen uitgevoerd', '🏆', 500, true),
('Labelspringer', 'labelspringer', 'Energielabel met minimaal 2 stappen verbeterd', '🏠', 300, true),
('Bespaar Held', 'bespaar-held', '10% onder wijkgemiddelde verbruik', '💪', 200, true),
('Zonkracht', 'zonkracht', 'Zonnepanelen geïnstalleerd', '☀️', 250, true),
('Gasvrij Genie', 'gasvrij-genie', 'Volledig van het gas af', '🌍', 1000, true),
('2050 Ready', '2050-ready', 'Woning energieneutraal gemaakt', '🎯', 2000, true);

-- ============================================
-- ROADMAP TEMPLATES
-- ============================================

INSERT INTO roadmap_templates (name, slug, description, target_energy_labels, target_property_types, steps, active) VALUES

(
  'Van Label D naar A',
  'label-d-naar-a',
  'Stapsgewijze verbetering van energielabel D naar A voor rijtjeswoningen en twee-onder-een-kap',
  ARRAY['D', 'E'],
  ARRAY['tussenwoning', 'hoekwoning', 'twee_onder_een_kap']::property_type[],
  '[
    {"order": 1, "measure_slug": "spouwmuurisolatie", "reason": "Grootste impact, laagste kosten, NIP subsidie beschikbaar"},
    {"order": 2, "measure_slug": "dakisolatie", "reason": "Tot 30% warmteverlies via dak"},
    {"order": 3, "measure_slug": "vloerisolatie", "reason": "Comfort verbetering, NIP subsidie"},
    {"order": 4, "measure_slug": "hr-plus-plus-glas", "reason": "Comfort en isolatie, ISDE subsidie"},
    {"order": 5, "measure_slug": "hybride-warmtepomp", "reason": "Ideaal na isolatie, ISDE subsidie"}
  ]'::jsonb,
  true
),

(
  'Oude Woning Opknappen',
  'oude-woning',
  'Complete renovatie voor woningen van vóór 1975',
  ARRAY['E', 'F', 'G'],
  ARRAY['vrijstaand', 'twee_onder_een_kap', 'hoekwoning', 'tussenwoning']::property_type[],
  '[
    {"order": 1, "measure_slug": "spouwmuurisolatie", "reason": "Lege spouw isoleren, NIP subsidie €2000"},
    {"order": 2, "measure_slug": "dakisolatie", "reason": "Groot warmteverlies bij oude daken"},
    {"order": 3, "measure_slug": "vloerisolatie", "reason": "Koude vloeren aanpakken"},
    {"order": 4, "measure_slug": "hr-plus-plus-glas", "reason": "Vervang enkel/dubbel glas"},
    {"order": 5, "measure_slug": "hybride-warmtepomp", "reason": "Na isolatie: efficiënt verwarmen"},
    {"order": 6, "measure_slug": "zonnepanelen", "reason": "Eigen stroom opwekken"}
  ]'::jsonb,
  true
),

(
  'Gasvrij Maken',
  'gasvrij',
  'Volledig van het gas af voor goed geïsoleerde woningen',
  ARRAY['A', 'B', 'C'],
  ARRAY['vrijstaand', 'twee_onder_een_kap', 'hoekwoning', 'tussenwoning']::property_type[],
  '[
    {"order": 1, "measure_slug": "lucht-water-warmtepomp", "reason": "CV-ketel vervangen door warmtepomp"},
    {"order": 2, "measure_slug": "zonnepanelen", "reason": "Extra stroom voor warmtepomp"},
    {"order": 3, "measure_slug": "thuisbatterij", "reason": "Opslag voor eigen gebruik"}
  ]'::jsonb,
  true
);

-- ============================================
-- WIJKSTATISTIEKEN (voorbeeld data)
-- ============================================

INSERT INTO neighborhood_stats (postal_code_4, avg_electricity_kwh_year, avg_gas_m3_year, avg_energy_label, solar_adoption_percentage, heat_pump_adoption_percentage, participation_count, year) VALUES

('4765', 3200, 1650, 'D', 25, 5, 45, 2024),  -- Zevenbergschen Hoek
('4781', 3400, 1800, 'E', 20, 3, 120, 2024), -- Moerdijk
('4782', 3300, 1750, 'D', 22, 4, 85, 2024),  -- Moerdijk
('4767', 3100, 1600, 'D', 28, 6, 35, 2024);  -- Langeweg

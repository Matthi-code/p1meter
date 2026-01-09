-- ============================================
-- Klantportaal 2.0 - Database Migration
-- Huisdossier, Subsidies, Actieplan, Energie Buddy Workflow
-- ============================================

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE property_type AS ENUM (
  'vrijstaand',
  'twee_onder_een_kap',
  'hoekwoning',
  'tussenwoning',
  'appartement',
  'overig'
);

CREATE TYPE wall_type AS ENUM (
  'massief',
  'spouw_leeg',
  'spouw_gedeeltelijk',
  'spouw_vol'
);

CREATE TYPE glass_type AS ENUM (
  'enkel',
  'dubbel',
  'hr',
  'hr_plus',
  'hr_plus_plus',
  'triple'
);

CREATE TYPE heating_type AS ENUM (
  'cv_ketel',
  'warmtepomp',
  'hybride',
  'stadsverwarming',
  'elektrisch',
  'overig'
);

CREATE TYPE subsidy_status AS ENUM (
  'eligible',
  'interested',
  'applied',
  'approved',
  'rejected',
  'paid'
);

CREATE TYPE action_item_status AS ENUM (
  'suggested',
  'interested',
  'planned',
  'in_progress',
  'completed',
  'skipped'
);

CREATE TYPE workflow_stage AS ENUM (
  'lead',
  'contacted',
  'visit_scheduled',
  'visit_completed',
  'interested',
  'intake_received',
  'installation_scheduled',
  'installation_completed',
  'activated',
  'onboarded'
);

CREATE TYPE visit_outcome AS ENUM (
  'interested',
  'not_home',
  'not_interested',
  'callback_requested'
);

CREATE TYPE improvement_potential AS ENUM (
  'geen',
  'minimaal',
  'zeer_laag',
  'laag',
  'gemiddeld',
  'hoog',
  'zeer_hoog'
);

-- ============================================
-- HUISDOSSIER TABELLEN
-- ============================================

-- Woningprofiel
CREATE TABLE house_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Basisgegevens
  property_type property_type,
  year_built INTEGER,
  living_area_m2 INTEGER,
  plot_size_m2 INTEGER,
  floors INTEGER,

  -- WOZ gegevens
  woz_value INTEGER,
  woz_year INTEGER,
  woz_reference_date DATE,

  -- Energie label
  energy_label TEXT, -- 'A++++' tot 'G'
  energy_label_date DATE,
  energy_index DECIMAL,

  -- Bouwkundige gegevens
  roof_type TEXT, -- 'plat', 'schuin', 'zadeldak'
  wall_type wall_type,
  wall_insulation BOOLEAN DEFAULT false,
  wall_insulation_cm INTEGER,
  floor_insulation BOOLEAN DEFAULT false,
  roof_insulation BOOLEAN DEFAULT false,
  glass_type glass_type,

  -- Installaties
  heating_type heating_type,
  heating_year INTEGER,
  solar_panels BOOLEAN DEFAULT false,
  solar_panels_count INTEGER,
  solar_panels_wp INTEGER,
  has_battery BOOLEAN DEFAULT false,

  -- BAG referentie
  bag_id TEXT,

  -- Automatisch geschatte waarden op basis van bouwjaar
  estimated_from_year BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Klant ingevoerd energieverbruik
CREATE TABLE customer_energy_input (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Bron van de data
  source TEXT NOT NULL, -- 'jaarafrekening', 'meterstand', 'schatting', 'p1_meter'

  -- Periode
  year INTEGER NOT NULL,
  period_months INTEGER DEFAULT 12,

  -- Gas
  gas_m3 INTEGER,
  gas_cost_euro DECIMAL(10, 2),

  -- Elektriciteit levering
  electricity_kwh_total INTEGER,
  electricity_kwh_high INTEGER,
  electricity_kwh_low INTEGER,
  electricity_cost_euro DECIMAL(10, 2),

  -- Elektriciteit teruglevering (zonnepanelen)
  electricity_returned_kwh INTEGER,
  electricity_returned_euro DECIMAL(10, 2),

  -- Energieleverancier info
  energy_supplier TEXT,
  contract_type TEXT, -- 'vast', 'variabel'

  -- Verificatie
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES team_members(id),
  verified_at TIMESTAMPTZ,

  -- Upload van jaarafrekening foto
  receipt_photo_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bouwperiode referentiedata
CREATE TABLE building_period_characteristics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  period_name TEXT NOT NULL,
  period_slug TEXT NOT NULL UNIQUE,
  year_from INTEGER NOT NULL,
  year_to INTEGER,

  -- Standaard isolatie kenmerken
  wall_type wall_type,
  wall_insulation_cm INTEGER,
  roof_insulation_cm INTEGER,
  floor_insulation BOOLEAN DEFAULT false,
  floor_type TEXT,
  glass_type glass_type,

  -- Rc-waarden (indien bekend)
  rc_wall DECIMAL(3, 1),
  rc_roof DECIMAL(3, 1),
  rc_floor DECIMAL(3, 1),

  -- Overige kenmerken
  has_gas_connection BOOLEAN DEFAULT true,
  typical_heating heating_type,

  improvement_potential improvement_potential,
  description TEXT
);

-- Referentiewoning verbruik
CREATE TABLE reference_households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  property_type property_type,
  build_period TEXT NOT NULL, -- 'voor_1975', '1975_1995', '1995_2015', '2015_heden'
  size_category TEXT, -- 'klein', 'middelgroot', 'groot'
  size_m2_min INTEGER,
  size_m2_max INTEGER,
  household_size INTEGER,

  -- Verbruik ranges
  gas_m3_min INTEGER,
  gas_m3_max INTEGER,
  gas_m3_avg INTEGER,

  electricity_kwh_min INTEGER,
  electricity_kwh_max INTEGER,
  electricity_kwh_avg INTEGER,

  -- Met zonnepanelen
  electricity_with_solar_kwh INTEGER,
  solar_return_kwh INTEGER,

  source TEXT, -- 'CBS', 'Milieu Centraal', 'Nibud'
  year INTEGER,

  notes TEXT
);

-- ============================================
-- SUBSIDIE TABELLEN
-- ============================================

-- Beschikbare subsidie programma's
CREATE TABLE subsidy_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Bedragen
  amount_min INTEGER,
  amount_max INTEGER,
  amount_fixed INTEGER,

  -- Voorwaarden
  requirements JSONB,
  eligible_property_types property_type[],
  eligible_energy_labels TEXT[],
  max_woz_value INTEGER,
  max_build_year INTEGER,

  -- Geldigheid
  valid_from DATE,
  valid_until DATE,
  budget_total INTEGER,
  budget_remaining INTEGER,

  -- Links
  info_url TEXT,
  application_url TEXT,

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Klant subsidie status
CREATE TABLE customer_subsidies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subsidy_program_id UUID NOT NULL REFERENCES subsidy_programs(id),

  -- Status tracking
  status subsidy_status NOT NULL DEFAULT 'eligible',

  -- Bedragen
  amount_eligible INTEGER,
  amount_requested INTEGER,
  amount_approved INTEGER,
  amount_paid INTEGER,

  -- Datums
  interest_shown_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Documenten
  application_reference TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subsidie documenten
CREATE TABLE subsidy_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_subsidy_id UUID NOT NULL REFERENCES customer_subsidies(id) ON DELETE CASCADE,

  document_type TEXT, -- 'application', 'approval', 'invoice', 'proof'
  filename TEXT,
  url TEXT,

  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIEPLAN TABELLEN
-- ============================================

-- Energiebesparende maatregelen catalogus
CREATE TABLE energy_measures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'isolatie', 'opwek', 'installatie', 'gedrag'

  description TEXT,

  -- Kosten indicatie
  cost_indication_min INTEGER,
  cost_indication_max INTEGER,

  -- Besparing indicatie
  saving_electricity_kwh_year INTEGER,
  saving_gas_m3_year INTEGER,
  saving_euro_year INTEGER,

  -- Terugverdientijd
  payback_years_min INTEGER,
  payback_years_max INTEGER,

  -- CO2 reductie
  co2_reduction_kg_year INTEGER,

  -- Subsidie koppeling
  eligible_subsidies TEXT[], -- ['NIP', 'ISDE', 'waarde_check']

  -- Vereisten
  requirements JSONB,
  applicable_property_types property_type[],
  applicable_build_periods TEXT[],

  priority_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roadmap templates
CREATE TABLE roadmap_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Target doelgroep
  target_energy_labels TEXT[],
  target_property_types property_type[],

  -- Stappen in volgorde
  steps JSONB NOT NULL, -- Array van {order, measure_slug, reason, dependencies}

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Klant actieplan items
CREATE TABLE customer_action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  measure_id UUID NOT NULL REFERENCES energy_measures(id),

  -- Status
  status action_item_status NOT NULL DEFAULT 'suggested',

  -- Personalisatie
  estimated_cost INTEGER,
  estimated_saving INTEGER,
  estimated_subsidy INTEGER,
  net_cost INTEGER,
  priority INTEGER,

  -- Planning
  target_date DATE,
  completed_date DATE,

  -- Notities
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Klant roadmaps
CREATE TABLE customer_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES roadmap_templates(id),

  -- Gepersonaliseerde versie
  steps JSONB, -- Kopie van template + aanpassingen

  -- Voortgang
  current_step INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ENERGIE BUDDY WORKFLOW TABELLEN
-- ============================================

-- Uitgebreide installatie workflow
CREATE TABLE installation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installation_id UUID REFERENCES installations(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Workflow status
  stage workflow_stage NOT NULL DEFAULT 'lead',

  -- Bezoek details
  visit_outcome visit_outcome,
  visit_notes TEXT,

  -- Interesse tracking
  interest_level INTEGER CHECK (interest_level >= 1 AND interest_level <= 5),
  objections TEXT[],

  -- Energie Buddy
  assigned_buddy_id UUID REFERENCES team_members(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow activiteiten log
CREATE TABLE workflow_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES installation_workflows(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL, -- 'call', 'visit', 'email', 'sms', 'note', 'status_change'
  description TEXT,
  outcome TEXT,

  performed_by UUID REFERENCES team_members(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXTRA FEATURES TABELLEN
-- ============================================

-- Wijkstatistieken (geaggregeerd)
CREATE TABLE neighborhood_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  postal_code_4 TEXT NOT NULL,

  avg_electricity_kwh_year INTEGER,
  avg_gas_m3_year INTEGER,
  avg_energy_label TEXT,

  solar_adoption_percentage INTEGER,
  heat_pump_adoption_percentage INTEGER,
  participation_count INTEGER DEFAULT 0,

  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(postal_code_4, year)
);

-- Achievements/Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,

  trigger_condition JSONB,
  points INTEGER DEFAULT 0,

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Klant achievements
CREATE TABLE customer_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),

  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(customer_id, achievement_id)
);

-- Klant documenten
CREATE TABLE customer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL, -- 'energy_label', 'installation_certificate', 'subsidy_approval', 'warranty'
  title TEXT NOT NULL,
  description TEXT,

  file_url TEXT NOT NULL,
  file_type TEXT,

  valid_until DATE,

  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_house_profiles_customer ON house_profiles(customer_id);
CREATE INDEX idx_customer_energy_input_customer ON customer_energy_input(customer_id);
CREATE INDEX idx_customer_energy_input_year ON customer_energy_input(year);
CREATE INDEX idx_customer_subsidies_customer ON customer_subsidies(customer_id);
CREATE INDEX idx_customer_subsidies_status ON customer_subsidies(status);
CREATE INDEX idx_customer_action_items_customer ON customer_action_items(customer_id);
CREATE INDEX idx_customer_action_items_status ON customer_action_items(status);
CREATE INDEX idx_installation_workflows_customer ON installation_workflows(customer_id);
CREATE INDEX idx_installation_workflows_stage ON installation_workflows(stage);
CREATE INDEX idx_installation_workflows_buddy ON installation_workflows(assigned_buddy_id);
CREATE INDEX idx_workflow_activities_workflow ON workflow_activities(workflow_id);
CREATE INDEX idx_neighborhood_stats_postal ON neighborhood_stats(postal_code_4);
CREATE INDEX idx_customer_achievements_customer ON customer_achievements(customer_id);
CREATE INDEX idx_customer_documents_customer ON customer_documents(customer_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE house_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_energy_input ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_period_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- House Profiles
CREATE POLICY "House profiles viewable by team" ON house_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "House profiles insertable by anyone" ON house_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "House profiles updatable by team or portal" ON house_profiles
  FOR UPDATE USING (true);

-- Customer Energy Input
CREATE POLICY "Energy input viewable by team" ON customer_energy_input
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Energy input insertable by anyone" ON customer_energy_input
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Energy input updatable by team or portal" ON customer_energy_input
  FOR UPDATE USING (true);

-- Reference data (public read)
CREATE POLICY "Building periods viewable by all" ON building_period_characteristics
  FOR SELECT USING (true);

CREATE POLICY "Reference households viewable by all" ON reference_households
  FOR SELECT USING (true);

CREATE POLICY "Subsidy programs viewable by all" ON subsidy_programs
  FOR SELECT USING (true);

CREATE POLICY "Energy measures viewable by all" ON energy_measures
  FOR SELECT USING (true);

CREATE POLICY "Roadmap templates viewable by all" ON roadmap_templates
  FOR SELECT USING (true);

CREATE POLICY "Achievements viewable by all" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Neighborhood stats viewable by all" ON neighborhood_stats
  FOR SELECT USING (true);

-- Customer Subsidies
CREATE POLICY "Customer subsidies viewable by team" ON customer_subsidies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customer subsidies insertable by anyone" ON customer_subsidies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer subsidies updatable" ON customer_subsidies
  FOR UPDATE USING (true);

-- Customer Action Items
CREATE POLICY "Action items viewable by team" ON customer_action_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Action items insertable by anyone" ON customer_action_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Action items updatable" ON customer_action_items
  FOR UPDATE USING (true);

-- Customer Roadmaps
CREATE POLICY "Roadmaps viewable by team" ON customer_roadmaps
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Roadmaps insertable by anyone" ON customer_roadmaps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Roadmaps updatable" ON customer_roadmaps
  FOR UPDATE USING (true);

-- Installation Workflows
CREATE POLICY "Workflows viewable by team" ON installation_workflows
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Workflows editable by admin/planner" ON installation_workflows
  FOR INSERT WITH CHECK (is_admin_or_planner());

CREATE POLICY "Workflows updatable by team" ON installation_workflows
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Workflow Activities
CREATE POLICY "Workflow activities viewable by team" ON workflow_activities
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Workflow activities insertable by team" ON workflow_activities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Customer Achievements
CREATE POLICY "Customer achievements viewable by team" ON customer_achievements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customer achievements insertable" ON customer_achievements
  FOR INSERT WITH CHECK (true);

-- Customer Documents
CREATE POLICY "Customer documents viewable by team" ON customer_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customer documents insertable" ON customer_documents
  FOR INSERT WITH CHECK (true);

-- Subsidy Documents
CREATE POLICY "Subsidy documents viewable by team" ON subsidy_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Subsidy documents insertable" ON subsidy_documents
  FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_house_profiles_updated_at
  BEFORE UPDATE ON house_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_energy_input_updated_at
  BEFORE UPDATE ON customer_energy_input
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_subsidies_updated_at
  BEFORE UPDATE ON customer_subsidies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_action_items_updated_at
  BEFORE UPDATE ON customer_action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_roadmaps_updated_at
  BEFORE UPDATE ON customer_roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_installation_workflows_updated_at
  BEFORE UPDATE ON installation_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

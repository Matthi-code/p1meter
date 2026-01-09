-- ============================================
-- p1Meter Installation Management - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'planner', 'energiebuddy', 'huiseigenaar');
CREATE TYPE installation_status AS ENUM ('scheduled', 'confirmed', 'traveling', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE issue_category AS ENUM ('malfunction', 'question', 'complaint');
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE photo_type AS ENUM ('pre', 'post', 'issue');

-- ============================================
-- TABLES
-- ============================================

-- Team Members (extends Supabase Auth users)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'energiebuddy',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Smart Meters Reference
CREATE TABLE smart_meters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  smr_version TEXT NOT NULL,
  needs_adapter BOOLEAN NOT NULL DEFAULT false,
  reference_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installations
CREATE TABLE installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status installation_status NOT NULL DEFAULT 'scheduled',
  assigned_to UUID REFERENCES team_members(id),
  smart_meter_id UUID REFERENCES smart_meters(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  assigned_to UUID REFERENCES team_members(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intake Forms (pre-installation customer input)
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  meter_type TEXT,
  accessibility TEXT,
  location TEXT,
  parking_info TEXT,
  pets TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Photos
CREATE TABLE customer_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES installations(id) ON DELETE SET NULL,
  type photo_type NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluations (post-installation feedback)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_punctuality INTEGER CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
  rating_friendliness INTEGER CHECK (rating_friendliness >= 1 AND rating_friendliness <= 5),
  rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
  feedback TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issues (customer reported problems)
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES installations(id) ON DELETE SET NULL,
  category issue_category NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status issue_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_installations_customer ON installations(customer_id);
CREATE INDEX idx_installations_assigned ON installations(assigned_to);
CREATE INDEX idx_installations_status ON installations(status);
CREATE INDEX idx_installations_scheduled ON installations(scheduled_at);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_customers_portal_token ON customers(portal_token);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM team_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin or planner
CREATE OR REPLACE FUNCTION is_admin_or_planner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'planner')
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Team Members Policies
CREATE POLICY "Team members viewable by authenticated users" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members editable by admins" ON team_members
  FOR ALL USING (get_user_role() = 'admin');

-- Customers Policies
CREATE POLICY "Customers viewable by team" ON customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customers editable by admin/planner" ON customers
  FOR INSERT WITH CHECK (is_admin_or_planner());

CREATE POLICY "Customers updatable by admin/planner" ON customers
  FOR UPDATE USING (is_admin_or_planner());

CREATE POLICY "Customers deletable by admin" ON customers
  FOR DELETE USING (get_user_role() = 'admin');

-- Customer portal access (via token, no auth needed)
CREATE POLICY "Customers viewable via portal token" ON customers
  FOR SELECT USING (true); -- Token check happens in app

-- Smart Meters Policies
CREATE POLICY "Smart meters viewable by all" ON smart_meters
  FOR SELECT USING (true);

CREATE POLICY "Smart meters editable by admin" ON smart_meters
  FOR ALL USING (get_user_role() = 'admin');

-- Installations Policies
CREATE POLICY "Installations viewable by team" ON installations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Installations editable by admin/planner" ON installations
  FOR INSERT WITH CHECK (is_admin_or_planner());

CREATE POLICY "Installations updatable by assigned or admin/planner" ON installations
  FOR UPDATE USING (
    is_admin_or_planner() OR
    assigned_to = (SELECT id FROM team_members WHERE user_id = auth.uid())
  );

-- Tasks Policies
CREATE POLICY "Tasks viewable by team" ON tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tasks editable by admin/planner" ON tasks
  FOR INSERT WITH CHECK (is_admin_or_planner());

CREATE POLICY "Tasks updatable by assigned or admin/planner" ON tasks
  FOR UPDATE USING (
    is_admin_or_planner() OR
    assigned_to = (SELECT id FROM team_members WHERE user_id = auth.uid())
  );

-- Intake Forms Policies
CREATE POLICY "Intake forms viewable by team" ON intake_forms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Intake forms insertable by anyone" ON intake_forms
  FOR INSERT WITH CHECK (true); -- Customer portal can insert

-- Customer Photos Policies
CREATE POLICY "Photos viewable by team" ON customer_photos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Photos insertable by anyone" ON customer_photos
  FOR INSERT WITH CHECK (true); -- Customer/installer can upload

-- Evaluations Policies
CREATE POLICY "Evaluations viewable by team" ON evaluations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Evaluations insertable by anyone" ON evaluations
  FOR INSERT WITH CHECK (true); -- Customer portal can insert

-- Issues Policies
CREATE POLICY "Issues viewable by team" ON issues
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Issues insertable by anyone" ON issues
  FOR INSERT WITH CHECK (true); -- Customer portal can insert

CREATE POLICY "Issues updatable by team" ON issues
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_installations_updated_at
  BEFORE UPDATE ON installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA (Smart Meters)
-- ============================================

INSERT INTO smart_meters (brand, model, smr_version, needs_adapter, notes) VALUES
  ('Landis+Gyr', 'E360', '5.0', false, NULL),
  ('Landis+Gyr', 'E350', '5.0', false, 'Volledig compatibel bij SMR 5.0'),
  ('Kaifa', 'MA304', '5.0', false, NULL),
  ('Kaifa', 'MA105', '4.2', true, 'USB-C adapter vereist'),
  ('Iskra', 'ME382', '4.2', true, 'Geen fase-informatie beschikbaar'),
  ('Sagemcom', 'T210-D', '5.0', false, NULL),
  ('Sagemcom', 'XS210', '5.0', false, NULL),
  ('Kamstrup', '382JxC', '4.0', true, 'Geen fase-informatie beschikbaar'),
  ('Kamstrup', '162JxC', '5.0', false, NULL);

-- ============================================
-- STORAGE BUCKETS (run separately in Supabase dashboard)
-- ============================================

-- Go to Storage in Supabase dashboard and create:
-- 1. Bucket: "customer-photos" (public: false)
-- 2. Bucket: "meter-photos" (public: false)

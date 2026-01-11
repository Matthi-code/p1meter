-- ================================================
-- Voorraad beheer tabellen
-- ================================================

-- Product categorie enum
DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('meter', 'adapter', 'cable', 'accessory', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Transactie type enum
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'return', 'adjustment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Producten tabel
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category product_category NOT NULL DEFAULT 'other',
  description TEXT,
  unit_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voorraad transacties tabel
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  installation_id UUID REFERENCES installations(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialen per installatie tabel
CREATE TABLE IF NOT EXISTS installation_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(installation_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock_quantity) WHERE stock_quantity <= min_stock_level;
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_installation ON inventory_transactions(installation_id);
CREATE INDEX IF NOT EXISTS idx_installation_materials_installation ON installation_materials(installation_id);
CREATE INDEX IF NOT EXISTS idx_installation_materials_product ON installation_materials(product_id);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_materials ENABLE ROW LEVEL SECURITY;

-- Products: admins en planners kunnen alles, energiebuddies kunnen lezen
CREATE POLICY "Products viewable by all team members" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products manageable by admins and planners" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'planner')
    )
  );

-- Inventory transactions: admins en planners kunnen alles, energiebuddies kunnen toevoegen
CREATE POLICY "Inventory transactions viewable by all team members" ON inventory_transactions
  FOR SELECT USING (true);

CREATE POLICY "Inventory transactions manageable by admins and planners" ON inventory_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'planner')
    )
  );

CREATE POLICY "Energiebuddies can insert usage transactions" ON inventory_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'energiebuddy'
    )
    AND type = 'usage'
  );

-- Installation materials: iedereen kan lezen, energiebuddies kunnen toevoegen/wijzigen
CREATE POLICY "Installation materials viewable by all" ON installation_materials
  FOR SELECT USING (true);

CREATE POLICY "Installation materials manageable by team" ON installation_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Seed data: standaard producten
INSERT INTO products (name, sku, category, description, stock_quantity, min_stock_level) VALUES
  ('p1Meter', 'P1M-001', 'meter', 'HomeWizard p1Meter voor slimme meter uitlezing', 50, 10),
  ('USB-C Adapter', 'ADP-USB-C', 'adapter', 'USB-C naar RJ12 adapter voor nieuwe slimme meters', 30, 5),
  ('USB-A Adapter', 'ADP-USB-A', 'adapter', 'USB-A naar RJ12 adapter voor oudere slimme meters', 20, 5),
  ('RJ12 Kabel 1m', 'CBL-RJ12-1M', 'cable', 'RJ12 kabel 1 meter', 40, 10),
  ('RJ12 Kabel 3m', 'CBL-RJ12-3M', 'cable', 'RJ12 kabel 3 meter', 25, 5),
  ('Velcro Strips', 'ACC-VELCRO', 'accessory', 'Velcro strips voor bevestiging', 100, 20),
  ('Installatiehandleiding', 'DOC-MANUAL', 'accessory', 'Gedrukte installatiehandleiding voor klant', 100, 25)
ON CONFLICT (sku) DO NOTHING;

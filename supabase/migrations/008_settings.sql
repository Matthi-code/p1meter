-- App Settings
-- Key-value store for application settings

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage app_settings"
  ON app_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO app_settings (key, value, description) VALUES
  ('contact_email', 'matthi@gcon.nl', 'E-mailadres voor klantenservice'),
  ('contact_phone', '', 'Telefoonnummer voor klantenservice'),
  ('company_name', 'p1Meter', 'Bedrijfsnaam')
ON CONFLICT (key) DO NOTHING;

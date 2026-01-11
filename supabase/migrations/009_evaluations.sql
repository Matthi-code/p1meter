-- Evaluations table for customer feedback after installation
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID REFERENCES installations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  feedback TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one evaluation per installation
  UNIQUE(installation_id)
);

-- Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anon can read evaluations for their customer token"
  ON evaluations FOR SELECT
  TO anon
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE portal_token IS NOT NULL
    )
  );

CREATE POLICY "Anon can insert evaluations"
  ON evaluations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role full access to evaluations"
  ON evaluations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_evaluations_customer_id ON evaluations(customer_id);
CREATE INDEX idx_evaluations_installation_id ON evaluations(installation_id);

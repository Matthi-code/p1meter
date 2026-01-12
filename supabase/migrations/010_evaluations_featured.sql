-- Add featured and recommend columns to evaluations table
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS recommend BOOLEAN DEFAULT true;

-- Index for faster featured lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_featured ON evaluations(featured) WHERE featured = true;

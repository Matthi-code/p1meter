-- FAQ Rate Limiting
-- Tracks submissions to limit to 3 per IP per day

CREATE TABLE IF NOT EXISTS faq_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by IP and date
CREATE INDEX idx_faq_submissions_ip_created ON faq_submissions(ip_address, created_at);

-- RLS policies
ALTER TABLE faq_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (from API)
CREATE POLICY "Service role can insert faq_submissions"
  ON faq_submissions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to select (for counting)
CREATE POLICY "Service role can select faq_submissions"
  ON faq_submissions FOR SELECT
  TO service_role
  USING (true);

-- Auto-cleanup: remove entries older than 7 days (optional, for maintenance)
-- This can be run periodically via a cron job or Supabase scheduled function

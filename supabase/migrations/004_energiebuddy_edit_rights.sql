-- Migration: Energie Buddies krijgen dezelfde rechten als planners (behalve verwijderen)
--
-- Dit geeft energiebuddy's de mogelijkheid om klanten te bewerken en toe te voegen,
-- wat nodig is voor hun dagelijkse werkzaamheden.

-- Helper functie voor admin/planner/energiebuddy
CREATE OR REPLACE FUNCTION is_admin_planner_or_buddy()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'planner', 'energiebuddy')
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Update customers policies: energiebuddy mag nu ook klanten bewerken
DROP POLICY IF EXISTS "Customers editable by admin/planner" ON customers;
DROP POLICY IF EXISTS "Customers updatable by admin/planner" ON customers;

CREATE POLICY "Customers editable by team" ON customers
  FOR INSERT WITH CHECK (is_admin_planner_or_buddy());

CREATE POLICY "Customers updatable by team" ON customers
  FOR UPDATE USING (is_admin_planner_or_buddy());

-- DELETE blijft admin-only (bestaande policy "Customers deletable by admin" blijft behouden)

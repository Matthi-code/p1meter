-- Voeg admin team member toe
-- BELANGRIJK: Voer dit uit NADAT je de user hebt aangemaakt in Authentication > Users

INSERT INTO team_members (user_id, name, email, role, active)
SELECT
  id as user_id,
  'Matthi' as name,
  'matthi@gcon.nl' as email,
  'admin' as role,
  true as active
FROM auth.users
WHERE email = 'matthi@gcon.nl'
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role = 'admin';

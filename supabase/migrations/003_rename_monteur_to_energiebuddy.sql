-- Migration: Hernoem 'monteur' naar 'energiebuddy'
-- Datum: 2026-01-09

-- Voeg nieuwe waarde toe aan ENUM
ALTER TYPE user_role ADD VALUE 'energiebuddy';

-- Update bestaande records
UPDATE team_members SET role = 'energiebuddy' WHERE role = 'monteur';

-- Opmerking: ENUM waarden kunnen niet verwijderd worden in PostgreSQL
-- De oude 'monteur' waarde blijft bestaan maar wordt niet meer gebruikt

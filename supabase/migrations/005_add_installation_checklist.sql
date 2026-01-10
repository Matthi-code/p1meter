-- Add checklist_data column to installations table
-- This stores the installation checklist progress as JSON

ALTER TABLE installations
ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN installations.checklist_data IS 'JSON object containing checklist items and completion status for the installation workflow';

-- Migration: Add completed_at field to projects table
-- This field tracks when a project is marked as completed for analytics

-- Add completed_at column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_projects_completed_at ON projects(completed_at);

-- Create a trigger to automatically set completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to 'completed' and completed_at is not set
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- If status is changing from 'completed' to 'active', clear completed_at
    IF NEW.status = 'active' AND OLD.status = 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_completed_at ON projects;
CREATE TRIGGER trigger_update_completed_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_completed_at();

-- For existing completed projects, set completed_at to updated_at
UPDATE projects
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;


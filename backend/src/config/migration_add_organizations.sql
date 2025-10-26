-- Migration: Add Organizations for Multi-Tenant Support
-- This migration adds organization support to the database

-- Step 1: Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add organization_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Step 3: Add organization_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);

-- Step 5: Add trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create a default organization for existing data (optional)
-- INSERT INTO organizations (name, description) VALUES ('Default Organization', 'Default organization for existing users');

-- Step 7: Update existing users and projects with default organization (if needed)
-- UPDATE users SET organization_id = 1 WHERE organization_id IS NULL;
-- UPDATE projects SET organization_id = 1 WHERE organization_id IS NULL;

-- Note: After migration, you may want to make organization_id NOT NULL
-- ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE projects ALTER COLUMN organization_id SET NOT NULL;


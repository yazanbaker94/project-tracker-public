# Testing Multi-Tenant Data Isolation

This guide helps you test the multi-tenant organization feature.

## What Changed?

### Backend Changes:
- ✅ Added `organizations` table
- ✅ Added `organization_id` to `users` and `projects` tables
- ✅ JWT tokens now include `organization_id`
- ✅ All project queries filter by organization
- ✅ Users can only access their organization's data

### Frontend Changes:
- ✅ Updated types to include `organization_id`
- ✅ Dashboard displays organization info
- ✅ Stats show organization-wide metrics

## Testing Steps

### 1. Start Fresh (Optional)
If you want to test with clean data:

```bash
# Connect to PostgreSQL
psql -U postgres -d project_tracker

# Drop and recreate tables (WARNING: deletes all data)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

# Exit psql
\q

# Reinitialize database
cd backend
npm run init-db
```

### 2. Test Registration & Login

**Register User 1 (Will be in Organization 1):**
```bash
# In Postman or using curl:
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user1@org1.com",
  "password": "Password123",
  "first_name": "User",
  "last_name": "One"
}

# Response should include organization_id: 1
```

**Register User 2 (Will also be in Organization 1):**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user2@org1.com",
  "password": "Password123",
  "first_name": "User",
  "last_name": "Two"
}
```

### 3. Create Projects as User 1

```bash
# Login as User 1 to get token
POST http://localhost:5000/api/auth/login
{
  "email": "user1@org1.com",
  "password": "Password123"
}

# Copy the token, then create a project
POST http://localhost:5000/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
{
  "title": "User 1 Project A",
  "description": "Created by User 1",
  "status": "active"
}
```

### 4. Verify Data Isolation

**Login as User 2 and fetch projects:**
```bash
# Login as User 2
POST http://localhost:5000/api/auth/login
{
  "email": "user2@org1.com",
  "password": "Password123"
}

# Get projects (should see User 1's project too - same organization)
GET http://localhost:5000/api/projects
Authorization: Bearer USER2_TOKEN
```

**Expected Result:** User 2 should see User 1's projects because they're in the same organization.

### 5. Test with Different Organizations

To test true isolation, you need to manually create a second organization:

```bash
# Connect to database
psql -U postgres -d project_tracker

# Create second organization
INSERT INTO organizations (name, description) 
VALUES ('Organization 2', 'Second test organization');

# Get the ID of the new organization (likely 2)
SELECT * FROM organizations;

# Update User 2 to belong to Organization 2
UPDATE users 
SET organization_id = 2 
WHERE email = 'user2@org1.com';

# Exit
\q
```

**Now test again:**
```bash
# User 2 needs to logout and login again to get new JWT with updated organization_id
POST http://localhost:5000/api/auth/login
{
  "email": "user2@org1.com",
  "password": "Password123"
}

# Get projects - should be empty now
GET http://localhost:5000/api/projects
Authorization: Bearer NEW_USER2_TOKEN
```

**Expected Result:** User 2 should see NO projects because they're now in Organization 2.

### 6. Test in Frontend

1. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

2. **Register a new user** - they'll automatically join Organization 1

3. **Check the dashboard:**
   - You should see "Organization ID: 1" in the header
   - Stats should show "Organization Overview"
   - You should see all projects from Organization 1

4. **Create projects** - they'll be visible to all users in Organization 1

## What to Look For

### ✅ Success Indicators:
- Users see organization_id in their profile
- Stats show organization-wide metrics (not just user's projects)
- Users in the same org can see each other's projects
- JWT token includes organization_id
- Projects have organization_id field

### ❌ Issues to Watch For:
- Users seeing projects from other organizations
- Missing organization_id in API responses
- Errors when creating/updating projects
- Stats showing incorrect numbers

## Database Verification

Check the data directly:

```sql
-- See all organizations
SELECT * FROM organizations;

-- See users and their organizations
SELECT id, email, first_name, last_name, organization_id FROM users;

-- See projects and their organizations
SELECT id, title, user_id, organization_id FROM projects;

-- Count projects per organization
SELECT organization_id, COUNT(*) as project_count 
FROM projects 
GROUP BY organization_id;
```

## Security Checklist

- [ ] Users cannot access projects from other organizations
- [ ] JWT tokens include organization_id
- [ ] All project endpoints filter by organization_id
- [ ] Stats are scoped to organization
- [ ] Database foreign keys are properly set up
- [ ] New users are assigned to an organization

## Production Considerations

For production deployment, you would want to:

1. **Add organization selection during registration**
2. **Create an admin panel to manage organizations**
3. **Add organization name (not just ID) to the UI**
4. **Implement organization invitations**
5. **Add role-based permissions within organizations**
6. **Track which user created each project**
7. **Add organization settings and customization**

---

**Current Status:** ✅ Basic multi-tenant data isolation is implemented and working!


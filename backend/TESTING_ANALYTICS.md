# Testing Analytics Features

## Quick Start

### 1. Run the Migration
```bash
cd backend
npm run migrate:analytics
```

Expected output:
```
✅ Migration: completed_at field added to projects table
✅ Verified: completed_at column exists
✅ Updated X completed projects with completion timestamp
✅ Verified: Auto-completion trigger installed
🎉 Analytics migration complete!
```

### 2. Test with Postman/cURL

#### **Login First**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}

# Copy the token from response
```

#### **Get Dashboard Analytics** ⭐ (Best starting point)
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer YOUR_TOKEN
```

Expected Response:
```json
{
  "success": true,
  "message": "Analytics dashboard data retrieved successfully",
  "data": {
    "organization_stats": {
      "total": 5,
      "active": 3,
      "completed": 2
    },
    "user_stats": {
      "total": 2,
      "active": 1,
      "completed": 1
    },
    "average_completion_time": {
      "days": 3.5,
      "hours": "84.0"
    },
    "detailed_analytics": {
      "overview": {
        "total_projects": 5,
        "active_projects": 3,
        "completed_projects": 2,
        "total_contributors": 2,
        "avg_completion_days": "3.5",
        "completion_rate": "40.0"
      },
      "top_contributors": [
        {
          "user_id": 1,
          "project_count": 3,
          "completed_count": 2
        }
      ],
      "recent_activity": [
        {
          "date": "2025-01-20T00:00:00.000Z",
          "projects_created": 2
        }
      ]
    }
  }
}
```

#### **Get User Stats**
```bash
GET http://localhost:5000/api/analytics/user
Authorization: Bearer YOUR_TOKEN
```

#### **Get Organization Analytics**
```bash
GET http://localhost:5000/api/analytics/organization
Authorization: Bearer YOUR_TOKEN
```

#### **Get Average Completion Time**
```bash
GET http://localhost:5000/api/analytics/completion-time
Authorization: Bearer YOUR_TOKEN
```

---

## Test Scenarios

### **Scenario 1: Basic Analytics**

1. **Create some projects:**
```bash
POST http://localhost:5000/api/projects
Authorization: Bearer YOUR_TOKEN

{
  "title": "Test Project 1",
  "description": "Testing analytics",
  "status": "active"
}
```

2. **Mark one as completed:**
```bash
PUT http://localhost:5000/api/projects/1
Authorization: Bearer YOUR_TOKEN

{
  "status": "completed"
}
```

3. **Check analytics:**
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer YOUR_TOKEN
```

**Expected:** 
- Organization stats show all projects
- User stats show only your projects
- Completion time shows average in days

---

### **Scenario 2: Completion Time Tracking**

1. **Create a new project:**
```bash
POST http://localhost:5000/api/projects
{
  "title": "Quick Task",
  "description": "Should complete fast",
  "status": "active"
}
```

2. **Wait a few minutes (or hours for realistic data)**

3. **Mark as completed:**
```bash
PUT http://localhost:5000/api/projects/{id}
{
  "status": "completed"
}
```

4. **Verify completed_at was set automatically:**
```bash
GET http://localhost:5000/api/projects/{id}
```

**Expected:** 
- Response includes `completed_at` timestamp
- `completed_at` is NOT null
- Time difference between `created_at` and `completed_at` is calculated

5. **Check average completion time:**
```bash
GET http://localhost:5000/api/analytics/completion-time
```

**Expected:**
- `average_completion_days` reflects the new completion
- Value makes sense based on time elapsed

---

### **Scenario 3: Multi-User Analytics**

1. **Register User 1:**
```bash
POST http://localhost:5000/api/auth/register
{
  "email": "user1@test.com",
  "password": "Password123",
  "first_name": "User",
  "last_name": "One"
}
```

2. **User 1 creates 3 projects, completes 2**

3. **Register User 2:**
```bash
POST http://localhost:5000/api/auth/register
{
  "email": "user2@test.com",
  "password": "Password123",
  "first_name": "User",
  "last_name": "Two"
}
```

4. **User 2 creates 2 projects, completes 1**

5. **Check analytics as User 1:**
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer USER1_TOKEN
```

**Expected:**
- `organization_stats.total` = 5 (all projects)
- `user_stats.total` = 3 (only User 1's projects)
- `top_contributors` shows both users
- User 1 ranked higher (3 projects vs 2)

6. **Check analytics as User 2:**
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer USER2_TOKEN
```

**Expected:**
- `organization_stats.total` = 5 (same org data)
- `user_stats.total` = 2 (only User 2's projects)
- Same `top_contributors` list
- User 2 ranked lower

---

### **Scenario 4: Completion Rate**

1. **Create 10 projects**
2. **Complete 6 of them**
3. **Check analytics:**

**Expected:**
- `completion_rate` = "60.0"
- `completed_projects` = 6
- `total_projects` = 10

---

### **Scenario 5: Recent Activity**

1. **Create projects on different days** (or manipulate `created_at` in DB for testing)
2. **Check organization analytics:**

**Expected:**
- `recent_activity` array shows last 30 days
- Each entry has `date` and `projects_created`
- Dates are sorted descending

---

## Frontend Testing

### **1. Start the Application**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### **2. Login**
Navigate to `http://localhost:3000` and login

### **3. Test Projects Tab**
- Create new projects
- Update project status
- Delete projects
- Verify stats update in real-time

### **4. Test Analytics Tab** ⭐

1. **Click "📊 Analytics" tab**
2. **Verify Overview Cards:**
   - Organization Total (blue card)
   - Your Projects (green card)
   - Completion Rate (purple card)
   - Avg Completion Time (orange card)

3. **Verify Team Overview Panel:**
   - Total Contributors count
   - Active/Completed breakdown
   - Average completion days

4. **Verify Top Contributors:**
   - Ranked list with badges (#1, #2, etc.)
   - Project counts displayed
   - Completed counts shown

5. **Verify Recent Activity Chart:**
   - Bar chart visible
   - Bars represent project creation
   - Hover shows date and count

### **5. Test Tab Switching**
- Switch between "Projects" and "Analytics"
- Verify smooth transitions
- No errors in console

---

## Database Verification

### **Check completed_at Field**
```sql
-- Connect to database
psql -U postgres -d project_tracker

-- See projects with completion times
SELECT id, title, status, 
       created_at, 
       completed_at,
       EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400 as days_to_complete
FROM projects
WHERE completed_at IS NOT NULL;

-- Verify trigger works
UPDATE projects 
SET status = 'completed' 
WHERE id = 1;

SELECT id, status, completed_at FROM projects WHERE id = 1;
-- Should show completed_at is now set

UPDATE projects 
SET status = 'active' 
WHERE id = 1;

SELECT id, status, completed_at FROM projects WHERE id = 1;
-- Should show completed_at is now NULL
```

---

## Common Issues & Fixes

### **Issue: "Average completion time is null"**
**Cause:** No projects have been completed yet.  
**Fix:** Mark at least one project as completed.

### **Issue: "No data in recent activity chart"**
**Cause:** No projects created in the last 30 days.  
**Fix:** Create some projects or check that `created_at` timestamps are recent.

### **Issue: "User stats show 0 but org stats show projects"**
**Cause:** Projects were created by other users.  
**Fix:** Create projects with the current user to see user stats.

### **Issue: "Analytics tab not loading"**
**Cause:** Backend server not running or endpoint not accessible.  
**Fix:** 
1. Check backend is running: `npm run dev`
2. Check console for errors
3. Verify token is valid

### **Issue: "Completion time seems wrong"**
**Cause:** Old completed projects have `completed_at` set to `updated_at` from migration.  
**Fix:** For accurate testing, create new projects and complete them.

---

## Success Checklist

- [ ] Migration ran successfully
- [ ] `/api/analytics/dashboard` returns data
- [ ] `/api/analytics/user` shows current user's stats
- [ ] `/api/analytics/organization` shows full org data
- [ ] `/api/analytics/completion-time` calculates correctly
- [ ] Frontend Analytics tab displays
- [ ] Overview cards show correct numbers
- [ ] Top contributors list appears
- [ ] Recent activity chart renders
- [ ] Tab switching works smoothly
- [ ] Completing a project updates `completed_at`
- [ ] Changing status back to active clears `completed_at`
- [ ] Multi-user scenario shows correct separation

---

## Performance Check

Run analytics endpoints multiple times and check response times:

```bash
# Should be < 50ms
time curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/analytics/user

# Should be < 100ms
time curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/analytics/dashboard
```

If response times are slow:
1. Check database indexes are created
2. Verify `organization_id` and `completed_at` indexes exist
3. Run `EXPLAIN ANALYZE` on slow queries

---

## 🎉 All Tests Passing?

**Congratulations! Analytics system is working perfectly!**

The application now provides comprehensive insights into:
- Team performance
- Individual contributions
- Project completion trends
- Time management metrics


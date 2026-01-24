# Doctor-User Linking Implementation Complete

## Overview
Implemented proper doctor-user account linking to replace hardcoded user_id → doctor_id mapping in Consultation module. Each doctor user account is now directly linked to their doctor profile via `users.doctor_id` foreign key.

## Changes Made

### 1. Database Schema (Migration 011)
**File**: `backend/src/db/migrations/011_add_doctor_id_to_users.sql`

Added `doctor_id` column to `users` table:
```sql
ALTER TABLE users 
ADD COLUMN doctor_id INTEGER 
REFERENCES doctors(id) ON DELETE SET NULL;

CREATE INDEX idx_users_doctor_id ON users(doctor_id);
```

**Updated Records**: 2 existing doctor users (user_id 2 and 6) now linked to doctor_id=1 (Dr. Rohan Sharma)

### 2. Backend: Auth Queries
**File**: `backend/src/modules/auth/auth.sql.js`

Updated queries to include `doctor_id`:
- `findByUsername`: Now selects `u.doctor_id`
- `findById`: Now selects `u.doctor_id`

### 3. Backend: Auth Service
**File**: `backend/src/modules/auth/auth.service.js`

Updated JWT payload and response to include `doctor_id`:
```javascript
// JWT token payload
{
  id: user.id,
  username: user.username,
  role: user.role,
  doctor_id: user.doctor_id  // NEW
}

// Login response user object
{
  id: user.id,
  username: user.username,
  role: user.role,
  doctor_id: user.doctor_id,  // NEW
  permissions,
  defaultRoute
}
```

### 4. Frontend: Consultation Page
**File**: `frontend/src/pages/Consultation/Consultation.jsx`

**BEFORE** (Hardcoded):
```javascript
let doctorId = 1; // Default
if (user.id === 2) doctorId = 1; // dr.aditya
else if (user.id === 6) doctorId = 1; // doctor
fetchTodayQueue(doctorId);
```

**AFTER** (Proper):
```javascript
const doctorId = user.doctor_id;

if (!doctorId) {
  console.error('Doctor user account is not linked to a doctor profile. Please contact administrator.');
  return;
}

fetchTodayQueue(doctorId);
```

## How It Works

### Authentication Flow
1. Doctor logs in with username/password
2. Auth service queries `users` table with JOIN to `roles`
3. Query returns user data **including `doctor_id`**
4. JWT token generated with `doctor_id` in payload
5. Frontend receives JWT and stores user object with `doctor_id`

### Consultation Queue Filtering
1. Consultation page reads `user.doctor_id` from auth store
2. Fetches OPD queue filtered by doctor_id: `GET /api/v1/opd?doctor_id=1&visit_date=2026-01-15`
3. Doctor sees only patients assigned to them
4. Status updates sync via `opd_queue` table (shared with OPD module)

## Testing Instructions

### 1. Logout and Re-Login (Required)
**Important**: Existing JWT tokens do NOT contain `doctor_id`. Users must logout and re-login to get updated tokens.

```bash
# In frontend (localhost:5173)
1. Click logout
2. Login as: doctor / doctor123
3. Navigate to Consultation page
```

### 2. Verify doctor_id in JWT
Open browser console and run:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Doctor ID:', user.doctor_id);
// Expected: 1 (for both test doctor accounts)
```

### 3. Test Queue Filtering
- Login as doctor
- Consultation page should show patients for doctor_id=1
- Check browser Network tab: `/api/v1/opd?doctor_id=1&visit_date=...`

### 4. Test Status Sync
1. Load a waiting patient from queue (status → IN_PROGRESS)
2. Complete consultation (status → COMPLETED)
3. Switch to OPD page
4. Within 10 seconds, status should update (auto-refresh)

## Multi-Doctor Setup

### Creating Additional Doctor Users
To test with multiple doctors:

```sql
-- Create user for Dr. Priya Mehta (doctor_id=2)
INSERT INTO users (username, password_hash, role_id, doctor_id, is_active)
VALUES (
  'dr.priya',
  '$2a$10$...',  -- Use bcrypt hash for 'password123'
  (SELECT id FROM roles WHERE name = 'DOCTOR'),
  2,
  true
);

-- Create user for Dr. Rajesh Kumar (doctor_id=3)  
INSERT INTO users (username, password_hash, role_id, doctor_id, is_active)
VALUES (
  'dr.rajesh',
  '$2a$10$...',
  (SELECT id FROM roles WHERE name = 'DOCTOR'),
  3,
  true
);
```

### Testing Multi-Doctor Scenario
1. Create OPD entries for different doctors
2. Login as `dr.priya` → see only doctor_id=2 patients
3. Login as `dr.rajesh` → see only doctor_id=3 patients
4. Login as `doctor` → see only doctor_id=1 patients

## Benefits

### Before (Hardcoded)
❌ Not scalable (required code changes for each doctor)  
❌ Tight coupling between user IDs and doctor IDs  
❌ Difficult to manage multiple doctors  
❌ No validation if mapping exists  

### After (Proper Linking)
✅ Scalable: Add doctors without code changes  
✅ Database-enforced relationship via foreign key  
✅ Easy to reassign or unlink doctors  
✅ Validation: Error if doctor_id is null  
✅ Proper multi-doctor support  

## Database State

### Current Doctor Users
```
user_id | username   | role   | doctor_id | linked_to
--------|------------|--------|-----------|------------------
2       | dr.aditya  | DOCTOR | 1         | Dr. Rohan Sharma
6       | doctor     | DOCTOR | 1         | Dr. Rohan Sharma
```

### Doctors Master Data
```
doctor_id | name            | is_active
----------|-----------------|----------
1         | Dr. Rohan Sharma| true
2         | Dr. Priya Mehta | true
3         | Dr. Rajesh Kumar| true
```

## Troubleshooting

### Issue: Consultation page shows "not linked to doctor profile" error
**Cause**: User's JWT token doesn't have `doctor_id` (old token)  
**Solution**: Logout and re-login to get updated JWT

### Issue: Doctor sees all patients, not just their queue
**Cause**: Frontend using old code or doctor_id is null  
**Solution**: 
1. Hard refresh browser (Cmd+Shift+R)
2. Check user.doctor_id in console
3. Verify doctor_id in database: `SELECT doctor_id FROM users WHERE username='doctor'`

### Issue: 500 error on login
**Cause**: Migration not applied (doctor_id column missing)  
**Solution**: 
```bash
cd backend
psql seemant_hms_db -f src/db/migrations/011_add_doctor_id_to_users.sql
```

## Next Steps

### Optional Enhancements
1. **Admin UI**: Add doctor selection dropdown in user management
2. **Validation**: Prevent DOCTOR role users without doctor_id
3. **Seed Script**: Update `seed-users.js` to include doctor_id
4. **API Docs**: Update AUTH_API.md with doctor_id field

### Future Multi-Facility Support
When implementing multiple facilities:
- Add `facility_id` to `doctors` table
- Filter by both `doctor_id` AND `facility_id`
- Each doctor linked to one facility

## Files Modified

### Backend
- `backend/src/db/migrations/011_add_doctor_id_to_users.sql` (NEW)
- `backend/src/modules/auth/auth.sql.js`
- `backend/src/modules/auth/auth.service.js`

### Frontend  
- `frontend/src/pages/Consultation/Consultation.jsx`

### Frontend (No Changes Needed)
- `frontend/src/store/auth.store.js` (already handles dynamic user object)

## Status
✅ Database migration applied  
✅ Backend auth service updated  
✅ Frontend Consultation page updated  
✅ Backend server restarted  
⚠️ **Action Required**: Users must logout and re-login

---
**Implementation Date**: January 15, 2026  
**Related Issues**: Status sync between OPD and Consultation modules  
**Migration**: 011_add_doctor_id_to_users.sql

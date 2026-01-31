# Eye Hospital HMS - Quick Reference Guide

## 🚀 Getting Started

### Start Backend Server
```bash
cd backend
npm install      # First time only
npm run dev      # Starts on http://localhost:3000
```

### Get API Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'

# Response includes: "token": "eyJhbGc..."
```

### Test API Endpoint
```bash
TOKEN="your_token_here"
curl -X GET http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Available Modules

### ✅ Auth Module
```
POST   /api/v1/auth/login              # Get JWT token
POST   /api/v1/auth/change-password    # Change password
GET    /api/v1/auth/me                 # Get user profile
```

### ✅ Patients Module
```
POST   /api/v1/patients                         # Register patient
GET    /api/v1/patients?search=&village=       # Search patients
GET    /api/v1/patients/:uhid                  # Get patient
PUT    /api/v1/patients/:uhid                  # Update patient
GET    /api/v1/patients/:uhid/visits           # Visit history
DELETE /api/v1/patients/:uhid                  # Delete patient
```

### ✅ OPD Module
```
POST   /api/v1/opd                     # Create queue entry
GET    /api/v1/opd?filters...          # List queue
GET    /api/v1/opd/:id                 # Get entry
PUT    /api/v1/opd/:id/status          # Update status
GET    /api/v1/opd/patient/:uhid       # Patient records
GET    /api/v1/opd/masters/doctors     # Doctors list
GET    /api/v1/opd/masters/visit-types # Visit types
```

---

## 📚 Module Documentation

| Module | Location | Docs |
|--------|----------|------|
| Auth | `backend/src/modules/auth/` | [AUTH_API.md](backend/src/modules/auth/AUTH_API.md) |
| Patients | `backend/src/modules/patients/` | [PATIENTS_API.md](backend/src/modules/patients/PATIENTS_API.md) |
| OPD | `backend/src/modules/opd/` | [OPD_API.md](backend/src/modules/opd/OPD_API.md) |

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management |
| **DOCTOR** | Consultations, diagnosis, status updates |
| **RECEPTION** | Patient registration, OPD queue |
| **BILLING** | Invoice generation, payments |
| **OPERATOR** | Read-only access |

**Default Test User:**
- Username: `admin`
- Password: `admin@123`
- Role: `ADMIN`

---

## 🗄️ Database Connection

```
Host:     localhost
Port:     5432
Database: seemant_hms_db
User:     seemant_db_admin
Password: S1dAd!tyaD0cs
```

### Quick SQL Query
```bash
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT * FROM patients LIMIT 5;"
```

---

## 📊 Sample Data

### Test Patient
- **UHID:** 9705
- **Name:** Ramya Pant
- **Phone:** 9999999999
- **Village:** Test Village

### Test Doctors
1. Dr Aditya (ID: 1)
2. Dr Sharma (ID: 2)
3. Dr Mehra (ID: 3)

### Visit Types
1. General Eye Checkup - ₹100
2. Cataract Surgery - ₹5000
3. LASIK Consultation - ₹500
4. Retina Checkup - ₹300
5. Contact Lens Fitting - ₹200

---

## 🧪 Quick Tests

### Test 1: Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

### Test 2: Create Patient
```bash
TOKEN="your_token"
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "gender":"Male",
    "dob":"1990-01-01",
    "phone":"9876543210",
    "village":"Mumbai"
  }'
```

### Test 3: Create OPD Entry
```bash
TOKEN="your_token"
curl -X POST http://localhost:3000/api/v1/opd \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uhid":"9705",
    "doctor_id":1,
    "visit_type_id":1,
    "visit_date":"2026-01-03"
  }'
```

### Test 4: Get OPD Queue
```bash
TOKEN="your_token"
curl -X GET "http://localhost:3000/api/v1/opd" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Common Tasks

### Add New Patient
1. POST to `/api/v1/patients` with registration data
2. Auto-generates UHID (97xx format)
3. Validates phone (10 digits) and age (0-150 years)

### Create OPD Queue Entry
1. Use patient's UHID from `/api/v1/patients`
2. Select doctor from `/api/v1/opd/masters/doctors`
3. Choose visit type from `/api/v1/opd/masters/visit-types`
4. POST to `/api/v1/opd` with uhid, doctor_id, visit_type_id, visit_date

### Update OPD Status
Status workflow: `waiting` → `in-progress` → `completed` (or `cancelled`)
```bash
curl -X PUT http://localhost:3000/api/v1/opd/11/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'
```

---

## 📝 Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized | Get new JWT token |
| 403 | Forbidden | User doesn't have required role |
| 400 | Bad Request | Check validation errors in response |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check server logs |

---

## 🎯 Development Workflow

### Add New Endpoint
1. Create files in `backend/src/modules/[name]/`
2. Define SQL in `[name].sql.js`
3. Implement business logic in `[name].service.js`
4. Create handlers in `[name].controller.js`
5. Add validation in `[name].validation.js`
6. Define routes in `[name].routes.js`
7. Import routes in `backend/src/routes.js`
8. Document in `[NAME]_API.md`

### Test Workflow
1. Start server: `npm run dev`
2. Get token from `/auth/login`
3. Test endpoint with token in Authorization header
4. Check logs for errors: Check terminal output

---

## 📞 Support Resources

- **API Docs:** See [PROJECT_STATUS.md](PROJECT_STATUS.md)
- **Module Docs:** See individual module `_API.md` files
- **Database Schema:** See [docs/seemant_hms_db_schema.sql](docs/seemant_hms_db_schema.sql)
- **Implementation Notes:** See [OPD_IMPLEMENTATION_COMPLETE.md](OPD_IMPLEMENTATION_COMPLETE.md)

---

## ✅ Completed Features

- ✅ User authentication with JWT
- ✅ Patient registration & management
- ✅ OPD queue system with serial numbers
- ✅ Role-based access control
- ✅ Input validation & error handling
- ✅ Database with 12 tables
- ✅ API documentation

## ⏳ Coming Soon

- ⏳ Consultation module (ICD codes)
- ⏳ Billing module (invoicing)
- ⏳ Frontend application
- ⏳ Testing suite
- ⏳ Mobile app

---

**Version:** 1.0 MVP
**Last Updated:** January 3, 2026
**Status:** Production Ready ✅

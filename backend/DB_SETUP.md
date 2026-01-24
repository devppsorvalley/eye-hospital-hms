# Database Setup Guide

## Overview

This guide explains how to set up the PostgreSQL database for the Eye Hospital HMS MVP.

---

## Prerequisites

1. **PostgreSQL 12+** installed and running
2. **Node.js 18+** with npm
3. **.env file** configured in `backend/` folder

---

## Step 1: Configure Environment Variables

Create or update `.env` in the `backend/` folder:

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=eye_hospital_hms

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

---

## Step 2: Create PostgreSQL Database

Open your PostgreSQL terminal or use a tool like pgAdmin:

```sql
-- Create the database
CREATE DATABASE eye_hospital_hms;

-- Verify it was created
\l
```

Or from command line:

```bash
createdb eye_hospital_hms
```

---

## Step 3: Run Migrations

Migrations are SQL files that create the database schema. They are stored in `backend/src/db/migrations/`

To run migrations:

```bash
cd backend
npm run migrate
```

Expected output:

```
🚀 Running database migrations...

📂 Found 1 migration file(s)

▶️  Executing 001_initial_schema.sql...
✅ 001_initial_schema.sql

✅ All migrations completed successfully!
```

### What Gets Created

The migration creates these tables:

| Table | Purpose |
|-------|---------|
| **users** | System users with roles |
| **roles** | User roles (ADMIN, DOCTOR, RECEPTION, etc.) |
| **patients** | Patient master data |
| **opd_queue** | Daily OPD queue |
| **doctors** | Doctor master |
| **consultations** | Doctor consultation records |
| **icd_master** | ICD-10 diagnosis codes |
| **bills** | Billing records |
| **bill_items** | Line items in bills |
| **service_charges** | Service charges master |
| **service_categories** | Service categories |
| **visit_types** | OPD visit types |

---

## Step 4: Seed Master Data

Seed scripts populate the database with test users, doctors, service charges, ICD codes, and sample patients.

```bash
cd backend
npm run seed
```

Expected output:

```
🌱 Starting database seeding...

📋 Seeding roles...
✅ Roles seeded

👤 Seeding users...
  ✓ admin (ADMIN)
  ✓ doctor (DOCTOR)
  ✓ reception (RECEPTION)
  ✓ billing (BILLING)
✅ Users seeded

👨‍⚕️ Seeding doctors...
  ✓ Dr. Rohan Sharma
  ✓ Dr. Priya Mehta
  ✓ Dr. Vikram Patel
  ✓ Dr. Anjali Singh
✅ Doctors seeded

🏥 Seeding visit types...
  ✓ General Eye Checkup (₹100)
  ✓ Cataract Surgery (₹5000)
  ✓ LASIK Consultation (₹500)
  ✓ Retina Checkup (₹300)
  ✓ Contact Lens Fitting (₹200)
✅ Visit types seeded

🏷️ Seeding service categories...
  ✓ Consultation
  ✓ Tests & Diagnostics
  ✓ Surgery
  ✓ Medication
  ✓ Accessories
✅ Categories seeded

💰 Seeding service charges...
  ✓ General Checkup (₹200)
  ✓ Specialist Consultation (₹500)
  ✓ Visual Acuity Test (₹100)
  ✓ Tonometry (₹150)
  ✓ OCT Scan (₹800)
  ✓ Cataract Surgery (PHACO) (₹5000)
  ✓ Retinal Surgery (₹8000)
  ✓ Antibiotic Eye Drops (₹150)
  ✓ Spectacles Frame (₹500)
  ✓ Contact Lens (₹300)
✅ Service charges seeded

📋 Seeding ICD codes...
  ✓ H52.2 - Astigmatism
  ✓ H52.0 - Hypermetropia
  ✓ H52.1 - Myopia
  ✓ H25.0 - Senile Cataract
  ✓ H26.9 - Cataract (Unspecified)
  ✓ H42 - Glaucoma
  ✓ H35.3 - Diabetic Retinopathy
  ✓ H33.0 - Retinal Detachment
  ✓ H53.0 - Amblyopia (Lazy Eye)
  ✓ H55 - Nystagmus
✅ ICD codes seeded

👥 Seeding sample patients...
  ✓ Ramya Pant (UHID: 9701)
  ✓ Jagdish Joshi (UHID: 9702)
  ✓ Gungun Chand (UHID: 9703)
✅ Sample patients seeded

✅ Database seeding completed successfully!
```

---

## Step 5: Complete Setup (Migrate + Seed)

To run both migration and seed in one command:

```bash
cd backend
npm run setup
```

---

## Test Users

After seeding, the following test users are available for login:

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| **admin** | admin123 | ADMIN | Full system access |
| **doctor** | doctor123 | DOCTOR | Consultation & diagnosis |
| **reception** | reception123 | RECEPTION | Patient registration & OPD queue |
| **billing** | billing123 | BILLING | Billing & charges |

---

## Step 6: Start the Server

```bash
cd backend
npm run dev
```

Expected output:

```
✅ Database connection successful: { now: 2026-01-02T... }
✅ HMS API running on http://localhost:3000
📚 Base URL: http://localhost:3000/api/v1
```

---

## Verify Database Setup

### Option 1: Using psql CLI

```bash
psql -U postgres -d eye_hospital_hms

-- Check tables
\dt

-- Check users
SELECT * FROM users;

-- Check patients
SELECT * FROM patients;
```

### Option 2: Using pgAdmin GUI

1. Connect to PostgreSQL
2. Navigate to Databases → eye_hospital_hms
3. Check Tables section

---

## Troubleshooting

### Error: "database does not exist"

**Solution:** Create the database first

```sql
CREATE DATABASE eye_hospital_hms;
```

### Error: "role "postgres" does not exist"

**Solution:** Check your PostgreSQL installation and credentials in `.env`

### Error: "Cannot connect to database"

**Solution:** 
- Ensure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
- Verify connection details in `.env`
- Try connecting manually: `psql -U postgres`

### Error: "relation "users" does not exist"

**Solution:** Run migrations first

```bash
npm run migrate
```

---

## Reset Database (Development Only)

To completely reset and reinitialize:

```bash
# Drop the database
dropdb eye_hospital_hms

# Recreate it
createdb eye_hospital_hms

# Run migrations and seeds
npm run setup
```

---

## Database Schema Details

### Primary Keys

- All main tables have auto-increment **integer** primary keys (id)
- **patients** table uses **UHID** (Unique Health ID) as primary key

### Foreign Keys

- `opd_queue.uhid` → `patients.uhid`
- `opd_queue.doctor_id` → `doctors.id`
- `consultations.opd_id` → `opd_queue.id`
- `bills.opd_id` → `opd_queue.id`
- `bill_items.bill_id` → `bills.id`
- `service_charges.category_id` → `service_categories.id`

### Indexes

Performance indexes are automatically created on:
- Patient phone numbers
- OPD queue dates and status
- Bill dates and UHID
- Doctor and category references

### Special Columns

- **editable_until**: Automatically calculated as bill_date + 6 months
- **local_uuid**: For offline synchronization
- **sync_status**: Tracks offline/online sync state
- **deleted_at**: Soft delete timestamp

---

## Next Steps

After database setup:

1. ✅ [Start the server](../README.md#starting-the-server)
2. ✅ [Test Auth endpoints](../modules/auth/AUTH_API.md)
3. ✅ [Implement remaining modules](../README.md#api-modules)

---

## Support

For issues, check:
- PostgreSQL version: `psql --version`
- Node version: `node --version`
- npm version: `npm --version`
- .env configuration

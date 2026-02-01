# PostgreSQL Local Setup Guide for Eye Hospital HMS

## Overview

This guide walks you through installing and configuring PostgreSQL locally for development on **macOS**. PostgreSQL is the database backend for the HMS system.

---

## Prerequisites

- **macOS 10.13+** (Monterey or newer recommended)
- **Homebrew** installed (if not, see [brew.sh](https://brew.sh))
- **Administrator access** on your machine
- **Terminal/iTerm2** app ready

---

## Method 1: Installation via Homebrew (Recommended for macOS)

### Step 1: Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify installation:
```bash
brew --version
```

Expected output:
```
Homebrew 4.2.x (or higher)
```

### Step 2: Install PostgreSQL via Homebrew

```bash
brew install postgresql@15
```

This installs PostgreSQL 15 (stable version recommended for production-like development).

### Step 3: Start PostgreSQL Service

Start PostgreSQL and have it run automatically on login:

```bash
brew services start postgresql@15
```

Verify it's running:
```bash
brew services list | grep postgresql
```

Expected output:
```
postgresql@15    started    root     /Library/LaunchDaemons/homebrew.mxcl.postgresql@15.plist
```

### Step 4: Verify Installation

Test the PostgreSQL installation:

```bash
psql --version
```

Expected output:
```
psql (PostgreSQL) 15.x
```

---

## Method 2: Installation via PostgreSQL.app (GUI Alternative)

If you prefer a graphical approach:

### Step 1: Download PostgreSQL.app

Visit [postgresql.app](https://postgresapp.com/) and download the latest version.

### Step 2: Move to Applications

Drag `Postgres.app` to your `Applications` folder.

### Step 3: Launch PostgreSQL.app

Open `Applications` → Double-click `Postgres.app`

### Step 4: Verify Installation

```bash
psql --version
```

---

## Step 3: Connect to PostgreSQL

### Using Default Credentials

```bash
psql -U postgres
```

Expected output:
```
psql (15.x)
Type "help" for help.

postgres=#
```

If you get a connection error, ensure PostgreSQL is running:
```bash
brew services start postgresql@15
```

---

## Step 4: Create the HMS Database

Once connected to PostgreSQL:

```bash
# The database 'seemant_hms_db' has already been created with:
# User: seemant_db_admin
# Password: S1dAd!tyaD0cs
# Host: localhost
# Port: 5432

# Verify the database exists
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT NOW();"
```

Expected output:
```
              now              
-------------------------------
 2026-01-02 10:30:45.123456+00
(1 row)
```

---

## Step 5: Verify Database Connection

### Check Tables

```bash
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "\dt"
```

You should see all 12 tables:
- bill_items
- bills
- consultation_icd
- consultation_icd_map
- consultations
- doctors
- icd_codes
- icd_master
- opd_queue
- patients
- roles
- service_categories
- service_charges
- users
- visit_types

### Check Seed Data

```bash
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT username FROM users LIMIT 5;"
```

Expected output showing test users:
```
 username  
-----------
 admin
 doctor
 reception
 billing
(4 rows)
```

---

## Step 6: Configure Backend Connection

Update `.env` in the `backend/` folder:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=seemant_db_admin
DB_PASSWORD=S1dAd!tyaD0cs
DB_NAME=seemant_hms_db
```

The `.env` file has already been configured with these values.

---

## Step 5: Configure PostgreSQL Password (Optional but Recommended)

By default, PostgreSQL uses the credentials configured in your database. The HMS database uses:

- **User:** seemant_db_admin
- **Password:** S1dAd!tyaD0cs

These are already set and do NOT need to be changed.

### Verify Credentials Work

```bash
psql -h localhost -U seemant_db_admin -d seemant_hms_db
```

If you enter this command, you should be prompted for password:
```
Password for user seemant_db_admin:
```

Enter: `S1dAd!tyaD0cs`

You should see the `seemant_hms_db=#` prompt.

---

## Step 6: Update .env File

Your `.env` file has already been configured:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=seemant_db_admin
DB_PASSWORD=S1dAd!tyaD0cs
DB_NAME=seemant_hms_db
```

No changes needed!

---

## Common Commands

### Start/Stop PostgreSQL

```bash
# Start PostgreSQL
brew services start postgresql@15

# Stop PostgreSQL
brew services stop postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15

# Check status
brew services list
```

### Connect to HMS Database

```bash
# Connect with seemant_db_admin user
psql -h localhost -U seemant_db_admin -d seemant_hms_db

# When prompted, enter password: S1dAd!tyaD0cs
```

### Database Management

```bash
# List all databases
psql -h localhost -U seemant_db_admin -l

# List all tables in HMS database
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "\dt"

# View specific table
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT * FROM users;"

# View users
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT username, role FROM users;"

# Check row counts
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT COUNT(*) FROM patients;"

# Backup database
pg_dump -h localhost -U seemant_db_admin seemant_hms_db > hms_backup.sql

# Restore database
psql -h localhost -U seemant_db_admin seemant_hms_db < hms_backup.sql
```

---

## Troubleshooting

### ❌ Error: "psql: command not found"

**Solution:** PostgreSQL is not in your PATH. Add it:

```bash
# For Homebrew installation
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql --version
```

### ❌ Error: "could not connect to server: No such file or directory"

**Solution:** PostgreSQL is not running

```bash
# Start it
brew services start postgresql@15

# Verify status
brew services list | grep postgresql
```

### ❌ Error: "FATAL: password authentication failed for user 'seemant_db_admin'"

**Solution:** Check your password. It should be: `S1dAd!tyaD0cs`

```bash
# Verify .env file
cat backend/.env | grep DB_PASSWORD

# Test connection with correct credentials
psql -h localhost -U seemant_db_admin -d seemant_hms_db
```

### ❌ Error: "database 'seemant_hms_db' does not exist"

**Solution:** Database was not created. Verify it exists:

```bash
psql -h localhost -U seemant_db_admin -l | grep seemant_hms_db
```

If not listed, ask your database administrator to create it.

### ❌ Error: "FATAL: Ident authentication failed"

**Solution:** Make sure you're using the correct credentials:

```bash
# Should use:
psql -h localhost -U seemant_db_admin -d seemant_hms_db

# NOT:
psql -U postgres
```

### ❌ Error: "could not translate host name 'localhost' to address"

**Solution:** Ensure PostgreSQL is listening on localhost:

```bash
# On macOS with Homebrew:
cat /usr/local/var/postgres/postgresql.conf | grep listen_addresses

# Should show:
# listen_addresses = 'localhost'

# If not, restart PostgreSQL
brew services restart postgresql@15
```

---

## Verify Complete Setup

Run this comprehensive check:

```bash
# 1. Check PostgreSQL is running
brew services list | grep postgresql

# 2. Check PostgreSQL version
psql --version

# 3. Check database exists and can connect
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT NOW();"

# 4. Check tables exist
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "\dt"

# 5. Check test users
psql -h localhost -U seemant_db_admin -d seemant_hms_db -c "SELECT username, role FROM users;"

# 6. Test backend connection
cd backend && npm run dev
```

Expected output for test #5:
```
 username  | role
-----------+----------
 admin     | ADMIN
 doctor    | DOCTOR
 reception | RECEPTION
 billing   | BILLING
```

Expected output for test #6:
```
✅ Database connection successful: { now: 2026-01-02T10:30:45.123Z }
✅ HMS API running on http://localhost:3000
📚 Base URL: http://localhost:3000/api/v1
```

If all steps succeed, you're ready! ✅

---

## macOS-Specific Notes

### Default Installation Paths

```bash
# PostgreSQL binary location
/usr/local/opt/postgresql@15/bin/

# PostgreSQL data directory
/usr/local/var/postgres

# Logs
/usr/local/var/postgres/postgresql.log
```

### Using PostgreSQL with Finder

You can create a shortcut in **Terminal Favorites**:

1. Open **Terminal**
2. `psql -U postgres -d eye_hospital_hms`
3. Drag this to Favorites for quick access

### Recommended macOS Tools (Optional)

For a visual interface to manage PostgreSQL:

```bash
# Option 1: pgAdmin (web-based)
brew install pgadmin4

# Option 2: DBeaver (desktop app)
brew install dbeaver-community

# Option 3: Postico (lightweight, native macOS)
# Download from https://eggerapps.at/postico/
```

---

## Next Steps

Once PostgreSQL is installed and running:

1. ✅ Create database: `createdb eye_hospital_hms`
2. ✅ Run migrations: `npm run migrate`
3. ✅ Seed data: `npm run seed`
4. ✅ Validate: `npm run validate`
5. ✅ Start server: `npm run dev`
6. ✅ Test API: [Auth endpoints](../backend/src/modules/auth/AUTH_API.md)

---

## Quick Start Checklist

- [ ] Homebrew installed
- [ ] PostgreSQL installed (`brew install postgresql@15`)
- [ ] PostgreSQL running (`brew services start postgresql@15`)
- [ ] Database created (`createdb eye_hospital_hms`)
- [ ] Backend `.env` configured
- [ ] Migrations run (`npm run migrate`)
- [ ] Data seeded (`npm run seed`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Can login with test user (admin/admin123)

---

## Additional Resources

- **PostgreSQL Official**: https://www.postgresql.org/docs/15/
- **Homebrew PostgreSQL**: https://formulae.brew.sh/formula/postgresql@15
- **pgAdmin**: https://www.pgadmin.org/ (web UI for PostgreSQL)
- **DBeaver**: https://dbeaver.io/ (free database tool)

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section above
2. Verify PostgreSQL is running: `brew services list`
3. Check .env file configuration
4. View PostgreSQL logs: `/usr/local/var/postgres/postgresql.log`
5. Test connection manually: `psql -U postgres`

Good luck! 🚀

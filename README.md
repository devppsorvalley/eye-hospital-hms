=======
# Eye Hospital HMS MVP

Production-grade Hospital Management System for eye care facility. Built with Node.js, Express, React, and PostgreSQL.

---

## 🚀 Quick Start

### Automated Setup (Recommended)

Run this one command to set up everything:

```bash
bash setup.sh
```

This script will:
- ✅ Install/verify Homebrew
- ✅ Install PostgreSQL 15
- ✅ Create `eye_hospital_hms` database
- ✅ Install backend dependencies
- ✅ Run database migrations
- ✅ Seed master data
- ✅ Validate database setup

### Manual Setup

See detailed instructions in:
- **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** — PostgreSQL installation guide
- **[backend/DB_SETUP.md](backend/DB_SETUP.md)** — Database configuration guide

---

## 📋 Project Structure

```
eye-hospital-hms-mvp/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── app.js             # Express app
│   │   ├── server.js          # Server bootstrap
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Auth, RBAC, error handling
│   │   ├── modules/           # API modules (auth, patients, opd, billing, etc.)
│   │   ├── db/                # Database setup, migrations, seeds
│   │   └── utils/             # Utilities & validators
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── DB_SETUP.md           # Database documentation
│
├── frontend/                   # React UI (coming soon)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docs/                       # Documentation & mockups
│   ├── MVP_SCOPE.md           # Project scope
│   ├── functional_spec/       # Functional specifications
│   └── mockups/               # UI mockups
│
├── POSTGRESQL_SETUP.md        # PostgreSQL local setup
├── setup.sh                   # Automated setup script
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 15+
- **Authentication:** JWT (jsonwebtoken)
- **Password:** bcryptjs
- **Utilities:** dotenv, pg

### Frontend (Planned)
- **Framework:** React 18+
- **Build Tool:** Vite
- **Router:** React Router v6

---

## ⚙️ Prerequisites

- **macOS 10.13+** (Monterey or newer)
- **Homebrew** (auto-installed by setup.sh)
- **Node.js 18+** ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **npm 9+**

Check versions:
```bash
node --version
npm --version
```

---

## 🎯 Getting Started

### 1. **First Time Setup**

```bash
# Run automated setup
bash setup.sh

# Or manual setup
brew install postgresql@15
brew services start postgresql@15
createdb eye_hospital_hms
cd backend
npm install
npm run setup
npm run dev
```

### 2. **Start the Server**

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Database connection successful
✅ HMS API running on http://localhost:3000
📚 Base URL: http://localhost:3000/api/v1
```

### 3. **Test the API**

```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Login (get JWT token)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response:
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "username": "admin",
#     "role": "ADMIN"
#   }
# }
```

---

## 🔐 Test Users

After setup, use these credentials:

| Username | Password | Role | Access |
|----------|----------|------|--------|
| **admin** | admin123 | ADMIN | Full system |
| **doctor** | doctor123 | DOCTOR | Consultations |
| **reception** | reception123 | RECEPTION | OPD & patients |
| **billing** | billing123 | BILLING | Billing module |

---

## 📦 Available Commands

### Backend

```bash
cd backend

# Development
npm run dev              # Start server with auto-reload
npm start              # Start server

# Database
npm run migrate        # Create schema
npm run seed          # Populate master data
npm run validate      # Check database structure
npm run setup         # Run all three above

# Cleanup
npm run format        # Format code (prettier)
npm run lint          # Lint code (eslint)
```

---

## 📚 API Endpoints

### Auth Module
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/logout` — Logout
- `GET /api/v1/auth/me` — Get current user
- `POST /api/v1/auth/change-password` — Change password

Documentation: [Auth API](backend/src/modules/auth/AUTH_API.md)

### Other Modules (Coming Soon)
- **Patients** — Registration, search, history
- **OPD** — Queue management, consultation
- **Billing** — Bill creation, payment tracking
- **Masters** — Service charges, categories, ICD codes

---

## 🗄️ Database

### Schema Overview

12 tables with relationships:

| Table | Purpose |
|-------|---------|
| users | System users |
| patients | Patient master data |
| opd_queue | Daily OPD queue |
| consultations | Doctor notes |
| bills | Billing records |
| bill_items | Line items |
| service_charges | Service master |
| icd_master | ICD-10 codes |
| doctors | Doctor list |
| visit_types | Visit categories |
| service_categories | Charge categories |
| roles | User roles |

Full schema: [seemant_hms_db_schema.sql](docs/seemant_hms_db_schema.sql)

### Database Management

```bash
# Connect to database
psql -U postgres -d eye_hospital_hms

# List tables
\dt

# View specific table
SELECT * FROM users;

# Backup database
pg_dump -U postgres eye_hospital_hms > backup.sql

# Restore database
psql -U postgres eye_hospital_hms < backup.sql
```

---

## 🔧 Configuration

### Environment Variables (.env)

Located in `backend/.env`:

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=eye_hospital_hms

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## 📖 Documentation

- **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** — PostgreSQL installation
- **[backend/DB_SETUP.md](backend/DB_SETUP.md)** — Database configuration
- **[backend/DB_CONFIG_SUMMARY.md](backend/DB_CONFIG_SUMMARY.md)** — Schema overview
- **[backend/src/modules/auth/AUTH_API.md](backend/src/modules/auth/AUTH_API.md)** — Auth endpoints
- **[docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)** — Project scope
- **[docs/functional_spec/](docs/functional_spec/)** — Feature specifications

---

## 🐛 Troubleshooting

### PostgreSQL Issues

```bash
# Check if running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Stop PostgreSQL
brew services stop postgresql@15

# View logs
tail -f /usr/local/var/postgres/postgresql.log
```

### Connection Issues

```bash
# Test connection
psql -U postgres

# Check database exists
psql -U postgres -l | grep eye_hospital_hms

# Recreate database
dropdb eye_hospital_hms
createdb eye_hospital_hms
npm run setup
```

### Backend Issues

```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check .env file
cat backend/.env

# View server logs
npm run dev   # Logs will appear in terminal
```

---

## 🎓 Learning Resources

- **PostgreSQL:** https://www.postgresql.org/docs/15/
- **Express.js:** https://expressjs.com/
- **JWT:** https://jwt.io/
- **Node.js:** https://nodejs.org/docs/

---

## 📝 Architecture Highlights

✅ **Layered Architecture:** Routes → Controllers → Services → SQL  
✅ **RBAC Enforcement:** Role-based access control on all endpoints  
✅ **Transaction Safety:** Database transactions for complex operations  
✅ **Error Handling:** Centralized error middleware  
✅ **Input Validation:** Request validation utilities  
✅ **Offline Support:** Sync tracking for offline mode  
✅ **Soft Deletes:** Logical deletion with timestamps  
✅ **Audit Trail:** Created/updated/deleted timestamps  

---

## 🚀 Next Steps

1. ✅ Run `bash setup.sh`
2. ✅ Start server with `npm run dev`
3. ✅ Test Auth API with provided curl commands
4. ✅ Implement Patients module
5. ✅ Implement OPD module
6. ✅ Implement Consultation module
7. ✅ Implement Billing module
8. ✅ Build React frontend

---

## 🤝 Contributing

Follow these guidelines:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push branch: `git push origin feature/my-feature`
4. Create Pull Request

### Code Style

- Use 2-space indentation
- Format with Prettier: `npm run format`
- Lint with ESLint: `npm run lint`
- Add descriptive commit messages

---

## 📄 License

Private project for Seemant Eye Hospital.

---

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review documentation in `docs/`
3. Check database logs: `psql -U postgres`
4. Check server logs: Terminal output from `npm run dev`

---

**Last Updated:** January 2, 2026  
**Status:** Active Development  
**Version:** 0.1.0-MVP
>>>>>>> caec2101d48ce3d68486986fe9067909b87ad717

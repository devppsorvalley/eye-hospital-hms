# Quick Reference Card

## 🎯 One-Command Setup

```bash
bash setup.sh
```

---

## ⏱️ 5-Minute Checklist

- [ ] Run `bash setup.sh` (automated setup)
- [ ] Wait for "✅ Setup Complete!" message
- [ ] Run `npm run dev` in backend folder
- [ ] Test: `curl http://localhost:3000/health`
- [ ] Login: `username: admin` / `password: admin123`

---

## 📌 Essential Commands

### Start/Stop PostgreSQL
```bash
brew services start postgresql@15   # Start
brew services stop postgresql@15    # Stop
brew services list                  # Status
```

### Start Backend
```bash
cd backend
npm run dev          # Development with auto-reload
npm start           # Production mode
```

### Database Operations
```bash
npm run migrate     # Create schema
npm run seed       # Add test data
npm run validate   # Check setup
npm run setup      # Do all three above
```

### Connect to Database
```bash
psql -U postgres                    # Connect as postgres
psql -U postgres -d eye_hospital_hms  # Connect to HMS database
\l                                  # List databases
\dt                                 # List tables
SELECT * FROM users;               # View users
\q                                  # Exit
```

---

## 🔑 Test Credentials

```
Username: admin        Password: admin123       Role: ADMIN
Username: doctor       Password: doctor123      Role: DOCTOR
Username: reception    Password: reception123   Role: RECEPTION
Username: billing      Password: billing123     Role: BILLING
```

---

## 🌐 API Endpoints

### Health Check (No Auth)
```bash
GET http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Current User (Requires Token)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js              Express app
│   ├── server.js           Server startup
│   ├── config/db.js        Database pool
│   ├── middleware/         Auth, RBAC, errors
│   ├── modules/            API modules
│   │   └── auth/           Login, change password
│   └── db/                 Migrations, seeds
├── .env                    Configuration
└── package.json            Dependencies
```

---

## 🔧 Troubleshooting Quick Fixes

### PostgreSQL Won't Start
```bash
brew services start postgresql@15
brew services list  # Check status
```

### Database Doesn't Exist
```bash
createdb eye_hospital_hms
npm run setup
```

### Backend Connection Fails
```bash
# Check .env file
cat backend/.env

# Verify PostgreSQL is running
psql -U postgres

# Restart everything
brew services restart postgresql@15
npm run dev
```

### "psql: command not found"
```bash
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
psql --version
```

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) | PostgreSQL installation |
| [backend/DB_SETUP.md](backend/DB_SETUP.md) | Database setup |
| [backend/DB_CONFIG_SUMMARY.md](backend/DB_CONFIG_SUMMARY.md) | Schema overview |
| [backend/src/modules/auth/AUTH_API.md](backend/src/modules/auth/AUTH_API.md) | Auth endpoints |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) | Project scope |

---

## 🎯 Next Steps After Setup

1. **Test API**
   ```bash
   curl http://localhost:3000/api/v1/auth/login \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. **Implement Patients Module**
   - Create routes, controller, service, SQL

3. **Implement OPD Module**
   - Queue management endpoints

4. **Implement Consultation Module**
   - Doctor notes with ICD codes

5. **Implement Billing Module**
   - Transaction-safe billing

6. **Build React Frontend**
   - Connect to API endpoints

---

## 🆘 Getting Help

1. Check relevant documentation file above
2. Review error messages carefully
3. Check PostgreSQL is running: `brew services list`
4. Check .env configuration
5. View server logs in terminal during `npm run dev`

---

## 💡 Pro Tips

- Use `npm run dev` in terminal to see real-time logs
- Keep PostgreSQL running in background: `brew services start postgresql@15`
- Backup database frequently: `pg_dump -U postgres eye_hospital_hms > backup.sql`
- Use Postman or curl for API testing
- Check table contents: `psql -U postgres -d eye_hospital_hms -c "SELECT * FROM users;"`

---

**Your HMS is ready! 🚀**

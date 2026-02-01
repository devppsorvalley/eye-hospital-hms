# Eye Hospital HMS - AI Agent Instructions

## Project Overview
Production-grade Hospital Management System for eye care facilities. 3-tier architecture: React frontend, Express backend (Node.js ESM), PostgreSQL 15 database. Built for NGO environments with limited budgets and intermittent connectivity.

**Status:** Backend 80% complete (Auth, Patients, OPD modules production-ready). Frontend: Early development phase.

## Architecture Pattern

### Backend Module Structure (src/modules/)
Each feature module follows strict 6-file convention:
```
<module>/
  ├── <module>.sql.js       # Raw SQL queries exported as object
  ├── <module>.service.js   # Business logic, calls SQL queries
  ├── <module>.controller.js # HTTP handlers, calls services
  ├── <module>.routes.js    # Express routes, applies middleware
  ├── <module>.validation.js # Input validation schemas
  └── <MODULE>_API.md       # API documentation
```

**Critical**: Services MUST import queries from `.sql.js` files. Controllers MUST NOT contain SQL or business logic. See [backend/src/modules/patients/](backend/src/modules/patients/) for reference implementation.

### Route Registration
All module routes registered in [backend/src/routes.js](backend/src/routes.js) under `/api/v1/<module>`. Auth middleware applied in individual route files, not globally.

### Database Layer
- **Connection**: Use `pool` from [backend/src/config/db.js](backend/src/config/db.js) for all queries
- **Migrations**: Sequential numbered `.sql` files in [backend/src/db/migrations/](backend/src/db/migrations/)
  - Run: `npm run migrate` (tracks state in `migrations` table)
  - Idempotent design - safe to re-run
- **Raw SQL only**: No ORM. Parameterized queries ($1, $2) for all user inputs

### Authentication & Authorization
- **JWT tokens**: 7-day expiration, generated in [auth.service.js](backend/src/modules/auth/auth.service.js)
- **Middleware chain**: 
  1. `authMiddleware` verifies JWT, attaches `req.user`
  2. `rbacMiddleware(['role'])` checks role permissions
- **Roles**: `admin`, `doctor`, `reception` (defined in [backend/src/config/constants.js](backend/src/config/constants.js))
- **Protected routes**: Apply both middlewares in route files (see [opd.routes.js](backend/src/modules/opd/opd.routes.js))

### Error Handling
Global error handler in [backend/src/middleware/error.middleware.js](backend/src/middleware/error.middleware.js). Controllers should throw errors; middleware formats response. Never send duplicate responses.

## Critical Conventions

### UHID Generation
Patient UHIDs use **97xx format** (9700, 9701...). Generation logic in [patients.service.js](backend/src/modules/patients/patients.service.js) line 100+. Query existing max UHID, increment by 1.

### OPD Serial Numbers
Auto-generated per doctor per day (resets daily). Logic in [opd.service.js](backend/src/modules/opd/opd.service.js). Query pattern:
```sql
SELECT COALESCE(MAX(serial_no), 0) + 1 
FROM opd_queue 
WHERE doctor_id = $1 AND visit_date = $2
```

### ESM Import Syntax
- Backend uses `"type": "module"` in [package.json](backend/package.json)
- All imports require `.js` extension: `import x from './file.js'`
- No `require()` or CommonJS

### Response Format
Use utility functions from [backend/src/utils/response.js](backend/src/utils/response.js):
- Success: `return res.json({ ...data })`
- Error: Throw errors, caught by global handler

### Pagination Standard
All list endpoints return:
```javascript
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5
  }
}
```

## Development Workflows

### Setup & Run
```bash
# Initial setup (automated)
bash setup.sh

# Start backend (from project root or backend/)
npm run dev          # Port 3000

# Start frontend (from frontend/)
npm run dev          # Port 5173

# Database operations
npm run migrate      # Run migrations
npm run seed         # Seed test users
npm run validate     # Check DB state
```

### Database Changes
1. Create numbered migration: `backend/src/db/migrations/002_feature_name.sql`
2. Use `IF NOT EXISTS` for tables/indexes (idempotent)
3. Run `npm run migrate` to apply
4. Update module `.sql.js` files with new queries

### Adding New API Module
1. Create folder: `backend/src/modules/<name>/`
2. Implement 6 files per pattern above
3. Register in [backend/src/routes.js](backend/src/routes.js)
4. Add middleware: `authMiddleware`, `rbacMiddleware(['role'])`
5. Write API docs: `<MODULE>_API.md`

### Testing APIs
Default test user (seeded):
```
Username: admin
Password: admin123
Role: admin
```

Login endpoint: `POST /api/v1/auth/login`
Returns JWT token for Authorization header: `Bearer <token>`

## Key Files Reference
- **App entry**: [backend/src/server.js](backend/src/server.js) → [app.js](backend/src/app.js)
- **DB config**: [backend/src/config/db.js](backend/src/config/db.js) (uses .env vars)
- **Auth middleware**: [backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js)
- **RBAC middleware**: [backend/src/middleware/rbac.middleware.js](backend/src/middleware/rbac.middleware.js)
- **Constants**: [backend/src/config/constants.js](backend/src/config/constants.js) (roles)

## Common Pitfalls
- ❌ Don't use ORM or query builders - raw SQL only
- ❌ Don't skip `.js` extensions in imports
- ❌ Don't apply auth middleware globally in app.js - use route-level
- ❌ Don't hardcode database credentials - use [backend/src/config/env.config.js](backend/src/config/env.config.js)
- ❌ Don't create migrations without sequential numbering (001_, 002_...)
- ❌ Don't put business logic in controllers - belongs in services
- ❌ Don't forget parameterized queries ($1, $2) for SQL injection prevention

## Frontend Context
- **Router**: React Router v6 with `<ProtectedRoute>` wrapper in [AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx)
- **State**: Simple store pattern (see [auth.store.js](frontend/src/store/auth.store.js))
- **API client**: Axios configured in [frontend/src/api/axios.js](frontend/src/api/axios.js)
- **Styling**: CSS modules per component/page (e.g., [login.css](frontend/src/styles/login.css))

## Documentation
- **Scope**: [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) - Feature requirements
- **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md) - Module completion tracking
- **Mockups**: [docs/mockups/frozen/](docs/mockups/frozen/) - UI references
- **Functional specs**: [docs/functional_spec/](docs/functional_spec/) - Per-module requirements

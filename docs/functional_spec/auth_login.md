# Authentication & Login — Functional Specification (MVP)

## Purpose
Provide secure access to the HMS based on user roles with a simple, fast login suitable for NGO hospital environments.

## Users
- Admin
- Doctor
- OPD Reception
- OT Reception

## Functional Flow
1. User enters **Username** and **Password**
2. System validates credentials
3. User is redirected based on role:
   - Admin → Admin Dashboard
   - Doctor → Patient Consultation
   - OPD Reception → Patient Registration / OPD
   - OT Reception → Billing

## Functional Requirements
- Username + password authentication
- Role-based redirection
- Disabled users cannot log in
- Error handling for:
  - Invalid credentials
  - Disabled account

## Non-Functional
- Passwords stored as hashed values
- Offline-capable authentication (local cache for MVP demo)
- JWT-ready architecture (future)

## Out of Scope (MVP)
- Forgot password (self-service)
- MFA
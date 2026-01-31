# OPD — Functional Specification (Production-grade)

## Purpose
Manage OPD queue efficiently with doctor-wise tracking.

## Users
- OPD Reception

## Visit Types
- New
- Follow-up
- Express
- ECHS

## Visit Type Logic
- Visit Type and default amount stored in DB
- Selecting Visit Type auto-loads amount
- Amount remains editable

## Queue Behavior
- Daily serial resets per doctor
- Status lifecycle:
  - Waiting → In Progress → Completed

## Left Panel
- Patient Details (non-editable)
- Visit Type
- Amount
- Doctor assignment
- Add to Queue

## Right Panel (Order)
1. Search Patient (UHID / Name / Phone / Address)
2. Live OPD Queue
3. Recent Registrations (last 5)

## Printing
- Token printing
- Receipt printing

## Rules
- Same patient can re-enter queue with new serial
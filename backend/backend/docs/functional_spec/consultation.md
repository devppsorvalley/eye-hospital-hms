# Patient Consultation — Functional Specification (Production-grade)

## Purpose
Enable doctors to consult patients efficiently with clinical context.

## Users
- Doctor

## Left Panel
### Patient Details
- UHID
- OPD Serial
- Name
- Gender
- Age
- Phone

### Clinical Notes
- ICD Codes
  - Multi-select
  - Loaded from ICD Master
- Diagnosis
- Treatment Plan
- Follow-up Instructions

### AI Summary (Optional)
- Toggle to show/hide
- Auto-generated summary (mock)
- Thumbs up/down feedback

## Right Panel
1. Today’s OPD Queue (logged-in doctor only)
2. Patient History (when patient loaded)

## Patient History
- Previous visit dates
- Doctor name
- Status
- Diagnosis summary (if available)
- Read-only

## Status Logic
- Load patient → In Progress
- Update → Completed

## Rules
- Only doctor can edit clinical notes
- Status auto-managed
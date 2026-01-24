# Patient Registration — Functional Specification (MVP)

## Purpose
Register and manage patient demographic information.

## Users
- OPD Reception

## Core Features
- New patient registration
- Search existing patient
- Edit demographics

## Fields
- UHID (auto-generated)
- Name (First, Middle, Last)
- Gender
- DOB / Age (auto-calculated)
- Phone (with ISD)
- Address:
  - Address
  - Village
  - Block
  - Tehsil
  - District
- Relation (S/o, D/o, W/o)
- Registration Date & Time
- Doctor (optional)
- Referred By (optional)
- Chief Complaint (optional)
- Photo
- Vitals

## Functional Rules
- UHID is immutable
- Age auto-calculates from DOB
- Address is concatenated for OPD/Billing use

## UI
- Recent Registrations shown
- Search by UHID / Name / Phone / Address
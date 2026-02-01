# Billing — Functional Specification (Production-grade)

## Purpose
Fast and accurate billing with category-driven charges.

## Users
- OPD Reception
- OT Reception

## Left Panel
- Date
- Bill Date
- UHID Search
- Patient Details
- Charges Section
- Totals & Discount
- Bill Type
- Save / Print

## Right Panel
1. Patient Search
2. Today’s Bills

## Categories & Charges
- Category selected first
- Charges filtered by Category
- Qty & Rate editable
- Auto total calculation

## Bill Types & Conditional Fields
- Cash → none
- UPI → UPI Reference
- Card → Card Reference
- Ayushman → Aadhaar / Card / Ration
- ECHS → Referral No / Service No / Claim ID
- TPA / ESIS / Golden Card

## Rules
- Charges enabled only after patient load
- Editable bills up to 6 months
- Offline-first supported

## Buttons
- Add Charge
- Whole Bill Delete
- Print Receipt
- Clear Form
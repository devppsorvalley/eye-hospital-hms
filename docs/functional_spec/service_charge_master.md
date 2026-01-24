# Service Charge Master — Functional Specification (Production-grade)

## Purpose
Central master for defining all billable services and visit charges.

## Users
- Admin only

## UI Layout
### Left Panel
- Charge Entry / Edit Form
- Charge List (below the form)

### Right Panel
- Recently Added Charges

## Fields
- Category (Combo box)
  - Default values:
    - Cash/UPI/Card
    - Ayushman
    - ECHS
  - Allows free text to add new categories
- Charge Name (text)
- Default Rate (₹)
- Active (Yes/No)
- Description (optional)

## Functional Rules
- Category must be selected before Charge Name is enabled
- Charges are always tied to a Category
- Charges appear in Billing only under their Category
- Add / Update:
  - Updates Charge List
  - Updates Recently Added Charges
- Delete:
  - Soft delete (inactive)

## Data Usage
- Used by:
  - OPD (Visit Type amount mapping)
  - Billing (Charge selection)

## Non-Functional
- Category and Charges cached locally
- API-first design
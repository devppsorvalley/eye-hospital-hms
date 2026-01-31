# Eye Hospital HMS — MVP Scope Document

## 1. Objective
The objective of this MVP is to build a **production-grade, modular, and scalable Hospital Management System (HMS)** for an eye hospital, suitable for NGO environments with limited budgets and intermittent internet connectivity.  
The MVP will digitize core operational workflows while remaining extensible for future phases.

---

## 2. Target Users & Roles
The system will support the following roles:

- **Admin**
  - System configuration
  - User & role management
  - Service/charge master maintenance
- **Doctor**
  - View OPD queue
  - Perform patient consultations
  - Enter clinical notes
  - Use AI-assisted summaries (experimental)
- **OPD Reception**
  - Patient registration
  - OPD queue management
  - Token & receipt printing   
  - Billing
  - Charge application
  - Receipt generation
- **OT Reception**
  - Billing
  - Charge application
  - Receipt generation

Role-based access control (RBAC) will strictly govern visibility and actions.

---

## 3. In-Scope Modules (MVP)

### 3.1 Authentication & Login
- Username + password login
- Role-based redirection after login
- Session-based authentication (JWT in later phases)

---

### 3.2 Admin Panel
Admin dashboard providing navigation to:
- User & Role Management
- Service Charge Master
- System configuration (future)

---

### 3.3 User & Role Management
- Add / edit users
- Assign roles:
  - Admin
  - Doctor
  - OPD Reception
  - OT Reception
- Enable / disable users
- Password reset (admin-driven)

---

### 3.4 Service Charge Master
- Add / update / delete service charges
- Fields:
  - Charge Type
  - Category (Cash/UPI/Card, Ayushman, ECHS)
  - Charge Name
  - Default Rate (₹)
  - Active status
  - Description (optional)
- Used by Billing module
- Stored centrally and reusable

- Category field behavior:
  - Category appears first in the form
  - Implemented as a combo-box (select + free text)
  - Pre-filled values: Cash/UPI/Card, Ayushman, ECHS
  - Admin can add and persist new categories

- Charge Name behavior:
  - Enabled only after Category selection
  - Entered manually via text box
  - Charge is always linked to a Category

- Category-to-Charge mapping:
  - Drives charge visibility in Billing module

---

### 3.5 Patient Registration
- Register new patients
- Auto-generate UHID
- Capture:
  - Name (First, Middle, Last)
  - Registration Date
  - Gender
  - DOB / Age (auto-calculated)
  - Phone (with ISD)
  - Address (Village, Block, Tehsil, District, Address)
  - Relation (S/o, D/o, W/o)
  - Time
  - Doctor (optional)
  - Referred By (optional)
  - Chief Eye Complaint (optional)
  - Photo (upload/webcam)
  - Vitals (Weight/SPO2/Temperature/Pulse/BP)
- Search existing patients (UHID/Name/Phone/Address)
- Edit basic demographics
- Registration data feeds OPD, Billing, Consultation
- Show recent registrations

---

### 3.6 OPD (Outpatient Department)
- Add patients to OPD queue
- Assign doctor
- Auto-generate daily serial per doctor
- Visit types:
  - New
  - Follow-up
  - Express
  - ECHS
- Queue features:
  - Status tracking: Waiting → In Progress → Completed
  - Per-doctor queues
  - Token printing
  - Receipt printing
- Right panel:
  - Patient search (UHID/Name/Phone/Address)
  - Live OPD queue by doctor/All doctors
  - Recent Registrations

---

### 3.7 Patient Consultation (Doctor View)
- Doctor-specific view
- Shows only logged-in doctor’s OPD queue
- Displays:
  - UHID
  - OPD Serial
  - Patient demographics
- Clinical notes sections:
  - ICD Codes:
    - Selected from ICD Master table
    - Multi-select supported
    - Pre-filled with sample ophthalmology ICD codes for MVP
  - Diagnosis
  - Treatment Plan
  - Follow-up Instructions
- AI Summary (optional, experimental):
  - Toggle visibility
  - Thumbs up/down feedback
- Status transitions:
  - Load patient → In Progress
  - Update → Completed
- Patient History Panel:
  - Visible on the right panel below Today’s OPD Queue
  - Automatically loads when a patient is selected from OPD queue
  - Displays historical information for the patient, including:
    - Previous OPD visit dates
    - Consulting doctor
    - Visit status (Completed)
    - High-level diagnosis summary (if available)
  - Read-only in MVP
  - Intended to assist doctors with clinical context

---

### 3.8 Billing
- Search by UHID + Bill Date on main (left) panel
- Patient search (UHID/Name/Phone/Address) on right panel 
- Auto-load patient details
- Select Category from service master
- Add multiple charges from Service Master per Category
- Editable Qty & Rate
- Auto-calculated totals
- Discount (final deduction in ₹)
- Bill Types:
  - Cash
  - UPI (fill UPI Reference field when selected)
  - Credit/Debit Card
  - Ayushman (fill Aadhaar, Ayushman Card, Ration Card fields when selected)
  - TPA
  - ESIS
  - ECHS (fill Referral No, Service No, Claim ID when selected)
  - Golden Card
- Print receipt immediately
- Edit bills up to 6 months
- Offline-first support
- Recent registrations on the right panel below Search results
- Today's Bills (recent) on right panel below recent registrations

- Category field:
  - Category is selected before charges
  - Categories sourced from Service Charge Master

- Charge selection:
  - Charges are filtered dynamically based on selected Category
  - Prevents cross-category charge selection

- Bill Type conditional fields:
  - Cash → no extra fields
  - UPI → UPI Reference Number
  - Credit/Debit Card → Card Reference (future)
  - Ayushman → Aadhaar No, Ayushman Card No, Ration Card No
  - ECHS → Referral No, Service No, Claim ID

---

### 3.9 Dashboard
Basic analytics for demo and decision-making:
- Total registrations (daily / monthly)
- OPD visits per doctor
- Billing totals
- Common services used
- Follow-ups vs new visits
- Simple charts and KPIs

---

## 4. Out of Scope (MVP)
- Inventory management
- Lab integrations
- EMR-level clinical records
- Insurance claim processing
- External device integrations
- Cloud multi-hospital federation

---

## 5. Non-Functional Requirements

### 5.1 Architecture
- Modular frontend (React + Vite)
- Modular backend (Node.js + Express)
- PostgreSQL database
- API-first design
- Offline-first (localStorage + sync-ready)

### 5.2 Security
- RBAC enforced at API & UI
- Password hashing
- Audit-friendly logging
- Secure local LAN deployment

### 5.3 Deployment
- Local system / LAN-based deployment
- Cloud-ready architecture (future)
- Docker-ready (optional phase)

### 5.4 Performance
- Target operation time:
  - Registration: < 1 min
  - OPD add: < 10 sec
  - Billing: ~20 sec

---

## 6. Future Phases (Post-MVP)
- SMS Integration for OPD and Billing
- Inventory & pharmacy
- IPD & OT workflows
- Multi-branch support
- Advanced analytics
- Mobile/tablet support
- Cloud sync & disaster recovery

---

## 7. Success Criteria
- Smooth OPD flow with live queue
- Reduced registration & billing time
- Minimal training required for staff
- Stable offline operation
- Positive feedback from doctors & operators

---

## 8. Seed Data & Demo Configuration (MVP)

To support demos and offline-first usage, the MVP will ship with seed data that can be reset safely.

### 8.1 Default Roles
- Admin
- Doctor
- OPD Reception
- OT Reception

### 8.2 Demo Users
- admin / admin@123 (Admin)
- dr.aditya / doctor@123 (Doctor)
- opd.reception / opd@123 (OPD Reception)
- ot.reception / ot@123 (OT Reception)

### 8.3 Demo Masters
- Category:
  - Cash/UPI/Card
  - Ayushman
  - ECHS
- Service Charges (for Category: Cash/UPI/Card):
  - OPD Consultation – ₹150
  - Follow-up Visit – ₹0
  - Express OPD – ₹250
  - Eye Examination – ₹200

- ICD Master (sample data for demo):
  - H25.1 – Senile nuclear cataract
  - H26.9 – Cataract, unspecified
  - H40.1 – Primary open-angle glaucoma
  - H52.1 – Myopia
  - H53.9 – Visual disturbance, unspecified

### 8.4 Demo Doctors
- Dr Aditya
- Dr Sharma
- Dr Mehra

---

## 9. API & Data Contract Readiness

Although the MVP may run in offline/local mode, all modules will adhere to API-first contracts to ensure smooth migration to LAN or cloud deployment.

- RESTful APIs (JSON)
- Versioned endpoints (`/api/v1/...`)
- Central validation layer
- Role-based authorization at API level

---

## 10. Environment Strategy

- **Development**: Laptop (local Node.js + PostgreSQL)
- **Demo / QA**: Local LAN deployment
- **Production (Future)**: Cloud-ready without refactor

Configuration managed via `.env` files and environment-based profiles.

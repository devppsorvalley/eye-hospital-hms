-- Eye Hospital HMS - Database Schema Initialization
-- This script creates all tables and relationships for the HMS system
-- Based on final schema specification

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT false
);

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patients (
    uhid VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    age_text VARCHAR(50),
    phone VARCHAR(20),
    relation_text VARCHAR(100),
    address TEXT,
    district VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    registration_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    patient_category VARCHAR(50),
    guardian_name VARCHAR(150),
    relation_to_patient VARCHAR(50),
    alternate_phone VARCHAR(20),
    local_uuid UUID DEFAULT gen_random_uuid(),
    last_synced_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================================
-- DOCTORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- VISIT TYPES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS visit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_amount NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- OPD QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS opd_queue (
    id SERIAL PRIMARY KEY,
    uhid VARCHAR(20) REFERENCES patients(uhid),
    doctor_id INTEGER REFERENCES doctors(id),
    visit_type VARCHAR(30),
    visit_type_id INTEGER REFERENCES visit_types(id),
    visit_amount NUMERIC(10,2),
    serial_no INTEGER,
    visit_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('WAITING', 'IN_PROGRESS', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CONSULTATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    uhid VARCHAR(20) REFERENCES patients(uhid),
    doctor_id INTEGER REFERENCES doctors(id),
    opd_id INTEGER REFERENCES opd_queue(id),
    diagnosis TEXT,
    treatment_plan TEXT,
    followup_instructions TEXT,
    follow_up_instructions TEXT,
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ICD CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS icd_codes (
    code VARCHAR(10) PRIMARY KEY,
    description TEXT NOT NULL
);

-- ============================================================================
-- ICD MASTER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS icd_master (
    id SERIAL PRIMARY KEY,
    icd_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONSULTATION ICD MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_icd (
    consultation_id INTEGER NOT NULL REFERENCES consultations(id),
    icd_id INTEGER NOT NULL REFERENCES icd_master(id),
    PRIMARY KEY (consultation_id, icd_id)
);

-- ============================================================================
-- CONSULTATION ICD CODE MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_icd_map (
    consultation_id INTEGER NOT NULL REFERENCES consultations(id),
    icd_code VARCHAR(10) NOT NULL,
    PRIMARY KEY (consultation_id, icd_code)
);

-- ============================================================================
-- SERVICE CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- SERVICE CHARGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_charges (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES service_categories(id),
    charge_name VARCHAR(150) NOT NULL,
    default_rate NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================================================
-- BILLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    bill_no INTEGER NOT NULL UNIQUE,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bill_time TIME NOT NULL DEFAULT CURRENT_TIME,
    uhid VARCHAR(20) NOT NULL REFERENCES patients(uhid),
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    relation_text VARCHAR(50),
    opd_id INTEGER REFERENCES opd_queue(id),
    doctor_id INTEGER REFERENCES doctors(id),
    category VARCHAR(50) NOT NULL,
    bill_type VARCHAR(30) NOT NULL CHECK (bill_type IN ('Cash', 'UPI', 'Card', 'Ayushman', 'TPA', 'ESIS', 'ECHS', 'Golden Card')),
    upi_reference VARCHAR(50),
    aadhaar_no VARCHAR(20),
    ayushman_card_no VARCHAR(30),
    ration_card_no VARCHAR(30),
    echs_referral_no VARCHAR(50),
    echs_service_no VARCHAR(50),
    echs_claim_id VARCHAR(50),
    gross_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    net_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    created_by VARCHAR(50),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editable_until DATE GENERATED ALWAYS AS (bill_date + INTERVAL '6 months') STORED,
    local_uuid UUID DEFAULT gen_random_uuid(),
    sync_status VARCHAR(20) DEFAULT 'LOCAL',
    deleted_at TIMESTAMP
);

-- ============================================================================
-- BILL ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    charge_id INTEGER REFERENCES service_charges(id),
    charge_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    qty INTEGER DEFAULT 1 NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Patients indexes
CREATE INDEX idx_patients_phone ON patients(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- OPD Queue indexes
CREATE INDEX idx_opd_queue_uhid ON opd_queue(uhid);
CREATE INDEX idx_opd_queue_doctor ON opd_queue(doctor_id);
CREATE INDEX idx_opd_queue_date ON opd_queue(visit_date);
CREATE INDEX idx_opd_queue_status ON opd_queue(status);

-- Bills indexes
CREATE INDEX idx_bills_bill_no ON bills(bill_no) WHERE is_deleted = false;
CREATE INDEX idx_bills_uhid ON bills(uhid) WHERE is_deleted = false;
CREATE INDEX idx_bills_bill_date ON bills(bill_date) WHERE is_deleted = false;
CREATE INDEX idx_bills_opd_id ON bills(opd_id);

-- Bill Items indexes
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_items_charge_id ON bill_items(charge_id);

-- Consultations indexes
CREATE INDEX idx_consultations_uhid ON consultations(uhid);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_opd ON consultations(opd_id);

-- Users indexes
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE is_active = true;

-- Service Charges indexes
CREATE INDEX idx_service_charges_category ON service_charges(category_id) WHERE is_active = true;

-- ============================================================================
-- TABLE COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE patients IS 'Patient master data with registration details';
COMMENT ON TABLE opd_queue IS 'OPD daily queue management';
COMMENT ON TABLE consultations IS 'Doctor consultation notes and records';
COMMENT ON TABLE bills IS 'Billing records with payment details';
COMMENT ON TABLE bill_items IS 'Line items in each bill';
COMMENT ON TABLE service_charges IS 'Service charge master with categorization';
COMMENT ON TABLE icd_master IS 'ICD-10 codes for diagnoses';
COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE doctors IS 'Doctor master list';
COMMENT ON TABLE visit_types IS 'Types of OPD visits';

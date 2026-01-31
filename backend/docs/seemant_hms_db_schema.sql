--
-- PostgreSQL database dump
--

\restrict QlM5M2GtgqG1wuKlAtGJMKvgNMTqzPhcfKfgfPiUlXBr250rOy3IfXucuBtnJH0

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bill_items (
    id integer NOT NULL,
    bill_id integer NOT NULL,
    charge_id integer,
    charge_name character varying(150) NOT NULL,
    category character varying(50) NOT NULL,
    qty integer DEFAULT 1 NOT NULL,
    rate numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bill_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bill_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bill_items_id_seq OWNED BY public.bill_items.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bills (
    id integer NOT NULL,
    bill_no integer NOT NULL,
    bill_date date DEFAULT CURRENT_DATE NOT NULL,
    bill_time time without time zone DEFAULT CURRENT_TIME NOT NULL,
    uhid character varying(20) NOT NULL,
    patient_name character varying(150) NOT NULL,
    phone character varying(20),
    relation_text character varying(50),
    opd_id integer,
    doctor_id integer,
    category character varying(50) NOT NULL,
    bill_type character varying(30) NOT NULL,
    upi_reference character varying(50),
    aadhaar_no character varying(20),
    ayushman_card_no character varying(30),
    ration_card_no character varying(30),
    echs_referral_no character varying(50),
    echs_service_no character varying(50),
    echs_claim_id character varying(50),
    gross_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    net_amount numeric(10,2) DEFAULT 0 NOT NULL,
    created_by character varying(50),
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    editable_until date GENERATED ALWAYS AS ((bill_date + '6 mons'::interval)) STORED,
    local_uuid uuid DEFAULT gen_random_uuid(),
    sync_status character varying(20) DEFAULT 'LOCAL'::character varying,
    deleted_at timestamp without time zone,
    CONSTRAINT bills_bill_type_check CHECK (((bill_type)::text = ANY ((ARRAY['Cash'::character varying, 'UPI'::character varying, 'Card'::character varying, 'Ayushman'::character varying, 'TPA'::character varying, 'ESIS'::character varying, 'ECHS'::character varying, 'Golden Card'::character varying])::text[])))
);


--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: consultation_icd; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultation_icd (
    consultation_id integer NOT NULL,
    icd_id integer NOT NULL
);


--
-- Name: consultation_icd_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultation_icd_map (
    consultation_id integer NOT NULL,
    icd_code character varying(10) NOT NULL
);


--
-- Name: consultations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultations (
    id integer NOT NULL,
    uhid character varying(20),
    doctor_id integer,
    opd_id integer,
    diagnosis text,
    treatment_plan text,
    followup_instructions text,
    ai_summary text,
    created_at timestamp without time zone DEFAULT now(),
    follow_up_instructions text
);


--
-- Name: consultations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consultations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consultations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consultations_id_seq OWNED BY public.consultations.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: icd_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.icd_codes (
    code character varying(10) NOT NULL,
    description text NOT NULL
);


--
-- Name: icd_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.icd_master (
    id integer NOT NULL,
    icd_code character varying(20) NOT NULL,
    description text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: icd_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.icd_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: icd_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.icd_master_id_seq OWNED BY public.icd_master.id;


--
-- Name: opd_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opd_queue (
    id integer NOT NULL,
    uhid character varying(20),
    doctor_id integer,
    visit_type character varying(30),
    visit_amount numeric(10,2),
    serial_no integer,
    visit_date date DEFAULT CURRENT_DATE,
    status character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    visit_type_id integer,
    CONSTRAINT opd_queue_status_check CHECK (((status)::text = ANY ((ARRAY['WAITING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: opd_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.opd_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: opd_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.opd_queue_id_seq OWNED BY public.opd_queue.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    uhid character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100),
    gender character varying(10),
    dob date,
    age_text character varying(50),
    phone character varying(20),
    relation_text character varying(100),
    address text,
    district character varying(100),
    registration_date date DEFAULT CURRENT_DATE,
    registration_time time without time zone DEFAULT CURRENT_TIME,
    created_at timestamp without time zone DEFAULT now(),
    patient_category character varying(50),
    guardian_name character varying(150),
    relation_to_patient character varying(50),
    alternate_phone character varying(20),
    local_uuid uuid DEFAULT gen_random_uuid(),
    last_synced_at timestamp without time zone,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_gender CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[])))
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: service_charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_charges (
    id integer NOT NULL,
    category_id integer,
    charge_name character varying(150) NOT NULL,
    default_rate numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


--
-- Name: service_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_charges_id_seq OWNED BY public.service_charges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    role_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    last_login_at timestamp without time zone,
    password_changed_at timestamp without time zone,
    must_change_password boolean DEFAULT false
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visit_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visit_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    default_amount numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: visit_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visit_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visit_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visit_types_id_seq OWNED BY public.visit_types.id;


--
-- Name: bill_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_items ALTER COLUMN id SET DEFAULT nextval('public.bill_items_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: consultations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations ALTER COLUMN id SET DEFAULT nextval('public.consultations_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: icd_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icd_master ALTER COLUMN id SET DEFAULT nextval('public.icd_master_id_seq'::regclass);


--
-- Name: opd_queue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opd_queue ALTER COLUMN id SET DEFAULT nextval('public.opd_queue_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: service_charges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_charges ALTER COLUMN id SET DEFAULT nextval('public.service_charges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visit_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_types ALTER COLUMN id SET DEFAULT nextval('public.visit_types_id_seq'::regclass);


--
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (id);


--
-- Name: bills bills_bill_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_bill_no_key UNIQUE (bill_no);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: consultation_icd_map consultation_icd_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd_map
    ADD CONSTRAINT consultation_icd_map_pkey PRIMARY KEY (consultation_id, icd_code);


--
-- Name: consultation_icd consultation_icd_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd
    ADD CONSTRAINT consultation_icd_pkey PRIMARY KEY (consultation_id, icd_id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: icd_codes icd_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icd_codes
    ADD CONSTRAINT icd_codes_pkey PRIMARY KEY (code);


--
-- Name: icd_master icd_master_icd_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icd_master
    ADD CONSTRAINT icd_master_icd_code_key UNIQUE (icd_code);


--
-- Name: icd_master icd_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icd_master
    ADD CONSTRAINT icd_master_pkey PRIMARY KEY (id);


--
-- Name: opd_queue opd_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opd_queue
    ADD CONSTRAINT opd_queue_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (uhid);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_charges service_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_charges
    ADD CONSTRAINT service_charges_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: visit_types visit_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_types
    ADD CONSTRAINT visit_types_name_key UNIQUE (name);


--
-- Name: visit_types visit_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_types
    ADD CONSTRAINT visit_types_pkey PRIMARY KEY (id);


--
-- Name: idx_bill_items_bill; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bill_items_bill ON public.bill_items USING btree (bill_id);


--
-- Name: idx_bills_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bills_date ON public.bills USING btree (bill_date);


--
-- Name: idx_bills_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bills_type ON public.bills USING btree (bill_type);


--
-- Name: idx_bills_uhid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bills_uhid ON public.bills USING btree (uhid);


--
-- Name: idx_charges_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_charges_category ON public.service_charges USING btree (category_id);


--
-- Name: idx_consult_doctor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consult_doctor ON public.consultations USING btree (doctor_id);


--
-- Name: idx_consult_opd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consult_opd ON public.consultations USING btree (opd_id);


--
-- Name: idx_consult_uhid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consult_uhid ON public.consultations USING btree (uhid);


--
-- Name: idx_consultations_uhid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_uhid ON public.consultations USING btree (uhid);


--
-- Name: idx_opd_doctor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opd_doctor_date ON public.opd_queue USING btree (doctor_id, visit_date);


--
-- Name: idx_opd_queue_uhid_visit_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opd_queue_uhid_visit_date ON public.opd_queue USING btree (uhid, visit_date);


--
-- Name: idx_opd_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opd_status ON public.opd_queue USING btree (status);


--
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_name ON public.patients USING btree (first_name, last_name);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_service_categories_name_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_service_categories_name_lower ON public.service_categories USING btree (lower((name)::text));


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role_id);


--
-- Name: consultation_icd_map consultation_icd_map_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd_map
    ADD CONSTRAINT consultation_icd_map_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE CASCADE;


--
-- Name: consultation_icd_map consultation_icd_map_icd_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd_map
    ADD CONSTRAINT consultation_icd_map_icd_code_fkey FOREIGN KEY (icd_code) REFERENCES public.icd_codes(code);


--
-- Name: consultations consultations_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: consultations consultations_opd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_opd_id_fkey FOREIGN KEY (opd_id) REFERENCES public.opd_queue(id);


--
-- Name: consultations consultations_uhid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_uhid_fkey FOREIGN KEY (uhid) REFERENCES public.patients(uhid);


--
-- Name: bills fk_bill_doctor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fk_bill_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: bill_items fk_bill_item_bill; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT fk_bill_item_bill FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE;


--
-- Name: bills fk_bill_opd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fk_bill_opd FOREIGN KEY (opd_id) REFERENCES public.opd_queue(id) ON DELETE SET NULL;


--
-- Name: consultation_icd fk_ci_consultation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd
    ADD CONSTRAINT fk_ci_consultation FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE CASCADE;


--
-- Name: consultation_icd fk_ci_icd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_icd
    ADD CONSTRAINT fk_ci_icd FOREIGN KEY (icd_id) REFERENCES public.icd_master(id);


--
-- Name: opd_queue opd_queue_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opd_queue
    ADD CONSTRAINT opd_queue_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: opd_queue opd_queue_uhid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opd_queue
    ADD CONSTRAINT opd_queue_uhid_fkey FOREIGN KEY (uhid) REFERENCES public.patients(uhid);


--
-- Name: opd_queue opd_queue_visit_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opd_queue
    ADD CONSTRAINT opd_queue_visit_type_id_fkey FOREIGN KEY (visit_type_id) REFERENCES public.visit_types(id);


--
-- Name: service_charges service_charges_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_charges
    ADD CONSTRAINT service_charges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict QlM5M2GtgqG1wuKlAtGJMKvgNMTqzPhcfKfgfPiUlXBr250rOy3IfXucuBtnJH0


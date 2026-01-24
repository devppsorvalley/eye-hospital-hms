# Consultation Module API Documentation

## Overview
The Consultation module manages doctor consultations, diagnoses, and medical notes with ICD-10 disease code integration. Each consultation is linked to an OPD queue entry and tracks the doctor's diagnosis and treatment plan.

## Base URL
```
http://localhost:3000/api/v1/consultations
```

## Authentication
All endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. Create Consultation
**POST** `/consultations`

Creates a new consultation record from an OPD queue entry.

**Required Roles:** ADMIN, DOCTOR

**Request Body:**
```json
{
  "uhid": "9705",
  "doctor_id": 1,
  "opd_id": 11,
  "diagnosis": "Age-related cataract in both eyes",
  "treatment_plan": "Recommend surgical intervention. Schedule cataract surgery consultation.",
  "followup_instructions": "Follow up after 1 week. Avoid strenuous activities."
}
```

**Parameters:**
- `uhid` (string, required): Patient UHID
- `doctor_id` (integer, required): Doctor ID
- `opd_id` (integer, optional): OPD queue entry ID
- `diagnosis` (string, optional): Doctor's diagnosis
- `treatment_plan` (string, optional): Recommended treatment plan
- `followup_instructions` (string, optional): Instructions for follow-up

**Response (201 Created):**
```json
{
  "message": "Consultation created successfully",
  "consultation": {
    "id": 1,
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Age-related cataract in both eyes",
    "treatment_plan": "Recommend surgical intervention. Schedule cataract surgery consultation.",
    "followup_instructions": "Follow up after 1 week. Avoid strenuous activities.",
    "created_at": "2026-01-03T10:30:00.000Z"
  }
}
```

**Error Cases:**
- `400`: Validation error or invalid doctor ID
- `404`: Patient UHID not found
- `401`: Unauthorized (missing/invalid token)
- `403`: Insufficient permissions

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/consultations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Age-related cataract in both eyes",
    "treatment_plan": "Recommend surgical intervention",
    "followup_instructions": "Follow up after 1 week"
  }'
```

---

### 2. List Consultations
**GET** `/consultations`

Retrieves all consultations with optional filtering by patient, doctor, or date.

**Required Roles:** All authenticated users

**Query Parameters:**
- `uhid` (string, optional): Filter by patient UHID
- `doctor_id` (integer, optional): Filter by doctor
- `date` (string, optional): Filter by date (YYYY-MM-DD)
- `page` (integer, optional, default: 1): Page number
- `limit` (integer, optional, default: 20): Records per page (max 100)

**Response:**
```json
{
  "message": "Consultations retrieved successfully",
  "data": [
    {
      "id": 1,
      "uhid": "9705",
      "doctor_id": 1,
      "opd_id": 11,
      "diagnosis": "Age-related cataract in both eyes",
      "treatment_plan": "Recommend surgical intervention",
      "followup_instructions": "Follow up after 1 week",
      "created_at": "2026-01-03T10:30:00.000Z",
      "first_name": "Ramya",
      "last_name": "Pant",
      "phone": "9999999999",
      "doctor_name": "Dr Aditya"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/consultations?doctor_id=1&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Consultation by ID
**GET** `/consultations/:id`

Retrieves a specific consultation with complete details and ICD codes.

**Required Roles:** All authenticated users

**Path Parameters:**
- `id` (integer, required): Consultation ID

**Response:**
```json
{
  "message": "Consultation retrieved successfully",
  "consultation": {
    "id": 1,
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Age-related cataract in both eyes",
    "treatment_plan": "Recommend surgical intervention",
    "followup_instructions": "Follow up after 1 week",
    "created_at": "2026-01-03T10:30:00.000Z",
    "first_name": "Ramya",
    "last_name": "Pant",
    "phone": "9999999999",
    "gender": "Female",
    "doctor_name": "Dr Aditya",
    "visit_type": "General Eye Checkup",
    "serial_no": 1,
    "visit_date": "2026-01-02T18:30:00.000Z",
    "icd_codes": [
      {
        "id": 45,
        "icd_code": "H25.9",
        "description": "Unspecified cataract"
      }
    ]
  }
}
```

**Error Cases:**
- `404`: Consultation not found
- `400`: Invalid consultation ID

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/consultations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get Patient Consultations
**GET** `/consultations/patient/:uhid`

Retrieves all consultations for a specific patient.

**Required Roles:** All authenticated users

**Path Parameters:**
- `uhid` (string, required): Patient UHID

**Query Parameters:**
- `page` (integer, optional, default: 1): Page number
- `limit` (integer, optional, default: 10): Records per page

**Response:**
```json
{
  "message": "Patient consultations retrieved successfully",
  "uhid": "9705",
  "data": [
    {
      "id": 1,
      "uhid": "9705",
      "doctor_id": 1,
      "opd_id": 11,
      "diagnosis": "Age-related cataract in both eyes",
      "treatment_plan": "Recommend surgical intervention",
      "followup_instructions": "Follow up after 1 week",
      "created_at": "2026-01-03T10:30:00.000Z",
      "doctor_name": "Dr Aditya",
      "visit_type": "General Eye Checkup",
      "serial_no": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/consultations/patient/9705" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Update Consultation
**PUT** `/consultations/:id`

Updates a consultation's diagnosis, treatment plan, or follow-up instructions.

**Required Roles:** ADMIN, DOCTOR

**Path Parameters:**
- `id` (integer, required): Consultation ID

**Request Body:**
```json
{
  "diagnosis": "Updated diagnosis",
  "treatment_plan": "Updated treatment plan",
  "followup_instructions": "Updated follow-up instructions"
}
```

**Parameters:**
- `diagnosis` (string, optional): Updated diagnosis
- `treatment_plan` (string, optional): Updated treatment plan
- `followup_instructions` (string, optional): Updated follow-up instructions

Note: At least one field must be provided.

**Response:**
```json
{
  "message": "Consultation updated successfully",
  "consultation": {
    "id": 1,
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Updated diagnosis",
    "treatment_plan": "Updated treatment plan",
    "followup_instructions": "Updated follow-up instructions",
    "created_at": "2026-01-03T10:30:00.000Z",
    "icd_codes": [
      {
        "id": 45,
        "icd_code": "H25.9",
        "description": "Unspecified cataract"
      }
    ]
  }
}
```

**Error Cases:**
- `404`: Consultation not found
- `400`: Validation error (no fields provided)
- `403`: Insufficient permissions

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/v1/consultations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "diagnosis": "Updated diagnosis after review",
    "treatment_plan": "Updated treatment plan"
  }'
```

---

### 6. Add ICD Code to Consultation
**POST** `/consultations/:id/icd`

Adds an ICD-10 disease code to a consultation.

**Required Roles:** ADMIN, DOCTOR

**Path Parameters:**
- `id` (integer, required): Consultation ID

**Request Body:**
```json
{
  "icd_id": 45
}
```

**Parameters:**
- `icd_id` (integer, required): ICD code ID from master

**Response:**
```json
{
  "message": "ICD code added successfully",
  "consultation": {
    "id": 1,
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Age-related cataract in both eyes",
    "treatment_plan": "Recommend surgical intervention",
    "followup_instructions": "Follow up after 1 week",
    "created_at": "2026-01-03T10:30:00.000Z",
    "icd_codes": [
      {
        "id": 45,
        "icd_code": "H25.9",
        "description": "Unspecified cataract"
      }
    ]
  }
}
```

**Error Cases:**
- `400`: Invalid ICD ID or validation error
- `404`: Consultation or ICD code not found
- `403`: Insufficient permissions

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/consultations/1/icd \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"icd_id": 45}'
```

---

### 7. Remove ICD Code from Consultation
**DELETE** `/consultations/:id/icd/:icd_id`

Removes an ICD code from a consultation.

**Required Roles:** ADMIN, DOCTOR

**Path Parameters:**
- `id` (integer, required): Consultation ID
- `icd_id` (integer, required): ICD code ID to remove

**Response:**
```json
{
  "message": "ICD code removed successfully",
  "consultation": {
    "id": 1,
    "uhid": "9705",
    "doctor_id": 1,
    "opd_id": 11,
    "diagnosis": "Age-related cataract in both eyes",
    "treatment_plan": "Recommend surgical intervention",
    "followup_instructions": "Follow up after 1 week",
    "created_at": "2026-01-03T10:30:00.000Z",
    "icd_codes": []
  }
}
```

**Error Cases:**
- `404`: Consultation not found
- `400`: Invalid ID format
- `403`: Insufficient permissions

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/consultations/1/icd/45 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Get All ICD Codes
**GET** `/consultations/masters/icd-codes`

Retrieves all available ICD-10 codes for selection.

**Required Roles:** All authenticated users

**Response:**
```json
{
  "message": "ICD codes retrieved successfully",
  "icd_codes": [
    {
      "id": 1,
      "icd_code": "A00",
      "description": "Cholera"
    },
    {
      "id": 45,
      "icd_code": "H25.9",
      "description": "Unspecified cataract"
    },
    {
      "id": 150,
      "icd_code": "H52",
      "description": "Disorders of refraction and accommodation"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/consultations/masters/icd-codes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. Search ICD Codes
**GET** `/consultations/masters/icd-search`

Searches for ICD codes by code or description.

**Required Roles:** All authenticated users

**Query Parameters:**
- `search` (string, required): Search term (minimum 2 characters)

**Response:**
```json
{
  "message": "ICD codes search completed",
  "results": [
    {
      "id": 45,
      "icd_code": "H25.9",
      "description": "Unspecified cataract"
    },
    {
      "id": 46,
      "icd_code": "H26",
      "description": "Cataract in diseases classified elsewhere"
    }
  ]
}
```

**Error Cases:**
- `400`: Search term too short or missing

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/consultations/masters/icd-search?search=cataract" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 10. Delete Consultation
**DELETE** `/consultations/:id`

Permanently deletes a consultation record.

**Required Roles:** ADMIN only

**Path Parameters:**
- `id` (integer, required): Consultation ID

**Response:**
```json
{
  "message": "Consultation deleted successfully",
  "id": 1
}
```

**Error Cases:**
- `404`: Consultation not found
- `400`: Invalid consultation ID
- `403`: Insufficient permissions (only ADMIN can delete)

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/consultations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ICD-10 Code Integration

### What are ICD-10 Codes?
ICD-10 (International Classification of Diseases, 10th Revision) codes are standardized codes used to classify diseases and medical conditions.

### Examples of Eye Care ICD-10 Codes
- **H25.9**: Unspecified cataract
- **H26**: Cataract in diseases classified elsewhere
- **H52**: Disorders of refraction and accommodation
- **H53.1**: Impaired light adaptation
- **H54**: Blindness and low vision

### Workflow for Adding ICD Codes
1. Create consultation via `POST /consultations`
2. Search for ICD codes via `GET /consultations/masters/icd-search?search=...`
3. Get all ICD codes via `GET /consultations/masters/icd-codes`
4. Add selected code via `POST /consultations/:id/icd`
5. View consultation with codes via `GET /consultations/:id`

---

## Database Schema

### Consultations Table
```
id              INTEGER PRIMARY KEY
uhid            VARCHAR(20) REFERENCES patients(uhid)
doctor_id       INTEGER REFERENCES doctors(id)
opd_id          INTEGER REFERENCES opd_queue(id)
diagnosis       TEXT
treatment_plan  TEXT
followup_instructions TEXT
ai_summary      TEXT (optional for AI features)
created_at      TIMESTAMP DEFAULT NOW()
```

### Consultation_ICD Junction Table
```
consultation_id  INTEGER REFERENCES consultations(id)
icd_id          INTEGER REFERENCES icd_master(id)
```

### ICD Master Table
```
id          INTEGER PRIMARY KEY
icd_code    VARCHAR(20) UNIQUE
description TEXT
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Workflows

### Workflow 1: Create Full Consultation with ICD Codes
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}' | jq -r '.token')

# 2. Create consultation
CONSULT_ID=$(curl -s -X POST http://localhost:3000/api/v1/consultations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "uhid":"9705",
    "doctor_id":1,
    "opd_id":11,
    "diagnosis":"Age-related cataract",
    "treatment_plan":"Cataract surgery recommended"
  }' | jq '.consultation.id')

# 3. Search for ICD code
curl -s -X GET "http://localhost:3000/api/v1/consultations/masters/icd-search?search=cataract" \
  -H "Authorization: Bearer $TOKEN" | jq '.results[0]'

# 4. Add ICD code (ID 45 in example)
curl -s -X POST http://localhost:3000/api/v1/consultations/$CONSULT_ID/icd \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"icd_id": 45}'
```

### Workflow 2: View Patient's Complete Consultation History
```bash
# Get patient's consultations with pagination
curl -X GET "http://localhost:3000/api/v1/consultations/patient/9705?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Workflow 3: Update Consultation After Review
```bash
# Update diagnosis and treatment plan
curl -X PUT http://localhost:3000/api/v1/consultations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "diagnosis": "Confirmed age-related cataract, bilateral",
    "treatment_plan": "Schedule cataract surgery within 2 weeks"
  }'
```

---

## Notes

- Each patient can have multiple consultations
- Consultations are typically linked to OPD queue entries
- ICD codes provide medical coding and billing information
- Follow-up instructions are important for patient care continuity
- Delete operations are permanent and only available to ADMIN role
- All consultations are timestamped for audit trail

---

## Authorization Matrix

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| /consultations | All | ADMIN, DOCTOR | ADMIN, DOCTOR | ADMIN |
| /consultations/:id | All | - | ADMIN, DOCTOR | ADMIN |
| /consultations/patient/:uhid | All | - | - | - |
| /consultations/:id/icd | All | ADMIN, DOCTOR | - | ADMIN, DOCTOR |
| /consultations/masters/icd-codes | All | - | - | - |
| /consultations/masters/icd-search | All | - | - | - |

---

**Version:** 1.0
**Last Updated:** January 3, 2026

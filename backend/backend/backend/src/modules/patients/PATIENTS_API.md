# Patients Module API Documentation

## Overview
The Patients module handles patient registration, search, retrieval, and visit history tracking. All endpoints require authentication via JWT token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### 1. Register Patient
**POST** `/api/v1/patients`

**Required Role:** RECEPTION, ADMIN

**Request Body:**
```json
{
  "first_name": "Ramya",
  "middle_name": "Kumar",
  "last_name": "Pant",
  "gender": "Female",
  "dob": "1992-05-15",
  "phone": "9876543210",
  "address": "123, Main Street",
  "village": "Mumbai",
  "patient_category": "General",
  "guardian_name": "Rajesh Pant",
  "relation_to_patient": "Father",
  "alternate_phone": "9876543211"
}
```

**Required Fields:**
- `first_name` (string)
- `last_name` (string)
- `gender` (Male | Female | Other)
- `dob` (ISO date: YYYY-MM-DD)
- `phone` (10 digits)
- `village` (string)

**Optional Fields:**
- `middle_name` (string)
- `address` (string)
- `patient_category` (string)
- `guardian_name` (string)
- `relation_to_patient` (string)
- `alternate_phone` (10 digits)

**Response (201 Created):**
```json
{
  "message": "Patient registered successfully",
  "patient": {
    "uhid": "9701",
    "first_name": "Ramya",
    "last_name": "Pant",
    "gender": "Female",
    "dob": "1992-05-15",
    "phone": "9876543210",
    "address": "123, Main Street",
    "village": "Mumbai",
    "patient_category": "General",
    "guardian_name": "Rajesh Pant",
    "created_at": "2026-01-03T10:30:45.123Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient role

---

### 2. Search Patients
**GET** `/api/v1/patients`

**Required Role:** RECEPTION, DOCTOR, ADMIN

**Query Parameters:**
- `search` (optional) - Search by name or phone
- `village` (optional) - Filter by village
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Results per page

**Example Request:**
```
GET /api/v1/patients?search=Ramya&village=Mumbai&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patients retrieved successfully",
  "data": [
    {
      "uhid": "9701",
      "first_name": "Ramya",
      "last_name": "Pant",
      "gender": "Female",
      "dob": "1992-05-15",
      "phone": "9876543210",
      "address": "123, Main Street",
      "village": "Mumbai",
      "patient_category": "General",
      "created_at": "2026-01-03T10:30:45.123Z"
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

---

### 3. Get Patient Details
**GET** `/api/v1/patients/:uhid`

**Required Role:** All authenticated users

**Path Parameters:**
- `uhid` (string) - Patient unique health ID

**Example Request:**
```
GET /api/v1/patients/9701
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patient retrieved successfully",
  "patient": {
    "uhid": "9701",
    "first_name": "Ramya",
    "middle_name": "Kumar",
    "last_name": "Pant",
    "gender": "Female",
    "dob": "1992-05-15",
    "age_text": "33 years",
    "phone": "9876543210",
    "address": "123, Main Street",
    "village": "Mumbai",
    "patient_category": "General",
    "guardian_name": "Rajesh Pant",
    "relation_to_patient": "Father",
    "alternate_phone": "9876543211",
    "registration_date": "2026-01-03",
    "is_active": true,
    "created_at": "2026-01-03T10:30:45.123Z",
    "updated_at": "2026-01-03T10:30:45.123Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Patient not found

---

### 4. Update Patient
**PUT** `/api/v1/patients/:uhid`

**Required Role:** RECEPTION, ADMIN

**Path Parameters:**
- `uhid` (string) - Patient unique health ID

**Request Body (all fields optional):**
```json
{
  "first_name": "Ramya Updated",
  "phone": "9999999999",
  "address": "456, New Street",
  "village": "Pune"
}
```

**Response (200 OK):**
```json
{
  "message": "Patient updated successfully",
  "patient": {
    "uhid": "9701",
    "first_name": "Ramya Updated",
    "last_name": "Pant",
    "gender": "Female",
    "dob": "1992-05-15",
    "phone": "9999999999",
    "address": "456, New Street",
    "village": "Pune",
    "patient_category": "General",
    "guardian_name": "Rajesh Pant",
    "updated_at": "2026-01-03T11:45:30.456Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `404 Not Found` - Patient not found

---

### 5. Get Patient Visit History
**GET** `/api/v1/patients/:uhid/visits`

**Required Role:** DOCTOR, RECEPTION, ADMIN

**Path Parameters:**
- `uhid` (string) - Patient unique health ID

**Example Request:**
```
GET /api/v1/patients/9701/visits
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patient visit history retrieved successfully",
  "uhid": "9701",
  "total_visits": 3,
  "visits": [
    {
      "visit_type": "OPD",
      "visit_id": 1,
      "visit_date": "2026-01-03",
      "amount": 200,
      "doctor_name": "Dr. Rohan Sharma",
      "visit_type_name": "General Eye Checkup",
      "serial_no": 1,
      "visit_status": "completed"
    },
    {
      "visit_type": "CONSULTATION",
      "visit_id": 1,
      "visit_date": "2026-01-02",
      "amount": null,
      "doctor_name": "Dr. Priya Mehta",
      "visit_type_name": null,
      "serial_no": null,
      "visit_status": "completed"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Patient not found

---

### 6. Delete Patient (Soft Delete)
**DELETE** `/api/v1/patients/:uhid`

**Required Role:** ADMIN

**Path Parameters:**
- `uhid` (string) - Patient unique health ID

**Example Request:**
```
DELETE /api/v1/patients/9701
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patient deleted successfully",
  "uhid": "9701"
}
```

**Error Responses:**
- `404 Not Found` - Patient not found

---

## Testing with cURL

### Register Patient
```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "first_name": "Ramya",
    "last_name": "Pant",
    "gender": "Female",
    "dob": "1992-05-15",
    "phone": "9876543210",
    "village": "Mumbai",
    "guardian_name": "Rajesh",
    "relation_to_patient": "Father"
  }'
```

### Search Patients
```bash
curl -X GET "http://localhost:3000/api/v1/patients?search=Ramya&village=Mumbai&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Get Patient Details
```bash
curl -X GET http://localhost:3000/api/v1/patients/9701 \
  -H "Authorization: Bearer <token>"
```

### Get Visit History
```bash
curl -X GET http://localhost:3000/api/v1/patients/9701/visits \
  -H "Authorization: Bearer <token>"
```

### Update Patient
```bash
curl -X PUT http://localhost:3000/api/v1/patients/9701 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "phone": "9999999999",
    "village": "Pune"
  }'
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Validation error | Invalid or missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User role does not have permission |
| 404 | Not found | Patient with given UHID does not exist |
| 500 | Server error | Database or server error |

---

## Notes

- **UHID:** Auto-generated unique patient ID (starting from 9700, incrementing)
- **Soft Delete:** Patients are soft-deleted (marked with `deleted_at` timestamp, not permanently removed)
- **Age Calculation:** Automatically calculated from DOB when registering
- **Phone Validation:** Must be exactly 10 digits
- **Gender Options:** Male, Female, Other
- **Authentication:** All endpoints require JWT token (obtained from `/api/v1/auth/login`)

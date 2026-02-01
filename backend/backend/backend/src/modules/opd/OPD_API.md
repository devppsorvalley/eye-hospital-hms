# OPD Queue Module API Documentation

## Overview
The OPD (Outpatient Department) module handles patient queue management, including registration in the queue, status tracking, and queue management. All endpoints require authentication via JWT token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### 1. Create OPD Queue Entry
**POST** `/api/v1/opd`

**Required Role:** RECEPTION, DOCTOR, ADMIN

**Request Body:**
```json
{
  "uhid": "9701",
  "doctor_id": 1,
  "visit_type_id": 1,
  "visit_date": "2026-01-03"
}
```

**Required Fields:**
- `uhid` (string) - Patient unique health ID
- `doctor_id` (integer) - ID of the doctor
- `visit_type_id` (integer) - ID of visit type (consultation, checkup, etc.)
- `visit_date` (ISO date: YYYY-MM-DD) - Date of visit

**Response (201 Created):**
```json
{
  "message": "OPD entry created successfully",
  "opd": {
    "id": 1,
    "uhid": "9701",
    "doctor_id": 1,
    "visit_type": "General Eye Checkup",
    "visit_type_id": 1,
    "visit_amount": 100,
    "serial_no": 1,
    "visit_date": "2026-01-03",
    "status": "waiting",
    "created_at": "2026-01-03T10:30:45.123Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or invalid visit type
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient role

---

### 2. Get OPD Queue
**GET** `/api/v1/opd`

**Required Role:** RECEPTION, DOCTOR, ADMIN

**Query Parameters:**
- `visit_date` (optional) - Filter by date (YYYY-MM-DD)
- `doctor_id` (optional) - Filter by doctor ID
- `status` (optional) - Filter by status (waiting, in-progress, completed, cancelled)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Results per page

**Example Request:**
```
GET /api/v1/opd?visit_date=2026-01-03&doctor_id=1&status=waiting&page=1&limit=20
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "OPD queue retrieved successfully",
  "data": [
    {
      "id": 1,
      "uhid": "9701",
      "doctor_id": 1,
      "visit_type": "General Eye Checkup",
      "visit_type_id": 1,
      "visit_amount": 100,
      "serial_no": 1,
      "visit_date": "2026-01-03",
      "status": "waiting",
      "created_at": "2026-01-03T10:30:45.123Z",
      "first_name": "Ramya",
      "last_name": "Pant",
      "phone": "9876543210",
      "doctor_name": "Dr. Rohan Sharma",
      "visit_type_name": "General Eye Checkup"
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

---

### 3. Get OPD Record Details
**GET** `/api/v1/opd/:id`

**Required Role:** DOCTOR, RECEPTION, ADMIN

**Path Parameters:**
- `id` (integer) - OPD record ID

**Example Request:**
```
GET /api/v1/opd/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "OPD record retrieved successfully",
  "opd": {
    "id": 1,
    "uhid": "9701",
    "doctor_id": 1,
    "visit_type": "General Eye Checkup",
    "visit_type_id": 1,
    "visit_amount": 100,
    "serial_no": 1,
    "visit_date": "2026-01-03",
    "status": "waiting",
    "created_at": "2026-01-03T10:30:45.123Z",
    "first_name": "Ramya",
    "middle_name": null,
    "last_name": "Pant",
    "phone": "9876543210",
    "dob": "1992-05-15",
    "gender": "Female",
    "doctor_name": "Dr. Rohan Sharma",
    "visit_type_name": "General Eye Checkup"
  }
}
```

**Error Responses:**
- `404 Not Found` - OPD record not found

---

### 4. Update OPD Status
**PUT** `/api/v1/opd/:id/status`

**Required Role:** DOCTOR, RECEPTION, ADMIN

**Path Parameters:**
- `id` (integer) - OPD record ID

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Valid Status Values:**
- `waiting` - Patient waiting for consultation
- `in-progress` - Doctor is consulting the patient
- `completed` - Consultation completed
- `cancelled` - Appointment cancelled

**Response (200 OK):**
```json
{
  "message": "OPD status updated successfully",
  "opd": {
    "id": 1,
    "uhid": "9701",
    "doctor_id": 1,
    "visit_type": "General Eye Checkup",
    "visit_type_id": 1,
    "visit_amount": 100,
    "serial_no": 1,
    "visit_date": "2026-01-03",
    "status": "in-progress",
    "created_at": "2026-01-03T10:30:45.123Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status value
- `404 Not Found` - OPD record not found

---

### 5. Get Patient's OPD Records
**GET** `/api/v1/opd/patient/:uhid`

**Required Role:** DOCTOR, RECEPTION, ADMIN

**Path Parameters:**
- `uhid` (string) - Patient unique health ID

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)

**Example Request:**
```
GET /api/v1/opd/patient/9701?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patient OPD records retrieved successfully",
  "uhid": "9701",
  "data": [
    {
      "id": 1,
      "uhid": "9701",
      "doctor_id": 1,
      "visit_type": "General Eye Checkup",
      "visit_type_id": 1,
      "visit_amount": 100,
      "serial_no": 1,
      "visit_date": "2026-01-03",
      "status": "completed",
      "created_at": "2026-01-03T10:30:45.123Z",
      "doctor_name": "Dr. Rohan Sharma",
      "visit_type_name": "General Eye Checkup"
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

### 6. Get Doctors (Master Data)
**GET** `/api/v1/opd/masters/doctors`

**Required Role:** All authenticated users

**Response (200 OK):**
```json
{
  "message": "Doctors retrieved successfully",
  "doctors": [
    { "id": 1, "name": "Dr. Rohan Sharma" },
    { "id": 2, "name": "Dr. Priya Mehta" },
    { "id": 3, "name": "Dr. Vikram Patel" },
    { "id": 4, "name": "Dr. Anjali Singh" }
  ]
}
```

---

### 7. Get Visit Types (Master Data)
**GET** `/api/v1/opd/masters/visit-types`

**Required Role:** All authenticated users

**Response (200 OK):**
```json
{
  "message": "Visit types retrieved successfully",
  "visit_types": [
    { "id": 1, "name": "General Eye Checkup", "default_amount": 100 },
    { "id": 2, "name": "Cataract Surgery", "default_amount": 5000 },
    { "id": 3, "name": "LASIK Consultation", "default_amount": 500 },
    { "id": 4, "name": "Retina Checkup", "default_amount": 300 },
    { "id": 5, "name": "Contact Lens Fitting", "default_amount": 200 }
  ]
}
```

---

## Testing with cURL

### Create OPD Entry
```bash
curl -X POST http://localhost:3000/api/v1/opd \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "uhid": "9701",
    "doctor_id": 1,
    "visit_type_id": 1,
    "visit_date": "2026-01-03"
  }'
```

### Get OPD Queue
```bash
curl -X GET "http://localhost:3000/api/v1/opd?visit_date=2026-01-03&doctor_id=1" \
  -H "Authorization: Bearer <token>"
```

### Get OPD Record Details
```bash
curl -X GET http://localhost:3000/api/v1/opd/1 \
  -H "Authorization: Bearer <token>"
```

### Update OPD Status
```bash
curl -X PUT http://localhost:3000/api/v1/opd/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "completed"}'
```

### Get Patient's OPD Records
```bash
curl -X GET "http://localhost:3000/api/v1/opd/patient/9701" \
  -H "Authorization: Bearer <token>"
```

### Get Masters Data
```bash
curl -X GET http://localhost:3000/api/v1/opd/masters/doctors \
  -H "Authorization: Bearer <token>"

curl -X GET http://localhost:3000/api/v1/opd/masters/visit-types \
  -H "Authorization: Bearer <token>"
```

---

## Notes

- **Serial Number:** Auto-incremented per doctor per day
- **Visit Amount:** Automatically populated from visit type default amount
- **Status Transitions:** waiting → in-progress → completed/cancelled
- **Queue Ordering:** Sorted by visit_date and serial_no (ascending)
- **Patient Details:** Available in OPD records for quick reference (name, phone, DOB, gender)

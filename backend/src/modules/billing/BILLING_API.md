# Billing Module API Documentation

## Overview
The Billing module manages bill generation, service charge tracking, and payment processing for consultations and OPD visits. Bills are generated from consultations with itemized service charges and support multiple payment types.

## Base URL
```
http://localhost:3000/api/v1/billing
```

## Authentication
All endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Bill Types Supported
- **Cash** - Cash payment
- **UPI** - UPI/Digital payment
- **Card** - Credit/Debit card
- **Ayushman** - Ayushman Bharat scheme
- **TPA** - Third Party Administrator (Insurance)
- **ESIS** - Employees' State Insurance Scheme
- **ECHS** - Ex-Servicemen Contributory Health Scheme
- **Golden Card** - State-specific golden card scheme

## Endpoints

### 1. Create Bill
**POST** `/billing`

Creates a new bill with itemized service charges for a patient.

**Required Roles:** BILLING, ADMIN

**Request Body:**
```json
{
  "uhid": "9705",
  "patient_name": "Ramesh Kumar",
  "phone": "9876543210",
  "opd_id": 5,
  "doctor_id": 2,
  "category": "Consultation",
  "bill_type": "Cash",
  "discount_amount": 0,
  "created_by": "billing_user",
  "items": [
    {
      "charge_id": 1,
      "charge_name": "Cataract Surgery",
      "category": "Surgery",
      "qty": 1,
      "rate": 15000
    },
    {
      "charge_id": 2,
      "charge_name": "Post-Op Medication",
      "category": "Medicines",
      "qty": 1,
      "rate": 500
    }
  ]
}
```

**Parameters:**
- `uhid` (string, required): Patient UHID
- `patient_name` (string, required): Patient name
- `phone` (string, optional): Contact phone
- `opd_id` (integer, optional): OPD queue entry ID (for reference)
- `doctor_id` (integer, optional): Attending doctor ID
- `category` (string, required): Bill category (e.g., "Consultation", "Surgery")
- `bill_type` (string, required): Payment type from supported list
- `discount_amount` (number, optional): Discount to apply
- `items` (array, required): Array of service charges with qty and rate
- `created_by` (string, optional): User creating the bill

**Response (201 Created):**
```json
{
  "message": "Bill created successfully",
  "bill": {
    "id": 1,
    "bill_no": 1001,
    "uhid": "9705",
    "patient_name": "Ramesh Kumar",
    "category": "Consultation",
    "bill_type": "Cash",
    "gross_amount": 15500,
    "discount_amount": 0,
    "net_amount": 15500,
    "created_at": "2026-01-03T14:30:00.000Z",
    "bill_items": [
      {
        "id": 1,
        "bill_id": 1,
        "charge_name": "Cataract Surgery",
        "qty": 1,
        "rate": 15000,
        "amount": 15000
      },
      {
        "id": 2,
        "bill_id": 1,
        "charge_name": "Post-Op Medication",
        "qty": 1,
        "rate": 500,
        "amount": 500
      }
    ]
  }
}
```

**Status Codes:**
- `201 Created` - Bill created successfully
- `400 Bad Request` - Validation error
- `404 Not Found` - Patient or doctor not found
- `401 Unauthorized` - Missing/invalid token

---

### 2. Get Bill by ID
**GET** `/billing/:id`

Retrieve a bill with all its itemized charges.

**Required Roles:** All authenticated users

**Parameters:**
- `id` (integer, path, required): Bill ID

**Response (200 OK):**
```json
{
  "message": "Bill retrieved successfully",
  "bill": {
    "id": 1,
    "bill_no": 1001,
    "bill_date": "2026-01-03",
    "bill_time": "14:30:00",
    "uhid": "9705",
    "patient_name": "Ramesh Kumar",
    "phone": "9876543210",
    "category": "Consultation",
    "bill_type": "Cash",
    "gross_amount": 15500,
    "discount_amount": 0,
    "net_amount": 15500,
    "created_at": "2026-01-03T14:30:00.000Z",
    "updated_at": "2026-01-03T14:30:00.000Z",
    "bill_items": [
      {
        "id": 1,
        "charge_name": "Cataract Surgery",
        "category": "Surgery",
        "qty": 1,
        "rate": 15000,
        "amount": 15000
      },
      {
        "id": 2,
        "charge_name": "Post-Op Medication",
        "category": "Medicines",
        "qty": 1,
        "rate": 500,
        "amount": 500
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Bill retrieved
- `404 Not Found` - Bill not found
- `401 Unauthorized` - Missing/invalid token

---

### 3. List Bills
**GET** `/billing`

List all bills with optional filtering and pagination.

**Required Roles:** All authenticated users

**Query Parameters:**
- `from_date` (date, optional): Filter bills from this date (YYYY-MM-DD)
- `to_date` (date, optional): Filter bills until this date (YYYY-MM-DD)
- `bill_type` (string, optional): Filter by bill type (Cash, UPI, Card, etc.)
- `search` (string, optional): Search by UHID or patient name
- `limit` (integer, optional, default: 10): Records per page (max: 100)
- `offset` (integer, optional, default: 0): Page offset

**Example Request:**
```
GET /billing?from_date=2026-01-01&to_date=2026-01-31&bill_type=Cash&limit=20&offset=0
```

**Response (200 OK):**
```json
{
  "message": "Bills retrieved successfully",
  "bills": [
    {
      "id": 1,
      "bill_no": 1001,
      "bill_date": "2026-01-03",
      "uhid": "9705",
      "patient_name": "Ramesh Kumar",
      "bill_type": "Cash",
      "net_amount": 15500,
      "created_at": "2026-01-03T14:30:00.000Z"
    }
  ],
  "total": 1,
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Bills retrieved
- `400 Bad Request` - Invalid filter parameters
- `401 Unauthorized` - Missing/invalid token

---

### 4. Get Patient Bills
**GET** `/billing/patient/:uhid`

Get all bills for a specific patient with pagination.

**Required Roles:** All authenticated users

**Parameters:**
- `uhid` (string, path, required): Patient UHID

**Query Parameters:**
- `limit` (integer, optional, default: 10): Records per page
- `offset` (integer, optional, default: 0): Page offset

**Example Request:**
```
GET /billing/patient/9705?limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "message": "Patient bills retrieved successfully",
  "bills": [
    {
      "id": 1,
      "bill_no": 1001,
      "bill_date": "2026-01-03",
      "patient_name": "Ramesh Kumar",
      "bill_type": "Cash",
      "net_amount": 15500,
      "created_at": "2026-01-03T14:30:00.000Z"
    }
  ],
  "total": 1,
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Bills retrieved
- `400 Bad Request` - Invalid UHID
- `401 Unauthorized` - Missing/invalid token

---

### 5. Update Bill
**PUT** `/billing/:id`

Update bill details like discount or payment reference.

**Required Roles:** BILLING, ADMIN

**Parameters:**
- `id` (integer, path, required): Bill ID

**Request Body:**
```json
{
  "discount_amount": 500,
  "net_amount": 15000,
  "upi_reference": "UPI123456789"
}
```

**Update Fields:**
- `discount_amount` (number, optional): Updated discount amount
- `net_amount` (number, optional): Updated net amount after discount
- `upi_reference` (string, optional): UPI transaction reference

**Response (200 OK):**
```json
{
  "message": "Bill updated successfully",
  "bill": {
    "id": 1,
    "bill_no": 1001,
    "gross_amount": 15500,
    "discount_amount": 500,
    "net_amount": 15000,
    "updated_at": "2026-01-03T15:45:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Bill updated
- `400 Bad Request` - Invalid data
- `404 Not Found` - Bill not found
- `401 Unauthorized` - Missing/invalid token

---

### 6. Delete Bill (Soft Delete)
**DELETE** `/billing/:id`

Soft delete a bill (marked as deleted but retained in database).

**Required Roles:** ADMIN

**Parameters:**
- `id` (integer, path, required): Bill ID

**Response (200 OK):**
```json
{
  "message": "Bill deleted successfully",
  "bill": {
    "id": 1,
    "bill_no": 1001,
    "is_deleted": true,
    "deleted_at": "2026-01-03T16:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Bill deleted
- `404 Not Found` - Bill not found or already deleted
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions

---

### 7. Get All Service Charges
**GET** `/billing/masters/service-charges`

List all available service charges for adding to bills.

**Required Roles:** All authenticated users

**Response (200 OK):**
```json
{
  "message": "Service charges retrieved successfully",
  "charges": [
    {
      "id": 1,
      "charge_name": "Cataract Surgery",
      "category": "Surgery",
      "default_rate": 15000,
      "is_active": true
    },
    {
      "id": 2,
      "charge_name": "Post-Op Medication",
      "category": "Medicines",
      "default_rate": 500,
      "is_active": true
    },
    {
      "id": 3,
      "charge_name": "Consultation Fee",
      "category": "Consultation",
      "default_rate": 500,
      "is_active": true
    }
  ],
  "count": 3
}
```

**Status Codes:**
- `200 OK` - Charges retrieved
- `401 Unauthorized` - Missing/invalid token

---

### 8. Search Service Charges
**GET** `/billing/masters/service-charges/search?q=<search_term>`

Search service charges by name or category.

**Required Roles:** All authenticated users

**Query Parameters:**
- `q` (string, required): Search term (charge name or category)

**Example Request:**
```
GET /billing/masters/service-charges/search?q=cataract
```

**Response (200 OK):**
```json
{
  "message": "Service charges searched successfully",
  "charges": [
    {
      "id": 1,
      "charge_name": "Cataract Surgery",
      "category": "Surgery",
      "default_rate": 15000,
      "is_active": true
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Search successful
- `400 Bad Request` - Missing search term
- `401 Unauthorized` - Missing/invalid token

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

**Common Status Codes:**
- `400 Bad Request` - Validation failed or missing required fields
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient role permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Examples

### Example 1: Create Bill for Cataract Surgery
```bash
curl -X POST http://localhost:3000/api/v1/billing \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "uhid": "9705",
    "patient_name": "Ramesh Kumar",
    "phone": "9876543210",
    "doctor_id": 2,
    "category": "Surgery",
    "bill_type": "Cash",
    "items": [
      {
        "charge_name": "Cataract Surgery",
        "category": "Surgery",
        "qty": 1,
        "rate": 15000
      }
    ]
  }'
```

### Example 2: List Bills for Specific Date Range
```bash
curl -X GET "http://localhost:3000/api/v1/billing?from_date=2026-01-01&to_date=2026-01-31" \
  -H "Authorization: Bearer <TOKEN>"
```

### Example 3: Get Patient's Bill History
```bash
curl -X GET "http://localhost:3000/api/v1/billing/patient/9705" \
  -H "Authorization: Bearer <TOKEN>"
```

### Example 4: Search Service Charges
```bash
curl -X GET "http://localhost:3000/api/v1/billing/masters/service-charges/search?q=surgery" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Notes

- **Bill Numbers:** Auto-incremented daily (resets per day)
- **Soft Deletes:** Deleted bills remain in database with `deleted_at` timestamp
- **Discounts:** Applied to bill and calculated in net_amount
- **Service Charges:** Sourced from service_charges master table
- **Date Format:** ISO 8601 (YYYY-MM-DD)
- **Amounts:** Stored as numeric(10,2) with 2 decimal places

# Dashboard Module API Documentation

## Overview
The Dashboard module provides comprehensive operational insights and KPIs for hospital administrators and doctors. It includes real-time metrics, trends analysis, and performance tracking across OPD, Billing, Consultations, and Patient Registration.

## Base URL
```
http://localhost:3000/api/v1/dashboard
```

## Authentication
All endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Features
- **KPI Overview** - Key performance indicators and metrics
- **OPD Analytics** - Visit metrics by doctor and status
- **Billing Analytics** - Revenue tracking and payment type breakdown
- **Trend Analysis** - 7-day rolling trends for registrations, OPD visits, and billing
- **Consultation Metrics** - Recent consultations and doctor workload
- **Patient Demographics** - Village-wise and follow-up analysis
- **System Health** - Database statistics and system status

---

## Endpoints

### 1. Get Complete Dashboard
**GET** `/dashboard`

Retrieve all dashboard data in a single request (comprehensive view).

**Required Roles:** ADMIN, DOCTOR, OPERATOR

**Response (200 OK):**
```json
{
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "kpis": {
        "registrations": {
          "total": 450,
          "today": 12
        },
        "opd_visits": {
          "total": 1250,
          "today": 45
        },
        "billing": {
          "total_amount": 2850000,
          "total_bills": 385,
          "today_amount": 125000,
          "today_bills": 18
        }
      },
      "system_stats": {
        "total_patients": 450,
        "active_doctors": 7,
        "active_users": 5,
        "total_opd_visits": 1250,
        "total_consultations": 380,
        "total_bills": 385,
        "system_time": "2026-01-03T16:30:00.000Z"
      }
    },
    "opd": {
      "status_breakdown": [
        { "status": "COMPLETED", "count": 35 },
        { "status": "WAITING", "count": 8 },
        { "status": "IN_PROGRESS", "count": 2 }
      ],
      "doctors_today": [
        { "id": 2, "name": "Dr. Aditya Kumar", "visit_count": 12 },
        { "id": 1, "name": "Dr. Rohan Sharma", "visit_count": 10 }
      ],
      "doctors_all_time": [
        { "id": 2, "name": "Dr. Aditya Kumar", "visit_count": 285 },
        { "id": 1, "name": "Dr. Rohan Sharma", "visit_count": 245 }
      ]
    },
    "billing": {
      "by_type": [
        { "bill_type": "Cash", "count": 12, "total_amount": 85000 },
        { "bill_type": "UPI", "count": 4, "total_amount": 35000 },
        { "bill_type": "Card", "count": 2, "total_amount": 5000 }
      ],
      "common_services": [
        {
          "charge_name": "Cataract Surgery",
          "category": "Surgery",
          "service_count": 45,
          "total_revenue": 675000
        },
        {
          "charge_name": "Consultation Fee",
          "category": "Consultation",
          "service_count": 280,
          "total_revenue": 140000
        }
      ]
    },
    "trends": {
      "registrations": [
        { "date": "2026-01-03", "registrations": 12 },
        { "date": "2026-01-02", "registrations": 14 },
        { "date": "2026-01-01", "registrations": 8 }
      ],
      "opd_visits": [
        { "date": "2026-01-03", "visits": 45 },
        { "date": "2026-01-02", "visits": 52 },
        { "date": "2026-01-01", "visits": 38 }
      ],
      "billing": [
        {
          "date": "2026-01-03",
          "bills": 18,
          "amount": 125000
        },
        {
          "date": "2026-01-02",
          "bills": 22,
          "amount": 156000
        }
      ]
    },
    "consultations": {
      "recent": [
        {
          "id": 1,
          "uhid": "9705",
          "patient_name": "Ramesh Kumar",
          "doctor_name": "Dr. Aditya Kumar",
          "diagnosis": "Age-related cataract",
          "created_at": "2026-01-03T14:30:00.000Z"
        }
      ],
      "by_doctor": [
        { "id": 2, "name": "Dr. Aditya Kumar", "consultation_count": 125 },
        { "id": 1, "name": "Dr. Rohan Sharma", "consultation_count": 98 }
      ],
      "active_count": 45
    },
    "demographics": [
      { "village": "Sector 12", "count": 145 },
      { "village": "Sector 15", "count": 98 },
      { "village": "Sector 18", "count": 67 }
    ],
    "follow_up_analysis": [
      { "visit_type": "New", "count": 28 },
      { "visit_type": "Follow-up", "count": 17 }
    ],
    "generated_at": "2026-01-03T16:30:45.123Z"
  }
}
```

**Status Codes:**
- `200 OK` - Dashboard data retrieved
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Database or calculation error

---

### 2. Get KPI Overview
**GET** `/dashboard/overview`

Get key performance indicator cards (registrations, OPD visits, billing).

**Required Roles:** ADMIN, DOCTOR, OPERATOR

**Response (200 OK):**
```json
{
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "kpis": {
      "registrations": {
        "total": 450,
        "today": 12
      },
      "opd_visits": {
        "total": 1250,
        "today": 45
      },
      "billing": {
        "total_amount": 2850000,
        "total_bills": 385,
        "today_amount": 125000,
        "today_bills": 18
      }
    },
    "system_stats": {
      "total_patients": 450,
      "active_doctors": 7,
      "active_users": 5,
      "total_opd_visits": 1250,
      "total_consultations": 380,
      "total_bills": 385,
      "system_time": "2026-01-03T16:30:00.000Z"
    }
  }
}
```

---

### 3. Get OPD Metrics
**GET** `/dashboard/opd`

Get OPD performance data: status breakdown, visits per doctor (today and all-time).

**Required Roles:** ADMIN, DOCTOR

**Response (200 OK):**
```json
{
  "message": "OPD metrics retrieved successfully",
  "data": {
    "status_breakdown": [
      { "status": "COMPLETED", "count": 35 },
      { "status": "WAITING", "count": 8 },
      { "status": "IN_PROGRESS", "count": 2 }
    ],
    "doctors_today": [
      { "id": 2, "name": "Dr. Aditya Kumar", "visit_count": 12 },
      { "id": 1, "name": "Dr. Rohan Sharma", "visit_count": 10 }
    ],
    "doctors_all_time": [
      { "id": 2, "name": "Dr. Aditya Kumar", "visit_count": 285 },
      { "id": 1, "name": "Dr. Rohan Sharma", "visit_count": 245 }
    ]
  }
}
```

---

### 4. Get Billing Metrics
**GET** `/dashboard/billing`

Get billing analytics: revenue by bill type and top services.

**Required Roles:** ADMIN, BILLING

**Response (200 OK):**
```json
{
  "message": "Billing metrics retrieved successfully",
  "data": {
    "by_type": [
      { "bill_type": "Cash", "count": 12, "total_amount": 85000 },
      { "bill_type": "UPI", "count": 4, "total_amount": 35000 }
    ],
    "common_services": [
      {
        "charge_name": "Cataract Surgery",
        "category": "Surgery",
        "service_count": 45,
        "total_revenue": 675000
      },
      {
        "charge_name": "Consultation Fee",
        "category": "Consultation",
        "service_count": 280,
        "total_revenue": 140000
      }
    ]
  }
}
```

---

### 5. Get Trends Data
**GET** `/dashboard/trends`

Get 7-day rolling trends for registrations, OPD visits, and billing.

**Required Roles:** ADMIN

**Response (200 OK):**
```json
{
  "message": "Trends data retrieved successfully",
  "data": {
    "registrations": [
      { "date": "2025-12-28", "registrations": 8 },
      { "date": "2025-12-29", "registrations": 10 },
      { "date": "2025-12-30", "registrations": 11 },
      { "date": "2025-12-31", "registrations": 9 },
      { "date": "2026-01-01", "registrations": 8 },
      { "date": "2026-01-02", "registrations": 14 },
      { "date": "2026-01-03", "registrations": 12 }
    ],
    "opd_visits": [
      { "date": "2025-12-28", "visits": 42 },
      { "date": "2025-12-29", "visits": 48 },
      { "date": "2025-12-30", "visits": 45 },
      { "date": "2025-12-31", "visits": 38 },
      { "date": "2026-01-01", "visits": 32 },
      { "date": "2026-01-02", "visits": 52 },
      { "date": "2026-01-03", "visits": 45 }
    ],
    "billing": [
      { "date": "2025-12-28", "bills": 18, "amount": 125000 },
      { "date": "2025-12-29", "bills": 21, "amount": 145000 },
      { "date": "2025-12-30", "bills": 19, "amount": 132000 },
      { "date": "2025-12-31", "bills": 15, "amount": 98000 },
      { "date": "2026-01-01", "bills": 12, "amount": 78000 },
      { "date": "2026-01-02", "bills": 22, "amount": 156000 },
      { "date": "2026-01-03", "bills": 18, "amount": 125000 }
    ]
  }
}
```

---

### 6. Get Consultation Metrics
**GET** `/dashboard/consultations`

Get consultation data: recent consultations, workload by doctor, active consultations.

**Required Roles:** ADMIN, DOCTOR

**Response (200 OK):**
```json
{
  "message": "Consultation metrics retrieved successfully",
  "data": {
    "recent": [
      {
        "id": 5,
        "uhid": "9705",
        "patient_name": "Ramesh Kumar",
        "doctor_name": "Dr. Aditya Kumar",
        "diagnosis": "Age-related cataract in both eyes",
        "created_at": "2026-01-03T14:30:00.000Z"
      },
      {
        "id": 4,
        "uhid": "9703",
        "patient_name": "Priya Singh",
        "doctor_name": "Dr. Rohan Sharma",
        "diagnosis": "Refractive error - myopia",
        "created_at": "2026-01-03T13:15:00.000Z"
      }
    ],
    "by_doctor": [
      { "id": 2, "name": "Dr. Aditya Kumar", "consultation_count": 125 },
      { "id": 1, "name": "Dr. Rohan Sharma", "consultation_count": 98 }
    ],
    "active_count": 45
  }
}
```

---

### 7. Get Patient Demographics
**GET** `/dashboard/demographics`

Get patient distribution by village/location.

**Required Roles:** ADMIN

**Response (200 OK):**
```json
{
  "message": "Patient demographics retrieved successfully",
  "data": [
    { "village": "Sector 12", "count": 145 },
    { "village": "Sector 15", "count": 98 },
    { "village": "Sector 18", "count": 67 },
    { "village": "Sector 21", "count": 54 },
    { "village": "Others", "count": 86 }
  ]
}
```

---

### 8. Get Follow-up Analysis
**GET** `/dashboard/follow-up`

Get analysis of today's visits: new patients vs follow-up patients.

**Required Roles:** ADMIN, DOCTOR

**Response (200 OK):**
```json
{
  "message": "Follow-up analysis retrieved successfully",
  "data": [
    {
      "visit_type": "New",
      "count": 28
    },
    {
      "visit_type": "Follow-up",
      "count": 17
    }
  ]
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description",
  "errors": ["Specific error details"]
}
```

**Common Status Codes:**
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient role permissions
- `500 Internal Server Error` - Database error or calculation failure

---

## Dashboard Cards Summary

### KPI Cards
| Card | Description | Data Points |
|------|-------------|------------|
| Registrations | Patient registration metrics | Total, Today |
| OPD Visits | Queue visit metrics | Total, Today |
| Billing | Revenue tracking | Total amount, Total bills, Today amount, Today bills |
| System Health | Database statistics | Total patients, Active doctors, Total consultations |

### Analytics Sections
| Section | Description | Data Points |
|---------|-------------|------------|
| OPD Performance | Doctor workload and queue status | Visits per doctor, Status breakdown |
| Billing Analytics | Revenue metrics | By bill type, Top services |
| Trends | 7-day rolling data | Registrations, OPD visits, Billing |
| Consultations | Doctor consultation load | Recent consultations, By doctor, Active |
| Demographics | Patient distribution | Village-wise breakdown |
| Follow-up Analysis | Patient visit patterns | New vs Follow-up |

---

## Example Usage

### Get Overview for KPI Cards
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/overview \
  -H "Authorization: Bearer <TOKEN>"
```

### Get OPD Performance for Line Chart
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/opd \
  -H "Authorization: Bearer <TOKEN>"
```

### Get 7-Day Trends for Multiple Charts
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/trends \
  -H "Authorization: Bearer <TOKEN>"
```

### Get Complete Dashboard (All Data)
```bash
curl -X GET http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Performance Notes

- All endpoints retrieve cached or efficiently computed metrics
- Trend data covers last 7 days (configurable)
- Complete dashboard endpoint aggregates all metrics in parallel queries
- Recommended refresh interval: 30 seconds for real-time monitoring
- Heavy aggregations (demographics) cached server-side where possible

---

## Role-Based Access

| Role | Endpoints Accessible |
|------|---------------------|
| ADMIN | All endpoints |
| DOCTOR | Overview, OPD, Consultations, Follow-up |
| BILLING | Overview, Billing |
| OPERATOR | Overview only |
| RECEPTION | No access |

---

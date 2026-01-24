// SQL queries for OPD module
export const opdQueries = {
  // Create OPD queue entry
  createOPD: `
    INSERT INTO opd_queue (
      uhid, doctor_id, visit_type, visit_type_id, visit_amount,
      serial_no, visit_date, status, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, 'WAITING', NOW()
    )
    RETURNING id, uhid, doctor_id, visit_type, visit_type_id, visit_amount,
              serial_no, visit_date, status, created_at
  `,

  // Get OPD record by ID
  getOPDById: `
    SELECT
      oq.id, oq.uhid, oq.doctor_id, oq.visit_type, oq.visit_type_id,
      oq.visit_amount, oq.serial_no, oq.visit_date, oq.status,
      oq.created_at,
      p.first_name, p.last_name, p.phone, p.dob, p.gender,
      d.name as doctor_name,
      vt.name as visit_type_name
    FROM opd_queue oq
    LEFT JOIN patients p ON oq.uhid = p.uhid
    LEFT JOIN doctors d ON oq.doctor_id = d.id
    LEFT JOIN visit_types vt ON oq.visit_type_id = vt.id
    WHERE oq.id = $1
    LIMIT 1
  `,

  // Get OPD queue (with filters)
  getOPDQueue: `
    SELECT
      oq.id, oq.uhid, oq.doctor_id, oq.visit_type, oq.visit_type_id,
      oq.visit_amount, oq.serial_no, oq.visit_date, oq.status,
      oq.created_at,
      p.first_name, p.last_name, p.phone, p.gender, p.age,
      d.name as doctor_name,
      vt.name as visit_type_name
    FROM opd_queue oq
    LEFT JOIN patients p ON oq.uhid = p.uhid
    LEFT JOIN doctors d ON oq.doctor_id = d.id
    LEFT JOIN visit_types vt ON oq.visit_type_id = vt.id
    WHERE 1=1
      AND (
        $1::date IS NULL OR oq.visit_date = $1
      )
      AND (
        $2::integer IS NULL OR oq.doctor_id = $2
      )
      AND (
        $3::text IS NULL OR oq.status = $3
      )
    ORDER BY oq.visit_date ASC, oq.serial_no ASC
    LIMIT $4 OFFSET $5
  `,

  // Count OPD records (for pagination)
  countOPD: `
    SELECT COUNT(*) as total
    FROM opd_queue oq
    WHERE 1=1
      AND (
        $1::date IS NULL OR oq.visit_date = $1
      )
      AND (
        $2::integer IS NULL OR oq.doctor_id = $2
      )
      AND (
        $3::text IS NULL OR oq.status = $3
      )
  `,

  // Get patient's OPD records
  getPatientOPD: `
    SELECT
      oq.id, oq.uhid, oq.doctor_id, oq.visit_type, oq.visit_type_id,
      oq.visit_amount, oq.serial_no, oq.visit_date, oq.status,
      oq.created_at,
      d.name as doctor_name,
      vt.name as visit_type_name
    FROM opd_queue oq
    LEFT JOIN doctors d ON oq.doctor_id = d.id
    LEFT JOIN visit_types vt ON oq.visit_type_id = vt.id
    WHERE oq.uhid = $1
    ORDER BY oq.visit_date DESC
    LIMIT $2 OFFSET $3
  `,

  // Count patient's OPD records
  countPatientOPD: `
    SELECT COUNT(*) as total
    FROM opd_queue
    WHERE uhid = $1
  `,

  // Update OPD status
  updateOPDStatus: `
    UPDATE opd_queue
    SET status = $2
    WHERE id = $1
    RETURNING id, uhid, doctor_id, visit_type, visit_type_id,
              visit_amount, serial_no, visit_date, status, created_at
  `,

  // Get next serial number for a day
  getNextSerialNumber: `
    SELECT COALESCE(MAX(serial_no), 0) + 1 as next_serial
    FROM opd_queue
    WHERE visit_date = $1 AND doctor_id = $2
  `,

  // Get all doctors
  getDoctors: `
    SELECT id, name FROM doctors WHERE is_active = true ORDER BY name
  `,

  // Get all visit types
  getVisitTypes: `
    SELECT id, name, default_amount FROM visit_types WHERE is_active = true ORDER BY name
  `,

  // Delete OPD entry
  deleteOPD: `
    DELETE FROM opd_queue WHERE id = $1 RETURNING id, uhid, doctor_id, visit_date
  `,

  // Get doctor by ID
  getDoctorById: `
    SELECT id, name FROM doctors WHERE id = $1 AND is_active = true LIMIT 1
  `,

  // Get visit type by ID
  getVisitTypeById: `
    SELECT id, name, default_amount FROM visit_types WHERE id = $1 AND is_active = true LIMIT 1
  `,
};

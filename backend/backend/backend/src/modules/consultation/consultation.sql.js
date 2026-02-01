// SQL queries for Consultation module
export const consultationQueries = {
  // Create consultation
  createConsultation: `
    INSERT INTO consultations (
      uhid, doctor_id, opd_id, diagnosis, treatment_plan,
      followup_instructions, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, NOW()
    )
    RETURNING id, uhid, doctor_id, opd_id, diagnosis, treatment_plan,
              followup_instructions, created_at
  `,

  // Get consultation by ID with full details
  getConsultationById: `
    SELECT
      c.id, c.uhid, c.doctor_id, c.opd_id, c.diagnosis, c.treatment_plan,
      c.followup_instructions, c.ai_summary, c.created_at,
      p.first_name, p.last_name, p.phone, p.gender,
      d.name as doctor_name,
      o.visit_type, o.serial_no, o.visit_date
    FROM consultations c
    LEFT JOIN patients p ON c.uhid = p.uhid
    LEFT JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN opd_queue o ON c.opd_id = o.id
    WHERE c.id = $1
    LIMIT 1
  `,

  // List consultations with pagination and filters
  listConsultations: `
    SELECT
      c.id, c.uhid, c.doctor_id, c.opd_id, c.diagnosis, c.treatment_plan,
      c.followup_instructions, c.created_at,
      p.first_name, p.last_name, p.phone,
      d.name as doctor_name,
      COUNT(*) OVER() as total_count
    FROM consultations c
    LEFT JOIN patients p ON c.uhid = p.uhid
    LEFT JOIN doctors d ON c.doctor_id = d.id
    WHERE ($1::VARCHAR IS NULL OR c.uhid = $1)
      AND ($2::INTEGER IS NULL OR c.doctor_id = $2)
      AND ($3::DATE IS NULL OR DATE(c.created_at) = $3)
    ORDER BY c.created_at DESC
    LIMIT $4 OFFSET $5
  `,

  // Count consultations for pagination
  countConsultations: `
    SELECT COUNT(*) as total
    FROM consultations c
    WHERE ($1::VARCHAR IS NULL OR c.uhid = $1)
      AND ($2::INTEGER IS NULL OR c.doctor_id = $2)
      AND ($3::DATE IS NULL OR DATE(c.created_at) = $3)
  `,

  // Get consultations by patient UHID
  getPatientConsultations: `
    SELECT
      c.id, c.uhid, c.doctor_id, c.opd_id, c.diagnosis, c.treatment_plan,
      c.followup_instructions, c.created_at,
      d.name as doctor_name,
      o.visit_type, o.serial_no
    FROM consultations c
    LEFT JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN opd_queue o ON c.opd_id = o.id
    WHERE c.uhid = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // Count patient consultations
  countPatientConsultations: `
    SELECT COUNT(*) as total FROM consultations WHERE uhid = $1
  `,

  // Update consultation
  updateConsultation: `
    UPDATE consultations
    SET diagnosis = COALESCE($2, diagnosis),
        treatment_plan = COALESCE($3, treatment_plan),
        followup_instructions = COALESCE($4, followup_instructions)
    WHERE id = $1
    RETURNING id, uhid, doctor_id, opd_id, diagnosis, treatment_plan,
              followup_instructions, created_at
  `,

  // Add ICD code to consultation
  addConsultationICD: `
    INSERT INTO consultation_icd (consultation_id, icd_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `,

  // Get ICD codes for consultation
  getConsultationICDs: `
    SELECT
      im.id, im.icd_code, im.description
    FROM consultation_icd ci
    JOIN icd_master im ON ci.icd_id = im.id
    WHERE ci.consultation_id = $1
    ORDER BY im.icd_code
  `,

  // Remove ICD code from consultation
  removeConsultationICD: `
    DELETE FROM consultation_icd
    WHERE consultation_id = $1 AND icd_id = $2
  `,

  // Get all ICD codes for dropdown
  getAllICDCodes: `
    SELECT id, icd_code, description
    FROM icd_master
    WHERE is_active = true
    ORDER BY icd_code
    LIMIT 100
  `,

  // Get ICD code by ID
  getICDCodeById: `
    SELECT id, icd_code, description, is_active
    FROM icd_master
    WHERE id = $1
    LIMIT 1
  `,

  // Search ICD codes
  searchICDCodes: `
    SELECT id, icd_code, description
    FROM icd_master
    WHERE is_active = true
      AND (icd_code ILIKE $1 OR description ILIKE $1)
    ORDER BY icd_code
    LIMIT 20
  `,

  // Delete consultation
  deleteConsultation: `
    DELETE FROM consultations WHERE id = $1
    RETURNING id
  `,
};

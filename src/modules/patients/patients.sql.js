// SQL queries for patients module
export const patientQueries = {
  // Insert new patient
  createPatient: `
    INSERT INTO patients (
      uhid, first_name, middle_name, last_name, gender, dob, age_text, age,
      phone, address, district, tehsil, block, village, chief_complaint,
      weight, spo2, temperature, pulse, bp,
      patient_category, guardian_name, relation_to_patient, alternate_phone, photo,
      registration_date, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, CURRENT_DATE, NOW()
    )
    RETURNING uhid, first_name, middle_name, last_name, gender, dob, age_text, age, phone, 
              address, district, tehsil, block, village, chief_complaint,
              weight, spo2, temperature, pulse, bp,
              patient_category, guardian_name, relation_to_patient, alternate_phone, photo, created_at
  `,

  // Find patient by UHID
  findByUHID: `
    SELECT uhid, first_name, middle_name, last_name, gender, dob, age_text, age,
           phone, address, district, tehsil, block, village, chief_complaint,
           weight, spo2, temperature, pulse, bp,
           patient_category, guardian_name, relation_to_patient, alternate_phone, photo,
           registration_date, created_at
    FROM patients
    WHERE uhid = $1 AND deleted_at IS NULL
    LIMIT 1
  `,

  // Search patients by name or phone with village/district filter
  searchPatients: `
    SELECT uhid, first_name, middle_name, last_name, gender, dob, age,
           phone, address, district, tehsil, block, village, chief_complaint,
           weight, spo2, temperature, pulse, bp,
           patient_category, guardian_name, relation_to_patient, photo, created_at
    FROM patients
    WHERE deleted_at IS NULL
      AND (
        $1::text IS NULL OR
        uhid ILIKE '%' || $1 || '%' OR
        first_name ILIKE '%' || $1 || '%' OR
        last_name ILIKE '%' || $1 || '%' OR
        (phone NOT IN ('9999999999') AND phone ILIKE '%' || $1 || '%') OR
        (village NOT IN ('None', '') AND village IS NOT NULL AND village ILIKE '%' || $1 || '%')
      )
      AND (
        $2::text IS NULL OR
        district ILIKE '%' || $2 || '%' OR
        (village NOT IN ('None', '') AND village IS NOT NULL AND village ILIKE '%' || $2 || '%')
      )
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
  `,

  // Get patient count for pagination
  countPatients: `
    SELECT COUNT(*) as total
    FROM patients
    WHERE deleted_at IS NULL
      AND (
        $1::text IS NULL OR
        uhid ILIKE '%' || $1 || '%' OR
        first_name ILIKE '%' || $1 || '%' OR
        last_name ILIKE '%' || $1 || '%' OR
        (phone NOT IN ('9999999999') AND phone ILIKE '%' || $1 || '%') OR
        (village NOT IN ('None') AND village ILIKE '%' || $1 || '%')
      )
      AND (
        $2::text IS NULL OR
        district ILIKE '%' || $2 || '%' OR
        (village NOT IN ('None') AND village ILIKE '%' || $2 || '%')
      )
  `,

  // Update patient
  updatePatient: `
    UPDATE patients
    SET first_name = COALESCE($2, first_name),
        middle_name = COALESCE($3, middle_name),
        last_name = COALESCE($4, last_name),
        gender = COALESCE($5, gender),
        dob = COALESCE($6, dob),
        age = COALESCE($7, age),
        phone = COALESCE($8, phone),
        address = COALESCE($9, address),
        district = COALESCE($10, district),
        tehsil = COALESCE($11, tehsil),
        block = COALESCE($12, block),
        village = COALESCE($13, village),
        chief_complaint = COALESCE($14, chief_complaint),
        weight = COALESCE($15, weight),
        spo2 = COALESCE($16, spo2),
        temperature = COALESCE($17, temperature),
        pulse = COALESCE($18, pulse),
        bp = COALESCE($19, bp),
        patient_category = COALESCE($20, patient_category),
        guardian_name = COALESCE($21, guardian_name),
        relation_to_patient = COALESCE($22, relation_to_patient),
        alternate_phone = COALESCE($23, alternate_phone),
        photo = COALESCE($24, photo)
    WHERE uhid = $1 AND deleted_at IS NULL
    RETURNING uhid, first_name, middle_name, last_name, gender, dob, age, phone, 
              address, district, tehsil, block, village, chief_complaint,
              weight, spo2, temperature, pulse, bp,
              patient_category, guardian_name, relation_to_patient, alternate_phone, photo
  `,

  // Soft delete patient
  deletePatient: `
    UPDATE patients
    SET deleted_at = NOW()
    WHERE uhid = $1 AND deleted_at IS NULL
    RETURNING uhid
  `,

  // Get patient visit history (OPD + Consultations)
  getVisitHistory: `
    SELECT
      'OPD' as visit_type,
      oq.id as visit_id,
      oq.visit_date as visit_date,
      oq.visit_amount as amount,
      d.name as doctor_name,
      vt.name as visit_type_name,
      oq.serial_no,
      oq.status
    FROM opd_queue oq
    LEFT JOIN doctors d ON oq.doctor_id = d.id
    LEFT JOIN visit_types vt ON oq.visit_type_id = vt.id
    WHERE oq.uhid = $1
    UNION ALL
    SELECT
      'CONSULTATION' as visit_type,
      c.id as visit_id,
      c.created_at as visit_date,
      NULL as amount,
      d.name as doctor_name,
      NULL as visit_type_name,
      NULL as serial_no,
      NULL as status
    FROM consultations c
    LEFT JOIN doctors d ON c.doctor_id = d.id
    WHERE c.uhid = $1
    ORDER BY visit_date DESC
  `,

  // Check if UHID exists
  checkUHIDExists: `
    SELECT uhid FROM patients WHERE uhid = $1 AND deleted_at IS NULL LIMIT 1
  `,

  // Get max UHID to generate next one
  getMaxUHID: `
    SELECT MAX(CAST(uhid as INTEGER)) as max_uhid FROM patients WHERE uhid ~ '^[0-9]+$'
  `,
};

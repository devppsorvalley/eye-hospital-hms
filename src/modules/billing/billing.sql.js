/**
 * Billing SQL Queries
 * Handles bill generation, retrieval, updates, and service charge lookups
 */

export const billingQueries = {
  // Create a new bill
  createBill: `
    INSERT INTO bills (
      bill_no, uhid, patient_name, phone, relation_text, opd_id, doctor_id, category, bill_type,
      upi_reference, aadhaar_no, ayushman_card_no, ration_card_no,
      echs_referral_no, echs_service_no, echs_claim_id,
      admit_date, discharge_date,
      gross_amount, discount_amount, net_amount, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING id, bill_no, uhid, patient_name, category, bill_type, gross_amount, discount_amount, net_amount, created_at;
  `,

  // Add bill item (service charge)
  addBillItem: `
    INSERT INTO bill_items (bill_id, charge_id, charge_name, category, qty, rate, amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, bill_id, charge_name, qty, rate, amount;
  `,

  // Get bill by ID with all items
  getBillById: `
    SELECT 
      b.id,
      b.bill_no,
      b.bill_date::text as bill_date,
      b.bill_time,
      b.uhid,
      b.patient_name,
      b.phone,
      b.relation_text,
      b.opd_id,
      b.doctor_id,
      b.category,
      b.bill_type,
      b.upi_reference,
      b.aadhaar_no,
      b.ayushman_card_no,
      b.ration_card_no,
      b.echs_referral_no,
      b.echs_service_no,
      b.echs_claim_id,
      b.admit_date::text as admit_date,
      b.discharge_date::text as discharge_date,
      b.gross_amount,
      b.discount_amount,
      b.net_amount,
      b.created_by,
      b.created_at,
      b.updated_at,
      json_agg(
        json_build_object(
          'id', bi.id,
          'charge_id', bi.charge_id,
          'charge_name', bi.charge_name,
          'category', bi.category,
          'qty', bi.qty,
          'rate', bi.rate,
          'amount', bi.amount
        ) ORDER BY bi.id
      ) FILTER (WHERE bi.id IS NOT NULL) as bill_items
    FROM bills b
    LEFT JOIN bill_items bi ON b.id = bi.bill_id
    WHERE b.id = $1 AND b.cancelled_at IS NULL
    GROUP BY b.id;
  `,

  // List bills with pagination and filters
  listBills: `
    SELECT 
      b.id,
      b.bill_no,
      b.bill_date::text as bill_date,
      b.bill_time,
      b.uhid,
      b.patient_name,
      b.phone,
      b.relation_text,
      b.opd_id,
      b.doctor_id,
      b.category,
      b.bill_type,
      b.upi_reference,
      b.aadhaar_no,
      b.ayushman_card_no,
      b.ration_card_no,
      b.echs_referral_no,
      b.echs_service_no,
      b.echs_claim_id,
      b.admit_date::text as admit_date,
      b.discharge_date::text as discharge_date,
      b.gross_amount,
      b.discount_amount,
      b.net_amount,
      b.created_by,
      b.created_at,
      b.updated_at,
      COUNT(*) OVER() as total_count
    FROM bills b
    WHERE b.cancelled_at IS NULL
      AND ($1::date IS NULL OR b.bill_date >= $1)
      AND ($2::date IS NULL OR b.bill_date <= $2)
      AND ($3::varchar IS NULL OR b.bill_type ILIKE $3)
      AND ($4::varchar IS NULL OR b.uhid ILIKE $4 OR b.patient_name ILIKE $4)
    ORDER BY b.created_at DESC
    LIMIT $5 OFFSET $6;
  `,

  // Count bills with filters
  countBills: `
    SELECT COUNT(*) as count
    FROM bills b
    WHERE b.cancelled_at IS NULL
      AND ($1::date IS NULL OR b.bill_date >= $1)
      AND ($2::date IS NULL OR b.bill_date <= $2)
      AND ($3::varchar IS NULL OR b.bill_type ILIKE $3)
      AND ($4::varchar IS NULL OR b.uhid ILIKE $4 OR b.patient_name ILIKE $4);
  `,

  // Get patient bills
  getPatientBills: `
    SELECT 
      id,
      bill_no,
      bill_date,
      patient_name,
      bill_type,
      net_amount,
      created_at
    FROM bills
    WHERE uhid = $1 AND cancelled_at IS NULL
    ORDER BY bill_date DESC, created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Count patient bills
  countPatientBills: `
    SELECT COUNT(*) as count
    FROM bills
    WHERE uhid = $1 AND cancelled_at IS NULL;
  `,

  // Update bill (discount, status, etc.)
  updateBill: `
    UPDATE bills
    SET 
      discount_amount = COALESCE($2, discount_amount),
      net_amount = COALESCE($3, net_amount),
      upi_reference = COALESCE($4, upi_reference),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND cancelled_at IS NULL
    RETURNING id, bill_no, gross_amount, discount_amount, net_amount, updated_at;
  `,

  // Cancel bill (soft delete - marks as cancelled for auditing)
  cancelBill: `
    UPDATE bills
    SET cancelled_at = CURRENT_TIMESTAMP, 
        cancelled_by = $2,
        cancel_reason = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND cancelled_at IS NULL
    RETURNING id, bill_no, cancelled_at, cancelled_by, cancel_reason;
  `,

  // Get service charges for bill items
  getServiceCharges: `
    SELECT 
      sc.id,
      sc.charge_name,
      sc.category_id,
      sc.default_rate,
      sc.is_active,
      sc.description,
      scat.name as category_name
    FROM service_charges sc
    LEFT JOIN service_categories scat ON sc.category_id = scat.id
    WHERE sc.deleted_at IS NULL
    ORDER BY scat.name, sc.charge_name;
  `,

  // Get service charge by ID
  getServiceChargeById: `
    SELECT 
      sc.id,
      sc.charge_name,
      sc.category_id,
      sc.default_rate,
      sc.is_active,
      sc.description,
      scat.name as category_name
    FROM service_charges sc
    LEFT JOIN service_categories scat ON sc.category_id = scat.id
    WHERE sc.id = $1 AND sc.deleted_at IS NULL;
  `,

  // Create service charge
  createServiceCharge: `
    INSERT INTO service_charges (category_id, charge_name, default_rate, is_active, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, category_id, charge_name, default_rate, is_active, description;
  `,

  // Update service charge
  updateServiceCharge: `
    UPDATE service_charges
    SET 
      category_id = $2,
      charge_name = $3,
      default_rate = $4,
      is_active = $5,
      description = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, category_id, charge_name, default_rate, is_active, description;
  `,

  // Soft delete service charge
  deleteServiceCharge: `
    UPDATE service_charges
    SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, charge_name;
  `,

  // Search service charges
  searchServiceCharges: `
    SELECT 
      id,
      charge_name,
      category,
      default_rate,
      is_active
    FROM service_charges
    WHERE is_active = true 
      AND deleted_at IS NULL
      AND (charge_name ILIKE $1 OR category ILIKE $1)
    ORDER BY category, charge_name;
  `,

  // Get bill items by bill ID
  getBillItems: `
    SELECT 
      id,
      bill_id,
      charge_name,
      category,
      qty,
      rate,
      amount
    FROM bill_items
    WHERE bill_id = $1
    ORDER BY created_at;
  `,

  // Check if patient exists
  checkPatientExists: `
    SELECT uhid FROM patients WHERE uhid = $1 AND deleted_at IS NULL LIMIT 1;
  `,

  // Check if OPD entry exists
  checkOPDExists: `
    SELECT id FROM opd_queue WHERE id = $1 LIMIT 1;
  `,

  // Check if doctor exists
  checkDoctorExists: `
    SELECT id FROM doctors WHERE id = $1 AND is_active = true LIMIT 1;
  `,

  // Get next bill number (for sequential billing)
  getNextBillNumber: `
    SELECT COALESCE(MAX(bill_no), 0) + 1 as next_bill_no
    FROM bills;
  `,

  // Get all service categories
  getServiceCategories: `
    SELECT id, name as category_name, created_at
    FROM service_categories
    WHERE is_active = true
    ORDER BY name;
  `,
};


/**
 * Billing Service
 * Business logic for bill generation, retrieval, and updates
 */

import { pool } from '../../config/db.js';
import { billingQueries } from './billing.sql.js';

/**
 * Create a bill with items
 */
export async function createBill(billData) {
  const {
    uhid,
    patient_name,
    phone,
    relation_text,
    opd_id,
    doctor_id,
    category,
    bill_type,
    upi_reference,
    aadhaar_no,
    ayushman_card_no,
    ration_card_no,
    echs_referral_no,
    echs_service_no,
    echs_claim_id,
    admit_date,
    discharge_date,
    items = [],
    created_by = 'system',
  } = billData;

  // Validate patient exists
  const patientCheck = await pool.query(billingQueries.checkPatientExists, [uhid]);
  if (patientCheck.rows.length === 0) {
    const err = new Error(`Patient with UHID ${uhid} not found`);
    err.statusCode = 404;
    throw err;
  }

  // Validate OPD exists (if provided)
  if (opd_id) {
    const opdCheck = await pool.query(billingQueries.checkOPDExists, [opd_id]);
    if (opdCheck.rows.length === 0) {
      const err = new Error(`OPD entry with ID ${opd_id} not found`);
      err.statusCode = 404;
      throw err;
    }
  }

  // Validate doctor exists (if provided)
  if (doctor_id) {
    const doctorCheck = await pool.query(billingQueries.checkDoctorExists, [doctor_id]);
    if (doctorCheck.rows.length === 0) {
      const err = new Error(`Doctor with ID ${doctor_id} not found`);
      err.statusCode = 404;
      throw err;
    }
  }

  // Get next bill number
  const billNoResult = await pool.query(billingQueries.getNextBillNumber);
  const billNo = billNoResult.rows[0].next_bill_no;

  // Calculate amounts
  let grossAmount = 0;
  items.forEach(item => {
    grossAmount += item.qty * item.rate;
  });

  const discountAmount = billData.discount_amount || 0;
  const netAmount = grossAmount - discountAmount;

  // Create bill
  const billResult = await pool.query(billingQueries.createBill, [
    billNo,
    uhid,
    patient_name,
    phone,
    relation_text,
    opd_id,
    doctor_id,
    category,
    bill_type,
    upi_reference,
    aadhaar_no,
    ayushman_card_no,
    ration_card_no,
    echs_referral_no,
    echs_service_no,
    echs_claim_id,
    admit_date || null,
    discharge_date || null,
    grossAmount,
    discountAmount,
    netAmount,
    created_by,
  ]);

  const bill = billResult.rows[0];

  // Add bill items
  const billItems = [];
  for (const item of items) {
    const itemResult = await pool.query(billingQueries.addBillItem, [
      bill.id,
      item.charge_id,
      item.charge_name,
      item.category,
      item.qty || 1,
      item.rate,
      (item.qty || 1) * item.rate,
    ]);
    billItems.push(itemResult.rows[0]);
  }

  return {
    ...bill,
    bill_items: billItems,
  };
}

/**
 * Get bill by ID with all items
 */
export async function getBillById(billId) {
  const result = await pool.query(billingQueries.getBillById, [billId]);
  if (result.rows.length === 0) {
    const err = new Error(`Bill with ID ${billId} not found`);
    err.statusCode = 404;
    throw err;
  }
  const bill = result.rows[0];
  return bill;
}

/**
 * List bills with filtering and pagination
 */
export async function listBills(filters = {}) {
  const {
    fromDate = null,
    toDate = null,
    billType = null,
    search = null,
    limit = 10,
    offset = 0,
  } = filters;

  const result = await pool.query(billingQueries.listBills, [
    fromDate,
    toDate,
    billType ? `%${billType}%` : null,
    search ? `%${search}%` : null,
    limit,
    offset,
  ]);

  return {
    bills: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
  };
}

/**
 * Get bills for a patient
 */
export async function getPatientBills(uhid, limit = 10, offset = 0) {
  const result = await pool.query(billingQueries.getPatientBills, [uhid, limit, offset]);

  const countResult = await pool.query(billingQueries.countPatientBills, [uhid]);
  const total = countResult.rows[0]?.count || 0;

  return {
    bills: result.rows,
    total,
  };
}

/**
 * Update bill (discount, upi reference, etc.)
 */
export async function updateBill(billId, updateData) {
  const {
    bill_type,
    discount_amount = 0,
    upi_reference,
    aadhaar_no,
    ayushman_card_no,
    ration_card_no,
    echs_referral_no,
    echs_service_no,
    echs_claim_id,
    admit_date,
    discharge_date,
    items = [],
  } = updateData;

  // Calculate amounts
  let grossAmount = 0;
  items.forEach(item => {
    grossAmount += item.qty * item.rate;
  });

  const netAmount = grossAmount - discount_amount;

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update bill header
    const billUpdateResult = await client.query(`
      UPDATE bills
      SET 
        bill_type = $2,
        upi_reference = $3,
        aadhaar_no = $4,
        ayushman_card_no = $5,
        ration_card_no = $6,
        echs_referral_no = $7,
        echs_service_no = $8,
        echs_claim_id = $9,
        admit_date = $10,
        discharge_date = $11,
        gross_amount = $12,
        discount_amount = $13,
        net_amount = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_deleted = false
      RETURNING *;
    `, [
      billId,
      bill_type,
      upi_reference,
      aadhaar_no,
      ayushman_card_no,
      ration_card_no,
      echs_referral_no,
      echs_service_no,
      echs_claim_id,
      admit_date || null,
      discharge_date || null,
      grossAmount,
      discount_amount,
      netAmount,
    ]);

    if (billUpdateResult.rows.length === 0) {
      throw new Error(`Bill with ID ${billId} not found or already deleted`);
    }

    const bill = billUpdateResult.rows[0];

    // Delete existing bill items
    await client.query('DELETE FROM bill_items WHERE bill_id = $1', [billId]);

    // Insert new bill items
    const billItems = [];
    for (const item of items) {
      const itemResult = await client.query(`
        INSERT INTO bill_items (bill_id, charge_id, charge_name, category, qty, rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [
        billId,
        item.charge_id,
        item.charge_name,
        item.category,
        item.qty || 1,
        item.rate,
        (item.qty || 1) * item.rate,
      ]);
      billItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      ...bill,
      bill_items: billItems,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cancel bill (soft delete - marks as cancelled)
 * Only admin can cancel bills
 */
export async function cancelBill(billId, cancelledBy, cancelReason = null) {
  const result = await pool.query(billingQueries.cancelBill, [
    billId,
    cancelledBy,
    cancelReason,
  ]);

  if (result.rows.length === 0) {
    const err = new Error(`Bill with ID ${billId} not found or already cancelled`);
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Get all service charges (for billing items)
 */
export async function getServiceCharges() {
  const result = await pool.query(billingQueries.getServiceCharges);
  return result.rows;
}

/**
 * Search service charges by name or category
 */
export async function searchServiceCharges(searchTerm) {
  const result = await pool.query(billingQueries.searchServiceCharges, [
    `%${searchTerm}%`,
  ]);
  return result.rows;
}

/**
 * Get service charge by ID
 */
export async function getServiceChargeById(chargeId) {
  const result = await pool.query(billingQueries.getServiceChargeById, [chargeId]);

  if (result.rows.length === 0) {
    const err = new Error(`Service charge with ID ${chargeId} not found`);
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Create new service charge
 */
export async function createServiceCharge(data) {
  const { category_id, charge_name, default_rate, is_active, description } = data;

  const result = await pool.query(billingQueries.createServiceCharge, [
    category_id,
    charge_name,
    default_rate,
    is_active !== undefined ? is_active : true,
    description || null,
  ]);

  return result.rows[0];
}

/**
 * Update service charge
 */
export async function updateServiceCharge(chargeId, data) {
  const { category_id, charge_name, default_rate, is_active, description } = data;

  const result = await pool.query(billingQueries.updateServiceCharge, [
    chargeId,
    category_id,
    charge_name,
    default_rate,
    is_active !== undefined ? is_active : true,
    description || null,
  ]);

  if (result.rows.length === 0) {
    const err = new Error(`Service charge with ID ${chargeId} not found or already deleted`);
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Delete service charge (soft delete)
 */
export async function deleteServiceCharge(chargeId) {
  const result = await pool.query(billingQueries.deleteServiceCharge, [chargeId]);

  if (result.rows.length === 0) {
    const err = new Error(`Service charge with ID ${chargeId} not found or already deleted`);
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Get bill items for a bill
 */
export async function getBillItems(billId) {
  const result = await pool.query(billingQueries.getBillItems, [billId]);
  return result.rows;
}

/**
 * Get all service categories
 */
export async function getServiceCategories() {
  const result = await pool.query(billingQueries.getServiceCategories);
  return result.rows;
}

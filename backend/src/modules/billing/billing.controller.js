/**
 * Billing Controller
 * HTTP request handlers for billing operations
 */

import * as billingService from './billing.service.js';
import * as billingValidation from './billing.validation.js';

/**
 * POST /billing
 * Create a new bill
 */
export async function createBillController(req, res, next) {
  try {
    const billData = req.body;

    // Validate request
    billingValidation.validateBillCreation(billData);

    // Create bill
    const bill = await billingService.createBill(billData);

    res.status(201).json({
      message: 'Bill created successfully',
      bill,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing/:id
 * Get bill by ID with all items
 */
export async function getBillController(req, res, next) {
  try {
    const { id } = req.params;

    // Validate bill ID
    billingValidation.validateBillId(id);

    // Get bill
    const bill = await billingService.getBillById(id);

    res.status(200).json({
      message: 'Bill retrieved successfully',
      bill,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing
 * List bills with filters and pagination
 */
export async function listBillsController(req, res, next) {
  try {
    const { from_date, to_date, bill_type, search, limit = 10, offset = 0 } = req.query;

    // Validate parameters
    billingValidation.validateListParams({
      limit: parseInt(limit),
      offset: parseInt(offset),
      fromDate: from_date,
      toDate: to_date,
      billType: bill_type,
    });

    // List bills
    const result = await billingService.listBills({
      fromDate: from_date,
      toDate: to_date,
      billType: bill_type,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Bills retrieved successfully',
      bills: result.bills,
      total: result.total,
      count: result.bills.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing/patient/:uhid
 * Get bills for a specific patient
 */
export async function getPatientBillsController(req, res, next) {
  try {
    const { uhid } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Validate UHID
    billingValidation.validateUHID(uhid);
    billingValidation.validateListParams({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Get patient bills
    const result = await billingService.getPatientBills(uhid, parseInt(limit), parseInt(offset));

    res.status(200).json({
      message: 'Patient bills retrieved successfully',
      bills: result.bills,
      total: result.total,
      count: result.bills.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /billing/:id
 * Update bill (discount, UPI reference, etc.)
 */
export async function updateBillController(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate bill ID
    billingValidation.validateBillId(id);

    // Validate update data
    billingValidation.validateBillUpdate(updateData);

    // Update bill
    const bill = await billingService.updateBill(id, updateData);

    res.status(200).json({
      message: 'Bill updated successfully',
      bill,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /billing/:id/cancel
 * Cancel bill (soft delete - marks as cancelled)
 * Only admin can cancel bills
 */
export async function cancelBillController(req, res, next) {
  try {
    const { id } = req.params;
    const { cancel_reason } = req.body;
    const cancelledBy = req.user?.username || 'system';

    // Validate bill ID
    billingValidation.validateBillId(id);

    // Cancel bill
    const bill = await billingService.cancelBill(id, cancelledBy, cancel_reason);

    res.status(200).json({
      message: 'Bill cancelled successfully',
      bill,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing/masters/service-charges
 * Get all available service charges for billing
 */
export async function getServiceChargesController(req, res, next) {
  try {
    const charges = await billingService.getServiceCharges();

    res.status(200).json({
      message: 'Service charges retrieved successfully',
      charges,
      count: charges.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /billing/masters/service-charges
 * Create new service charge
 */
export async function createServiceChargeController(req, res, next) {
  try {
    const { category_id, charge_name, default_rate, is_active, description } = req.body;

    // Validate required fields
    if (!category_id || !charge_name || default_rate === undefined) {
      const err = new Error('category_id, charge_name, and default_rate are required');
      err.statusCode = 400;
      throw err;
    }

    // Create charge
    const charge = await billingService.createServiceCharge({
      category_id,
      charge_name,
      default_rate,
      is_active,
      description,
    });

    res.status(201).json({
      message: 'Service charge created successfully',
      charge,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /billing/masters/service-charges/:id
 * Update service charge
 */
export async function updateServiceChargeController(req, res, next) {
  try {
    const { id } = req.params;
    const { category_id, charge_name, default_rate, is_active, description } = req.body;

    // Validate ID
    if (!id || isNaN(id)) {
      const err = new Error('Valid service charge ID is required');
      err.statusCode = 400;
      throw err;
    }

    // Validate required fields
    if (!category_id || !charge_name || default_rate === undefined) {
      const err = new Error('category_id, charge_name, and default_rate are required');
      err.statusCode = 400;
      throw err;
    }

    // Update charge
    const charge = await billingService.updateServiceCharge(id, {
      category_id,
      charge_name,
      default_rate,
      is_active,
      description,
    });

    res.status(200).json({
      message: 'Service charge updated successfully',
      charge,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /billing/masters/service-charges/:id
 * Delete service charge (soft delete)
 */
export async function deleteServiceChargeController(req, res, next) {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      const err = new Error('Valid service charge ID is required');
      err.statusCode = 400;
      throw err;
    }

    // Delete charge
    const charge = await billingService.deleteServiceCharge(id);

    res.status(200).json({
      message: 'Service charge deleted successfully',
      charge,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing/masters/service-charges/search
 * Search service charges by name or category
 */
export async function searchServiceChargesController(req, res, next) {
  try {
    const { q } = req.query;

    // Validate search term
    billingValidation.validateSearchTerm(q);

    // Search charges
    const charges = await billingService.searchServiceCharges(q);

    res.status(200).json({
      message: 'Service charges searched successfully',
      charges,
      count: charges.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /billing/masters/categories
 * Get all service categories
 */
export async function getServiceCategoriesController(req, res, next) {
  try {
    // Get categories
    const categories = await billingService.getServiceCategories();

    res.status(200).json({
      message: 'Service categories retrieved successfully',
      categories,
      count: categories.length,
    });
  } catch (err) {
    next(err);
  }
}

import {
  createOPDEntry,
  getOPDById,
  getOPDQueue,
  getPatientOPD,
  updateOPDStatus,
  deleteOPDEntry,
  getDoctors,
  getVisitTypes,
} from './opd.service.js';
import { validateOPDCreation, validateOPDStatusUpdate } from './opd.validation.js';

/**
 * Create OPD queue entry
 * POST /api/v1/opd
 */
export async function createController(req, res, next) {
  try {
    // Validate input
    const { error, value } = validateOPDCreation(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((e) => e.message),
      });
    }

    // Create OPD entry
    const opd = await createOPDEntry(value);

    return res.status(201).json({
      message: 'OPD entry created successfully',
      opd,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get OPD queue
 * GET /api/v1/opd
 */
export async function queueController(req, res, next) {
  try {
    const { visit_date, doctor_id, status, page = 1, limit = 20 } = req.query;

    const filters = {
      visit_date: visit_date || null,
      doctor_id: doctor_id ? parseInt(doctor_id) : null,
      status: status || null,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await getOPDQueue(filters);

    return res.status(200).json({
      message: 'OPD queue retrieved successfully',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get OPD record by ID
 * GET /api/v1/opd/:id
 */
export async function getController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Valid OPD ID is required' });
    }

    const opd = await getOPDById(parseInt(id));

    return res.status(200).json({
      message: 'OPD record retrieved successfully',
      opd,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update OPD status
 * PUT /api/v1/opd/:id/status
 */
export async function updateStatusController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Valid OPD ID is required' });
    }

    // Validate input
    const { error, value } = validateOPDStatusUpdate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((e) => e.message),
      });
    }

    // Update status
    const opd = await updateOPDStatus(parseInt(id), value.status);

    return res.status(200).json({
      message: 'OPD status updated successfully',
      opd,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete OPD entry
 * DELETE /api/v1/opd/:id
 */
export async function deleteController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Valid OPD ID is required' });
    }

    const deleted = await deleteOPDEntry(parseInt(id));

    return res.status(200).json({
      message: 'OPD entry removed successfully. Serial numbers have been reset.',
      deleted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get patient's OPD records
 * GET /api/v1/opd/patient/:uhid
 */
export async function patientOPDController(req, res, next) {
  try {
    const { uhid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!uhid || typeof uhid !== 'string') {
      return res.status(400).json({ message: 'Valid UHID is required' });
    }

    const result = await getPatientOPD(uhid, parseInt(page) || 1, parseInt(limit) || 10);

    return res.status(200).json({
      message: 'Patient OPD records retrieved successfully',
      uhid,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get doctors (for dropdown)
 * GET /api/v1/opd/masters/doctors
 */
export async function getDoctorsController(req, res, next) {
  try {
    const doctors = await getDoctors();

    return res.status(200).json({
      message: 'Doctors retrieved successfully',
      doctors,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get visit types (for dropdown)
 * GET /api/v1/opd/masters/visit-types
 */
export async function getVisitTypesController(req, res, next) {
  try {
    const visitTypes = await getVisitTypes();

    return res.status(200).json({
      message: 'Visit types retrieved successfully',
      visit_types: visitTypes,
    });
  } catch (err) {
    next(err);
  }
}

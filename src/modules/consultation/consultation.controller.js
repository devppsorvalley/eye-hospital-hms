import * as consultationService from './consultation.service.js';
import * as consultationValidation from './consultation.validation.js';

/**
 * Create consultation from OPD queue
 */
export async function createConsultationController(req, res, next) {
  try {
    // Validate input
    const validated = consultationValidation.validateConsultationCreation(req.body);
    if (validated.error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validated.error.details,
      });
    }

    // Create consultation
    const consultation = await consultationService.createConsultation(validated.value);

    return res.status(201).json({
      message: 'Consultation created successfully',
      consultation,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Get consultation by ID
 */
export async function getConsultationController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    const consultation = await consultationService.getConsultationById(parseInt(id));

    return res.status(200).json({
      message: 'Consultation retrieved successfully',
      consultation,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * List consultations
 */
export async function listConsultationsController(req, res, next) {
  try {
    const { uhid, doctor_id, date, page, limit } = req.query;

    const filters = {
      uhid: uhid || null,
      doctor_id: doctor_id ? parseInt(doctor_id) : null,
      date: date || null,
    };

    const result = await consultationService.listConsultations(
      filters,
      page,
      limit
    );

    return res.status(200).json({
      message: 'Consultations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient consultations
 */
export async function getPatientConsultationsController(req, res, next) {
  try {
    const { uhid } = req.params;
    const { page, limit } = req.query;

    if (!uhid || typeof uhid !== 'string') {
      return res.status(400).json({ message: 'Invalid patient UHID' });
    }

    const result = await consultationService.getPatientConsultations(
      uhid,
      page,
      limit
    );

    return res.status(200).json({
      message: 'Patient consultations retrieved successfully',
      uhid,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update consultation
 */
export async function updateConsultationController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    // Validate input
    const validated = consultationValidation.validateConsultationUpdate(req.body);
    if (validated.error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validated.error.details,
      });
    }

    // Update consultation
    const consultation = await consultationService.updateConsultation(
      parseInt(id),
      validated.value
    );

    return res.status(200).json({
      message: 'Consultation updated successfully',
      consultation,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Add ICD code to consultation
 */
export async function addICDController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    // Validate input
    const validated = consultationValidation.validateICDAddition(req.body);
    if (validated.error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validated.error.details,
      });
    }

    // Add ICD code
    const consultation = await consultationService.addConsultationICD(
      parseInt(id),
      validated.value.icd_id
    );

    return res.status(200).json({
      message: 'ICD code added successfully',
      consultation,
    });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Remove ICD code from consultation
 */
export async function removeICDController(req, res, next) {
  try {
    const { id, icd_id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    if (!icd_id || !Number.isInteger(parseInt(icd_id))) {
      return res.status(400).json({ message: 'Invalid ICD ID' });
    }

    // Remove ICD code
    const consultation = await consultationService.removeConsultationICD(
      parseInt(id),
      parseInt(icd_id)
    );

    return res.status(200).json({
      message: 'ICD code removed successfully',
      consultation,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Get all ICD codes
 */
export async function getAllICDCodesController(req, res, next) {
  try {
    const icdCodes = await consultationService.getAllICDCodes();

    return res.status(200).json({
      message: 'ICD codes retrieved successfully',
      icd_codes: icdCodes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search ICD codes
 */
export async function searchICDCodesController(req, res, next) {
  try {
    const { search } = req.query;

    // Validate input
    const validated = consultationValidation.validateICDSearch({ search });
    if (validated.error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validated.error.details,
      });
    }

    const icdCodes = await consultationService.searchICDCodes(validated.value.search);

    return res.status(200).json({
      message: 'ICD codes search completed',
      results: icdCodes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete consultation
 */
export async function deleteConsultationController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    await consultationService.deleteConsultation(parseInt(id));

    return res.status(200).json({
      message: 'Consultation deleted successfully',
      id: parseInt(id),
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

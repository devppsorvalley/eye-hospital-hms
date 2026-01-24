import { getDoctors, getVisitTypes } from './masters.service.js';

/**
 * Get all active doctors
 * GET /api/v1/masters/doctors
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
 * Get all active visit types
 * GET /api/v1/masters/visit-types
 */
export async function getVisitTypesController(req, res, next) {
  try {
    const visitTypes = await getVisitTypes();
    return res.status(200).json({
      message: 'Visit types retrieved successfully',
      visitTypes,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Dashboard Controller
 * HTTP request handlers for dashboard endpoints
 */

import * as dashboardService from './dashboard.service.js';

/**
 * GET /dashboard
 * Get complete dashboard with all metrics
 */
export async function getDashboardController(req, res, next) {
  try {
    const dashboard = await dashboardService.getCompleteDashboard();

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      data: dashboard,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/overview
 * Get KPI overview cards
 */
export async function getOverviewController(req, res, next) {
  try {
    const overview = await dashboardService.getDashboardOverview();

    res.status(200).json({
      message: 'Dashboard overview retrieved successfully',
      data: overview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/opd
 * Get OPD performance metrics
 */
export async function getOPDMetricsController(req, res, next) {
  try {
    const metrics = await dashboardService.getOPDMetrics();

    res.status(200).json({
      message: 'OPD metrics retrieved successfully',
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/billing
 * Get billing metrics
 */
export async function getBillingMetricsController(req, res, next) {
  try {
    const metrics = await dashboardService.getBillingMetrics();

    res.status(200).json({
      message: 'Billing metrics retrieved successfully',
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/trends
 * Get 7-day trend data
 */
export async function getTrendsController(req, res, next) {
  try {
    const trends = await dashboardService.getTrendsData();

    res.status(200).json({
      message: 'Trends data retrieved successfully',
      data: trends,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/consultations
 * Get consultation metrics
 */
export async function getConsultationsController(req, res, next) {
  try {
    const consultations = await dashboardService.getConsultationMetrics();

    res.status(200).json({
      message: 'Consultation metrics retrieved successfully',
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/demographics
 * Get patient demographics
 */
export async function getDemographicsController(req, res, next) {
  try {
    const demographics = await dashboardService.getPatientDemographics();

    res.status(200).json({
      message: 'Patient demographics retrieved successfully',
      data: demographics,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard/follow-up
 * Get follow-up vs new patient analysis
 */
export async function getFollowUpAnalysisController(req, res, next) {
  try {
    const analysis = await dashboardService.getFollowUpAnalysis();

    res.status(200).json({
      message: 'Follow-up analysis retrieved successfully',
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
}

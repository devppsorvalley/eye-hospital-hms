/**
 * Dashboard Service
 * Business logic for dashboard KPIs and metrics
 */

import { pool } from '../../config/db.js';
import { dashboardQueries } from './dashboard.sql.js';

/**
 * Get dashboard overview with key KPIs
 */
export async function getDashboardOverview() {
  try {
    const [
      totalRegResult,
      todayRegResult,
      totalOPDResult,
      todayOPDResult,
      totalBillResult,
      todayBillResult,
      dbStatsResult,
    ] = await Promise.all([
      pool.query(dashboardQueries.getTotalRegistrations),
      pool.query(dashboardQueries.getTodayRegistrations),
      pool.query(dashboardQueries.getTotalOPDVisits),
      pool.query(dashboardQueries.getTodayOPDVisits),
      pool.query(dashboardQueries.getTotalBillingAmount),
      pool.query(dashboardQueries.getTodayBillingAmount),
      pool.query(dashboardQueries.getDatabaseStats),
    ]);

    return {
      kpis: {
        registrations: {
          total: parseInt(totalRegResult.rows[0]?.total) || 0,
          today: parseInt(todayRegResult.rows[0]?.total) || 0,
        },
        opd_visits: {
          total: parseInt(totalOPDResult.rows[0]?.total) || 0,
          today: parseInt(todayOPDResult.rows[0]?.total) || 0,
        },
        billing: {
          total_amount: parseFloat(totalBillResult.rows[0]?.total_amount) || 0,
          total_bills: parseInt(totalBillResult.rows[0]?.total_bills) || 0,
          today_amount: parseFloat(todayBillResult.rows[0]?.total_amount) || 0,
          today_bills: parseInt(todayBillResult.rows[0]?.total_bills) || 0,
        },
      },
      system_stats: dbStatsResult.rows[0],
    };
  } catch (err) {
    const error = new Error('Failed to fetch dashboard overview');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get OPD performance metrics
 */
export async function getOPDMetrics() {
  try {
    const [statusResult, doctorTodayResult, doctorAllTimeResult] = await Promise.all(
      [
        pool.query(dashboardQueries.getOPDByStatus),
        pool.query(dashboardQueries.getOPDPerDoctor),
        pool.query(dashboardQueries.getOPDPerDoctorAllTime),
      ]
    );

    return {
      status_breakdown: statusResult.rows,
      doctors_today: doctorTodayResult.rows,
      doctors_all_time: doctorAllTimeResult.rows,
    };
  } catch (err) {
    const error = new Error('Failed to fetch OPD metrics');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get billing metrics
 */
export async function getBillingMetrics() {
  try {
    const [billTypeResult, commonServicesResult] = await Promise.all([
      pool.query(dashboardQueries.getBillingByType),
      pool.query(dashboardQueries.getCommonServices),
    ]);

    return {
      by_type: billTypeResult.rows,
      common_services: commonServicesResult.rows,
    };
  } catch (err) {
    const error = new Error('Failed to fetch billing metrics');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get trends data (7-day rolling)
 */
export async function getTrendsData() {
  try {
    const [regTrendResult, opdTrendResult, billTrendResult] = await Promise.all([
      pool.query(dashboardQueries.getRegistrationTrend),
      pool.query(dashboardQueries.getOPDTrend),
      pool.query(dashboardQueries.getBillingTrend),
    ]);

    return {
      registrations: regTrendResult.rows,
      opd_visits: opdTrendResult.rows,
      billing: billTrendResult.rows,
    };
  } catch (err) {
    const error = new Error('Failed to fetch trends data');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get consultation metrics
 */
export async function getConsultationMetrics() {
  try {
    const [recentResult, doctorResult, activeResult] = await Promise.all([
      pool.query(dashboardQueries.getRecentConsultations),
      pool.query(dashboardQueries.getConsultationsByDoctor),
      pool.query(dashboardQueries.getActiveConsultations),
    ]);

    return {
      recent: recentResult.rows,
      by_doctor: doctorResult.rows,
      active_count: parseInt(activeResult.rows[0]?.count) || 0,
    };
  } catch (err) {
    console.error('[DASHBOARD] Consultation metrics SQL error:', err.message);
    const error = new Error('Failed to fetch consultation metrics');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get patient demographics
 */
export async function getPatientDemographics() {
  try {
    const result = await pool.query(dashboardQueries.getPatientDemographics);
    return result.rows;
  } catch (err) {
    const error = new Error('Failed to fetch patient demographics');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get follow-up vs new patient breakdown
 */
export async function getFollowUpAnalysis() {
  try {
    const result = await pool.query(dashboardQueries.getFollowUpVsNew);
    return result.rows;
  } catch (err) {
    console.error('[DASHBOARD] Follow-up analysis SQL error:', err.message);
    const error = new Error('Failed to fetch follow-up analysis');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get complete dashboard data (all metrics combined)
 */
export async function getCompleteDashboard() {
  try {
    
    const [overview, opd, billing, trends, consultations, demographics, followUp] =
      await Promise.all([
        getDashboardOverview().catch(err => { console.error('[DASHBOARD] Overview error:', err.message); throw err; }),
        getOPDMetrics().catch(err => { console.error('[DASHBOARD] OPD error:', err.message); throw err; }),
        getBillingMetrics().catch(err => { console.error('[DASHBOARD] Billing error:', err.message); throw err; }),
        getTrendsData().catch(err => { console.error('[DASHBOARD] Trends error:', err.message); throw err; }),
        getConsultationMetrics().catch(err => { console.error('[DASHBOARD] Consultations error:', err.message); throw err; }),
        getPatientDemographics().catch(err => { console.error('[DASHBOARD] Demographics error:', err.message); throw err; }),
        getFollowUpAnalysis().catch(err => { console.error('[DASHBOARD] Follow-up error:', err.message); throw err; }),
      ]);


    return {
      overview,
      opd,
      billing,
      trends,
      consultations,
      demographics,
      follow_up_analysis: followUp,
      generated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[DASHBOARD] Complete dashboard error:', err);
    const error = new Error('Failed to fetch complete dashboard');
    error.statusCode = 500;
    throw error;
  }
}
